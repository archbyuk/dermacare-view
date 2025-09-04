'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
    Settings,
    X,
    Save,
    Edit
} from 'lucide-react';
import Image from 'next/image';
import { GlobalResponse, updateGlobalSettings } from '@/api/global-api';

interface LaborCostsTabProps {
    globalSettings: GlobalResponse | null;
    loading: boolean;
    error: string | null;
    searchQuery: string;
    onRefresh: () => void;
}

export default function GlobalCostsTab({ 
    globalSettings, 
    loading, 
    error, 
    searchQuery, 
    onRefresh
}: LaborCostsTabProps) {
    const isSearching = searchQuery.length > 0;

    // 수정 모달 상태
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingType, setEditingType] = useState<'doctor' | 'aesthetician' | null>(null);
    const [editValue, setEditValue] = useState('');
    const [saving, setSaving] = useState(false);

    // 수정 버튼 클릭 핸들러
    const handleEditClick = (type: 'doctor' | 'aesthetician') => {
        setEditingType(type);
        const currentValue = type === 'doctor' 
            ? globalSettings?.doc_price_minute 
            : globalSettings?.aesthetician_price_minute;
        setEditValue(currentValue?.toString() || '');
        setIsModalOpen(true);
    };

    // 모달 닫기 핸들러
    const handleModalClose = () => {
        setIsModalOpen(false);
        setEditingType(null);
        setEditValue('');
    };

    // 수정 저장 핸들러
    const handleSave = async () => {
        if (!globalSettings || !editingType) return;
        
        const newValue = parseFloat(editValue);
        if (isNaN(newValue) || newValue < 0) {
            alert('올바른 금액을 입력해주세요.');
            return;
        }

        setSaving(true);
        try {
            const updateData = {
                doc_price_minute: editingType === 'doctor' ? newValue : globalSettings.doc_price_minute,
                aesthetician_price_minute: editingType === 'aesthetician' ? newValue : globalSettings.aesthetician_price_minute
            };

            await updateGlobalSettings(updateData);
            
            // 부모 컴포넌트에 데이터 업데이트 알림
            onRefresh();
            
            // 모달 닫기
            handleModalClose();
            
            alert('인건비가 성공적으로 수정되었습니다.');
        } catch (error: unknown) {
            console.error('수정 실패:', error);
            alert(`수정 중 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
        } finally {
            setSaving(false);
        }
    };

    // 수정 타입에 따른 라벨과 현재 값
    const getEditInfo = () => {
        if (editingType === 'doctor') {
            return {
                label: '의사 시간당 요금',
                currentValue: globalSettings?.doc_price_minute
            };
        } else if (editingType === 'aesthetician') {
            return {
                label: '관리사 시간당 요금',
                currentValue: globalSettings?.aesthetician_price_minute
            };
        }
        return { label: '', currentValue: 0 };
    };

    const editInfo = getEditInfo();

    return (
        <div className="space-y-2 h-full overflow-hidden">
            {/* 메인 콘텐츠 영역 */}
            <Card className="border-none shadow-none h-screen mx-auto max-w-2xl px-0">
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
                    {!loading && !error && globalSettings && (
                        <>
                            {/* 헤더 */}
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h4 className="font-semibold text-gray-900">인건비 관리</h4>
                                </div>
                            </div>

                            {/* 검색 결과 헤더 */}
                            {isSearching && (
                                <div className="mb-4 slide-up">
                                    <h3 className="text-md font-medium text-gray-900 mb-3">
                                        검색 결과: {isSearching ? '검색됨' : '전체'}
                                    </h3>
                                </div>
                            )}

                            {/* 인건비 설정 목록 */}
                            <div className="space-y-3 slide-up">
                                <div className="border-b border-gray-100 py-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center space-x-3">
                                                <div className="flex-1">
                                                    <h4 className="text-sm font-medium text-gray-900">
                                                        의사 시간당 요금
                                                    </h4>
                                                    <p className="text-xs text-gray-500">의사 1분당 요금 설정</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <div className="text-right">
                                                <p className="text-sm font-medium text-gray-900">
                                                    {globalSettings.doc_price_minute.toLocaleString()}원 
                                                    <span className="text-xs text-gray-500"> / 분</span>
                                                </p>
                                            </div>
                                            <Button 
                                                size="sm" 
                                                variant="outline" 
                                                className="text-blue-600 border-blue-200 hover:bg-blue-50"
                                                onClick={() => handleEditClick('doctor')}
                                            >
                                                <Edit className="w-4 h-4 mr-1" />
                                                수정
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                <div className="border-b border-gray-100 py-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center space-x-3">
                                                <div className="flex-1">
                                                    <h4 className="text-sm font-medium text-gray-900">
                                                        관리사 시간당 요금
                                                    </h4>
                                                    <p className="text-xs text-gray-500">관리사 1분당 요금 설정</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <div className="text-right">
                                                <p className="text-sm font-medium text-gray-900">
                                                    {globalSettings.aesthetician_price_minute.toLocaleString()}원
                                                    <span className="text-xs text-gray-500"> / 분</span>
                                                </p>
                                            </div>
                                            <Button 
                                                size="sm" 
                                                variant="outline" 
                                                className="text-blue-600 border-blue-200 hover:bg-blue-50"
                                                onClick={() => handleEditClick('aesthetician')}
                                            >
                                                <Edit className="w-4 h-4 mr-1" />
                                                수정
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* 데이터가 없는 경우 */}
                    {!loading && !error && !globalSettings && (
                        <div className="text-center py-8 slide-up">
                            <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                                <Settings className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                {isSearching ? '검색 결과가 없습니다' : '인건비 설정이 없습니다'}
                            </h3>
                            <p className="text-sm text-gray-500">
                                {isSearching ? '다른 검색어를 시도해보세요' : '인건비 설정을 확인해보세요'}
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* 수정 모달 */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg w-full max-w-md shadow-xl border border-gray-200">
                        {/* 헤더 */}
                        <div className="flex items-center justify-between p-4 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900">
                                인건비 수정
                            </h2>
                            <Button
                                onClick={handleModalClose}
                                variant="ghost"
                                size="sm"
                                className="text-gray-500 hover:text-gray-600"
                            >
                                <X className="w-5 h-5" />
                            </Button>
                        </div>

                        {/* 내용 */}
                        <div className="p-4">
                            <div className="mb-4">
                                <p className="text-sm text-gray-600 mb-2">
                                    {editInfo.label}을 얼마로 설정하시겠습니까?
                                </p>
                                <p className="text-xs text-gray-500 mb-4">
                                    현재: {editInfo.currentValue?.toLocaleString()}원/분
                                </p>
                                <Input
                                    type="number"
                                    value={editValue}
                                    onChange={(e) => setEditValue(e.target.value)}
                                    placeholder="금액을 입력하세요"
                                    className="w-full"
                                />
                                <p className="text-xs text-gray-500 mt-1">원/분</p>
                            </div>
                        </div>

                        {/* 푸터 */}
                        <div className="flex items-center justify-end space-x-3 p-4 border-t border-gray-200">
                            <Button
                                onClick={handleModalClose}
                                variant="outline"
                                className="text-gray-600 border-gray-300 hover:bg-gray-50"
                            >
                                취소
                            </Button>
                            <Button
                                onClick={handleSave}
                                className="bg-blue-600 hover:bg-blue-700"
                                disabled={saving}
                            >
                                {saving ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        저장 중...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4 mr-2" />
                                        저장
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
