'use client'

import { useState, useEffect, useRef, useCallback } from 'react';
import { getConsultations } from '@/api/consultations-api';
import { ConsultationListResponse, ConsultationReadResponse } from '@/types/consultations';
import ConsultationDetailModal from './consultation-detail-modal';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RefreshCw, AlertTriangle, Calendar, User, CreditCard, ArrowUpDown } from 'lucide-react';
import Image from 'next/image';

export default function ConsultationList() {
    const [consultations, setConsultations] = useState<ConsultationReadResponse[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [nextCursor, setNextCursor] = useState<number | null>(null);
    const [hasMore, setHasMore] = useState(true);
    const [totalCount, setTotalCount] = useState<number>(0);
    const [selectedConsultation, setSelectedConsultation] = useState<ConsultationReadResponse | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    
    // 정렬 상태
    const [sortBy, setSortBy] = useState<'id' | 'consultation_date' | 'customer_name' | 'created_at'>('id');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    // 초기 데이터 로드
    const loadInitialData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await getConsultations({ 
                limit: 30,
                sort_by: sortBy,
                sort_order: sortOrder
            });
            setConsultations(response.consultations);
            setNextCursor(response.next_cursor || null);
            setHasMore(response.has_next);
            setTotalCount(response.total_count);
        } catch (error) {
            console.error('상담 목록 로드 실패:', error);
            setError('상담 목록을 불러오는데 실패했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    // 추가 데이터 로드
    const loadMoreData = async () => {
        if (!nextCursor || isLoadingMore) return;
        
        setIsLoadingMore(true);
        try {
            const response = await getConsultations({ 
                cursor: nextCursor, 
                limit: 30,
                sort_by: sortBy,
                sort_order: sortOrder
            });
            setConsultations(prev => [...prev, ...response.consultations]);
            setNextCursor(response.next_cursor || null);
            setHasMore(response.has_next);
        } catch (error) {
            console.error('추가 데이터 로드 실패:', error);
        } finally {
            setIsLoadingMore(false);
        }
    };

    // 새로고침 함수
    const handleRefresh = () => {
        loadInitialData();
    };

    // 스크롤 이벤트 핸들러
    const handleScroll = useCallback(() => {
        const container = scrollContainerRef.current;
        if (!container || !hasMore || isLoadingMore) return;

        const scrollTop = container.scrollTop;
        const clientHeight = container.clientHeight;
        const scrollHeight = container.scrollHeight;
        const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100;
        
        if (isNearBottom) {
            loadMoreData();
        }
    }, [hasMore, isLoadingMore, loadMoreData]);

    // 스크롤 이벤트 리스너 등록
    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container) return;

        container.addEventListener('scroll', handleScroll);
        
        return () => {
            container.removeEventListener('scroll', handleScroll);
        };
    }, [handleScroll]);

    // 초기 데이터 로드
    useEffect(() => {
        loadInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sortBy, sortOrder]);


    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('ko-KR', {
            timeZone: 'Asia/Seoul'
        });
    };

    const formatTime = (timeString: string) => {
        const date = new Date(timeString);
        return date.toLocaleTimeString('ko-KR', {
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'Asia/Seoul'
        });
    };

    const handleConsultationClick = (consultation: ConsultationReadResponse) => {
        setSelectedConsultation(consultation);
        setIsModalOpen(true);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setSelectedConsultation(null);
    };

    return (
        <div className="px-3">
            <Card className="border-none shadow-none">
                <CardContent className="px-6 py-2">
                    
                    {/* 로딩 상태 */}
                    {isLoading && (
                        <div className="text-center py-8 fade-in">
                            <Image 
                                src="/logo.svg" 
                                alt="로딩" 
                                width={32} 
                                height={32} 
                                className="mx-auto mb-4" 
                            />
                            <p className="text-sm text-gray-600">로딩 중입니다</p>
                        </div>
                    )}

                    {/* 데이터 없음 */}
                    {!isLoading && !error && consultations.length === 0 && (
                        <div className="text-center py-8 fade-in">
                            <div className="w-16 h-11 rounded-full mx-auto mb-4 flex items-center justify-center">
                                <Image 
                                    src="/logo.svg" 
                                    alt="데이터 없음" 
                                    width={32} 
                                    height={32} 
                                    className="mx-auto mb-4" 
                                />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">상담 목록이 없습니다</h3>
                            <p className="text-sm text-gray-500">등록된 상담이 없습니다</p>
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
                            <Button onClick={handleRefresh}>
                                다시 시도
                            </Button>
                        </div>
                    )}

                    {/* 데이터 표시 */}
                    {!isLoading && !error && consultations.length > 0 && (
                        <div className="slide-up">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-md font-medium text-gray-900">
                                    총 상담 개수: {totalCount.toLocaleString()}개
                                </h3>
                                
                                <div className="flex items-center gap-2">
                                    {/* 정렬 기준 선택 */}
                                    <Select value={sortBy} onValueChange={(value) => setSortBy(value as typeof sortBy)}>
                                        <SelectTrigger className="w-[140px] h-8 text-sm">
                                            <ArrowUpDown className="w-3 h-3 mr-1" />
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="id">ID 순</SelectItem>
                                            <SelectItem value="consultation_date">상담 일자</SelectItem>
                                            <SelectItem value="customer_name">고객명</SelectItem>
                                            <SelectItem value="created_at">생성일시</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    
                                    {/* 정렬 순서 선택 */}
                                    <Select value={sortOrder} onValueChange={(value) => setSortOrder(value as typeof sortOrder)}>
                                        <SelectTrigger className="w-[100px] h-8 text-sm">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="desc">내림차순</SelectItem>
                                            <SelectItem value="asc">오름차순</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    
                                    {/* 새로고침 버튼 */}
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleRefresh}
                                        disabled={isLoading}
                                        className="bg-white text-gray-600 border-none shadow-none"
                                    >
                                        <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`}/>
                                    </Button>
                                </div>
                            </div>
                            
                            <div 
                                ref={scrollContainerRef}
                                className="h-[70vh] overflow-y-auto"
                                style={{ scrollBehavior: 'smooth' }}
                            >
                                <div className="space-y-1">
                                    {consultations.map((consultation, index) => (
                                        <div 
                                            key={`${consultation.id}-${index}`} 
                                            className="border-b border-gray-100 py-6 cursor-pointer hover:bg-gray-50 transition-colors"
                                            onClick={() => handleConsultationClick(consultation)}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <User className="w-4 h-4 text-gray-400" />
                                                        <h4 className="text-sm font-medium text-gray-900 truncate">
                                                            {consultation.customer_name}
                                                        </h4>
                                                        <span className="text-xs text-gray-500">
                                                            차트 #{consultation.chart_number}
                                                        </span>
                                                    </div>
                                                    
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 min-w-fit">
                                                            #{consultation.id}
                                                        </span>
                                                        <span className="text-xs text-gray-500 truncate">
                                                            {consultation.consultation_type}
                                                        </span>
                                                        {consultation.inflow_path && (
                                                            <span className="text-xs text-gray-500 truncate">
                                                                {consultation.inflow_path}
                                                            </span>
                                                        )}
                                                    </div>
                                                    
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="w-3 h-3 text-gray-400" />
                                                        <span className="text-xs text-gray-500">
                                                            {formatDate(consultation.consultation_date)}
                                                        </span>
                                                        <span className="text-xs text-gray-400">
                                                            {formatTime(consultation.start_time)} - {formatTime(consultation.end_time)}
                                                        </span>
                                                    </div>
                                                </div>
                                                
                                                <div className="text-right ml-3 flex-shrink-0">
                                                    <div className="flex items-center gap-1 mb-1">
                                                        <CreditCard className="w-3 h-3 text-gray-400" />
                                                        <p className="text-xs text-gray-500">
                                                            {consultation.payment_type}
                                                        </p>
                                                    </div>
                                                    <p className="text-sm font-medium text-gray-900 pr-1.5">
                                                        {consultation.total_payment?.toLocaleString() || '0'}원
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    
                                    {/* 로딩 인디케이터 */}
                                    {isLoadingMore && (
                                        <div className="flex justify-center items-center py-4">
                                            <div className="flex items-center space-x-2 text-gray-600">
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                                                <span className="text-sm">더 많은 상담을 불러오는 중...</span>
                                            </div>
                                        </div>
                                    )}
                                    
                                    {/* 더보기 버튼 */}
                                    {hasMore && consultations.length > 0 && !isLoadingMore && (
                                        <div className="flex justify-center items-center py-4">
                                            <Button
                                                onClick={loadMoreData}
                                                variant="outline"
                                                size="sm"
                                                className="bg-white text-gray-600 border-gray-300"
                                            >
                                                더 불러오기 (30개)
                                            </Button>
                                        </div>
                                    )}
                                    
                                    {/* 더 이상 불러올 데이터가 없을 때 */}
                                    {!hasMore && consultations.length > 0 && (
                                        <div className="flex justify-center items-center py-4">
                                            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded">
                                                모든 상담을 불러왔습니다
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
            
            {/* 상담 상세 모달 */}
            <ConsultationDetailModal
                consultation={selectedConsultation}
                isOpen={isModalOpen}
                onClose={handleModalClose}
            />
        </div>
    );
}