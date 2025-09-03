'use client';

import { useEffect } from 'react';
import { ProductDetailResponse } from '@/api/products-api';
import { ProcedureInfo, getProcedureName, getProcedureDescription, getProcedureCost, getProcedurePrice, getProcedureCategory } from '../../standard-detail-types';
import { Element as ElementType } from '@/api/element-api';
import ProcedureAccordion from '../shared/procedure-accordion';

interface CustomProcedureProps {
    displayProduct: ProductDetailResponse;
    isEditing: boolean;
    editData: Partial<ProductDetailResponse>;
    existingCustomInfo?: ProcedureInfo;
}

export default function CustomProcedure({ displayProduct, existingCustomInfo }: CustomProcedureProps) {

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
                    <p className="text-sm font-medium text-gray-700">
                        {displayProduct.procedure_info ? getProcedureCategory(displayProduct.procedure_info) : '-'}
                    </p>
                </div>
                <div>
                    <label className="text-xs text-gray-500">커스텀 총 원가</label>
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

            {/* 커스텀 상품인 경우 element 상세 정보 표시 */}
            {displayProduct.package_type === '커스텀' && (
                <div className="mt-4">
                    <ProcedureAccordion 
                        title="커스텀 상세 정보" 
                        subtitle={`커스텀 ID: ${displayProduct.custom_id || '없음'}`}
                        value="custom-details"
                    >
                        <div className="space-y-4">
                            {/* 커스텀 기본 정보 */}
                            {existingCustomInfo && 'elements' in existingCustomInfo && (
                                <>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs text-gray-500">커스텀명</label>
                                            <p className="text-sm font-medium text-gray-900">
                                                {'name' in existingCustomInfo ? existingCustomInfo.name : '이름 없음'}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-500">총 시술 수</label>
                                            <p className="text-sm font-medium text-gray-900">
                                                {existingCustomInfo.elements?.length || 0}개
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-xs text-gray-500">배포 상태</span>
                                            <span className="ml-1 text-xs text-gray-900">
                                                {'release' in existingCustomInfo ? (existingCustomInfo.release === 1 ? '배포됨' : '미배포') : '정보 없음'}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    {/* 커스텀 설명 */}
                                    {'description' in existingCustomInfo && existingCustomInfo.description && (
                                        <div>
                                            <label className="text-xs text-gray-500">커스텀 설명</label>
                                            <p className="text-sm text-gray-700 whitespace-pre-wrap mt-1">
                                                {existingCustomInfo.description}
                                            </p>
                                        </div>
                                    )}
                                    
                                    {/* 포함된 시술들 상세 정보 */}
                                    {existingCustomInfo.elements && existingCustomInfo.elements.length > 0 && (
                                        <div>
                                            <label className="text-xs text-gray-500 mb-2 block">포함된 시술들 상세 정보</label>
                                            <div className="space-y-3">
                                                {existingCustomInfo.elements.map((element, index: number) => {
                                                    // 타입 안전성을 위해 타입 가드 사용
                                                    if (!('element_detail' in element) || !element.element_detail) {
                                                        return null;
                                                    }
                                                    
                                                    const elementDetail = element.element_detail;
                                                    
                                                    // Element 타입인지 확인 (필수 속성들이 있는지 체크)
                                                    const isElementType = elementDetail && 
                                                        'id' in elementDetail && 
                                                        'name' in elementDetail && 
                                                        'class_major' in elementDetail && 
                                                        'class_sub' in elementDetail &&
                                                        'cost_time' in elementDetail &&
                                                        'position_type' in elementDetail &&
                                                        'procedure_level' in elementDetail &&
                                                        'plan_state' in elementDetail;
                                                    
                                                    if (!isElementType) {
                                                        return null;
                                                    }
                                                    
                                                    // 이제 elementDetail이 Element 타입임이 확실하므로 안전하게 캐스팅
                                                    const elementDetailAsElement = elementDetail as ElementType;
                                                    
                                                    return (
                                                        <div key={index} className="bg-white rounded-lg p-3 border border-gray-200">
                                                            {/* 시술 헤더 */}
                                                            <div className="flex items-center justify-between mb-3">
                                                                <div className="flex items-center space-x-2">
                                                                    <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
                                                                        {index + 1}
                                                                    </span>
                                                                    <h6 className="text-sm font-medium text-gray-900">
                                                                        {elementDetailAsElement.name || '이름 없음'}
                                                                    </h6>
                                                                </div>
                                                                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                                                    {elementDetailAsElement.class_major || '-'} - {elementDetailAsElement.class_sub || '-'}
                                                                </span>
                                                            </div>
                                                            
                                                            {/* 시술 기본 정보 */}
                                                            <div className="grid grid-cols-2 gap-3 text-xs mb-3">
                                                                <div>
                                                                    <span className="text-gray-500">시술 ID:</span>
                                                                    <span className="ml-1 text-gray-900 font-medium">
                                                                        {elementDetailAsElement.id || '-'}
                                                                    </span>
                                                                </div>
                                                                <div>
                                                                    <span className="text-gray-500">커스텀 횟수:</span>
                                                                    <span className="ml-1 text-gray-900 font-medium">
                                                                        {'custom_count' in element && element.custom_count ? String(element.custom_count) : '-'}
                                                                    </span>
                                                                </div>
                                                                <div>
                                                                    <span className="text-gray-500">시술 원가:</span>
                                                                    <span className="ml-1 text-gray-900 font-medium">
                                                                        {element.element_cost?.toLocaleString()}원
                                                                    </span>
                                                                </div>
                                                                <div>
                                                                    <span className="text-gray-500">가격 비율:</span>
                                                                    <span className="ml-1 text-gray-900 font-medium">
                                                                        {'price_ratio' in element && element.price_ratio ? (element.price_ratio * 100).toFixed(1) : '-'}%
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            
                                                            {/* 시술 상세 정보 */}
                                                            {elementDetail && (
                                                                <>
                                                                    <div className="grid grid-cols-2 gap-3 text-xs mb-3">
                                                                        <div>
                                                                            <span className="text-gray-500">소요 시간:</span>
                                                                            <span className="ml-1 text-gray-900">
                                                                                {elementDetailAsElement.cost_time || '-'}분
                                                                            </span>
                                                                        </div>
                                                                        <div>
                                                                            <span className="text-gray-500">시술 담당:</span>
                                                                            <span className="ml-1 text-gray-900">
                                                                                {elementDetailAsElement.position_type || '-'}
                                                                            </span>
                                                                        </div>
                                                                        <div>
                                                                            <span className="text-gray-500">시술 수준:</span>
                                                                            <span className="ml-1 text-gray-900">
                                                                                {elementDetailAsElement.procedure_level || '-'}
                                                                            </span>
                                                                        </div>
                                                                        <div>
                                                                            <span className="text-gray-500">플랜 상태:</span>
                                                                            <span className="ml-1 text-gray-900">
                                                                                {elementDetailAsElement.plan_state === 1 ? '플랜 있음' : '플랜 없음'}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                    
                                                                    {/* 시술 분류 정보 */}
                                                                    <div className="grid grid-cols-2 gap-3 text-xs mb-3">
                                                                        <div>
                                                                            <span className="text-gray-500">주요 분류:</span>
                                                                            <span className="ml-1 text-gray-900">
                                                                                {elementDetailAsElement.class_major || '-'}
                                                                            </span>
                                                                        </div>
                                                                        <div>
                                                                            <span className="text-gray-500">세부 분류:</span>
                                                                            <span className="ml-1 text-gray-900">
                                                                                {elementDetailAsElement.class_sub || '-'}
                                                                            </span>
                                                                        </div>
                                                                        <div>
                                                                            <span className="text-gray-500">상세 분류:</span>
                                                                            <span className="ml-1 text-gray-900">
                                                                                {elementDetailAsElement.class_detail || '-'}
                                                                            </span>
                                                                        </div>
                                                                        <div>
                                                                            <span className="text-gray-500">시술 타입:</span>
                                                                            <span className="ml-1 text-gray-900">
                                                                                {elementDetailAsElement.class_type || '-'}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                    
                                                                    {/* 플랜 정보 */}
                                                                    {elementDetailAsElement.plan_state === 1 && (
                                                                        <div className="grid grid-cols-2 gap-3 text-xs mb-3">
                                                                            <div>
                                                                                <span className="text-gray-500">플랜 횟수:</span>
                                                                                <span className="ml-1 text-gray-900">
                                                                                    {elementDetailAsElement.plan_count || '-'}회
                                                                                </span>
                                                                            </div>
                                                                            <div>
                                                                                <span className="text-gray-500">플랜 주기:</span>
                                                                                <span className="ml-1 text-gray-900">
                                                                                    {elementDetailAsElement.plan_interval || '-'}일
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                    
                                                                    {/* 소모품 정보 */}
                                                                    {elementDetailAsElement.consum_1_id && (
                                                                        <div className="mt-3 pt-3 border-t border-gray-100">
                                                                            <div className="text-xs text-gray-500 mb-2 font-medium">소모품 정보</div>
                                                                            <div className="grid grid-cols-2 gap-3 text-xs">
                                                                                <div>
                                                                                    <span className="text-gray-500">소모품 ID:</span>
                                                                                    <span className="ml-1 text-gray-900 font-medium">
                                                                                        {elementDetailAsElement.consum_1_id}
                                                                                    </span>
                                                                                </div>
                                                                                <div>
                                                                                    <span className="text-gray-500">소모품명:</span>
                                                                                    <span className="ml-1 text-gray-900 font-medium">
                                                                                        {elementDetailAsElement.consum_1_name}
                                                                                    </span>
                                                                                </div>
                                                                                <div>
                                                                                    <span className="text-gray-500">수량:</span>
                                                                                    <span className="ml-1 text-gray-900">
                                                                                        {elementDetailAsElement.consum_1_count} {elementDetailAsElement.consum_1_unit}
                                                                                    </span>
                                                                                </div>
                                                                                <div>
                                                                                    <span className="text-gray-500">소모품 가격:</span>
                                                                                    <span className="ml-1 text-gray-900">
                                                                                        {elementDetailAsElement.procedure_cost?.toLocaleString()}원
                                                                                    </span>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                    
                                                                    {/* 시술 설명 */}
                                                                    {elementDetailAsElement.description && (
                                                                        <div className="mt-3 pt-3 border-t border-gray-100">
                                                                            <div className="text-xs text-gray-500 mb-1 font-medium">시술 설명</div>
                                                                            <p className="text-xs text-gray-700">
                                                                                {elementDetailAsElement.description}
                                                                            </p>
                                                                        </div>
                                                                    )}
                                                                    
                                                                    {/* 시술 가격 정보 */}
                                                                    {elementDetailAsElement.price && (
                                                                        <div className="mt-3 pt-3 border-t border-gray-100">
                                                                            <div className="text-xs text-gray-500 mb-1 font-medium">가격 정보</div>
                                                                            <div className="grid grid-cols-2 gap-3 text-xs">
                                                                                <div>
                                                                                    <span className="text-gray-500">시술 가격:</span>
                                                                                    <span className="ml-1 text-gray-900 font-medium">
                                                                                        {elementDetailAsElement.price.toLocaleString()}원
                                                                                    </span>
                                                                                </div>
                                                                                <div>
                                                                                    <span className="text-gray-500">원가:</span>
                                                                                    <span className="ml-1 text-gray-900 font-medium">
                                                                                        {elementDetailAsElement.procedure_cost?.toLocaleString()}원
                                                                                    </span>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </ProcedureAccordion>
                </div>
            )}
        </div>
    );
}
