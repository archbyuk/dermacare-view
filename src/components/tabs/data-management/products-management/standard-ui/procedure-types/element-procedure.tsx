'use client';

import { ProductDetailResponse } from '@/api/products-api';
import { ProcedureInfo, getProcedureName, getProcedureDescription, getProcedureCost, getProcedurePrice, getProcedureCategory } from '../../standard-detail-types';

interface ElementProcedureProps {
    displayProduct: ProductDetailResponse;
    isEditing: boolean;
    editData: Partial<ProductDetailResponse>;
}

export default function ElementProcedure({ displayProduct, editData }: ElementProcedureProps) {
    const currentPackageType = editData.package_type || displayProduct.package_type;
    
    return (
        <div className="space-y-4">
            {/* 기본 시술 정보 */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-xs text-gray-500">시술명</label>
                    <p className="text-sm font-medium text-gray-900">
                        {displayProduct.procedure_info ? getProcedureName(displayProduct.procedure_info) : '시술 정보 없음'}
                    </p>
                </div>
                <div>
                    <label className="text-xs text-gray-500">카테고리</label>
                    <p className="text-sm text-gray-700">
                        {displayProduct.procedure_info ? getProcedureCategory(displayProduct.procedure_info) : '-'}
                    </p>
                </div>
                <div>
                    <label className="text-xs text-gray-500">시술 원가</label>
                    <p className="text-sm font-medium text-gray-900">
                        {displayProduct.procedure_info ? getProcedureCost(displayProduct.procedure_info).toLocaleString() : '0'}원
                    </p>
                </div>
                {displayProduct.procedure_info && getProcedurePrice(displayProduct.procedure_info) > 0 && (
                    <div>
                        <label className="text-xs text-gray-500">시술 가격</label>
                        <p className="text-sm font-medium text-gray-900">
                            {getProcedurePrice(displayProduct.procedure_info).toLocaleString()}원
                        </p>
                    </div>
                )}
            </div>
            
            {/* 시술 설명 */}
            {displayProduct.procedure_info && getProcedureDescription(displayProduct.procedure_info) !== '설명 없음' && (
                <div className="mt-4">
                    <label className="text-xs text-gray-500">시술 설명</label>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap mt-1">
                        {getProcedureDescription(displayProduct.procedure_info)}
                    </p>
                </div>
            )}
            
            {/* 시술 상세 정보 - displayProduct.procedure_info가 Element 타입인 경우만 표시 */}
            {displayProduct.procedure_info && 'consumable_info' in displayProduct.procedure_info && displayProduct.procedure_info.consumable_info && (
                <div className="mt-4">
                    <label className="text-xs text-gray-500">시술 상세 정보</label>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                        <div>
                            <span className="text-xs text-gray-500">소모품 정보: </span>
                            <span className="text-sm text-gray-700">{displayProduct.procedure_info.consumable_info.name}</span>
                        </div>
                        <div>
                            <span className="text-xs text-gray-500">급여분류: </span>
                            <span className="text-sm text-gray-700">{displayProduct.procedure_info.consumable_info.covered_type}</span>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Element 타입인 경우 소모품 정보 표시 */}
            {displayProduct.procedure_info?.consumable_info && currentPackageType === '단일시술' && (
                <div className="mt-4">
                    <label className="text-xs text-gray-500">소모품 정보</label>
                    <div className="mt-2 p-3 bg-gray-50 rounded border">
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs text-gray-500">소모품 ID</label>
                                <p className="text-sm font-medium text-gray-900">{displayProduct.procedure_info.consumable_info.id}</p>
                            </div>
                            <div>
                                <label className="text-xs text-gray-500">소모품명</label>
                                <p className="text-sm font-medium text-gray-900">{displayProduct.procedure_info.consumable_info.name}</p>
                            </div>
                            <div>
                                <label className="text-xs text-gray-500">설명</label>
                                <p className="text-sm text-gray-700">{displayProduct.procedure_info.consumable_info.description}</p>
                            </div>
                            <div>
                                <label className="text-xs text-gray-500">단위</label>
                                <p className="text-sm text-gray-700">{displayProduct.procedure_info.consumable_info.unit_type}</p>
                            </div>
                            <div>
                                <label className="text-xs text-gray-500">수량 (정수)</label>
                                <p className="text-sm font-medium text-gray-900">{displayProduct.procedure_info.consumable_info.i_value || '없음'}</p>
                            </div>
                            <div>
                                <label className="text-xs text-gray-500">수량 (실수)</label>
                                <p className="text-sm font-medium text-gray-900">{displayProduct.procedure_info.consumable_info.f_value || '없음'}</p>
                            </div>
                            <div>
                                <label className="text-xs text-gray-500">가격</label>
                                <p className="text-sm font-medium text-gray-900">{displayProduct.procedure_info.consumable_info.price.toLocaleString()}원</p>
                            </div>
                            <div>
                                <label className="text-xs text-gray-500">단위 가격</label>
                                <p className="text-sm font-medium text-gray-900">{displayProduct.procedure_info.consumable_info.unit_price.toLocaleString()}원</p>
                            </div>
                            <div>
                                <label className="text-xs text-gray-500">부가세</label>
                                <p className="text-sm font-medium text-gray-900">{displayProduct.procedure_info.consumable_info.vat.toLocaleString()}원</p>
                            </div>
                            <div>
                                <label className="text-xs text-gray-500">과세분류</label>
                                <p className="text-sm font-medium text-gray-900">{displayProduct.procedure_info.consumable_info.taxable_type}</p>
                            </div>
                            <div>
                                <label className="text-xs text-gray-500">급여분류</label>
                                <p className="text-sm font-medium text-gray-900">{displayProduct.procedure_info.consumable_info.covered_type}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
