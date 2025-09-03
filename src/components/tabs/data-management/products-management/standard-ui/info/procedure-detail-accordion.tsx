'use client';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { SequenceStepResponse } from '@/api/sequences-api';
import { ProcedureInfo, isBundle, isCustom } from '../../standard-detail-types';

interface ProcedureDetailAccordionProps {
    newSelectedProcedure: ProcedureInfo;
    newPackageType: string;
}

export default function ProcedureDetailAccordion({
    newSelectedProcedure,
}: ProcedureDetailAccordionProps) {
    // null/undefined 체크
    if (!newSelectedProcedure) {
        return null;
    }

    return (
        <Accordion type="single" collapsible className="bg-gray-50 rounded-lg border border-gray-200">
            <AccordionItem value="element-details" className="border-none">
                <AccordionTrigger className="px-4 py-3 hover:bg-gray-100 transition-colors [&[data-state=open]]:bg-gray-100">
                    <div className="flex items-center space-x-3">
                        <h5 className="text-sm font-medium text-gray-900">포함된 시술 상세 정보</h5>
                        <span className="text-xs text-gray-600 bg-gray-200 px-2 py-1 rounded">
                            {isBundle(newSelectedProcedure) && newSelectedProcedure.elements ? 
                                `${newSelectedProcedure.elements.length}개 시술` : 
                                ('steps' in newSelectedProcedure && newSelectedProcedure.steps && Array.isArray(newSelectedProcedure.steps)) ? 
                                    `${newSelectedProcedure.steps.length}개 단계` : '0개'
                            }
                        </span>
                    </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 border-t border-gray-200 bg-white">
                    <div className="space-y-3 pt-4">
                        {/* 번들 또는 커스텀의 경우 elements 표시 */}
                        {(isBundle(newSelectedProcedure) || isCustom(newSelectedProcedure)) && 
                            newSelectedProcedure.elements && 
                            newSelectedProcedure.elements.map((element, index: number) => {
                                // BundleElementResponse인지 CustomElementResponse인지 판별
                                const isBundleElement = 'id' in element && 'group_id' in element;
                                const isCustomElement = 'id' in element && 'custom_count' in element;
                                
                                return (
                                    <div key={index} className="bg-white rounded-lg p-3 border border-gray-200">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center space-x-2">
                                                <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
                                                    {index + 1}
                                                </span>
                                                <h6 className="text-sm font-medium text-gray-900">
                                                    {`요소 ${index + 1}`}
                                                </h6>
                                            </div>
                                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                                {isBundle(newSelectedProcedure) ? '번들 요소' : '커스텀 요소'}
                                            </span>
                                        </div>
                                        
                                        {/* 기본 정보 */}
                                        <div className="grid grid-cols-2 gap-3 text-xs mb-3">
                                            <div>
                                                <span className="text-gray-500">요소 ID:</span>
                                                <span className="ml-1 text-gray-900 font-medium">
                                                    {(() => {
                                                        if (isBundleElement || isCustomElement) {
                                                            return element.id;
                                                        }
                                                        // if ('element_id' in element && typeof element.element_id === 'number') {
                                                        //     return element.element_id;
                                                        // }
                                                        return '-';
                                                    })()}
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
                                                    {element.price_ratio ? (element.price_ratio * 100).toFixed(1) : '-'}%
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-gray-500">커스텀 횟수:</span>
                                                <span className="ml-1 text-gray-900 font-medium">
                                                    {isCustomElement ? element.custom_count : '-'}
                                                </span>
                                            </div>
                                        </div>
                                        
                                        {/* 상세 정보가 있는 경우 표시 */}
                                        {('element_detail' in element && element.element_detail) && (
                                            <>
                                                {/* 시술 분류 정보 */}
                                                <div className="grid grid-cols-2 gap-3 text-xs mb-3">
                                                    <div>
                                                        <span className="text-gray-500">주요 분류:</span>
                                                        <span className="ml-1 text-gray-900">
                                                            {element.element_detail.class_major || '-'}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500">세부 분류:</span>
                                                        <span className="ml-1 text-gray-900">
                                                            {element.element_detail.class_sub || '-'}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500">상세 분류:</span>
                                                        <span className="ml-1 text-gray-900">
                                                            {element.element_detail.class_detail || '-'}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500">시술 타입:</span>
                                                        <span className="ml-1 text-gray-900">
                                                            {element.element_detail.class_type || '-'}
                                                        </span>
                                                    </div>
                                                </div>
                                                
                                                {/* 시술 기본 정보 */}
                                                <div className="grid grid-cols-2 gap-3 text-xs mb-3">
                                                    <div>
                                                        <span className="text-gray-500">소요 시간:</span>
                                                        <span className="ml-1 text-gray-900">
                                                            {element.element_detail.cost_time || '-'}분
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500">시술 담당:</span>
                                                        <span className="ml-1 text-gray-900">
                                                            {element.element_detail.position_type || '-'}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500">시술 수준:</span>
                                                        <span className="ml-1 text-gray-900">
                                                            {element.element_detail.procedure_level || '-'}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500">플랜 상태:</span>
                                                        <span className="ml-1 text-gray-900">
                                                            {element.element_detail.plan_state === 1 ? '플랜 있음' : '플랜 없음'}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* 플랜 정보 */}
                                                {element.element_detail.plan_state === 1 && (
                                                    <div className="grid grid-cols-2 gap-3 text-xs mb-3">
                                                        <div>
                                                            <span className="text-gray-500">플랜 횟수:</span>
                                                            <span className="ml-1 text-gray-900">
                                                                {element.element_detail.plan_count || '-'}회
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-500">플랜 주기:</span>
                                                            <span className="ml-1 text-gray-900">
                                                                {element.element_detail.plan_interval || '-'}일
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}
                                                
                                                {/* 소모품 정보 */}
                                                {element.element_detail.consum_1_id && (
                                                    <div className="mt-3 pt-3 border-t border-gray-100">
                                                        <div className="text-xs text-gray-500 mb-2 font-medium">소모품 정보</div>
                                                        <div className="grid grid-cols-2 gap-3 text-xs">
                                                            <div>
                                                                <span className="text-gray-500">소모품 ID:</span>
                                                                <span className="ml-1 text-gray-900 font-medium">
                                                                    {element.element_detail.consum_1_id}
                                                                </span>
                                                            </div>
                                                            <div>
                                                                <span className="text-gray-500">수량:</span>
                                                                <span className="ml-1 text-gray-900">
                                                                    {element.element_detail.consum_1_count || '-'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                                
                                                {/* 시술 설명 */}
                                                {element.element_detail.description && (
                                                    <div className="mt-3 pt-3 border-t border-gray-100">
                                                        <div className="text-xs text-gray-500 mb-1 font-medium">시술 설명</div>
                                                        <p className="text-xs text-gray-700">
                                                            {element.element_detail.description}
                                                        </p>
                                                    </div>
                                                )}
                                                
                                                {/* 시술 가격 정보 */}
                                                {element.element_detail.price && (
                                                    <div className="mt-3 pt-3 border-t border-gray-100">
                                                        <div className="text-xs text-gray-500 mb-1 font-medium">가격 정보</div>
                                                        <div className="grid grid-cols-2 gap-3 text-xs">
                                                            <div>
                                                                <span className="text-gray-500">시술 가격:</span>
                                                                <span className="ml-1 text-gray-900 font-medium">
                                                                    {element.element_detail.price.toLocaleString()}원
                                                                </span>
                                                            </div>
                                                            <div>
                                                                <span className="text-gray-500">시술 원가:</span>
                                                                <span className="ml-1 text-gray-900 font-medium">
                                                                    {element.element_detail.procedure_cost?.toLocaleString()}원
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                );
                            })
                        }
                        
                        {/* 시퀀스의 경우 steps 표시 */}
                        {('steps' in newSelectedProcedure && newSelectedProcedure.steps && Array.isArray(newSelectedProcedure.steps) && newSelectedProcedure.steps.length > 0) && 
                            newSelectedProcedure.steps.map((step, index: number) => {
                                const sequenceStep = step as SequenceStepResponse;
                                return (
                                    <div key={index} className="bg-white rounded-lg p-3 border border-gray-200">
                                        {/* Step 헤더 */}
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center space-x-2">
                                                <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2 py-1 rounded-full">
                                                    {step.step_num || index + 1}
                                                </span>
                                                <h6 className="text-sm font-medium text-gray-900">
                                                    {sequenceStep.name || `단계 ${sequenceStep.step_num || index + 1}`}
                                                </h6>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                                    {step.step_num || index + 1}단계
                                                </span>
                                                {sequenceStep.procedure_cost && (
                                                    <span className="text-xs text-gray-500 bg-blue-100 px-2 py-1 rounded">
                                                        {sequenceStep.procedure_cost.toLocaleString()}원
                                                    </span>
                                                )}
                                                {sequenceStep.sequence_interval && (
                                                    <span className="text-xs text-gray-500 bg-green-100 px-2 py-1 rounded">
                                                        {sequenceStep.sequence_interval}일
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        
                                        {/* 기본 정보 */}
                                        <div className="grid grid-cols-2 gap-3 text-xs mb-3">
                                            <div>
                                                <span className="text-gray-500">단계 ID:</span>
                                                <span className="ml-1 text-gray-900 font-medium">
                                                    {sequenceStep.id || '-'}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-gray-500">시술 원가:</span>
                                                <span className="ml-1 text-gray-900 font-medium">
                                                    {sequenceStep.procedure_cost ? sequenceStep.procedure_cost.toLocaleString() : '-'}원
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-gray-500">가격 비율:</span>
                                                <span className="ml-1 text-gray-900 font-medium">
                                                    {sequenceStep.price_ratio ? (sequenceStep.price_ratio * 100).toFixed(1) : '-'}%
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-gray-500">시퀀스 간격:</span>
                                                <span className="ml-1 text-gray-900 font-medium">
                                                    {sequenceStep.sequence_interval ? sequenceStep.sequence_interval : '-'}일
                                                </span>
                                            </div>
                                        </div>
                                        
                                        {/* Element 정보가 있는 경우 (단일 시술) */}
                                        {step.element_info && (
                                            <div className="mt-3 pt-3 border-t border-gray-100">
                                                <div className="text-xs text-gray-500 mb-2 font-medium">Element 상세 정보</div>
                                                <div className="grid grid-cols-2 gap-3 text-xs mb-3">
                                                    <div>
                                                        <span className="text-gray-500">Element ID:</span>
                                                        <span className="ml-1 text-gray-900 font-medium">
                                                            {sequenceStep.element_info?.id || '-'}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500">Element명:</span>
                                                        <span className="ml-1 text-gray-900 font-medium">
                                                            {sequenceStep.element_info?.name || '-'}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500">시술 원가:</span>
                                                        <span className="ml-1 text-gray-900 font-medium">
                                                            {sequenceStep.element_info?.procedure_cost?.toLocaleString() || '-'}원
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500">시술 가격:</span>
                                                        <span className="ml-1 text-gray-900 font-medium">
                                                            {sequenceStep.element_info?.price?.toLocaleString() || '-'}원
                                                        </span>
                                                    </div>
                                                </div>
                                                
                                                {/* 시술 분류 정보 */}
                                                <div className="grid grid-cols-2 gap-3 text-xs mb-3">
                                                    <div>
                                                        <span className="text-gray-500">주요 분류:</span>
                                                        <span className="ml-1 text-gray-900">
                                                            {sequenceStep.element_info?.class_major || '-'}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500">세부 분류:</span>
                                                        <span className="ml-1 text-gray-900">
                                                            {sequenceStep.element_info?.class_sub || '-'}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500">상세 분류:</span>
                                                        <span className="ml-1 text-gray-900">
                                                            {sequenceStep.element_info?.class_detail || '-'}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500">시술 타입:</span>
                                                        <span className="ml-1 text-gray-900">
                                                            {sequenceStep.element_info?.class_type || '-'}
                                                        </span>
                                                    </div>
                                                </div>
                                                
                                                {/* 시술 기본 정보 */}
                                                <div className="grid grid-cols-2 gap-3 text-xs mb-3">
                                                    <div>
                                                        <span className="text-gray-500">소요 시간:</span>
                                                        <span className="ml-1 text-gray-900">
                                                            {sequenceStep.element_info?.cost_time || '-'}분
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500">시술 담당:</span>
                                                        <span className="ml-1 text-gray-900">
                                                            {sequenceStep.element_info?.position_type || '-'}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500">시술 수준:</span>
                                                        <span className="ml-1 text-gray-900">
                                                            {sequenceStep.element_info?.procedure_level || '-'}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500">플랜 상태:</span>
                                                        <span className="ml-1 text-gray-900">
                                                            {sequenceStep.element_info?.plan_state === 1 ? '플랜 있음' : '플랜 없음'}
                                                        </span>
                                                    </div>
                                                </div>
                                                
                                                {/* 플랜 정보 */}
                                                {sequenceStep.element_info?.plan_state === 1 && (
                                                    <div className="grid grid-cols-2 gap-3 text-xs mb-3">
                                                        <div>
                                                            <span className="text-gray-500">플랜 횟수:</span>
                                                            <span className="ml-1 text-gray-900">
                                                                {sequenceStep.element_info?.plan_count || '-'}회
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-500">플랜 주기:</span>
                                                            <span className="ml-1 text-gray-900">
                                                                {sequenceStep.element_info?.plan_interval || '-'}일
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}
                                                
                                                {/* 소모품 정보 */}
                                                {sequenceStep.element_info?.consum_1_id && sequenceStep.element_info?.consumable_info && (
                                                    <div className="mt-3 pt-3 border-t border-gray-100">
                                                        <div className="text-xs text-gray-500 mb-2 font-medium">소모품 정보</div>
                                                        <div className="grid grid-cols-2 gap-3 text-xs mb-3">
                                                            <div>
                                                                <span className="text-gray-500">소모품 ID:</span>
                                                                <span className="ml-1 text-gray-900 font-medium">
                                                                    {sequenceStep.element_info?.consum_1_id}
                                                                </span>
                                                            </div>
                                                            <div>
                                                                <span className="text-gray-500">수량:</span>
                                                                <span className="ml-1 text-gray-900">
                                                                    {sequenceStep.element_info?.consum_1_count || '-'}
                                                                </span>
                                                            </div>
                                                            <div>
                                                                <span className="text-gray-500">소모품명:</span>
                                                                <span className="ml-1 text-gray-900 font-medium">
                                                                    {sequenceStep.element_info?.consumable_info.name || '-'}
                                                                </span>
                                                            </div>
                                                            <div>
                                                                <span className="text-gray-500">단위:</span>
                                                                <span className="ml-1 text-gray-900">
                                                                    {sequenceStep.element_info?.consumable_info.unit_type || '-'}
                                                                </span>
                                                            </div>
                                                            <div>
                                                                <span className="text-gray-500">소모품 가격:</span>
                                                                <span className="ml-1 text-gray-900 font-medium">
                                                                    {sequenceStep.element_info?.consumable_info.price?.toLocaleString() || '-'}원
                                                                </span>
                                                            </div>
                                                            <div>
                                                                <span className="text-gray-500">단위 가격:</span>
                                                                <span className="ml-1 text-gray-900">
                                                                    {sequenceStep.element_info?.consumable_info.unit_price?.toLocaleString() || '-'}원
                                                                </span>
                                                            </div>
                                                        </div>
                                                        
                                                        {/* 소모품 설명 */}
                                                        {sequenceStep.element_info?.consumable_info.description && (
                                                            <div className="mt-2 pt-2 border-t border-gray-100">
                                                                <div className="text-xs text-gray-500 mb-1 font-medium">소모품 설명</div>
                                                                <p className="text-xs text-gray-700">
                                                                    {sequenceStep.element_info?.consumable_info.description}
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                                
                                                {/* 시술 설명 */}
                                                {sequenceStep.element_info?.description && (
                                                    <div className="mt-3 pt-3 border-t border-gray-100">
                                                        <div className="text-xs text-gray-500 mb-1 font-medium">시술 설명</div>
                                                        <p className="text-xs text-gray-700">
                                                            {sequenceStep.element_info?.description}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        
                                        {/* Bundle Info가 있는 경우 Elements 표시 */}
                                        {sequenceStep.bundle_info && sequenceStep.bundle_info.elements && (
                                            <div className="mt-3 pt-3 border-t border-gray-100">
                                                <div className="text-xs text-gray-500 mb-2 font-medium">Bundle 상세 정보</div>
                                                <div className="grid grid-cols-2 gap-3 text-xs mb-3">
                                                    <div>
                                                        <span className="text-gray-500">Bundle ID:</span>
                                                        <span className="ml-1 text-gray-900 font-medium">
                                                            {sequenceStep.bundle_info.group_id || '-'}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500">Bundle명:</span>
                                                        <span className="ml-1 text-gray-900 font-medium">
                                                            {sequenceStep.bundle_info.name || '-'}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500">Bundle 원가:</span>
                                                        <span className="ml-1 text-gray-900 font-medium">
                                                            {sequenceStep.bundle_info.element_cost?.toLocaleString() || '-'}원
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500">가격 비율:</span>
                                                        <span className="ml-1 text-gray-900 font-medium">
                                                            {sequenceStep.bundle_info.price_ratio ? (sequenceStep.bundle_info.price_ratio * 100).toFixed(1) : '-'}%
                                                        </span>
                                                    </div>
                                                </div>
                                                
                                                {/* Bundle 설명 */}
                                                {sequenceStep.bundle_info.description && (
                                                    <div className="mt-3 pt-3 border-t border-gray-100">
                                                        <div className="text-xs text-gray-500 mb-1 font-medium">Bundle 설명</div>
                                                        <p className="text-xs text-gray-700">
                                                            {sequenceStep.bundle_info.description}
                                                        </p>
                                                    </div>
                                                )}
                                                
                                                <div className="space-y-2">
                                                    <div className="text-xs text-gray-600 font-medium mb-2">
                                                        📦 번들: {sequenceStep.bundle_info.name} ({sequenceStep.bundle_info.elements.length}개 시술)
                                                    </div>
                                                    {sequenceStep.bundle_info.elements.map((element, elementIndex: number) => (
                                                        <div key={elementIndex} className="bg-orange-50 rounded p-2 border border-orange-200">
                                                            <div className="flex items-center justify-between mb-2">
                                                                <div className="flex items-center space-x-2">
                                                                    <span className="bg-orange-200 text-orange-700 text-xs px-1.5 py-0.5 rounded">
                                                                        {elementIndex + 1}
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
                                            </div>
                                        )}
                                        
                                        {/* Custom Info가 있는 경우 Elements 표시 */}
                                        {sequenceStep.custom_info && sequenceStep.custom_info.elements && (
                                            <div className="mt-3 pt-3 border-t border-gray-100">
                                                <div className="text-xs text-gray-500 mb-2 font-medium">Custom 상세 정보</div>
                                                <div className="grid grid-cols-2 gap-3 text-xs mb-3">
                                                    <div>
                                                        <span className="text-gray-500">Custom ID:</span>
                                                        <span className="ml-1 text-gray-900 font-medium">
                                                            {sequenceStep.custom_info.group_id || '-'}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500">Custom명:</span>
                                                        <span className="ml-1 text-gray-900 font-medium">
                                                            {sequenceStep.custom_info.name || '-'}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500">Custom 원가:</span>
                                                        <span className="ml-1 text-gray-900 font-medium">
                                                            {sequenceStep.custom_info.element_cost?.toLocaleString() || '-'}원
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500">가격 비율:</span>
                                                        <span className="ml-1 text-gray-900 font-medium">
                                                            {sequenceStep.custom_info.price_ratio ? (sequenceStep.custom_info.price_ratio * 100).toFixed(1) : '-'}%
                                                        </span>
                                                    </div>
                                                </div>
                                                
                                                {/* Custom 설명 */}
                                                {sequenceStep.custom_info?.description && (
                                                    <div className="mt-3 pt-3 border-t border-gray-100">
                                                        <div className="text-xs text-gray-500 mb-1 font-medium">Custom 설명</div>
                                                        <p className="text-xs text-gray-700">
                                                            {sequenceStep.custom_info.description}
                                                        </p>
                                                    </div>
                                                )}
                                                
                                                <div className="space-y-2">
                                                    <div className="text-xs text-gray-600 font-medium mb-2">
                                                        🎯 커스텀: {sequenceStep.custom_info.name} ({sequenceStep.custom_info.elements.length}개 시술)
                                                    </div>
                                                    {sequenceStep.custom_info.elements.map((element, elementIndex: number) => (
                                                        <div key={elementIndex} className="bg-red-50 rounded p-2 border border-red-200">
                                                            <div className="flex items-center justify-between mb-2">
                                                                <div className="flex items-center space-x-2">
                                                                    <span className="bg-red-200 text-red-700 text-xs px-1.5 py-0.5 rounded">
                                                                        {elementIndex + 1}
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
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        }
                    </div>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    );
}
