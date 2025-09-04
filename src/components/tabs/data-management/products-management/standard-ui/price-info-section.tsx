'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { CreditCard } from 'lucide-react';
import { ProductDetailResponse } from '@/api/products-api';
import { ProcedureInfo, calculateVAT, calculateOriginalPrice, calculateActualDiscount, calculateMargin } from '../standard-detail-types';

interface PriceInfoSectionProps {
    displayProduct: ProductDetailResponse;
    isEditing: boolean;
    editData: Partial<ProductDetailResponse>;
    setEditData: (data: Partial<ProductDetailResponse>) => void;
    newSelectedProcedure: ProcedureInfo;
    packageType?: string;
}

export default function PriceInfoSection({
    displayProduct,
    isEditing,
    editData,
    setEditData,
    newSelectedProcedure,
    packageType
}: PriceInfoSectionProps) {
    

    return (
        <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-900 flex items-center">
                <CreditCard className="w-4 h-4 mr-2" />
                가격 정보
            </h3>
            
            <div className="grid grid-cols-2 gap-6">
                {/* 왼쪽: 수동 입력 필드들 */}
                <div className="space-y-4">
                    <div>
                        <label className="text-xs text-gray-500">판매가</label>
                        {isEditing ? (
                            <Input
                                type="number"
                                value={editData.hasOwnProperty('sell_price') ? (editData.sell_price || '') : (displayProduct.sell_price || '')}
                                onChange={(e) => {
                                    
                                    const sellPrice = e.target.value === '' ? undefined : parseFloat(e.target.value);
                                    const discountRate = editData.discount_rate || displayProduct.discount_rate || 0;
                                    const roundedPlace = editData.rounded_place || displayProduct.rounded_place || '올림 - 천';
                                    const taxableType = editData.taxable_type || displayProduct.taxable_type || '';
                                    
                                    // sellPrice가 undefined이면 계산하지 않음
                                    if (sellPrice !== undefined) {
                                        // 정상가 자동 계산
                                        const originalPrice = calculateOriginalPrice(sellPrice, discountRate, roundedPlace);
                                        
                                        // 실제 할인율 자동 계산
                                        const actualDiscount = calculateActualDiscount(originalPrice, sellPrice);
                                        
                                        // 마진 및 마진율 자동 계산
                                        const currentPackageType = packageType || editData.package_type || displayProduct.package_type || '';
                                        const procedureInfo = newSelectedProcedure || displayProduct.procedure_info;
                                        
                                        // 마진 계산
                                        let margin, marginRate;
                                        
                                        if (currentPackageType === '시퀀스' && procedureInfo && 'steps' in procedureInfo && Array.isArray(procedureInfo.steps)) {
                                            // 시퀀스인 경우 직접 계산
                                            const totalCost = procedureInfo.steps.reduce((sum, step) => {
                                                const stepCost = ('procedure_cost' in step && step.procedure_cost) ? step.procedure_cost : 0;
                                                return sum + stepCost;
                                            }, 0);
                                            margin = sellPrice - totalCost;
                                            marginRate = sellPrice > 0 ? margin / sellPrice : 0;
                                            
                                        } else {
                                            // 다른 타입들은 calculateMargin 함수 사용
                                            const result = calculateMargin(sellPrice, currentPackageType, procedureInfo);
                                            margin = result.margin;
                                            marginRate = result.marginRate;
                                        }
                                        
                                        // 부가세 자동 계산
                                        const vat = calculateVAT(sellPrice, taxableType);
                                        
                                        setEditData({ 
                                            ...editData, 
                                            sell_price: sellPrice,
                                            original_price: originalPrice,
                                            actual_discount: actualDiscount,
                                            margin: margin,
                                            margin_rate: marginRate,
                                            vat: vat
                                        });
                                    } else {
                                        // 빈 값일 때는 sell_price만 업데이트
                                        setEditData({ 
                                            ...editData, 
                                            sell_price: undefined
                                        });
                                    }
                                }}
                                className="text-sm"
                                placeholder="판매가를 입력하세요"
                            />
                        ) : (
                            <p className="text-lg font-semibold text-gray-900">{(displayProduct.sell_price || 0).toLocaleString()}원</p>
                        )}
                    </div>
                    <div>
                        <label className="text-xs text-gray-500">시술 원가</label>
                        <div className="space-y-2">
                            {/* 원가 상세 정보 */}
                            {(() => {
                                // 수정 모드일 때는 새로 선택된 시술 정보를 우선 사용
                                const procedureInfo = isEditing && newSelectedProcedure ? newSelectedProcedure : (newSelectedProcedure || displayProduct.procedure_info);
                                
                                
                                
                                if (!procedureInfo) return null;
                                
                                // 총비용(원가) 표시
                                let totalCost = 0;
                                
                                // Element 타입인 경우
                                if ('procedure_cost' in procedureInfo && procedureInfo.procedure_cost) {
                                    totalCost = procedureInfo.procedure_cost;
                                }
                                
                                // Bundle/Custom 타입인 경우 (elements가 있는 경우)
                                if ('elements' in procedureInfo && procedureInfo.elements && Array.isArray(procedureInfo.elements)) {
                                    totalCost = procedureInfo.elements.reduce((sum, element) => sum + (element.element_cost || 0), 0);
                                }
                                
                                // Sequence 타입인 경우
                                if ('steps' in procedureInfo && procedureInfo.steps && Array.isArray(procedureInfo.steps)) {
                                    totalCost = procedureInfo.steps.reduce((sum, step) => {
                                        if ('procedure_cost' in step && step.procedure_cost) {
                                            return sum + step.procedure_cost;
                                        }
                                        return sum;
                                    }, 0);
                                }
                                
                                // 총비용이 있으면 표시
                                if (totalCost > 0) {
                                    return (
                                        <div className="text-sm text-gray-500 bg-gray-50 p-2 rounded-md border">
                                            <div className="flex items-center justify-between">
                                                <span className="font-medium text-gray-700">
                                                    {totalCost.toLocaleString()}원
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    자동
                                                </span>
                                            </div>
                                        </div>
                                    );
                                }
                                
                                return null;
                            })()}
                        </div>
                    </div>
                    
                    <div>
                        <label className="text-xs text-gray-500">할인율</label>
                        {isEditing ? (
                            <Input
                                type="number"
                                step="0.01"
                                min="0"
                                max="1"
                                value={editData.discount_rate !== undefined ? editData.discount_rate : (displayProduct.discount_rate || 0)}
                                onChange={(e) => {
                                    const discountRate = e.target.value === '' ? 0 : parseFloat(e.target.value);
                                    const sellPrice = editData.sell_price || displayProduct.sell_price || 0;
                                    const roundedPlace = editData.rounded_place || displayProduct.rounded_place || '올림 - 천';
                                    const taxableType = editData.taxable_type || displayProduct.taxable_type || '';
                                    
                                    // 할인율을 항상 업데이트
                                    setEditData({ 
                                        ...editData, 
                                        discount_rate: discountRate
                                    });
                                    
                                    // sellPrice가 0보다 클 때만 추가 계산 수행
                                    if (sellPrice > 0) {
                                        // 정상가 자동 계산
                                        const originalPrice = calculateOriginalPrice(sellPrice, discountRate, roundedPlace);
                                        
                                        // 실제 할인율 자동 계산
                                        const actualDiscount = calculateActualDiscount(originalPrice, sellPrice);
                                        
                                        // 기존 마진과 마진율 유지
                                        const currentMargin = editData.margin !== undefined ? editData.margin : displayProduct.margin;
                                        const currentMarginRate = editData.margin_rate !== undefined ? editData.margin_rate : displayProduct.margin_rate;
                                        
                                        // 부가세 자동 계산
                                        const vat = calculateVAT(sellPrice, taxableType);
                                        
                                        setEditData({ 
                                            ...editData, 
                                            discount_rate: discountRate,
                                            original_price: originalPrice,
                                            actual_discount: actualDiscount,
                                            margin: currentMargin,
                                            margin_rate: currentMarginRate,
                                            vat: vat
                                        });
                                    }
                                }}
                                className="text-sm"
                                placeholder="할인율 (0-1)"
                            />
                        ) : (
                            <p className="text-sm font-medium text-red-600">{((displayProduct.discount_rate || 0) * 100).toFixed(1)}%</p>
                        )}
                    </div>
                    
                    <div>
                        <label className="text-xs text-gray-500">마진</label>
                        {isEditing ? (
                            <div className="relative">
                                <Input
                                    type="number"
                                    value={editData.margin || displayProduct.margin || ''}
                                    className={`text-sm bg-gray-100 cursor-not-allowed ${
                                        (editData.margin !== undefined ? editData.margin : displayProduct.margin || 0) < 0 
                                            ? 'text-red-600' 
                                            : 'text-gray-600'
                                    }`}
                                    placeholder="자동 계산됨"
                                    readOnly
                                />
                                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-500">
                                    자동
                                </span>
                            </div>
                        ) : (
                            <p className={`text-sm font-medium ${
                                (editData.margin !== undefined ? editData.margin : displayProduct.margin || 0) < 0 
                                    ? 'text-red-600' 
                                    : 'text-gray-700'
                            }`}>
                                {(editData.margin !== undefined ? editData.margin : displayProduct.margin || 0).toLocaleString()}원
                            </p>
                        )}
                    </div>
                    
                </div>

                {/* 오른쪽: 자동 계산 필드들 */}
                <div className="space-y-4">
                    <div>
                        <label className="text-xs text-gray-500">정상가</label>
                        {isEditing ? (
                            <div className="relative">
                                <Input
                                    type="number"
                                    value={editData.original_price || displayProduct.original_price || ''}
                                    className="text-sm bg-gray-100 text-gray-600 cursor-not-allowed"
                                    placeholder="자동 계산됨"
                                    readOnly
                                />
                                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-500">
                                    자동
                                </span>
                            </div>
                        ) : (
                            <p className="text-sm font-medium text-gray-700">
                                {(editData.original_price !== undefined ? editData.original_price : displayProduct.original_price || 0).toLocaleString()}원
                            </p>
                        )}
                    </div>
                    <div>
                        <label className="text-xs text-gray-500">실제 할인율</label>
                        {isEditing ? (
                            <div className="relative">
                                <Input
                                    type="number"
                                    value={(() => {
                                        // editData에 actual_discount가 있으면 사용, 없으면 계산
                                        if (editData.actual_discount !== undefined) {
                                            return (editData.actual_discount * 100).toFixed(1);
                                        }
                                        
                                        // editData에 sell_price와 discount_rate가 있으면 계산
                                        if (editData.sell_price !== undefined && editData.discount_rate !== undefined) {
                                            const sellPrice = editData.sell_price;
                                            const discountRate = editData.discount_rate;
                                            const roundedPlace = editData.rounded_place || displayProduct.rounded_place || '올림 - 천';
                                            
                                            if (sellPrice > 0) {
                                                const originalPrice: number = calculateOriginalPrice(sellPrice, discountRate, roundedPlace);
                                                const actualDiscount: number = calculateActualDiscount(originalPrice, sellPrice);
                                                return (actualDiscount * 100).toFixed(1);
                                            }
                                        }
                                        
                                        // 기본값
                                        return ((displayProduct.actual_discount || 0) * 100).toFixed(1);
                                    })()}
                                    className={`text-sm bg-gray-100 cursor-not-allowed ${
                                        (() => {
                                            const actualDiscount = editData.actual_discount !== undefined ? editData.actual_discount : displayProduct.actual_discount || 0;
                                            return actualDiscount * 100 >= 50 ? 'text-red-600' : 'text-gray-600';
                                        })()
                                    }`}
                                    placeholder="자동 계산됨"
                                    readOnly
                                />
                                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-500">
                                    자동
                                </span>
                            </div>
                        ) : (
                            <div className="h-10 flex items-center">
                                <span className="text-sm text-gray-400">(수정 모드 전용)</span>
                            </div>
                        )}
                    </div>
                    <div>
                    <label className="text-xs text-gray-500">올림단위설정</label>
                    {isEditing ? (
                        <Select
                            value={editData.rounded_place || displayProduct.rounded_place || '올림 - 천'}
                            onValueChange={(value) => {
                                const roundedPlace = value;
                                const sellPrice = editData.sell_price || displayProduct.sell_price || 0;
                                const discountRate = editData.discount_rate || displayProduct.discount_rate || 0;
                                const taxableType = editData.taxable_type || displayProduct.taxable_type || '';
                                
                                // sellPrice가 0보다 클 때만 계산
                                if (sellPrice > 0) {
                                    // 정상가 자동 계산
                                    const originalPrice = calculateOriginalPrice(sellPrice, discountRate, roundedPlace);
                                    
                                    // 실제 할인율 자동 계산
                                    const actualDiscount = calculateActualDiscount(originalPrice, sellPrice);
                                    
                                    // 올림 단위 설정 변경 시에는 마진과 마진율을 재계산하지 않음
                                    // 기존 마진과 마진율 유지
                                    const currentMargin = editData.margin !== undefined ? editData.margin : displayProduct.margin;
                                    const currentMarginRate = editData.margin_rate !== undefined ? editData.margin_rate : displayProduct.margin_rate;
                                    
                                    // 부가세 자동 계산
                                    const vat = calculateVAT(sellPrice, taxableType);
                                    
                                    setEditData({ 
                                        ...editData, 
                                        rounded_place: roundedPlace,
                                        original_price: originalPrice,
                                        actual_discount: actualDiscount,
                                        margin: currentMargin,
                                        margin_rate: currentMarginRate,
                                        vat: vat
                                    });
                                } else {
                                    // sellPrice가 0이면 rounded_place만 업데이트
                                    setEditData({ 
                                        ...editData, 
                                        rounded_place: roundedPlace
                                    });
                                }
                            }}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="올림단위를 선택하세요" />
                            </SelectTrigger>
                            <SelectContent className="z-[60] bg-white border-gray-300 text-gray-500">
                                <SelectItem value="반올림 안함">반올림 안함</SelectItem>
                                <SelectItem value="내림 - 천">내림 - 천</SelectItem>
                                <SelectItem value="내림 - 만">내림 - 만</SelectItem>
                                <SelectItem value="내림 - 십만">내림 - 십만</SelectItem>
                                <SelectItem value="올림 - 천">올림 - 천</SelectItem>
                                <SelectItem value="올림 - 만">올림 - 만</SelectItem>
                                <SelectItem value="올림 - 십만">올림 - 십만</SelectItem>
                            </SelectContent>
                        </Select>
                    ) : (
                        <p className="text-sm text-gray-700">{displayProduct.rounded_place || '올림 - 천'}</p>
                    )}
                </div>
                    <div>
                        <label className="text-xs text-gray-500">마진율</label>
                        {isEditing ? (
                            <div className="relative">
                                <Input
                                    type="number"
                                    value={editData.margin_rate !== undefined ? (editData.margin_rate * 100).toFixed(1) : ((displayProduct.margin_rate || 0) * 100).toFixed(1)}
                                    className={`text-sm bg-gray-100 cursor-not-allowed ${
                                        (editData.margin_rate !== undefined ? editData.margin_rate : displayProduct.margin_rate || 0) < 0 
                                            ? 'text-red-600' 
                                            : 'text-gray-600'
                                    }`}
                                    placeholder="자동 계산됨"
                                    readOnly
                                />
                                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-500">
                                    자동
                                </span>
                            </div>
                        ) : (
                            <p className={`text-sm font-medium ${
                                (editData.margin_rate !== undefined ? editData.margin_rate : displayProduct.margin_rate || 0) < 0 
                                    ? 'text-red-600' 
                                    : 'text-gray-700'
                            }`}>
                                {((editData.margin_rate !== undefined ? editData.margin_rate : displayProduct.margin_rate || 0) * 100).toFixed(1)}%
                            </p>
                        )}
                    </div>
                </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
                <div>
                    <label className="text-xs text-gray-500">급여분류</label>
                    {isEditing ? (
                        <Select
                            value={editData.covered_type || displayProduct.covered_type || 'none'}
                            onValueChange={(value) => setEditData({ ...editData, covered_type: value })}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="급여분류를 선택하세요" />
                            </SelectTrigger>
                            <SelectContent className="z-[60] bg-white border-gray-300 text-gray-500">
                                <SelectItem value="급여">급여</SelectItem>
                                <SelectItem value="비급여">비급여</SelectItem>
                                <SelectItem value="none">none</SelectItem>
                            </SelectContent>
                        </Select>
                    ) : (
                        <p className="text-sm text-gray-700">{displayProduct.covered_type || 'none'}</p>
                    )}
                </div>
                
                <div>
                    <label className="text-xs text-gray-500">과세분류</label>
                    {isEditing ? (
                        <Select
                            value={editData.taxable_type || displayProduct.taxable_type || '과세'}
                            onValueChange={(value) => {
                                const taxableType = value;
                                const sellPrice = editData.sell_price || displayProduct.sell_price || 0;
                                const discountRate = editData.discount_rate || displayProduct.discount_rate || 0;
                                const roundedPlace = editData.rounded_place || displayProduct.rounded_place || '올림 - 천';
                                
                                // sellPrice가 0보다 클 때만 계산
                                if (sellPrice > 0) {
                                    // 정상가 자동 계산
                                    const originalPrice = calculateOriginalPrice(sellPrice, discountRate, roundedPlace);
                                    
                                    // 실제 할인율 자동 계산
                                    const actualDiscount = calculateActualDiscount(originalPrice, sellPrice);
                                    
                                    // 과세분류 변경 시에도 마진과 마진율을 재계산하지 않음
                                    // 기존 마진과 마진율 유지
                                    const currentMargin = editData.margin !== undefined ? editData.margin : displayProduct.margin;
                                    const currentMarginRate = editData.margin_rate !== undefined ? editData.margin_rate : displayProduct.margin_rate;
                                    
                                    // 부가세 자동 계산 (과세일 때만 10%, 비과세일 때는 0)
                                    const vat = taxableType === '과세' ? Math.round(sellPrice * 0.1) : 0;
                                    
                                    setEditData({ 
                                        ...editData, 
                                        taxable_type: taxableType,
                                        original_price: originalPrice,
                                        actual_discount: actualDiscount,
                                        margin: currentMargin,
                                        margin_rate: currentMarginRate,
                                        vat: vat
                                    });
                                } else {
                                    // sellPrice가 0이면 taxable_type과 vat만 업데이트
                                    const vat = taxableType === '과세' ? 0 : 0;
                                    setEditData({ 
                                        ...editData, 
                                        taxable_type: taxableType,
                                        vat: vat
                                    });
                                }
                            }}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="과세분류를 선택하세요" />
                            </SelectTrigger>
                            <SelectContent className="z-[60] bg-white border-gray-300 text-gray-500">
                                <SelectItem value="과세">과세</SelectItem>
                                <SelectItem value="비과세">비과세</SelectItem>
                            </SelectContent>
                        </Select>
                    ) : (
                        <p className="text-sm text-gray-700">{displayProduct.taxable_type || '과세'}</p>
                    )}
                </div>
                
                <div>
                    <label className="text-xs text-gray-500">부가세</label>
                    {isEditing ? (
                        <div className="relative">
                            <Input
                                type="number"
                                value={(() => {
                                    const sellPrice = editData.sell_price || displayProduct.sell_price || 0;
                                    const taxableType = editData.taxable_type || displayProduct.taxable_type || '과세';
                                    
                                    if (taxableType === '과세' && sellPrice > 0) {
                                        return Math.round(sellPrice * 0.1);
                                    }
                                    return 0;
                                })()}
                                className="text-sm bg-gray-100 text-gray-600 cursor-not-allowed"
                                placeholder="자동 계산됨"
                                readOnly
                            />
                            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-500">
                                자동
                            </span>
                        </div>
                    ) : (
                        <p className="text-sm text-gray-700">
                            {(() => {
                                const sellPrice = editData.sell_price || displayProduct.sell_price || 0;
                                const taxableType = editData.taxable_type || displayProduct.taxable_type || '과세';
                                
                                if (taxableType === '과세' && sellPrice > 0) {
                                    return Math.round(sellPrice * 0.1).toLocaleString();
                                }
                                return '0';
                            })()}원
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
