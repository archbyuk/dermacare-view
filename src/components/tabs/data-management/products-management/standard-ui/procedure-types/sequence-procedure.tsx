'use client';

import { ProductDetailResponse } from '@/api/products-api';
import { ProcedureInfo, getProcedureName, getProcedureDescription, getProcedureCost, getProcedurePrice, getProcedureCategory } from '../../standard-detail-types';
import ProcedureAccordion from '../shared/procedure-accordion';
import { useEffect } from 'react';

// 시퀀스 step의 타입 정의 (existingSequenceInfo용)
interface SequenceStep {
    id: number;
    group_id: number;
    name?: string;
    step_num: number;
    element_id?: number | null;
    bundle_id?: number | null;
    custom_id?: number | null;
    sequence_interval?: number | null;
    procedure_cost: number;
    price_ratio?: number | null;
    release: number;
    element_info?: {
        id: number;
        name: string;
        description: string;
        class_major: string;
        class_sub: string;
        class_detail: string;
        class_type: string;
        procedure_cost: number;
        price: number;
        position_type?: string;
        cost_time?: number;
        plan_state?: number;
        plan_count?: number;
        plan_interval?: number | null;
        consum_1_id?: number | null;
        consum_1_count?: number;
        procedure_level?: string;
        release?: number;
        consumable_info?: {
            id: number;
            name: string;
            description: string;
            unit_type: string;
            i_value: number | null;
            f_value: number | null;
            price: number;
            unit_price: number;
            vat: number;
            taxable_type: string;
            covered_type: string;
        } | null;
    } | null;
    bundle_info?: {
        group_id: number;
        name: string;
        description?: string;
        element_cost: number;
        price_ratio: number;
        elements: Array<{
            id: number;
            name: string;
            description: string;
            class_major: string;
            class_sub: string;
            class_detail: string;
            class_type: string;
            procedure_cost: number;
            price: number;
            position_type?: string;
            cost_time?: number;
            plan_state?: number;
            plan_count?: number;
            plan_interval?: number | null;
            consum_1_id?: number | null;
            consum_1_count?: number;
            procedure_level?: string;
            release?: number;
            consumable_info?: {
                id: number;
                name: string;
                description: string;
                unit_type: string;
                i_value: number | null;
                f_value: number | null;
                price: number;
                unit_price: number;
                vat: number;
                taxable_type: string;
                covered_type: string;
            } | null;
        }>;
    } | null;
    custom_info?: {
        group_id: number;
        name: string;
        description?: string;
        custom_count?: number;
        element_limit?: number;
        element_cost?: number;
        price_ratio?: number;
        elements?: Array<{
            id: number;
            name: string;
            description: string;
            class_major: string;
            class_sub: string;
            class_detail: string;
            class_type: string;
            procedure_cost: number;
            price: number;
            position_type?: string;
            cost_time?: number;
            plan_state?: number;
            plan_count?: number;
            plan_interval?: number | null;
            consum_1_id?: number | null;
            consum_1_count?: number;
            procedure_level?: string;
            release?: number;
            consumable_info?: {
                id: number;
                name: string;
                description: string;
                unit_type: string;
                i_value: number | null;
                f_value: number | null;
                price: number;
                unit_price: number;
                vat: number;
                taxable_type: string;
                covered_type: string;
            } | null;
        }>;
    } | null;
}

// displayProduct.procedure_info.steps용 타입 정의
interface ProductSequenceStep {
    step_num: number;
    step_name: string;
    procedure_cost: number;
    sequence_interval: number;
    price_ratio: number;
    reference_type: string;
    reference_id: number;
    bundle_detail?: {
        id: number;
        name: string;
        element_count: number;
        elements: Array<{
            id: number;
            name: string;
            description: string;
            class_major: string;
            class_sub: string;
            class_detail: string;
            class_type: string;
            position_type: string;
            cost_time: number;
            plan_state: number;
            plan_count: number;
            plan_interval: number | null;
            consum_1_id: number | null;
            consum_1_count: number;
            consumable_info: {
                id: number;
                name: string;
                description: string | null;
                unit_type: string;
                i_value: number | null;
                f_value: number | null;
                price: number;
                unit_price: number;
                vat: number;
                taxable_type: string;
                covered_type: string;
            } | null;
            procedure_level: string;
            procedure_cost: number;
            price: number;
            bundle_element_cost: number;
            price_ratio: number;
        }>;
    };
    element_detail?: {
        id: number;
        name: string;
        description: string;
        class_major: string;
        class_sub: string;
        class_detail: string;
        class_type: string;
        position_type: string;
        cost_time: number;
        plan_state: number;
        plan_count: number;
        plan_interval: number | null;
        consum_1_id: number | null;
        consum_1_count: number;
        consumable_info: {
            id: number;
            name: string;
            description: string | null;
            unit_type: string;
            i_value: number | null;
            f_value: number | null;
            price: number;
            unit_price: number;
            vat: number;
            taxable_type: string;
            covered_type: string;
        } | null;
        procedure_level: string;
        procedure_cost: number;
        price: number;
        bundle_element_cost: number;
        price_ratio: number;
    };
}

interface SequenceProcedureProps {
    displayProduct: ProductDetailResponse;
    isEditing: boolean;
    editData: Partial<ProductDetailResponse>;
    existingSequenceInfo?: ProcedureInfo;
}

export default function SequenceProcedure({ displayProduct, existingSequenceInfo }: SequenceProcedureProps) {
    
    // 시퀀스 상세 정보가 있는지 확인
    const hasSequenceInfo = existingSequenceInfo && 'steps' in existingSequenceInfo && Array.isArray(existingSequenceInfo.steps);
    
    return (
        <div className="space-y-4">
            {/* 시퀀스 상세 정보 아코디언 */}
            {displayProduct.package_type === '시퀀스' && (
                <ProcedureAccordion 
                    title="시퀀스 상세 정보" 
                    subtitle={`시퀀스 ID: ${displayProduct.sequence_id || 'N/A'}`}
                    value="sequence-detail"
                >
                    {existingSequenceInfo && hasSequenceInfo ? (
                        <div className="space-y-4">
                            {/* 시퀀스 기본 정보 */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-gray-500">시퀀스 그룹 ID</label>
                                    <p className="text-sm font-medium text-gray-900">
                                        {'group_id' in existingSequenceInfo ? existingSequenceInfo.group_id : 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500">총 단계 수</label>
                                    <p className="text-sm font-medium text-gray-900">
                                        {existingSequenceInfo.steps?.length || 0}개
                                    </p>
                                </div>
                            </div>
                            
                            {/* 시퀀스 단계별 상세 정보 */}
                            <div className="space-y-3">
                                <h6 className="text-sm font-medium text-gray-900">단계별 상세 정보</h6>
                                {existingSequenceInfo && 'steps' in existingSequenceInfo && existingSequenceInfo.steps?.map((step: unknown, index: number) => {
                                    // 타입 가드로 step의 구조 확인
                                    if (step && typeof step === 'object' && 'step_num' in step) {
                                        const safeStep = step as SequenceStep;
                                        
                                        return (
                                            <div key={index} className="bg-white rounded-lg p-3 border border-gray-200">
                                                {/* Step 헤더 */}
                                                <div className="flex items-center justify-between mb-3">
                                                    <div className="flex items-center space-x-2">
                                                        <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2 py-1 rounded-full">
                                                            {safeStep.step_num || index + 1}
                                                        </span>
                                                        <h6 className="text-sm font-medium text-gray-900">
                                                            {safeStep.name || `Step ${safeStep.step_num || index + 1}`}
                                                        </h6>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                                            {safeStep.procedure_cost?.toLocaleString()}원
                                                        </span>
                                                        {safeStep.sequence_interval && (
                                                            <span className="text-xs text-gray-500 bg-blue-100 px-2 py-1 rounded">
                                                                {safeStep.sequence_interval}일
                                                            </span>
                                                        )}
                                                        {safeStep.price_ratio && (
                                                            <span className="text-xs text-gray-500 bg-green-100 px-2 py-1 rounded">
                                                                {safeStep.price_ratio}%
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                
                                                {/* Element 정보가 있는 경우 (단일 시술) */}
                                                {safeStep.element_info && (
                                                    <div className="bg-gray-50 rounded p-2 border-l-2 border-green-300">
                                                        <div className="flex items-center justify-between mb-1">
                                                            <div className="flex items-center space-x-2">
                                                                <span className="bg-green-200 text-green-700 text-xs px-1.5 py-0.5 rounded">
                                                                    단일시술
                                                                </span>
                                                                <span className="text-sm font-medium text-gray-900">
                                                                    {safeStep.element_info.name}
                                                                </span>
                                                            </div>
                                                            <span className="text-xs text-gray-600">
                                                                {safeStep.element_info.procedure_cost?.toLocaleString()}원
                                                            </span>
                                                        </div>
                                                        <div className="ml-6 text-xs text-gray-600">
                                                            <p>{safeStep.element_info.description}</p>
                                                            <div className="grid grid-cols-2 gap-2 mt-1">
                                                                <span className="text-gray-500">분류: {safeStep.element_info.class_major} &gt; {safeStep.element_info.class_sub} &gt; {safeStep.element_info.class_detail}</span>
                                                                <span className="text-gray-500">타입: {safeStep.element_info.class_type}</span>
                                                                <span className="text-gray-500">담당: {safeStep.element_info.position_type}</span>
                                                                <span className="text-gray-500">시간: {safeStep.element_info.cost_time}분</span>
                                                                <span className="text-gray-500">난이도: {safeStep.element_info.procedure_level}</span>
                                                                <span className="text-gray-500">가격: {safeStep.element_info.price?.toLocaleString()}원</span>
                                                            </div>
                                                            
                                                            {/* 소모품 정보 */}
                                                            {safeStep.element_info.consum_1_id && safeStep.element_info.consumable_info && (
                                                                <div className="mt-2 p-2 bg-white rounded border border-gray-200">
                                                                    <div className="text-xs font-medium text-gray-700 mb-1">소모품 정보</div>
                                                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                                                        <span className="text-gray-500">소모품명: {safeStep.element_info.consumable_info.name}</span>
                                                                        <span className="text-gray-500">설명: {safeStep.element_info.consumable_info.description}</span>
                                                                        <span className="text-gray-500">단위: {safeStep.element_info.consumable_info.unit_type}</span>
                                                                        <span className="text-gray-500">수량: {safeStep.element_info.consum_1_count}</span>
                                                                        <span className="text-gray-500">가격: {safeStep.element_info.consumable_info.price?.toLocaleString()}원</span>
                                                                        <span className="text-gray-500">단가: {safeStep.element_info.consumable_info.unit_price?.toLocaleString()}원</span>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                                
                                                {/* Bundle Info가 있는 경우 Elements 표시 */}
                                                {safeStep.bundle_info && safeStep.bundle_info.elements && (
                                                    <div className="space-y-2">
                                                        <div className="text-xs text-gray-600 font-medium mb-2">
                                                            번들: {safeStep.bundle_info.name} ({safeStep.bundle_info.elements.length}개 시술)
                                                        </div>
                                                        {safeStep.bundle_info.elements.map((element, elemIndex: number) => (
                                                            <div key={elemIndex} className="bg-gray-50 rounded p-2 border-l-2 border-purple-300">
                                                                <div className="flex items-center justify-between mb-1">
                                                                    <div className="flex items-center space-x-2">
                                                                        <span className="bg-purple-200 text-purple-700 text-xs px-1.5 py-0.5 rounded">
                                                                            {elemIndex + 1}
                                                                        </span>
                                                                        <span className="text-sm font-medium text-gray-900">
                                                                            {element.name}
                                                                        </span>
                                                                    </div>
                                                                    <span className="text-xs text-gray-600">
                                                                        {element.procedure_cost?.toLocaleString()}원
                                                                    </span>
                                                                </div>
                                                                <div className="ml-6 text-xs text-gray-600">
                                                                    <p>{element.description}</p>
                                                                    <div className="grid grid-cols-2 gap-2 mt-1">
                                                                        <span className="text-gray-500">분류: {element.class_major} &gt; {element.class_sub} &gt; {element.class_detail}</span>
                                                                        <span className="text-gray-500">타입: {element.class_type}</span>
                                                                        <span className="text-gray-500">담당: {element.position_type}</span>
                                                                        <span className="text-gray-500">시간: {element.cost_time}분</span>
                                                                        <span className="text-gray-500">난이도: {element.procedure_level}</span>
                                                                        <span className="text-gray-500">가격: {element.price?.toLocaleString()}원</span>
                                                                    </div>
                                                                    
                                                                    {/* 소모품 정보 */}
                                                                    {element.consum_1_id && element.consumable_info && (
                                                                        <div className="mt-2 p-2 bg-white rounded border border-gray-200">
                                                                            <div className="text-xs font-medium text-gray-700 mb-1">소모품 정보</div>
                                                                            <div className="grid grid-cols-2 gap-2 text-xs">
                                                                                <span className="text-gray-500">소모품명: {element.consumable_info.name}</span>
                                                                                <span className="text-gray-500">설명: {element.consumable_info.description}</span>
                                                                                <span className="text-gray-500">단위: {element.consumable_info.unit_type}</span>
                                                                                <span className="text-gray-500">수량: {element.consum_1_count}</span>
                                                                                <span className="text-gray-500">가격: {element.consumable_info.price?.toLocaleString()}원</span>
                                                                                <span className="text-gray-500">단가: {element.consumable_info.unit_price?.toLocaleString()}원</span>
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                                
                                                {/* Custom Info가 있는 경우 Elements 표시 */}
                                                {safeStep.custom_info && safeStep.custom_info.elements && (
                                                    <div className="space-y-2">
                                                        <div className="text-xs text-gray-600 font-medium mb-2">
                                                            🎯 커스텀: {safeStep.custom_info.name} ({safeStep.custom_info.elements.length}개 시술)
                                                        </div>
                                                        {safeStep.custom_info.elements.map((element, elemIndex: number) => (
                                                            <div key={elemIndex} className="bg-gray-50 rounded p-2 border-l-2 border-red-300">
                                                                <div className="flex items-center justify-between mb-1">
                                                                    <div className="flex items-center space-x-2">
                                                                        <span className="bg-red-200 text-red-700 text-xs px-1.5 py-0.5 rounded">
                                                                            {elemIndex + 1}
                                                                        </span>
                                                                        <span className="text-sm font-medium text-gray-900">
                                                                            {element.name}
                                                                        </span>
                                                                    </div>
                                                                    <span className="text-xs text-gray-600">
                                                                        {element.procedure_cost?.toLocaleString()}원
                                                                    </span>
                                                                </div>
                                                                <div className="ml-6 text-xs text-gray-600">
                                                                    <p>{element.description}</p>
                                                                    <div className="grid grid-cols-2 gap-2 mt-1">
                                                                        <span className="text-gray-500">분류: {element.class_major} &gt; {element.class_sub} &gt; {element.class_detail}</span>
                                                                        <span className="text-gray-500">타입: {element.class_type}</span>
                                                                        <span className="text-gray-500">담당: {element.position_type}</span>
                                                                        <span className="text-gray-500">시간: {element.cost_time}분</span>
                                                                        <span className="text-gray-500">난이도: {element.procedure_level}</span>
                                                                        <span className="text-gray-500">가격: {element.price?.toLocaleString()}원</span>
                                                                    </div>
                                                                    
                                                                    {/* 소모품 정보 */}
                                                                    {element.consum_1_id && element.consumable_info && (
                                                                        <div className="mt-2 p-2 bg-white rounded border border-gray-200">
                                                                            <div className="text-xs font-medium text-gray-700 mb-1">소모품 정보</div>
                                                                            <div className="grid grid-cols-2 gap-2 text-xs">
                                                                                <span className="text-gray-500">소모품명: {element.consumable_info.name}</span>
                                                                                <span className="text-gray-500">설명: {element.consumable_info.description}</span>
                                                                                <span className="text-gray-500">단위: {element.consumable_info.unit_type}</span>
                                                                                <span className="text-gray-500">수량: {element.consum_1_count}</span>
                                                                                <span className="text-gray-500">가격: {element.consumable_info.price?.toLocaleString()}원</span>
                                                                                <span className="text-gray-500">단가: {element.consumable_info.unit_price?.toLocaleString()}원</span>
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    }
                                    return null;
                                })}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-4 text-gray-500">
                            시퀀스 상세 정보를 불러올 수 없습니다.
                        </div>
                    )}
                </ProcedureAccordion>
            )}

            {/* 기본 시술 정보 */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-xs text-gray-500">시술명</label>
                    <p className="text-sm font-medium text-gray-900">
                        {displayProduct.procedure_info ? getProcedureName(displayProduct.procedure_info) : '시술 정보 없음'}
                    </p>
                </div>
                <div>
                    <label className="text-xs text-gray-500">시퀀스 타입</label>
                    <p className="text-sm text-gray-700">
                        {existingSequenceInfo && hasSequenceInfo && existingSequenceInfo.steps
                            ? `${existingSequenceInfo.steps.length}단계 시퀀스`
                            : '-'}
                    </p>
                </div>
                <div>
                    <label className="text-xs text-gray-500">시퀀스 총 원가</label>
                    <p className="text-sm font-medium text-gray-900">
                        {existingSequenceInfo && hasSequenceInfo && existingSequenceInfo.steps
                            ? existingSequenceInfo.steps.reduce((sum: number, step: unknown) => {
                                if (step && typeof step === 'object' && 'procedure_cost' in step) {
                                    const safeStep = step as { procedure_cost?: number };
                                    return sum + (safeStep.procedure_cost || 0);
                                }
                                return sum;
                              }, 0).toLocaleString()
                            : '0'}원
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

            {/* 기존 시퀀스 단계별 상세 정보 (displayProduct.procedure_info 사용) */}
            {displayProduct.procedure_info && 'steps' in displayProduct.procedure_info && Array.isArray(displayProduct.procedure_info.steps) && displayProduct.procedure_info.steps.length > 0 && (
                <div className="mt-4">
                    <ProcedureAccordion 
                        title="기존 시퀀스 단계별 상세 정보" 
                        subtitle={`${displayProduct.procedure_info.steps.length}개 단계`}
                        value="sequence-steps"
                    >
                        <div className="space-y-3">
                            {displayProduct.procedure_info.steps.map((step: ProductSequenceStep, index: number) => (
                                <div key={index} className="bg-white rounded-lg p-3 border border-gray-200">
                                    {/* Step 헤더 */}
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center space-x-2">
                                            <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2 py-1 rounded-full">
                                                {step.step_num || index + 1}
                                            </span>
                                            <h6 className="text-sm font-medium text-gray-900">
                                                {step.step_name || `Step ${step.step_num || index + 1}`}
                                            </h6>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                                {step.procedure_cost?.toLocaleString()}원
                                            </span>
                                            {step.sequence_interval && (
                                                <span className="text-xs text-gray-500 bg-blue-100 px-2 py-1 rounded">
                                                    {step.sequence_interval}일
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    
                                    {/* Bundle Detail이 있는 경우 Elements 표시 */}
                                    {step.bundle_detail?.elements && (
                                        <div className="space-y-2">
                                            <div className="text-xs text-gray-600 font-medium mb-2">
                                                📦 번들: {step.bundle_detail.name} ({step.bundle_detail.elements.length}개 시술)
                                            </div>
                                            {step.bundle_detail.elements.map((element, elemIndex: number) => (
                                                <div key={elemIndex} className="bg-gray-50 rounded p-2 border-l-2 border-purple-300">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <div className="flex items-center space-x-2">
                                                            <span className="bg-purple-200 text-purple-700 text-xs px-1.5 py-0.5 rounded">
                                                                {elemIndex + 1}
                                                            </span>
                                                            <span className="text-sm font-medium text-gray-900">
                                                                {element.name}
                                                            </span>
                                                        </div>
                                                        <span className="text-xs text-gray-600">
                                                            {element.procedure_cost?.toLocaleString()}원
                                                        </span>
                                                    </div>
                                                    <div className="ml-6 text-xs text-gray-600">
                                                        <p>{element.description}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </ProcedureAccordion>
                </div>
            )}
        </div>
    );
}
