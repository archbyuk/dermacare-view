'use client';

import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, Clock, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useModalStore } from '@/store/modal-store';
import { useProceduresStore } from '@/store/procedures-store';
import type { Element } from '@/api/element-api';
import { searchElements } from '@/utils/searchUtils';

interface ElementTabProps {
    searchQuery: string;  // 검색 쿼리 (검색어)
}

export default function ElementTab({ searchQuery }: ElementTabProps) {
    const { openElementCreate, openElementDetail } = useModalStore();
    const { elements, loading, error, forceRefreshAllProcedures } = useProceduresStore();
    
    // 검색된 데이터 계산
    const filteredElements = searchElements(elements, searchQuery);

    const handleElementClick = (element: Element) => {
        openElementDetail(element, forceRefreshAllProcedures);
    };

    const handleCreateClick = () => {
        openElementCreate(forceRefreshAllProcedures);
    };

    // 검색 중인지 여부
    const isSearching = searchQuery.trim().length > 0;
    // 표시할 데이터 개수 (검색 중이면 검색 결과, 아니면 원본 데이터)
    const displayCount = isSearching ? filteredElements.length : elements.length;

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
                                <AlertTriangle className="w-8 h-8 text-red-600" />
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
                                총 단일시술 개수: {isSearching ? `${filteredElements.length}개 (검색 결과)` : `${displayCount}개`}
                            </h3>

                                <Button 
                                    variant="outline" 
                                    size="sm"
                                    className='mb-2 bg-white hover:bg-gray-50 border-gray-300 text-gray-700 hover:text-gray-900 transition-colors'
                                    onClick={handleCreateClick}
                                >
                                    <Plus className="w-4 h-4 mr-1" />
                                    <p className='mt-0.5'>새 단일시술</p>
                                </Button>
                            </div>

                            {/* 일관된 컨테이너 - 검색 전후 동일한 구조 */}
                            <div className="space-y-1">
                                
                                {/* 데이터가 있을 때만 목록 표시 */}
                                {filteredElements.length > 0 ? (
                                    filteredElements.map((element) => (
                                        <div 
                                            key={element.id} 
                                            className="border-b border-gray-100 py-3 cursor-pointer hover:bg-gray-50 transition-colors"
                                            onClick={() => handleElementClick(element)}
                                        >
                                            <div className="flex items-start justify-between">
                                                
                                                {/* 왼쪽 컨테이너 */}
                                                <div className="flex-1 min-w-0 pr-4">
                                                    <h4 className="text-sm font-medium text-gray-900 truncate mb-1">
                                                        {element.name || `Element ${element.id}`}
                                                    </h4>
                                                    <div className="text-xs text-gray-500 mb-2">
                                                        {element.class_major} &gt; {element.class_sub} &gt; {element.class_detail}
                                                    </div>
                                                    <p className="text-xs text-gray-400 line-clamp-1">
                                                        {element.description 
                                                            ? (element.description.length > 15
                                                                ? `${element.description.substring(0, 18)}...` 
                                                                : element.description)
                                                            : '설명 없음'
                                                        }
                                                    </p>
                                                </div>
                                                
                                                {/* 오른쪽 컨테이너 */}
                                                <div className="flex-shrink-0 w-28 mt-4.5">
                                                    <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                                                        <span className="flex items-center">
                                                            <Clock className="w-2.5 h-2.5 mr-1 mb-0.5" />
                                                            {element.cost_time}분
                                                        </span>
                                                        <span className={`border rounded-full px-2 pt-0.5 ${element.position_type === '의사' ? 'text-sky-300' : 'text-pink-300'}`}>{element.position_type}</span>
                                                    </div>
                                                    <p className="text-sm font-medium text-gray-900 text-left">
                                                        <span className="text-gray-500 text-xs">원가:</span> {element.procedure_cost?.toLocaleString()} 원
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    // 데이터 없음 - 동일한 컨테이너 내에서 표시
                                    <div className="text-center py-8 fade-in">
                                        <div className="w-16 h-11 rounded-full mx-auto mb-4 flex items-center justify-center">
                                            <Image src="/logo.svg" alt="데이터 없음" width={32} height={32} />
                                        </div>
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                                            {isSearching ? '검색 결과가 없습니다' : '시술 목록이 없습니다'}
                                        </h3>
                                        <p className="text-sm text-gray-500">
                                            {isSearching ? '다른 검색어를 시도해보세요' : '선택한 조건에 맞는 시술이 없습니다'}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                    
                </CardContent>
            </Card>
        </div>
    );
}
