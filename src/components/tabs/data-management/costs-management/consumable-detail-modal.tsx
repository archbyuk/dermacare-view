'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Settings, Save, Edit, DollarSign, Package, Tag, AlertTriangle, Hash, TrendingDown } from 'lucide-react';
import { ConsumableResponse, getConsumableDetail, updateConsumable } from '@/api/consumables-api';
import { UNIT_TYPE_OPTIONS } from '@/lib/constants';

interface ConsumableDetailModalProps {
    consumable: ConsumableResponse | null;
    isOpen: boolean;
    onClose: () => void;
    onDataUpdate?: () => void;
}

export default function ConsumableDetailModal({ 
    consumable, 
    isOpen, 
    onClose, 
    onDataUpdate 
}: ConsumableDetailModalProps) {
    const [detailConsumable, setDetailConsumable] = useState<ConsumableResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState<Partial<ConsumableResponse>>({});
    const [saving, setSaving] = useState(false);

    // 모달이 열릴 때 상세 정보 가져오기
    useEffect(() => {
        if (isOpen && consumable?.id) {
            setLoading(true);
            setError(null);
            
            getConsumableDetail(consumable.id)
                .then((detailData) => {
                    setDetailConsumable(detailData);
                })
                .catch((err) => {
                    setError(err.message);
                    // 에러가 발생해도 기본 정보는 표시
                    setDetailConsumable(consumable);
                })
                .finally(() => {
                    setLoading(false);
                });
        } else if (!isOpen) {
            // 모달이 닫힐 때 상태 초기화
            setDetailConsumable(null);
            setError(null);
            setIsEditing(false);
            setEditData({});
        }
    }, [isOpen, consumable]);

    // 표시할 데이터 결정 (상세 정보가 있으면 상세 정보, 없으면 기본 정보)
    const displayConsumable = detailConsumable || consumable;

    // 수정 모드 시작
    const handleEdit = () => {
        if (displayConsumable) {
            // 원래 값들을 그대로 복사하여 editData에 설정
            const originalData = {
                id: displayConsumable.id,
                name: displayConsumable.name || '',
                unit_price: displayConsumable.unit_price || 0,
                unit_type: displayConsumable.unit_type || '',
                description: displayConsumable.description || '',
                price: displayConsumable.price || 0,
                i_value: displayConsumable.i_value || undefined,
                f_value: displayConsumable.f_value || undefined,
                vat: displayConsumable.vat || 0,
                taxable_type: displayConsumable.taxable_type || '',
                covered_type: displayConsumable.covered_type || '',
                release: displayConsumable.release || 1,
            };
            
            setEditData(originalData);
            setIsEditing(true);
        }
    };

    // 수정 모드 취소
    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditData({});
    };

    // 수정 저장
    const handleSave = async () => {
        if (!displayConsumable?.id) return;
        
        setSaving(true);
        try {
            // updateConsumable API 호출
            const response = await updateConsumable(displayConsumable.id, editData);
            
            // 수정된 데이터로 상태 업데이트
            if (response.data) {
                setDetailConsumable(response.data);
            }
            setIsEditing(false);
            setEditData({});
            
            // 부모 컴포넌트에 데이터 업데이트 알림
            if (onDataUpdate) {
                onDataUpdate();
            }
            
            // 성공 메시지 표시
            alert('소모품 정보가 성공적으로 수정되었습니다.');
        } catch (error: unknown) {
            console.error('수정 실패:', error);
            alert(`수정 중 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
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
                    <h2 className="text-lg font-semibold text-gray-900">
                        {isEditing ? '소모품 정보 수정' : '소모품 상세정보'}
                    </h2>
                    <Button
                        onClick={() => {
                            setIsEditing(false);
                            setEditData({});
                            onClose();
                        }}
                        variant="ghost"
                        size="sm"
                        className="!text-gray-500 hover:text-gray-600 p-0 h-auto"
                    >
                        <X className="!w-5 !h-5" />
                    </Button>
                </div>

                {/* 내용 */}
                <div className="p-4 flex-1 overflow-y-auto relative">
                    {loading && (
                        <div className="absolute inset-0 flex flex-col items-center justify-start pt-20 bg-white bg-opacity-90">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-600 mx-auto mb-2"></div>
                            <p className="text-sm text-gray-600">상세 정보를 불러오는 중...</p>
                        </div>
                    )}

                    {error && (
                        <div className="text-center py-3 bg-red-50 rounded-lg border border-red-200 mb-4">
                            <AlertTriangle className="w-4 h-4 text-red-500 mx-auto mb-1" />
                            <p className="text-sm text-red-600">{error}</p>
                            <p className="text-xs text-red-500">기본 정보만 표시됩니다.</p>
                        </div>
                    )}

                    {!loading && displayConsumable && (
                        <div className="space-y-4">
                            {/* 소모품명 */}
                            <div className="text-center pb-3 border-b border-gray-100">
                                {isEditing ? (
                                    <div className="space-y-3">
                                        <Input
                                            value={editData.name || ''}
                                            onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                                            placeholder="소모품명을 입력하세요"
                                            className="text-center text-lg font-semibold text-gray-600 placeholder:text-gray-500 bg-white border-gray-300 focus:ring-0 focus:border-gray-300"
                                        />
                                        <div className="flex items-center justify-center space-x-2">
                                            <Package className="w-3 h-3 text-gray-400" />
                                            <span className="text-xs text-gray-500">
                                                ID: {displayConsumable.id}
                                            </span>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <h2 className="text-lg font-semibold text-gray-900 mb-1">
                                            {displayConsumable.name || `Consumable ${displayConsumable.id}`}
                                        </h2>
                                        <div className="flex items-center justify-center space-x-2">
                                            <Package className="w-3 h-3 text-gray-400" />
                                            <span className="text-xs text-gray-500">
                                                ID: {displayConsumable.id}
                                            </span>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* 기본 정보 */}
                            <div className="space-y-3">
                                <div>
                                    <h3 className="text-sm font-medium text-gray-900 mb-2">기본 정보</h3>
                                    {isEditing ? (
                                        <div className="bg-gray-50 rounded-lg p-3 space-y-3">
                                            <div>
                                                <label className="text-xs text-gray-500 block mb-1">소모품명</label>
                                                <Input
                                                    value={editData.name || ''}
                                                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                                                    placeholder="소모품명"
                                                    className="text-sm text-gray-600 placeholder:text-gray-500 bg-white border-gray-300 focus:ring-0 focus:border-gray-300"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs text-gray-500 block mb-1">설명</label>
                                                <Textarea
                                                    value={editData.description || ''}
                                                    onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                                                    placeholder="소모품 설명을 입력하세요"
                                                    className="bg-white text-sm min-h-[8vh] w-full resize-none text-gray-600 placeholder:text-gray-500 border-gray-300 focus:ring-0 focus:border-gray-300"
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                                                <div className="flex items-center">
                                                    <Hash className="w-4 h-4 text-gray-500 mr-2" />
                                                    <span className="text-sm text-gray-700">소모품 ID</span>
                                                </div>
                                                <span className="text-sm font-medium text-gray-900">{displayConsumable.id}</span>
                                            </div>
                                            {displayConsumable.description && (
                                                <div className="bg-gray-50 rounded-lg p-3">
                                                    <p className="text-sm text-gray-600">{displayConsumable.description}</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* 가격 정보 */}
                                <div>
                                    <h3 className="text-sm font-medium text-gray-900 mb-2">가격 정보</h3>
                                    {isEditing ? (
                                        <div className="bg-gray-50 rounded-lg p-3 space-y-3">
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="text-xs text-gray-500 block mb-1">단가 (원)</label>
                                                    <Input
                                                        type="number"
                                                        value={editData.unit_price || 0}
                                                        onChange={(e) => setEditData({ ...editData, unit_price: parseFloat(e.target.value) || 0 })}
                                                        className="text-sm text-gray-600 placeholder:text-gray-500 bg-white border-gray-300 focus:ring-0 focus:border-gray-300"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-xs text-gray-500 block mb-1">단위</label>
                                                    <Select
                                                        value={editData.unit_type || ''}
                                                        onValueChange={(value) => setEditData({ ...editData, unit_type: value })}
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
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="text-xs text-gray-500 block mb-1">I값 (정수)</label>
                                                    <Input
                                                        type="number"
                                                        value={editData.i_value || ''}
                                                        onChange={(e) => {
                                                            const iValue = parseInt(e.target.value) || undefined;
                                                            setEditData({ 
                                                                ...editData, 
                                                                i_value: iValue,
                                                                f_value: iValue ? undefined : editData.f_value // I값이 입력되면 F값 초기화
                                                            });
                                                        }}
                                                        className={`text-sm placeholder:text-gray-500 border-gray-300 focus:ring-0 focus:border-gray-300 ${
                                                            editData.f_value ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-600'
                                                        }`}
                                                        disabled={!!editData.f_value}
                                                        placeholder={editData.f_value ? 'F값 사용 중' : 'I값 입력'}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-xs text-gray-500 block mb-1">F값 (실수)</label>
                                                    <Input
                                                        type="number"
                                                        step="0.1"
                                                        value={editData.f_value || ''}
                                                        onChange={(e) => {
                                                            const fValue = parseFloat(e.target.value) || undefined;
                                                            setEditData({ 
                                                                ...editData, 
                                                                f_value: fValue,
                                                                i_value: fValue ? undefined : editData.i_value // F값이 입력되면 I값 초기화
                                                            });
                                                        }}
                                                        className={`text-sm placeholder:text-gray-500 border-gray-300 focus:ring-0 focus:border-gray-300 ${
                                                            editData.i_value ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-600'
                                                        }`}
                                                        disabled={!!editData.i_value}
                                                        placeholder={editData.i_value ? 'I값 사용 중' : 'F값 입력'}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                                                <div className="flex items-center">
                                                    <DollarSign className="w-4 h-4 text-gray-500 mr-2" />
                                                    <span className="text-sm text-gray-700">단가</span>
                                                </div>
                                                <span className="text-sm font-medium text-gray-900">
                                                    {(displayConsumable.unit_price || 0).toLocaleString()}원
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                                                <div className="flex items-center">
                                                    <Package className="w-4 h-4 text-gray-500 mr-2" />
                                                    <span className="text-sm text-gray-700">단위</span>
                                                </div>
                                                <span className="text-sm font-medium text-gray-900">
                                                    {displayConsumable.unit_type}
                                                </span>
                                            </div>
                                            {displayConsumable.i_value && (
                                                <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                                                    <div className="flex items-center">
                                                        <TrendingDown className="w-4 h-4 text-gray-500 mr-2" />
                                                        <span className="text-sm text-gray-700">I값</span>
                                                    </div>
                                                    <span className="text-sm font-medium text-gray-900">
                                                        {displayConsumable.i_value}
                                                    </span>
                                                </div>
                                            )}
                                            {displayConsumable.f_value && (
                                                <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                                                    <div className="flex items-center">
                                                        <TrendingDown className="w-4 h-4 text-gray-500 mr-2" />
                                                        <span className="text-sm text-gray-700">F값</span>
                                                    </div>
                                                    <span className="text-sm font-medium text-gray-900">
                                                        {displayConsumable.f_value}
                                                    </span>
                                                </div>
                                            )}
                                            <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                                                <div className="flex items-center">
                                                    <DollarSign className="w-4 h-4 text-gray-500 mr-2" />
                                                    <span className="text-sm text-gray-700">VAT</span>
                                                </div>
                                                <span className="text-sm font-medium text-gray-900">
                                                    {displayConsumable.vat.toLocaleString()}원
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* 분류 정보 */}
                                <div>
                                    <h3 className="text-sm font-medium text-gray-900 mb-2">분류 정보</h3>
                                    {isEditing ? (
                                        <div className="bg-gray-50 rounded-lg p-3 space-y-3">
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="text-xs text-gray-500 block mb-1">세금 유형</label>
                                                    <Select
                                                        value={editData.taxable_type || ''}
                                                        onValueChange={(value) => setEditData({ ...editData, taxable_type: value })}
                                                    >
                                                        <SelectTrigger className="text-sm bg-white text-gray-600 border-gray-300">
                                                            <SelectValue placeholder="세금 유형 선택" className="text-gray-900" />
                                                        </SelectTrigger>
                                                        <SelectContent className="w-full bg-white border-gray-300 shadow-lg">
                                                            <SelectItem value="과세" className="text-gray-600">과세</SelectItem>
                                                            <SelectItem value="면세" className="text-gray-600">면세</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div>
                                                    <label className="text-xs text-gray-500 block mb-1">급여 분류</label>
                                                    <Select
                                                        value={editData.covered_type || ''}
                                                        onValueChange={(value) => setEditData({ ...editData, covered_type: value })}
                                                    >
                                                        <SelectTrigger className="text-sm bg-white text-gray-600 border-gray-300">
                                                            <SelectValue placeholder="급여 분류 선택" className="text-gray-900" />
                                                        </SelectTrigger>
                                                        <SelectContent className="w-full bg-white border-gray-300 shadow-lg">
                                                            <SelectItem value="급여" className="text-gray-600">급여</SelectItem>
                                                            <SelectItem value="비급여" className="text-gray-600">비급여</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-xs text-gray-500 block mb-1">상태</label>
                                                <Select
                                                    value={editData.release?.toString() || '1'}
                                                    onValueChange={(value) => setEditData({ ...editData, release: parseInt(value) })}
                                                >
                                                    <SelectTrigger className="text-sm bg-white text-gray-600 border-gray-300">
                                                        <SelectValue placeholder="상태 선택" className="text-gray-900" />
                                                    </SelectTrigger>
                                                    <SelectContent className="w-full bg-white border-gray-300 shadow-lg">
                                                        <SelectItem value="1" className="text-gray-600">활성화</SelectItem>
                                                        <SelectItem value="0" className="text-gray-600">비활성화</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                                                <div className="flex items-center">
                                                    <Tag className="w-4 h-4 text-gray-500 mr-2" />
                                                    <span className="text-sm text-gray-700">세금 유형</span>
                                                </div>
                                                <span className="text-sm font-medium text-gray-900">
                                                    {displayConsumable.taxable_type}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                                                <div className="flex items-center">
                                                    <Tag className="w-4 h-4 text-gray-500 mr-2" />
                                                    <span className="text-sm text-gray-700">급여 분류</span>
                                                </div>
                                                <span className="text-sm font-medium text-gray-900">
                                                    {displayConsumable.covered_type}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                                                <div className="flex items-center">
                                                    <Settings className="w-4 h-4 text-gray-500 mr-2" />
                                                    <span className="text-sm text-gray-700">활성화 상태</span>
                                                </div>
                                                <span className={`text-xs px-2 py-1 rounded-full ${
                                                    displayConsumable.release === 1 
                                                        ? 'bg-green-100 text-green-700' 
                                                        : 'bg-red-100 text-red-700'
                                                }`}>
                                                    {displayConsumable.release === 1 ? '활성화' : '비활성화'}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* 하단 버튼 */}
                <div className="p-4 border-t border-gray-200 flex-shrink-0">
                    <div className="flex space-x-3">
                        {isEditing ? (
                            <>
                                <Button
                                    onClick={handleCancelEdit}
                                    className="flex-1 bg-gray-500 py-3 font-semibold text-white"
                                    variant="secondary"
                                >
                                    취소
                                </Button>
                                <Button
                                    onClick={handleSave}
                                    className="flex-1 bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700"
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
                                            저장하기
                                        </>
                                    )}
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button
                                    onClick={() => {
                                        setIsEditing(false);
                                        setEditData({});
                                        onClose();
                                    }}
                                    className="flex-1 bg-gray-500 py-3 font-semibold text-white"
                                    variant="secondary"
                                >
                                    닫기
                                </Button>
                                <Button
                                    onClick={handleEdit}
                                    className="flex-1 bg-gray-900 py-3 font-semibold text-white hover:bg-gray-800"
                                >
                                    <Edit className="w-4 h-4 mr-2" />
                                    수정하기
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
