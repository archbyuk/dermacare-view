'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Save } from 'lucide-react';
import { createConsumable, ConsumableCreateRequest } from '@/api/consumables-api';
import {
  UNIT_TYPE_OPTIONS,
  TAXABLE_TYPE_OPTIONS,
  COVERED_TYPE_OPTIONS,
} from '@/lib/constants';

interface ConsumablesCreateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    onRefresh?: (() => Promise<void>) | null;
}

export default function ConsumablesCreateModal({ isOpen, onClose, onSuccess, onRefresh }: ConsumablesCreateModalProps) {
    const [formData, setFormData] = useState<ConsumableCreateRequest>({
        id: 0,
        name: '',
        unit_price: 0,
        unit_type: '',
        description: '',
        price: 0,
        i_value: undefined,
        f_value: undefined,
        taxable_type: '',
        covered_type: '',
    });
    
    const [saving, setSaving] = useState(false);

    // 폼 데이터 변경 핸들러
    const handleInputChange = (field: keyof ConsumableCreateRequest, value: string | number | undefined) => {
        setFormData({
            ...formData,
            [field]: value
        });
    };

    // 소모품 생성
    const handleCreate = async () => {
        if (!formData.name || !formData.unit_price || !formData.unit_type) {
            alert('필수 항목을 모두 입력해주세요.');
            return;
        }
        
        setSaving(true);
        try {
            const response = await createConsumable(formData);
            
            // 성공 메시지 표시
            alert('소모품이 성공적으로 생성되었습니다.');
            
            // 부모 컴포넌트에 성공 알림
            onSuccess();
            
            // consumables-tab 데이터 새로고침
            if (onRefresh) {
                await onRefresh();
            }
            
            // 모달 닫기
            onClose();
            
            // 폼 초기화
            setFormData({
                id: 0,
                name: '',
                unit_price: 0,
                unit_type: '',
                description: '',
                price: 0,
                i_value: undefined,
                f_value: undefined,
                taxable_type: '',
                covered_type: '',
            });
        } catch (error: unknown) {
            console.error('생성 실패:', error);
            alert(`생성 중 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center z-50 p-4 overflow-hidden">
            <div className="bg-white rounded-xl w-full max-w-md h-[85vh] flex flex-col shadow-2xl border border-gray-200">
                
                {/* 헤더 */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">새 소모품 생성</h2>
                    <Button
                        onClick={onClose}
                        variant="ghost"
                        size="sm"
                        className="!text-gray-500 hover:text-gray-600 p-0 h-auto"
                    >
                        <X className="!w-5 !h-5" />
                    </Button>
                </div>

                {/* 내용 */}
                <div className="p-4 flex-1 overflow-y-auto">
                    <div className="space-y-4">
                        {/* 기본 정보 */}
                        <div>
                            <h3 className="text-sm font-medium text-gray-900 mb-2">기본 정보</h3>
                            <div className="bg-gray-50 rounded-lg p-3 space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs text-gray-500 block mb-1">소모품 ID</label>
                                        <Input
                                            value={formData.id || ''}
                                            onChange={(e) => handleInputChange('id', e.target.value ? Number(e.target.value) : 0)}
                                            placeholder="소모품 ID"
                                            className="text-sm text-gray-600 placeholder:text-gray-500 bg-white border-gray-300 focus:ring-0 focus:border-gray-300"
                                            type="number"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 block mb-1">소모품명</label>
                                        <Input
                                            value={formData.name}
                                            onChange={(e) => handleInputChange('name', e.target.value)}
                                            placeholder="소모품명을 입력하세요"
                                            className="text-sm text-gray-600 placeholder:text-gray-500 bg-white border-gray-300 focus:ring-0 focus:border-gray-300"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 block mb-1">설명</label>
                                    <Textarea
                                        value={formData.description || ''}
                                        onChange={(e) => handleInputChange('description', e.target.value)}
                                        placeholder="소모품 설명을 입력하세요"
                                        className="bg-white text-sm min-h-[8vh] w-full resize-none text-gray-600 placeholder:text-gray-500 border-gray-300 focus:ring-0 focus:border-gray-300"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 가격 정보 */}
                        <div>
                            <h3 className="text-sm font-medium text-gray-900 mb-2">가격 정보</h3>
                            <div className="bg-gray-50 rounded-lg p-3 space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs text-gray-500 block mb-1">단위당 원가 (원)</label>
                                        <Input
                                            value={formData.unit_price || ''}
                                            onChange={(e) => handleInputChange('unit_price', e.target.value ? Number(e.target.value) : 0)}
                                            placeholder="단위당 원가"
                                            className="text-sm text-gray-600 placeholder:text-gray-500 bg-white border-gray-300 focus:ring-0 focus:border-gray-300"
                                            type="number"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 block mb-1">구매가격 (원)</label>
                                        <Input
                                            value={formData.price || ''}
                                            onChange={(e) => handleInputChange('price', e.target.value ? Number(e.target.value) : 0)}
                                            placeholder="구매가격"
                                            className="text-sm text-gray-600 placeholder:text-gray-500 bg-white border-gray-300 focus:ring-0 focus:border-gray-300"
                                            type="number"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 block mb-1">단위</label>
                                    <Select
                                        value={formData.unit_type}
                                        onValueChange={(value) => handleInputChange('unit_type', value)}
                                    >
                                        <SelectTrigger className="text-sm bg-white text-gray-600 border-gray-300">
                                            <SelectValue placeholder="단위 선택" className="text-gray-900" />
                                        </SelectTrigger>
                                        <SelectContent className="w-full bg-white border-gray-300 shadow-lg">
                                            {UNIT_TYPE_OPTIONS.map((option) => (
                                                <SelectItem key={option.value} value={option.value} className="text-gray-600">
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        {/* 수치 정보 */}
                        <div>
                            <h3 className="text-sm font-medium text-gray-900 mb-2">수치 정보</h3>
                            <div className="bg-gray-50 rounded-lg p-3 space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs text-gray-500 block mb-1">정수값 (I값)</label>
                                        <Input
                                            value={formData.i_value || ''}
                                            onChange={(e) => handleInputChange('i_value', e.target.value ? Number(e.target.value) : undefined)}
                                            placeholder="정수값"
                                            className="text-sm text-gray-600 placeholder:text-gray-500 bg-white border-gray-300 focus:ring-0 focus:border-gray-300"
                                            type="number"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 block mb-1">실수값 (F값)</label>
                                        <Input
                                            value={formData.f_value || ''}
                                            onChange={(e) => handleInputChange('f_value', e.target.value ? Number(e.target.value) : undefined)}
                                            placeholder="실수값"
                                            className="text-sm text-gray-600 placeholder:text-gray-500 bg-white border-gray-300 focus:ring-0 focus:border-gray-300"
                                            type="number"
                                            step="0.01"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 분류 정보 */}
                        <div>
                            <h3 className="text-sm font-medium text-gray-900 mb-2">분류 정보</h3>
                            <div className="bg-gray-50 rounded-lg p-3 space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs text-gray-500 block mb-1">과세 유형</label>
                                        <Select
                                            value={formData.taxable_type || ''}
                                            onValueChange={(value) => handleInputChange('taxable_type', value)}
                                        >
                                            <SelectTrigger className="text-sm bg-white text-gray-600 border-gray-300">
                                                <SelectValue placeholder="과세 유형 선택" className="text-gray-900" />
                                            </SelectTrigger>
                                            <SelectContent className="w-full bg-white border-gray-300 shadow-lg">
                                                {TAXABLE_TYPE_OPTIONS.map((option) => (
                                                    <SelectItem key={option.value} value={option.value} className="text-gray-600">
                                                        {option.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 block mb-1">급여 분류</label>
                                        <Select
                                            value={formData.covered_type || ''}
                                            onValueChange={(value) => handleInputChange('covered_type', value)}
                                        >
                                            <SelectTrigger className="text-sm bg-white text-gray-600 border-gray-300">
                                                <SelectValue placeholder="급여 분류 선택" className="text-gray-900" />
                                            </SelectTrigger>
                                            <SelectContent className="w-full bg-white border-gray-300 shadow-lg">
                                                {COVERED_TYPE_OPTIONS.map((option) => (
                                                    <SelectItem key={option.value} value={option.value} className="text-gray-600">
                                                        {option.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 하단 버튼 */}
                <div className="p-4 border-t border-gray-200 flex-shrink-0">
                    <div className="flex space-x-3">
                        <Button
                            onClick={onClose}
                            className="flex-1 bg-gray-500 py-3 font-semibold text-white"
                            variant="secondary"
                            disabled={saving}
                        >
                            취소
                        </Button>
                        <Button
                            onClick={handleCreate}
                            className="flex-1 bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700"
                            disabled={saving}
                        >
                            {saving ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    생성 중...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4 mr-2" />
                                    생성하기
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
