'use client';

import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, Plus, Tickets } from 'lucide-react';
import { MembershipResponse } from '@/api/membership-api';
import { Button } from '@/components/ui/button';
import { useModalStore } from '@/store/modal-store';
import MembershipCreateModal from './membership-create-modal';

interface MembershipTabProps {
    memberships: MembershipResponse[];  // 멤버십 목록 (api 호출 결과)
    loading: boolean;     // 로딩 상태 (true/false)
    error: string | null; // 에러 메시지 (null 또는 에러 메시지 문자열)
    searchQuery: string;  // 검색 쿼리 (검색어)
    onRefresh: () => Promise<void>; // 새로고침 함수 (Promise<void> 반환)
    totalMemberships?: number; // 원본 데이터 개수 추가
}

export default function MembershipTab({ memberships, loading, error, searchQuery, onRefresh, totalMemberships }: MembershipTabProps) {
    const { openMembershipDetail, openMembershipCreate, activeModal, closeModal } = useModalStore();
    
    const handleMembershipClick = (membership: MembershipResponse) => {
        openMembershipDetail(membership, onRefresh);
    };

    const handleCreateClick = () => {
        openMembershipCreate(onRefresh);
    };

    // 멤버십 타입에 따른 아이콘과 배지 색상 반환
    const getMembershipBadge = (packageType: string) => {
        switch (packageType) {
            case '단일시술':
                return {
                    icon: <Tickets className="w-3 h-3" />,
                    borderColor: 'border-gray-400',
                    textColor: 'text-gray-400'
                };
            case '번들':
                return {
                    icon: <Tickets className="w-3 h-3" />,
                    borderColor: 'border-orange-400',
                    textColor: 'text-orange-400'
                };
            case '커스텀':
                return {
                    icon: <Tickets className="w-3 h-3" />,
                    borderColor: 'border-red-400',
                    textColor: 'text-red-400'
                };
            case '시퀀스':
                return {
                    icon: <Tickets className="w-3 h-3" />,
                    borderColor: 'border-purple-400',
                    textColor: 'text-purple-400'
                };
            default:
                return {
                    icon: <Tickets className="w-3 h-3" />,
                    borderColor: 'border-gray-400',
                    textColor: 'text-gray-400'
                };
        }
    };

    // 검색 중인지 여부
    const isSearching = searchQuery.trim().length > 0;
    // 표시할 데이터 개수 (검색 중이면 검색 결과, 아니면 원본 데이터)
    const displayCount = isSearching ? memberships.length : (totalMemberships || memberships.length);

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
                            <Button onClick={onRefresh}>
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
                                    총 맴버십 개수: {isSearching ? `${memberships.length}개 (검색 결과)` : `${displayCount}개`}
                                </h3>

                                <Button 
                                    variant="outline" 
                                    size="sm"
                                    className='mb-2 bg-white hover:bg-gray-50 border-gray-300 text-gray-700 hover:text-gray-900 transition-colors'
                                    onClick={handleCreateClick}
                                >
                                    <Plus className="w-4 h-4 mr-1" />
                                    새 맴버십
                                </Button>
                            </div>

                            {/* 일관된 컨테이너 - 검색 전후 동일한 구조 */}
                            <div className="space-y-1">
                                
                                {/* 데이터가 있을 때만 목록 표시 */}
                                {memberships.length > 0 ? (
                                    memberships.map((membership) => (
                                        <div 
                                            key={membership.id} 
                                            className="border-b border-gray-100 py-3 cursor-pointer hover:bg-gray-50 transition-colors"
                                            onClick={() => handleMembershipClick(membership)}
                                        >

                                            <div className="flex items-start justify-between">
                                                
                                                {/* 왼쪽 컨테이너 */}
                                                <div className="flex-1 min-w-0 pr-4">
                                                    <h4 className="text-sm font-medium text-gray-900 truncate mb-1">
                                                        {membership.info?.membership_name || `Membership ${membership.id}`}
                                                    </h4>
                                                    <div className="text-xs text-gray-500 mb-2">
                                                        {(() => {
                                                            const badge = getMembershipBadge(membership.package_type);
                                                            const displayText = (() => {
                                                                switch (membership.package_type) {
                                                                    case '번들':
                                                                        return '패키지';
                                                                    case '시퀀스':
                                                                        return '코스 패키지';
                                                                    case '커스텀':
                                                                        return '커스텀';
                                                                    default:
                                                                        return membership.package_type;
                                                                }
                                                            })();
                                                            return (
                                                                <div className={`${badge.borderColor} ${badge.textColor} border rounded-full text-[10px] font-medium items-center gap-1 bg-white inline-flex py-0.5 pl-1.5 pr-2`}>
                                                                    {badge.icon}
                                                                    <span className="text-[9px] mt-0.5">{displayText}</span>
                                                                </div>
                                                            );
                                                        })()}
                                                    </div>
                                                    <p className="text-xs text-gray-400 line-clamp-1">
                                                        {membership.release_start_date && membership.release_end_date 
                                                            ? `${membership.release_start_date.split(' ')[0]} ~ ${membership.release_end_date.split(' ')[0]}`
                                                            : '기간 미정'
                                                        }
                                                    </p>
                                                </div>
                                                
                                                {/* 오른쪽 컨테이너 */}
                                                <div className="flex-shrink-0 w-32 mt-7">
                                                    <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                                                        <span>할인율: {(membership.discount_rate * 100).toFixed(1)}%</span>
                                                    </div>
                                                    <p className="text-sm font-medium text-gray-900 text-left">
                                                        <span className="text-gray-500 text-xs">가격:</span> {membership.payment_amount?.toLocaleString()} 원
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
                                            {isSearching ? '검색 결과가 없습니다' : 'Membership 목록이 없습니다'}
                                        </h3>
                                        <p className="text-sm text-gray-500">
                                            {isSearching ? '다른 검색어를 시도해보세요' : '선택한 조건에 맞는 Membership이 없습니다'}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                    
                </CardContent>
            </Card>
            
            {/* 멤버십 생성 모달 */}
            <MembershipCreateModal
                isOpen={activeModal === 'membership-create'}
                onClose={closeModal}
                onSuccess={closeModal}
                onRefresh={onRefresh}
            />
        </div>
    );
}
