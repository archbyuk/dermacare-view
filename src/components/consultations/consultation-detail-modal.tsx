'use client'

import { ConsultationReadResponse } from '@/types/consultations';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar, User, CreditCard, Clock, MapPin, MessageSquare, ShoppingBag } from 'lucide-react';

interface ConsultationDetailModalProps {
    consultation: ConsultationReadResponse | null;
    isOpen: boolean;
    onClose: () => void;
}

export default function ConsultationDetailModal({ 
    consultation, 
    isOpen, 
    onClose 
}: ConsultationDetailModalProps) {
    if (!consultation) return null;

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long',
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

    const formatDateTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString('ko-KR', {
            timeZone: 'Asia/Seoul'
        });
    };

    const formatValue = (value: string | number | boolean | null | undefined) => {
        if (value === null || value === undefined || value === '') {
            return 'NULL';
        }
        return value;
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold flex items-center gap-2">
                        <User className="w-5 h-5" />
                        상담 상세 정보
                    </DialogTitle>
                    <DialogDescription>
                        상담 ID: #{consultation.id} | 고객: {consultation.customer_name}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* 기본 정보 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-gray-500" />
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        고객명
                                    </label>
                                    <div className="text-lg font-semibold">{formatValue(consultation.customer_name)}</div>
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    차트번호
                                </label>
                                <div className="text-lg">#{formatValue(consultation.chart_number)}</div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-gray-500" />
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        상담일자
                                    </label>
                                    <div className="text-lg">{formatDate(consultation.consultation_date)}</div>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-gray-500" />
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        상담 시간
                                    </label>
                                    <div className="text-lg">
                                        {formatTime(consultation.start_time)} - {formatTime(consultation.end_time)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 상담 정보 */}
                    <div className="border-t pt-6">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <MessageSquare className="w-5 h-5" />
                            상담 정보
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    유입경로
                                </label>
                                <div className="p-3 bg-gray-50 rounded-md border">{formatValue(consultation.inflow_path)}</div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    상담유형
                                </label>
                                <div className="p-3 bg-gray-50 rounded-md border">{formatValue(consultation.consultation_type)}</div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    고민유형
                                </label>
                                <div className="p-3 bg-gray-50 rounded-md border">{formatValue(consultation.concern_type)}</div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    목표시술 여부
                                </label>
                                <div className="p-3 bg-gray-50 rounded-md border">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                        consultation.goal_treatment 
                                            ? 'bg-green-100 text-green-800' 
                                            : 'bg-gray-100 text-gray-800'
                                    }`}>
                                        {consultation.goal_treatment ? '예' : '아니오'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 결제 정보 */}
                    <div className="border-t pt-6">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <CreditCard className="w-5 h-5" />
                            결제 정보
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    결제액
                                </label>
                                <div className="text-2xl font-bold text-green-600">
                                    {consultation.total_payment ? consultation.total_payment.toLocaleString() : 'NULL'}원
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    결제타입
                                </label>
                                <div className="p-3 bg-gray-50 rounded-md border">{formatValue(consultation.payment_type)}</div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    할인율
                                </label>
                                <div className="p-3 bg-gray-50 rounded-md border">
                                    {formatValue(consultation.discount_rate)}%
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    회원권 보유
                                </label>
                                <div className="p-3 bg-gray-50 rounded-md border">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                        consultation.has_membership 
                                            ? 'bg-blue-100 text-blue-800' 
                                            : 'bg-gray-100 text-gray-800'
                                    }`}>
                                        {consultation.has_membership ? '보유' : '미보유'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 구매 상품 */}
                    {consultation.purchased_items && (
                        <div className="border-t pt-6">
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <ShoppingBag className="w-5 h-5" />
                                구매 상품
                            </h3>
                            <div className="p-4 bg-gray-50 rounded-md border">
                                {formatValue(consultation.purchased_items)}
                            </div>
                        </div>
                    )}

                    {/* 상담 내용 */}
                    {consultation.consultation_content && (
                        <div className="border-t pt-6">
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <MessageSquare className="w-5 h-5" />
                                상담 내용
                            </h3>
                            <div className="p-4 bg-gray-50 rounded-md border whitespace-pre-wrap">
                                {formatValue(consultation.consultation_content)}
                            </div>
                        </div>
                    )}

                    {/* 시스템 정보 */}
                    <div className="border-t pt-6">
                        <h3 className="text-lg font-semibold mb-4">시스템 정보</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-600">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    생성일시
                                </label>
                                <div className="p-2 bg-gray-50 rounded border">{formatDateTime(consultation.created_at)}</div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    수정일시
                                </label>
                                <div className="p-2 bg-gray-50 rounded border">{formatDateTime(consultation.updated_at)}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter className="bg-gray-50 -mx-6 -mb-6 px-6 py-4">
                    <Button variant="outline" onClick={onClose}>
                        닫기
                    </Button>
                    <Button>
                        수정하기
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
