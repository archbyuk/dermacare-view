'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
    Plus,
    Settings
} from 'lucide-react';
import Image from 'next/image';
import { ConsumableResponse } from '@/api/consumables-api';
import ConsumableDetailModal from '@/components/tabs/data-management/costs-management/consumable-detail-modal';
import { useModalStore } from '@/store/modal-store';

interface ConsumablesTabProps {
    consumables: ConsumableResponse[];
    loading: boolean;
    error: string | null;
    searchQuery: string;
    onRefresh: () => Promise<void>;
    totalConsumables: number;
}

export default function ConsumablesTab({ 
    consumables, 
    loading, 
    error, 
    searchQuery, 
    onRefresh, 
    totalConsumables 
}: ConsumablesTabProps) {
    const isSearching = searchQuery.length > 0;
    const displayCount = isSearching ? consumables.length : totalConsumables;

    // 모달 상태
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedConsumable, setSelectedConsumable] = useState<ConsumableResponse | null>(null);
    
    // Store에서 모달 함수 가져오기
    const { openConsumableCreate } = useModalStore();

    // 소모품 클릭 핸들러
    const handleConsumableClick = (consumable: ConsumableResponse) => {
        setSelectedConsumable(consumable);
        setIsModalOpen(true);
    };

    // 모달 닫기 핸들러
    const handleModalClose = () => {
        setIsModalOpen(false);
        setSelectedConsumable(null);
    };

    // 데이터 업데이트 핸들러
    const handleDataUpdate = () => {
        onRefresh();
    };

    return (
        <div className="space-y-2 h-full overflow-hidden">
            {/* 메인 콘텐츠 영역 */}
            <Card className="border-none shadow-none h-[calc(100vh-265px)] mx-auto max-w-2xl px-0">
                <CardContent className="h-full overflow-y-auto scroll-consistent">
                    
                    {/* 로딩 상태 */}
                    {loading && (
                        <div className="text-center py-8 fade-in">
                            <Image src="/logo.svg" alt="로딩" width={32} height={32} className="animate-spin mx-auto mb-4" />
                            <p className="text-sm text-gray-600">로딩 중입니다</p>
                        </div>
                    )}

                    {/* 에러 상태 */}
                    {error && (
                        <div className="text-center py-8 fade-in">
                            <div className="w-16 h-16 bg-red-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                                <Settings className="w-8 h-8 text-red-600" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">오류 발생</h3>
                            <p className="text-sm text-gray-500 mb-4">{error}</p>
                            <Button onClick={onRefresh}>
                                다시 시도
                            </Button>
                        </div>
                    )}

                    {/* 데이터 표시 */}
                    {!loading && !error && (
                        <>
                            {/* 헤더 */}
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                <h3 className="text-md font-medium text-gray-900">
                                    총 소모품 개수: {isSearching ? `${consumables.length}개 (검색 결과)` : `${displayCount}개`}
                                </h3>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className='mb-2 bg-white hover:bg-gray-50 border-gray-300 text-gray-700 hover:text-gray-900 transition-colors'
                                    onClick={() => openConsumableCreate(onRefresh)}>
                                    <Plus className="w-4 h-4 mr-1" />
                                    새 소모품
                                </Button>
                            </div>

                            {/* 검색 결과 헤더 */}
                            {isSearching && (
                                <div className="mb-4 slide-up">
                                    <h3 className="text-md font-medium text-gray-900 mb-3">
                                        검색 결과: {displayCount}개
                                    </h3>
                                </div>
                            )}

                            {/* 소모품 목록 */}
                            {consumables.length === 0 ? (
                                <div className="text-center py-8 slide-up">
                                    <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                                        <Settings className="w-8 h-8 text-gray-400" />
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                                        {isSearching ? '검색 결과가 없습니다' : '소모품 데이터가 없습니다'}
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        {isSearching ? '다른 검색어를 시도해보세요' : '새로운 소모품을 추가해보세요'}
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3 slide-up">
                                    {consumables.map((consumable) => (
                                        <div 
                                            key={consumable.id}
                                            className={`border-b border-gray-100 py-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                                                consumable.release === 0 ? 'opacity-60' : ''
                                            }`}
                                            onClick={() => handleConsumableClick(consumable)}
                                        >
                                            {/* 왼쪽 컨테이너 */}
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1 min-w-0 pr-4">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center space-x-2 mb-1">
                                                                <h4 className="text-sm font-medium text-gray-900 truncate">
                                                                    {consumable.name}
                                                                </h4>
                                                            </div>
                                                            <div className="flex items-center space-x-2">
                                                                <span className="px-2 pt-0.5 text-xs rounded-full border border-blue-500 text-blue-500">
                                                                    {consumable.taxable_type}
                                                                </span>
                                                                <span className="px-2 pt-0.5 text-xs rounded-full border border-emerald-500 text-emerald-500">
                                                                    {consumable.covered_type}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center space-x-4 mt-2">
                                                                <span className="text-xs text-gray-500">
                                                                    단위: {consumable.unit_type}
                                                                </span>
                                                                {consumable.i_value && (
                                                                    <span className="text-xs text-gray-500">
                                                                        정수값: {consumable.i_value}
                                                                    </span>
                                                                )}
                                                                {consumable.f_value && (
                                                                    <span className="text-xs text-gray-500">
                                                                        실수값: {consumable.f_value}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                {/* 오른쪽 컨테이너 */}
                                                <div className="flex flex-col text-left justify-start items-start w-32 mt-4.5 gap-1">
                                                    <p className="text-sm font-medium text-gray-900">
                                                        <span className='text-gray-500 text-xs'>단위 비용: </span>{consumable.unit_price.toLocaleString()}원
                                                    </p>

                                                    {consumable.vat > 0 && (
                                                        <p className="text-xs text-gray-400">
                                                            VAT: {consumable.vat.toLocaleString()} 원
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>

            {/* 소모품 상세 정보 모달 */}
            {isModalOpen && selectedConsumable && (
                <ConsumableDetailModal
                    consumable={selectedConsumable}
                    isOpen={isModalOpen}
                    onClose={handleModalClose}
                    onDataUpdate={handleDataUpdate}
                />
            )}
        </div>
    );
}
