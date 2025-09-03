'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
    Plus,
    Settings
} from 'lucide-react';
import Image from 'next/image';
import { useModalStore } from '@/store/modal-store';
import { useProceduresStore } from '@/store/procedures-store';
import type { BundleListResponse } from '@/api/bundles-api';
import { searchBundles } from '@/utils/searchUtils';

interface BundleTabProps {
    searchQuery: string;            // 검색 쿼리 (검색어)
}

export default function BundleTab({ searchQuery }: BundleTabProps) {
    const { openBundleCreate, openBundleDetail } = useModalStore();
    const { bundles, loading, error, forceRefreshAllProcedures } = useProceduresStore();
    
    // 검색된 데이터 계산
    const filteredBundles = searchBundles(bundles, searchQuery);

    const handleBundleClick = (bundle: BundleListResponse) => {
        openBundleDetail(bundle, forceRefreshAllProcedures);
    };

    const handleCreateClick = () => {
        openBundleCreate(forceRefreshAllProcedures);
    };

    // 검색 중인지 여부
    const isSearching = searchQuery.trim().length > 0;
    // 표시할 데이터 개수 (검색 중이면 검색 결과, 아니면 원본 데이터)
    const displayCount = isSearching ? filteredBundles.length : bundles.length;

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
                            <Button onClick={forceRefreshAllProcedures}>
                                다시 시도
                            </Button>
                        </div>
                    )}

                    {/* 데이터 표시 */}
                    {!loading && !error && (
                        <div className="slide-up">
                            
                            {/* 헤더 */}
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-md font-medium text-gray-900">
                                    총 패키지 개수: {isSearching ? `${filteredBundles.length}개 (검색 결과)` : `${displayCount}개`}
                                </h3>

                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className='mb-2 bg-white hover:bg-gray-50 border-gray-300 text-gray-700 hover:text-gray-900 transition-colors'
                                    onClick={handleCreateClick}
                                >
                                    <Plus className="w-4 h-4 mr-1" />
                                    <p className='mt-0.5'>새 패키지</p>
                                </Button>
                            </div>

                            {/* 일관된 컨테이너 - 검색 전후 동일한 구조 */}
                            <div className="space-y-1">
                                {filteredBundles.length === 0 ? (
                                    <div className="text-center py-8">
                                        <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                                            <Settings className="w-8 h-8 text-gray-400" />
                                        </div>
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                                            {isSearching ? '검색 결과가 없습니다' : 'Bundle 데이터가 없습니다'}
                                        </h3>
                                        <p className="text-sm text-gray-500">
                                            {isSearching ? '다른 검색어를 시도해보세요' : '새로운 Bundle을 추가해보세요'}
                                        </p>
                                    </div>
                                ) : (
                                    filteredBundles.map((bundle) => (
                                        <div 
                                            key={bundle.group_id}
                                            className={`border-b border-gray-100 py-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                                                bundle.release === 0 ? 'opacity-60' : ''
                                            }`}
                                            onClick={() => handleBundleClick(bundle)}
                                        >
                                            <div className="flex items-start justify-between">
                                                
                                                {/* 왼쪽 컨테이너 */}
                                                <div className="flex-1 min-w-0 pr-4">
                                                    <div className="flex items-center space-x-2 truncate mb-1">
                                                        <h4 className="text-sm font-medium text-gray-900 truncate">
                                                            {bundle.name || `Bundle ${bundle.group_id}`}
                                                        </h4>
                                                    </div>
                                                    
                                                    <div className="flex items-center space-x-4 mt-1 mb-2">
                                                        <span className="text-xs text-gray-500">
                                                            패키지 ID: {bundle.group_id}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-gray-500 truncate line-clamp-2">
                                                        {bundle.description || '설명 없음'}
                                                    </p>
                                                </div>
                                                {/* 오른쪽 컨테이너 */}
                                                <div className="flex flex-col text-left justify-start items-start w-32 mt-6 gap-1">
                                                    <span className="text-xs text-gray-500">
                                                        포함시술: {bundle.elements.length}개
                                                    </span>
                                                    <p className="text-sm font-medium text-gray-900">
                                                        <span className="text-gray-500 text-xs">총 비용: </span> 
                                                        {bundle.elements.reduce((total, element) => 
                                                            total + (element.element_cost || 0), 0
                                                        ).toLocaleString()} 원
                                                    </p>                                                    
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
