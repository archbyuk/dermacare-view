'use client';

import { useState, useEffect } from 'react';
import { ProductDetailModal } from '@/components/tabs/product-detail-modal';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTreatmentsStore } from '@/store/treatments-store';
import { useSearch, SearchResult, TreatmentData } from '@/hooks/useSearch';
import Image from 'next/image';
import { Search } from 'lucide-react';

interface SearchTabProps {
    onModalStateChange?: (isOpen: boolean) => void;
}

export function ProductSearch({ onModalStateChange }: SearchTabProps) {
    // 모달 상태
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTreatment, setSelectedTreatment] = useState<{ id: number; type: 'standard' | 'event' } | null>(null);

    // Zustand store에서 캐시된 데이터 가져오기
    const { 
        treatments, 
        loading: storeLoading, 
        error: storeError, 
        fetchTreatments 
    } = useTreatmentsStore();

    // 검색 훅 사용
    const {
        searchQuery,
        sortedResults,
        hasSearched,
        selectedCategory,
        sortBy,
        setSearchQuery,
        setCategory,
        setSort,
        totalResults,
        isEmpty
    } = useSearch(treatments as TreatmentData[], {
        minQueryLength: 1,
        debounceDelay: 200,
        enableChosungSearch: true
    });

    // 초기 데이터 로드
    useEffect(() => {
        fetchTreatments();
    }, [fetchTreatments]);

    // 시술 상세 모달 열기
    const handleTreatmentClick = (treatment: SearchResult) => {
        setSelectedTreatment({ id: treatment.ID, type: treatment.Product_Type });
        setIsModalOpen(true);
        onModalStateChange?.(true);
    };

    return (
        <div className="pb-20 px-7 slide-in-right">
            {/* 검색 입력 */}
            <div className="mb-6">
                <div className="relative">
                    <Input
                        type="text"
                        placeholder="시술명, 분류, 상품명으로 검색..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-4 py-3 pl-12 border-gray-300 text-gray-500"
                    />
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                        <Search className="w-5 h-5 text-gray-400" />
                    </div>
                </div>
            </div>

            {/* 필터 및 정렬 */}
            {hasSearched && (
                <div className="mb-2 flex items-center justify-between">
                    {/* 카테고리 필터 */}
                    <div className="flex gap-1 overflow-x-auto">
                        {[
                            { value: 'all' as const, label: 'ALL' },
                            { value: 'standard' as const, label: '스탠다드' },
                            { value: 'event' as const, label: '이벤트' }
                        ].map((category) => (
                            <Button
                                key={category.value}
                                variant="outline"
                                size="default"
                                onClick={() => setCategory(category.value)}
                                className={`whitespace-nowrap py-0 px-1.5 transition-colors ${
                                    selectedCategory === category.value 
                                        ? 'bg-gray-400 text-white hover:bg-gray-200' 
                                        : 'bg-white text-gray-600 hover:bg-gray-200 hover:text-white border-gray-300'
                                }`}
                            >
                                {category.label}
                            </Button>
                        ))}
                    </div>

                    {/* 정렬 옵션 */}
                    <Select value={sortBy} onValueChange={(value) => setSort(value as 'latest' | 'oldest' | 'price_high' | 'price_low' | 'name')}>
                        <SelectTrigger className="w-28 bg-white text-gray-600 border-gray-300">
                            <SelectValue placeholder="정렬 선택" />
                        </SelectTrigger>
                        <SelectContent className="w-16 z-10 bg-white border-gray-300 text-gray-500 shadow-lg" position="popper" side="bottom" align="end">
                            <SelectItem value="latest" className="w-full text-gray-500 hover:bg-white border-gray-300 text-xs">최신순</SelectItem>
                            <SelectItem value="oldest" className="w-full text-gray-500 hover:bg-white border-gray-300 text-xs">오래된순</SelectItem>
                            <SelectItem value="price_high" className="w-full text-gray-500 hover:bg-white border-gray-300 text-xs">가격 높은순</SelectItem>
                            <SelectItem value="price_low" className="w-full text-gray-500 hover:bg-white border-gray-300 text-xs">가격 낮은순</SelectItem>
                            <SelectItem value="name" className="w-full text-gray-500 hover:bg-white border-gray-300 text-xs">이름순</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            )}

            {/* 로딩 상태 */}
            {(storeLoading) && (
                <div className="text-center py-8">
                    <Image src="/logo.svg" alt="로딩" width={32} height={32} className="animate-spin mx-auto mb-4" />
                    <p className="text-sm text-gray-600">로딩 중입니다</p>
                </div>
            )}

            {/* 에러 메시지 */}
            {(storeError) && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600 text-sm">{storeError}</p>
                </div>
            )}

            {/* 검색 결과 */}
            {hasSearched && !storeLoading && (
                <Card className="border-none shadow-none" key={`search-results-${searchQuery}-${selectedCategory}`}>
                    <CardContent className="px-3 py-2">
                        <div className="mb-4 slide-up">
                            <h3 className="text-md font-medium text-gray-900 mb-3">
                                검색 결과: {totalResults}개
                            </h3>
                        </div>

                        {isEmpty ? (
                            <div className="text-center py-8 slide-up">
                                <div className="w-16 h-11 rounded-full mx-auto mb-4 flex items-center justify-center">
                                    <Image src="/logo.svg" alt="검색 결과 없음" width={32} height={32} />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">검색 결과가 없습니다</h3>
                                <p className="text-sm text-gray-500">다른 검색어를 시도해보세요</p>
                            </div>
                        ) : (
                            <div className="space-y-1 slide-up">
                                {sortedResults.map((treatment) => (
                                    <div 
                                        key={`${treatment.ID}-${treatment.Product_Type}`}
                                        className="border-b border-gray-100 py-3 cursor-pointer hover:bg-gray-50 transition-colors"
                                        onClick={() => handleTreatmentClick(treatment)}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-sm font-medium text-gray-900 truncate">
                                                    {treatment.Product_Name || `시술 ${treatment.ID}`}
                                                </h4>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className={`text-xs px-2 py-0.5 rounded-full min-w-fit ${
                                                        treatment.Package_Type === '단일시술' 
                                                            ? 'bg-gray-100 text-gray-600' 
                                                            : treatment.Package_Type === '번들'
                                                            ? 'bg-orange-50 text-orange-400'
                                                            : treatment.Package_Type === '시퀀스'
                                                            ? 'bg-purple-50 text-purple-400'
                                                            : treatment.Package_Type === '커스텀'
                                                            ? 'bg-red-50 text-red-400'
                                                            : 'bg-gray-100 text-gray-400'
                                                    }`}>
                                                        {treatment.Package_Type === '단일시술' ? '단일시술' : 
                                                        treatment.Package_Type === '번들' ? '패키지' :
                                                        treatment.Package_Type === '시퀀스' ? '코스 패키지' :
                                                        treatment.Package_Type === '커스텀' ? '커스텀' : treatment.Package_Type}
                                                    </span>
                                                    {treatment.elements && treatment.elements.length > 0 && (
                                                        <span className="text-xs text-gray-500 truncate">
                                                            #{[...new Set(treatment.elements)].slice(0, 3).join(' #')}
                                                            {[...new Set(treatment.elements)].length > 3 && '...'}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-right ml-3 flex-shrink-0">
                                                {treatment.Original_Price > treatment.Sell_Price && (
                                                    <p className="text-xs text-gray-400 line-through mb-0.5">
                                                        {treatment.Original_Price.toLocaleString()}원
                                                    </p>
                                                )}
                                                <p className="text-sm font-medium text-gray-900 pr-1.5">
                                                    {treatment.Sell_Price.toLocaleString()}원
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* 초기 상태 */}
            {!hasSearched && !storeLoading && (
                <Card className="border-none shadow-none">
                    <CardContent className="px-6 py-2">
                        <div className="text-center py-8">
                            <div className="w-16 h-11 rounded-full mx-auto mb-4 flex items-center justify-center">
                                <Image src="/logo.svg" alt="검색" width={32} height={32} />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">시술을 검색해보세요</h3>
                            <p className="text-sm text-gray-500">시술명, 분류, 상품명으로 검색할 수 있습니다</p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* 시술 상세 모달 */}
            {isModalOpen && selectedTreatment && (
                <ProductDetailModal
                    isOpen={isModalOpen}
                    onClose={() => {
                        setIsModalOpen(false);
                        setSelectedTreatment(null);
                        onModalStateChange?.(false);
                    }}
                    productId={selectedTreatment.id}
                    productType={selectedTreatment.type}
                />
            )}
        </div>
    );
}
