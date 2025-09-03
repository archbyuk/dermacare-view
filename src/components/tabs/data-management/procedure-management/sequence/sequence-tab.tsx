'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
    Plus,
    AlertTriangle,
    Package,
} from 'lucide-react';
import Image from 'next/image';
import { useModalStore } from '@/store/modal-store';
import SequenceDetailModal from './sequence-detail-modal';
import { useProceduresStore } from '@/store/procedures-store';
import type { SequenceResponse, SequenceStepResponse } from '@/api/sequences-api';
import { searchSequences } from '@/utils/searchUtils';

interface SequenceTabProps {
    searchQuery: string;
}

export default function SequenceTab({ searchQuery }: SequenceTabProps) {
    
    const { openSequenceDetail, openSequenceCreate, activeModal, closeModal, modalData } = useModalStore();
    const { sequences, loading, error, forceRefreshAllProcedures } = useProceduresStore();
    
    // 검색된 데이터 계산
    const filteredSequences = searchSequences(sequences, searchQuery);
    
    const handleSequenceClick = (sequence: SequenceResponse) => {
        openSequenceDetail(sequence, forceRefreshAllProcedures);
    };

    const handleCreateClick = () => {
        openSequenceCreate(forceRefreshAllProcedures);
    };

    // 검색 중인지 여부
    const isSearching = searchQuery.trim().length > 0;
    // 표시할 데이터 개수 (검색 중이면 검색 결과, 아니면 원본 데이터)
    const displayCount = isSearching ? filteredSequences.length : sequences.length;

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
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="text-md font-medium text-gray-900">
                                        총 코스 개수: {isSearching ? `${filteredSequences.length} \n(검색 결과)` : `${displayCount}개`}
                                    </h3>
                                </div>
                                <Button 
                                    variant="outline"
                                    size="sm"
                                    className='mb-2 bg-white hover:bg-gray-50 border-gray-300 text-gray-700 hover:text-gray-900 transition-colors'
                                    onClick={handleCreateClick}
                                >
                                    <Plus className="w-4 h-4 mr-1" />
                                    <p className='mt-0.5'>새 코스 패키지</p>
                                </Button>
                            </div>

                            {/* 일관된 컨테이너 - 검색 전후 동일한 구조 */}
                            <div className="space-y-1">
                                
                                {/* 데이터가 있을 때만 목록 표시 */}
                                {filteredSequences.length > 0 ? (
                                    <div className="space-y-1">
                                        {filteredSequences.map((sequence, index) => (
                                            <div
                                                key={index}
                                                onClick={() => handleSequenceClick(sequence)}
                                                className="border-b border-gray-100 py-3 cursor-pointer hover:bg-gray-50 transition-colors"
                                            >
                                                <div className="flex items-start justify-between">
                                                    {/* 왼쪽 컨테이너 */}
                                                    <div className="flex-1 min-w-0 pr-4">
                                                        <h4 className="text-sm font-medium text-gray-900 truncate mb-1">
                                                            {sequence.sequence_name || `코스 패키지 ${sequence.group_id}`}
                                                        </h4>
                                                        <p className="text-xs text-gray-500 mb-2">
                                                            코스 패키지 ID: {sequence.group_id}
                                                        </p>
                                                        <div className="flex items-center space-x-2 mt-1">
                                                            <span className="text-xs text-gray-500">
                                                                {sequence.steps?.length || 0}개로 구성된 코스 패키지
                                                            </span>
                                                        </div>
                                                    </div>
                                                    
                                                    {/* 오른쪽 컨테이너 */}
                                                    <div className="flex flex-col text-left justify-start items-start w-32 mt-1 gap-1">
                                                        <p className="text-xs text-gray-500">
                                                            포함 Step: {sequence.steps?.length || 0}개
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            총 기간: {sequence.steps?.reduce((total: number, step: SequenceStepResponse) => total + (step.sequence_interval || 0), 0) || 0}일
                                                        </p>
                                                        <p className="text-sm font-medium text-gray-900">
                                                            <span className="text-gray-500 text-xs">총 비용: </span> 
                                                            {(sequence.steps?.reduce((total: number, step: SequenceStepResponse) => total + (step.procedure_cost || 0), 0) || 0).toLocaleString()}원
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    /* 데이터가 없을 때 */
                                    <div className="text-center py-12">
                                        <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                                            <Package className="w-8 h-8 text-gray-400" />
                                        </div>
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                                            {isSearching ? '검색 결과가 없습니다' : 'Sequence가 없습니다'}
                                        </h3>
                                        <p className="text-sm text-gray-500 mb-4">
                                            {isSearching 
                                                ? '다른 검색어를 시도해보세요' 
                                                : '새로운 Sequence를 추가해보세요'
                                            }
                                        </p>
                                        {!isSearching && (
                                            <Button onClick={handleCreateClick} className="bg-gray-900 hover:bg-gray-800">
                                                <Plus className="w-4 h-4 mr-2" />
                                                첫 Sequence 추가
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
            
            {/* 시퀀스 디테일 모달 */}
            <SequenceDetailModal
                isOpen={activeModal === 'sequence-detail'}
                onClose={closeModal}
                onSuccess={closeModal}
                sequence={modalData?.type === 'sequence-detail' ? modalData.data : null}
                onRefresh={forceRefreshAllProcedures}
            />
        </div>
    );
}
