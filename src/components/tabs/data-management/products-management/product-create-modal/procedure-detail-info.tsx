'use client';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Element } from '@/api/element-api';
import { BundleListResponse } from '@/api/bundles-api';
import { CustomListResponse } from '@/api/customs-api';
import { SequenceResponse } from '@/api/sequences-api';
import { isElement, isBundle, isCustom, isSequence, getTotalProcedureCost } from './procedure-utils';

interface ProcedureDetailInfoProps {
    selectedProcedure: Element | BundleListResponse | CustomListResponse | SequenceResponse;
    selectedProcedureType: 'element' | 'bundle' | 'custom' | 'sequence';
}

export default function ProcedureDetailInfo({ 
    selectedProcedure, 
    selectedProcedureType
}: ProcedureDetailInfoProps) {

    return (
        <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="procedure-details" className="border-0">
                <AccordionTrigger className="text-blue-800 hover:text-blue-900 hover:no-underline">
                    <span className="text-sm font-medium">시술 상세 정보 보기</span>
                </AccordionTrigger>
                <AccordionContent className="pt-2">
                    <div className="bg-white/60 rounded-lg p-4 border border-blue-200">
                        {/* 공통 정보 */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
                            <div className="flex justify-between">
                                <span className="text-blue-700">총 비용:</span>
                                <span className="font-medium text-blue-900">{getTotalProcedureCost(selectedProcedure).toLocaleString()}원</span>
                            </div>
                        </div>

                        {/* Element 타입 상세 정보 */}
                        {isElement(selectedProcedure) && (
                            <>
                                <div className="border-t border-blue-200 pt-4 mb-4">
                                    <h6 className="text-blue-800 font-medium text-xs mb-3 uppercase tracking-wide">Element 상세 정보</h6>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                        {selectedProcedure.cost_time && (
                                            <div className="flex justify-between">
                                                <span className="text-blue-700">소요시간:</span>
                                                <span className="font-medium text-blue-900">{selectedProcedure.cost_time}분</span>
                                            </div>
                                        )}
                                        {selectedProcedure.procedure_level && (
                                            <div className="flex justify-between">
                                                <span className="text-blue-700">시술 등급:</span>
                                                <span className="font-medium text-blue-900">{selectedProcedure.procedure_level}</span>
                                            </div>
                                        )}
                                        {selectedProcedure.position_type && (
                                            <div className="flex justify-between">
                                                <span className="text-blue-700">위치:</span>
                                                <span className="font-medium text-blue-900">{selectedProcedure.position_type}</span>
                                            </div>
                                        )}
                                        {selectedProcedure.price && (
                                            <div className="flex justify-between">
                                                <span className="text-blue-700">가격:</span>
                                                <span className="font-medium text-blue-900">{selectedProcedure.price.toLocaleString()}원</span>
                                            </div>
                                        )}
                                        {selectedProcedure.plan_count && (
                                            <div className="flex justify-between">
                                                <span className="text-blue-700">계획 횟수:</span>
                                                <span className="font-medium text-blue-900">{selectedProcedure.plan_count}회</span>
                                            </div>
                                        )}
                                        {selectedProcedure.plan_interval && (
                                            <div className="flex justify-between">
                                                <span className="text-blue-700">계획 간격:</span>
                                                <span className="font-medium text-blue-900">{selectedProcedure.plan_interval}일</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* 분류 정보 */}
                                {(selectedProcedure.class_major || selectedProcedure.class_sub || selectedProcedure.class_detail || selectedProcedure.class_type) && (
                                    <div className="border-t border-blue-200 pt-4 mb-4">
                                        <h6 className="text-blue-800 font-medium text-xs mb-3 uppercase tracking-wide">분류 정보</h6>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                            {selectedProcedure.class_major && (
                                                <div className="flex justify-between">
                                                    <span className="text-blue-700">대분류:</span>
                                                    <span className="font-medium text-blue-900">{selectedProcedure.class_major}</span>
                                                </div>
                                            )}
                                            {selectedProcedure.class_sub && (
                                                <div className="flex justify-between">
                                                    <span className="text-blue-700">중분류:</span>
                                                    <span className="font-medium text-blue-900">{selectedProcedure.class_sub}</span>
                                                </div>
                                            )}
                                            {selectedProcedure.class_detail && (
                                                <div className="flex justify-between">
                                                    <span className="text-blue-700">소분류:</span>
                                                    <span className="font-medium text-blue-900">{selectedProcedure.class_detail}</span>
                                                </div>
                                            )}
                                            {selectedProcedure.class_type && (
                                                <div className="flex justify-between">
                                                    <span className="text-blue-700">분류 타입:</span>
                                                    <span className="font-medium text-blue-900">{selectedProcedure.class_type}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* 소모품 정보 */}
                                {(selectedProcedure.consum_1_name || selectedProcedure.consum_1_count || selectedProcedure.consum_1_unit) && (
                                    <div className="border-t border-blue-200 pt-4">
                                        <h6 className="text-blue-800 font-medium text-xs mb-3 uppercase tracking-wide">소모품 정보</h6>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                            {selectedProcedure.consum_1_name && (
                                                <div className="flex justify-between">
                                                    <span className="text-blue-700">소모품명:</span>
                                                    <span className="font-medium text-blue-900">{selectedProcedure.consum_1_name}</span>
                                                </div>
                                            )}
                                            {selectedProcedure.consum_1_count && (
                                                <div className="flex justify-between">
                                                    <span className="text-blue-700">수량:</span>
                                                    <span className="font-medium text-blue-900">{selectedProcedure.consum_1_count}</span>
                                                </div>
                                            )}
                                            {selectedProcedure.consum_1_unit && (
                                                <div className="flex justify-between">
                                                    <span className="text-blue-700">단위:</span>
                                                    <span className="font-medium text-blue-900">{selectedProcedure.consum_1_unit}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}

                        {/* Bundle 타입 상세 정보 */}
                        {isBundle(selectedProcedure) && (
                            <>
                                <div className="border-t border-blue-200 pt-4 mb-4">
                                    <h6 className="text-blue-800 font-medium text-xs mb-3 uppercase tracking-wide">Bundle 상세 정보</h6>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-blue-700">포함 시술:</span>
                                            <span className="font-medium text-blue-900">{selectedProcedure.elements.length}개</span>
                                        </div>
                                        {selectedProcedure.description && (
                                            <div className="flex justify-between">
                                                <span className="text-blue-700">설명:</span>
                                                <span className="font-medium text-blue-900">{selectedProcedure.description}</span>
                                            </div>
                                        )}
                                        {selectedProcedure.release !== undefined && (
                                            <div className="flex justify-between">
                                                <span className="text-blue-700">릴리즈:</span>
                                                <span className="font-medium text-blue-900">{selectedProcedure.release}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* 포함된 시술 목록 */}
                                {selectedProcedure.elements && selectedProcedure.elements.length > 0 && (
                                    <div className="border-t border-blue-200 pt-4 mb-4">
                                        <h6 className="text-blue-800 font-medium text-xs mb-3 uppercase tracking-wide">포함된 시술 목록</h6>
                                        <div className="space-y-3">
                                            {selectedProcedure.elements.map((element, index) => (
                                                <div key={index} className="bg-white/40 rounded-lg p-3 border border-blue-100">
                                                    {/* 기본 정보 */}
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm mb-3">
                                                        <div className="flex justify-between">
                                                            <span className="text-blue-700">시술명:</span>
                                                            <span className="font-medium text-blue-900">
                                                                {element.element_detail?.name || `Element ${element.element_id}`}
                                                            </span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-blue-700">비용:</span>
                                                            <span className="font-medium text-blue-900">
                                                                {element.element_cost ? `${element.element_cost.toLocaleString()}원` : 'N/A'}
                                                            </span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-blue-700">가격 비율:</span>
                                                            <span className="font-medium text-blue-900">
                                                                {element.price_ratio ? `${(element.price_ratio * 100).toFixed(1)}%` : 'N/A'}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Bundle 전용 정보 */}
                                                    {isBundle(selectedProcedure) && (
                                                        <div className="border-t border-blue-100 pt-3">
                                                            <div className="text-blue-600 font-medium text-xs mb-2">Bundle 전용 정보</div>
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                                                                {element.element_cost && (
                                                                    <div className="flex justify-between">
                                                                        <span className="text-blue-600">비용:</span>
                                                                        <span className="font-medium text-blue-800">{element.element_cost.toLocaleString()}원</span>
                                                                    </div>
                                                                )}
                                                                <div className="flex justify-between">
                                                                    <span className="text-blue-600">가격 비율:</span>
                                                                    <span className="font-medium text-blue-800">
                                                                        {element.price_ratio ? `${(element.price_ratio * 100).toFixed(1)}%` : 'N/A'}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}

                        {/* Custom 타입 정보 (기본) */}
                        {isCustom(selectedProcedure) && (
                            <>
                                <div className="border-t border-blue-200 pt-4 mb-4">
                                    <h6 className="text-blue-800 font-medium text-xs mb-3 uppercase tracking-wide">Custom 상세 정보</h6>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                        {selectedProcedure.elements && (
                                            <div className="flex justify-between">
                                                <span className="text-blue-700">포함 시술:</span>
                                                <span className="font-medium text-blue-900">{selectedProcedure.elements.length}개</span>
                                            </div>
                                        )}
                                        {selectedProcedure.description && (
                                            <div className="flex justify-between">
                                                <span className="text-blue-700">설명:</span>
                                                <span className="font-medium text-blue-900">{selectedProcedure.description}</span>
                                            </div>
                                        )}
                                        {selectedProcedure.release !== undefined && (
                                            <div className="flex justify-between">
                                                <span className="text-blue-700">릴리즈:</span>
                                                <span className="font-medium text-blue-900">{selectedProcedure.release}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* 포함된 시술 목록 */}
                                {selectedProcedure.elements && selectedProcedure.elements.length > 0 && (
                                    <div className="border-t border-blue-200 pt-4 mb-4">
                                        <h6 className="text-blue-800 font-medium text-xs mb-3 uppercase tracking-wide">포함된 시술 목록</h6>
                                        <div className="space-y-3">
                                            {selectedProcedure.elements.map((element, index) => (
                                                <div key={index} className="bg-white/40 rounded-lg p-3 border border-blue-100">
                                                    {/* 기본 정보 */}
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm mb-3">
                                                        <div className="flex justify-between">
                                                            <span className="text-blue-700">시술 ID:</span>
                                                            <span className="font-medium text-blue-900">{element.element_id}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-blue-700">커스텀 횟수:</span>
                                                            <span className="font-medium text-blue-900">{element.custom_count}회</span>
                                                        </div>
                                                        {element.element_limit && (
                                                            <div className="flex justify-between">
                                                                <span className="text-blue-700">제한 횟수:</span>
                                                                <span className="font-medium text-blue-900">{element.element_limit}회</span>
                                                            </div>
                                                        )}
                                                        {element.element_cost && (
                                                            <div className="flex justify-between">
                                                                <span className="text-blue-700">비용:</span>
                                                                <span className="font-medium text-blue-900">{element.element_cost.toLocaleString()}원</span>
                                                            </div>
                                                        )}
                                                        <div className="flex justify-between">
                                                            <span className="text-blue-700">가격 비율:</span>
                                                            <span className="font-medium text-blue-900">
                                                                {element.price_ratio ? `${(element.price_ratio * 100).toFixed(1)}%` : 'N/A'}
                                                            </span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-blue-700">릴리즈:</span>
                                                            <span className="font-medium text-blue-900">{element.release}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                        
                
                        {/* Sequence 타입 정보 */}
                        {isSequence(selectedProcedure) && (
                            <>
                                <div className="border-t border-blue-200 pt-4 mb-4">
                                    <h6 className="text-blue-800 font-medium text-xs mb-3 uppercase tracking-wide">Sequence 상세 정보</h6>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                        {selectedProcedure.steps && (
                                            <div className="flex justify-between">
                                                <span className="text-blue-700">총 단계:</span>
                                                <span className="font-medium text-blue-900">{selectedProcedure.steps.length}단계</span>
                                            </div>
                                        )}
                                        {selectedProcedure.sequence_name && (
                                            <div className="flex justify-between">
                                                <span className="text-blue-700">시퀀스명:</span>
                                                <span className="font-medium text-blue-900">{selectedProcedure.sequence_name}</span>
                                            </div>
                                        )}
                                        {selectedProcedure.procedure_cost && (
                                            <div className="flex justify-between">
                                                <span className="text-blue-700">총 비용:</span>
                                                <span className="font-medium text-blue-900">{selectedProcedure.procedure_cost.toLocaleString()}원</span>
                                            </div>
                                        )}
                                        {selectedProcedure.price_ratio && (
                                            <div className="flex justify-between">
                                                <span className="text-blue-700">가격 비율:</span>
                                                <span className="font-medium text-blue-900">
                                                    {selectedProcedure.price_ratio ? `${(selectedProcedure.price_ratio * 100).toFixed(1)}%` : 'N/A'}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* 단계별 상세 정보 */}
                                {selectedProcedure.steps && selectedProcedure.steps.length > 0 && (
                                    <div className="border-t border-blue-200 pt-4 mb-4">
                                        <h6 className="text-blue-800 font-medium text-xs mb-3 uppercase tracking-wide">단계별 상세 정보</h6>
                                        <div className="space-y-4">
                                            {selectedProcedure.steps.map((step, index) => (
                                                <div key={index} className="bg-white/40 rounded-lg p-4 border border-blue-100">
                                                    {/* 단계 기본 정보 */}
                                                    <div className="mb-3">
                                                        <h6 className="text-blue-800 font-medium text-sm mb-2">Step {step.step_num}</h6>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                                            {step.sequence_interval && (
                                                                <div className="flex justify-between">
                                                                    <span className="text-blue-700">간격:</span>
                                                                    <span className="font-medium text-blue-900">{step.sequence_interval}일</span>
                                                                </div>
                                                            )}
                                                            {step.procedure_cost && (
                                                                <div className="flex justify-between">
                                                                    <span className="text-blue-700">비용:</span>
                                                                    <span className="font-medium text-blue-900">{step.procedure_cost.toLocaleString()}원</span>
                                                                </div>
                                                            )}
                                                            <div className="flex justify-between">
                                                                <span className="text-blue-700">가격 비율:</span>
                                                                <span className="font-medium text-blue-900">
                                                                    {step.price_ratio ? `${(step.price_ratio * 100).toFixed(1)}%` : 'N/A'}
                                                                </span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span className="text-blue-700">릴리즈:</span>
                                                                <span className="font-medium text-blue-900">{step.release}</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Element 정보 */}
                                                    {step.element_info && (
                                                        <div className="border-t border-blue-100 pt-3 mb-3">
                                                            <div className="text-blue-600 font-medium text-xs mb-2">Element 정보</div>
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                                                                <div className="flex justify-between">
                                                                    <span className="text-blue-600">시술명:</span>
                                                                    <span className="font-medium text-blue-800">{step.element_info.name}</span>
                                                                </div>
                                                                {step.element_info.cost_time && (
                                                                    <div className="flex justify-between">
                                                                        <span className="text-blue-600">소요시간:</span>
                                                                        <span className="font-medium text-blue-800">{step.element_info.cost_time}분</span>
                                                                    </div>
                                                                )}
                                                                {step.element_info.procedure_level && (
                                                                    <div className="flex justify-between">
                                                                        <span className="text-blue-600">시술 등급:</span>
                                                                        <span className="font-medium text-blue-800">{step.element_info.procedure_level}</span>
                                                                    </div>
                                                                )}
                                                                {step.element_info.position_type && (
                                                                    <div className="flex justify-between">
                                                                        <span className="text-blue-600">위치:</span>
                                                                        <span className="font-medium text-blue-800">{step.element_info.position_type}</span>
                                                                    </div>
                                                                )}
                                                                {step.element_info.price && (
                                                                    <div className="flex justify-between">
                                                                        <span className="text-blue-600">가격:</span>
                                                                        <span className="font-medium text-blue-800">{step.element_info.price.toLocaleString()}원</span>
                                                                    </div>
                                                                )}
                                                                {step.element_info.plan_count && (
                                                                    <div className="flex justify-between">
                                                                        <span className="text-blue-600">계획 횟수:</span>
                                                                        <span className="font-medium text-blue-800">{step.element_info.plan_count}회</span>
                                                                    </div>
                                                                )}
                                                                {step.element_info.plan_interval && (
                                                                    <div className="flex justify-between">
                                                                        <span className="text-blue-600">계획 간격:</span>
                                                                        <span className="font-medium text-blue-800">{step.element_info.plan_interval}일</span>
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {/* 분류 정보 */}
                                                            {(step.element_info.class_major || step.element_info.class_sub || step.element_info.class_detail || step.element_info.class_type) && (
                                                                <div className="border-t border-blue-100 pt-3 mt-3">
                                                                    <div className="text-blue-600 font-medium text-xs mb-2">분류 정보</div>
                                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                                                                        {step.element_info.class_major && (
                                                                            <div className="flex justify-between">
                                                                                <span className="text-blue-600">대분류:</span>
                                                                                <span className="font-medium text-blue-800">{step.element_info.class_major}</span>
                                                                            </div>
                                                                        )}
                                                                        {step.element_info.class_sub && (
                                                                            <div className="flex justify-between">
                                                                                <span className="text-blue-600">중분류:</span>
                                                                                <span className="font-medium text-blue-800">{step.element_info.class_sub}</span>
                                                                            </div>
                                                                        )}
                                                                        {step.element_info.class_detail && (
                                                                            <div className="flex justify-between">
                                                                                <span className="text-blue-600">소분류:</span>
                                                                                <span className="font-medium text-blue-800">{step.element_info.class_detail}</span>
                                                                            </div>
                                                                        )}
                                                                        {step.element_info.class_type && (
                                                                            <div className="flex justify-between">
                                                                                <span className="text-blue-600">분류 타입:</span>
                                                                                <span className="font-medium text-blue-800">{step.element_info.class_type}</span>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* 소모품 정보 */}
                                                            {(step.element_info.consum_1_count || step.element_info.consumable_info) && (
                                                                <div className="border-t border-blue-100 pt-3 mt-3">
                                                                    <div className="text-blue-600 font-medium text-xs mb-2">소모품 정보</div>
                                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                                                                        {step.element_info.consum_1_count && (
                                                                            <div className="flex justify-between">
                                                                                <span className="text-blue-600">수량:</span>
                                                                                <span className="font-medium text-blue-800">{step.element_info.consum_1_count}</span>
                                                                            </div>
                                                                        )}
                                                                        {step.element_info.consumable_info && (
                                                                            <>
                                                                                <div className="flex justify-between">
                                                                                    <span className="text-blue-600">소모품명:</span>
                                                                                    <span className="font-medium text-blue-800">{step.element_info.consumable_info.name}</span>
                                                                                </div>
                                                                                <div className="flex justify-between">
                                                                                    <span className="text-blue-600">단위:</span>
                                                                                    <span className="font-medium text-blue-800">{step.element_info.consumable_info.unit_type}</span>
                                                                                </div>
                                                                                <div className="flex justify-between">
                                                                                    <span className="text-blue-600">가격:</span>
                                                                                    <span className="font-medium text-blue-800">{step.element_info.consumable_info.price.toLocaleString()}원</span>
                                                                                </div>
                                                                            </>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}

                                                    {/* Bundle 정보 */}
                                                    {step.bundle_info && (
                                                        <div className="border-t border-blue-100 pt-3 mb-3">
                                                            <div className="text-blue-600 font-medium text-xs mb-2">Bundle 정보</div>
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                                                                <div className="flex justify-between">
                                                                    <span className="text-blue-600">번들명:</span>
                                                                    <span className="font-medium text-blue-800">{step.bundle_info.name}</span>
                                                                </div>
                                                                {step.bundle_info.description && (
                                                                    <div className="flex justify-between">
                                                                        <span className="text-blue-600">설명:</span>
                                                                        <span className="font-medium text-blue-800">{step.bundle_info.description}</span>
                                                                    </div>
                                                                )}
                                                                <div className="flex justify-between">
                                                                    <span className="text-blue-600">요소 비용:</span>
                                                                    <span className="font-medium text-blue-800">{step.bundle_info.element_cost.toLocaleString()}원</span>
                                                                </div>
                                                                <div className="flex justify-between">
                                                                    <span className="text-blue-600">가격 비율:</span>
                                                                    <span className="font-medium text-blue-800">
                                                                        {step.bundle_info.price_ratio ? `${(step.bundle_info.price_ratio * 100).toFixed(1)}%` : 'N/A'}
                                                                    </span>
                                                                </div>
                                                                <div className="flex justify-between">
                                                                    <span className="text-blue-600">포함 요소:</span>
                                                                    <span className="font-medium text-blue-800">{step.bundle_info.elements.length}개</span>
                                                                </div>
                                                            </div>

                                                            {/* Bundle 내 Element 목록 */}
                                                            {step.bundle_info.elements && step.bundle_info.elements.length > 0 && (
                                                                <div className="border-t border-blue-100 pt-3 mt-3">
                                                                    <div className="text-blue-600 font-medium text-xs mb-2">포함된 요소</div>
                                                                    <div className="space-y-2">
                                                                        {step.bundle_info.elements.map((element, elemIndex) => (
                                                                            <div key={elemIndex} className="bg-white/30 rounded p-2 text-xs">
                                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                                                                                    <div className="flex justify-between">
                                                                                        <span className="text-blue-600">이름:</span>
                                                                                        <span className="font-medium text-blue-800">{element.name}</span>
                                                                                    </div>
                                                                                    {element.cost_time && (
                                                                                        <div className="flex justify-between">
                                                                                            <span className="text-blue-600">소요시간:</span>
                                                                                            <span className="font-medium text-blue-800">{element.cost_time}분</span>
                                                                                        </div>
                                                                                    )}
                                                                                    {element.procedure_level && (
                                                                                        <div className="flex justify-between">
                                                                                            <span className="text-blue-600">시술 등급:</span>
                                                                                            <span className="font-medium text-blue-800">{element.procedure_level}</span>
                                                                                        </div>
                                                                                    )}
                                                                                    {element.position_type && (
                                                                                        <div className="flex justify-between">
                                                                                            <span className="text-blue-600">위치:</span>
                                                                                            <span className="font-medium text-blue-800">{element.position_type}</span>
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}

                                                    {/* Custom 정보 */}
                                                    {step.custom_info && (
                                                        <div className="border-t border-blue-100 pt-3 mb-3">
                                                            <div className="text-blue-600 font-medium text-xs mb-2">Custom 정보</div>
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                                                                <div className="flex justify-between">
                                                                    <span className="text-blue-600">커스텀명:</span>
                                                                    <span className="font-medium text-blue-800">{step.custom_info.name}</span>
                                                                </div>
                                                                {step.custom_info.description && (
                                                                    <div className="flex justify-between">
                                                                        <span className="text-blue-600">설명:</span>
                                                                        <span className="font-medium text-blue-800">{step.custom_info.description}</span>
                                                                    </div>
                                                                )}
                                                                {step.custom_info.custom_count && (
                                                                    <div className="flex justify-between">
                                                                        <span className="text-blue-600">커스텀 횟수:</span>
                                                                        <span className="font-medium text-blue-800">{step.custom_info.custom_count}회</span>
                                                                    </div>
                                                                )}
                                                                {step.custom_info.element_limit && (
                                                                    <div className="flex justify-between">
                                                                        <span className="text-blue-600">제한 횟수:</span>
                                                                        <span className="font-medium text-blue-800">{step.custom_info.element_limit}회</span>
                                                                    </div>
                                                                )}
                                                                {step.custom_info.element_cost && (
                                                                    <div className="flex justify-between">
                                                                        <span className="text-blue-600">요소 비용:</span>
                                                                        <span className="font-medium text-blue-800">{step.custom_info.element_cost.toLocaleString()}원</span>
                                                                    </div>
                                                                )}
                                                                {step.custom_info.price_ratio && (
                                                                    <div className="flex justify-between">
                                                                        <span className="text-blue-600">가격 비율:</span>
                                                                        <span className="font-medium text-blue-800">
                                                                            {step.custom_info.price_ratio ? `${(step.custom_info.price_ratio * 100).toFixed(1)}%` : 'N/A'}
                                                                        </span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    );
}
