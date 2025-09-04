'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Info } from 'lucide-react';
import { ProductDetailResponse } from '@/api/products-api';

interface BasicInfoSectionProps {
    displayProduct: ProductDetailResponse;
    isEditing: boolean;
    editData: Partial<ProductDetailResponse>;
    setEditData: (data: Partial<ProductDetailResponse>) => void;
    onPackageTypeChange: (value: string) => void;
}

export default function BasicInfoSection({
    displayProduct,
    isEditing,
    editData,
    setEditData,
    onPackageTypeChange
}: BasicInfoSectionProps) {
    return (
        <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-900 flex items-center">
                <Info className="w-4 h-4 mr-2" />
                기본 정보
            </h3>
            
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs text-gray-500">상품 ID</label>
                        {isEditing ? (
                            <Input
                                type="number"
                                value={editData.id || displayProduct.id || ''}
                                onChange={(e) => setEditData({ ...editData, id: e.target.value === '' ? undefined : parseInt(e.target.value) })}
                                className="text-sm"
                            />
                        ) : (
                            <p className="text-sm font-medium text-gray-900">{displayProduct.id}</p>
                        )}
                    </div>
                    
                    <div>
                        <label className="text-xs text-gray-500">패키지 타입</label>
                        {isEditing ? (
                            <Select
                                value={editData.package_type || displayProduct.package_type || ''}
                                onValueChange={(value) => {
                                    onPackageTypeChange(value);
                                }}
                            >
                                <SelectTrigger 
                                    className="w-full"
                                >
                                    <SelectValue placeholder="패키지 타입을 선택하세요" />
                                </SelectTrigger>
                                <SelectContent 
                                    className="z-[60] bg-white border-gray-300 text-gray-500"
                                    position="popper"
                                    sideOffset={4}
                                >
                                    <SelectItem value="단일시술">단일시술</SelectItem>
                                    <SelectItem value="번들">번들</SelectItem>
                                    <SelectItem value="커스텀">커스텀</SelectItem>
                                    <SelectItem value="시퀀스">시퀀스</SelectItem>
                                </SelectContent>
                            </Select>
                        ) : (
                            <p className="text-sm text-gray-700">{displayProduct.package_type}</p>
                        )}
                    </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs text-gray-500">시작일</label>
                        {isEditing ? (
                            <Input
                                type="date"
                                value={editData.start_date || displayProduct.start_date || ''}
                                onChange={(e) => setEditData({ ...editData, start_date: e.target.value })}
                                className="text-sm"
                            />
                        ) : (
                            <p className="text-sm text-gray-700">{displayProduct.start_date || '미설정'}</p>
                        )}
                    </div>
                    
                    <div>
                        <label className="text-xs text-gray-500">종료일</label>
                        {isEditing ? (
                            <Input
                                type="date"
                                value={editData.end_date || displayProduct.end_date || ''}
                                onChange={(e) => setEditData({ ...editData, end_date: e.target.value })}
                                className="text-sm"
                            />
                        ) : (
                            <p className="text-sm text-gray-700">{displayProduct.end_date || '미설정'}</p>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs text-gray-500">유효기간</label>
                        {isEditing ? (
                            <Input
                                type="number"
                                value={editData.hasOwnProperty('validity_period') ? (editData.validity_period || '') : (displayProduct.validity_period || '')}
                                onChange={(e) => setEditData({ ...editData, validity_period: e.target.value === '' ? undefined : parseInt(e.target.value) })}
                                className="text-sm"
                                placeholder="유효기간을 입력하세요"
                            />
                        ) : (
                            <p className="text-sm text-gray-700">{displayProduct.validity_period || 0}일</p>
                        )}
                    </div>
                    
                    <div>
                        <label className="text-xs text-gray-500">상태</label>
                        {isEditing ? (
                            <Select
                                value={editData.release?.toString() || displayProduct.release?.toString() || '1'}
                                onValueChange={(value) => setEditData({ ...editData, release: parseInt(value) })}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="z-[60] bg-white border-gray-300 text-gray-500">
                                    <SelectItem value="1">활성화</SelectItem>
                                    <SelectItem value="0">비활성화</SelectItem>
                                </SelectContent>
                            </Select>
                        ) : (
                            <p className="text-sm text-gray-700">{displayProduct.release === 1 ? '활성화' : '비활성화'}</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
