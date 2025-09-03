'use client';

import { ProcedureInfo, getProcedureName, getProcedureDescription, getProcedureCost, getProcedurePrice, getProcedureCategory } from '../../standard-detail-types';
import { Element } from '@/api/element-api';
import ProcedureDetailAccordion from './procedure-detail-accordion';

interface ProcedurePreviewProps {
    newSelectedProcedure: ProcedureInfo;
    newPackageType: string;
}

export default function ProcedurePreview({
    newSelectedProcedure,
    newPackageType
}: ProcedurePreviewProps) {
    const getTypeColors = (type: string) => {
        switch (type) {
            case '단일시술':
                return {
                    bg: 'bg-gray-50',
                    border: 'border-gray-200',
                    title: 'text-gray-900',
                    subtitle: 'text-gray-600'
                };
            case '번들':
                return {
                    bg: 'bg-orange-50',
                    border: 'border-orange-200',
                    title: 'text-orange-900',
                    subtitle: 'text-orange-600'
                };
            case '커스텀':
                return {
                    bg: 'bg-red-50',
                    border: 'border-red-200',
                    title: 'text-red-900',
                    subtitle: 'text-red-600'
                };
            case '시퀀스':
                return {
                    bg: 'bg-purple-50',
                    border: 'border-purple-200',
                    title: 'text-purple-900',
                    subtitle: 'text-purple-600'
                };
            default:
                return {
                    bg: 'bg-gray-50',
                    border: 'border-gray-200',
                    title: 'text-gray-900',
                    subtitle: 'text-gray-600'
                };
        }
    };

    const colors = getTypeColors(newPackageType);

    return (
        <div className={`${colors.bg} rounded-lg p-4 border ${colors.border}`}>
            {/* 교체할 시술 정보 표시 */}
            <div className="flex items-center justify-between mb-3">
                <h4 className={`text-sm font-medium ${colors.title}`}>교체될 시술 정보 (미리보기)</h4>
                <span className={`text-xs ${colors.subtitle}`}>저장 시 적용됩니다</span>
            </div>
            
            {/* 번들인 경우 상세 정보 표시 */}
            {newPackageType === '번들' && newSelectedProcedure && 'elements' in newSelectedProcedure && newSelectedProcedure.elements ? (
                <div className="space-y-4">
                    {/* 번들 기본 정보 */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs text-gray-500">번들 ID</label>
                            <p className="text-sm font-medium text-gray-900">
                                {'group_id' in newSelectedProcedure ? newSelectedProcedure.group_id : 'ID 없음'}
                            </p>
                        </div>
                        <div>
                            <label className="text-xs text-gray-500">번들명</label>
                            <p className="text-sm font-medium text-gray-900">
                                {newSelectedProcedure.name || '이름 없음'}
                            </p>
                        </div>
                        <div>
                            <label className="text-xs text-gray-500">총 시술 수</label>
                            <p className="text-sm font-medium text-gray-900">
                                {newSelectedProcedure.elements?.length || 0}개
                            </p>
                        </div>
                        <div>
                            <label className="text-xs text-gray-500">배포 상태</label>
                            <p className="text-sm font-medium text-gray-900">
                                {'release' in newSelectedProcedure ? (newSelectedProcedure.release === 1 ? '배포됨' : '미배포') : '정보 없음'}
                            </p>
                        </div>
                    </div>
                    
                    {/* 번들 설명 */}
                    <div>
                        <label className="text-xs text-gray-500">번들 설명</label>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap mt-1">
                            {newSelectedProcedure.description || '설명 없음'}
                        </p>
                    </div>
                    
                    {/* 번들 요약 정보 */}
                    <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                        <h5 className="text-sm font-medium text-blue-900 mb-2">번들 요약</h5>
                        <div className="grid grid-cols-2 gap-4 text-xs">
                            <div>
                                <span className="text-blue-600">총 시술 원가:</span>
                                <span className="ml-1 text-blue-900 font-medium">
                                    {newSelectedProcedure.elements?.reduce((sum: number, element) => sum + (element.element_cost || 0), 0).toLocaleString()}원
                                </span>
                            </div>
                            <div>
                                <span className="text-blue-600">총 소요 시간:</span>
                                <span className="ml-1 text-blue-900 font-medium">
                                    {newSelectedProcedure.elements?.reduce((sum: number, element) => {
                                        if ('element_detail' in element && element.element_detail && 'cost_time' in element.element_detail) {
                                            return sum + (element.element_detail.cost_time || 0);
                                        }
                                        return sum;
                                    }, 0)}분
                                </span>
                            </div>
                        </div>
                    </div>
                    
                    {/* 포함된 시술들 상세 정보 */}
                    <div>
                        <label className="text-xs text-gray-500 mb-2 block">포함된 시술들 상세 정보</label>
                        <div className="space-y-3">
                            {newSelectedProcedure.elements.map((element, index: number) => {
                                // Bundle과 Custom의 element 구조가 다르므로 타입 가드 사용
                                const hasElementDetail = 'element_detail' in element;
                                const elementDetail = hasElementDetail ? element.element_detail : null;
                                // Element 타입인지 확인
                                const isElementDetail = elementDetail && 'id' in elementDetail && 'procedure_cost' in elementDetail;
                                // Element 타입으로 캐스팅
                                const elementDetailAsElement = isElementDetail ? (elementDetail as Element) : null;
                                
                                return (
                                    <div key={index} className="bg-white rounded-lg p-3 border border-gray-200">
                                        {/* 시술 헤더 */}
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center space-x-2">
                                                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                                                    {index + 1}
                                                </span>
                                                <h5 className="text-sm font-medium text-gray-900">
                                                    {hasElementDetail && elementDetail?.name ? elementDetail.name : '이름 없음'}
                                                </h5>
                                            </div>
                                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                                {isElementDetail ? 
                                                    `${elementDetailAsElement?.class_major || '-'} - ${elementDetailAsElement?.class_sub || '-'}` : 
                                                    '정보 없음'
                                                }
                                            </span>
                                        </div>
                                        
                                        {/* 시술 기본 정보 */}
                                        <div className="grid grid-cols-2 gap-3 text-xs mb-3">
                                            <div>
                                                <span className="text-gray-500">시술 ID:</span>
                                                <span className="ml-1 text-gray-900 font-medium">
                                                    {hasElementDetail && elementDetail?.id ? elementDetail.id : '-'}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-gray-500">그룹 ID:</span>
                                                <span className="ml-1 text-gray-900 font-medium">
                                                    {'group_id' in element ? element.group_id : '-'}
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
                                                    {'price_ratio' in element ? (element.price_ratio * 100).toFixed(1) : '-'}%
                                                </span>
                                            </div>
                                        </div>
                    
                                        {/* 시술 상세 정보 (element_detail이 있는 경우만) */}
                                        {isElementDetail && (
                                            <>
                                                <div className="grid grid-cols-2 gap-3 text-xs mb-3">
                                                    <div>
                                                        <span className="text-gray-500">소요 시간:</span>
                                                        <span className="ml-1 text-gray-900">
                                                            {elementDetailAsElement?.cost_time || '-'}분
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500">시술 담당:</span>
                                                        <span className="ml-1 text-gray-900">
                                                            {elementDetailAsElement?.position_type || '-'}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500">시술 수준:</span>
                                                        <span className="ml-1 text-gray-900">
                                                            {elementDetailAsElement?.procedure_level || '-'}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500">플랜 상태:</span>
                                                        <span className="ml-1 text-gray-900">
                                                            {elementDetailAsElement?.plan_state === 1 ? '플랜 있음' : '플랜 없음'}
                                                        </span>
                                                    </div>
                                                </div>
                                                
                                                {/* 시술 분류 정보 */}
                                                <div className="grid grid-cols-2 gap-3 text-xs mb-3">
                                                    <div>
                                                        <span className="text-gray-500">주요 분류:</span>
                                                        <span className="ml-1 text-gray-900">
                                                            {elementDetailAsElement?.class_major || '-'}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500">세부 분류:</span>
                                                        <span className="ml-1 text-gray-900">
                                                            {elementDetailAsElement?.class_sub || '-'}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500">상세 분류:</span>
                                                        <span className="ml-1 text-gray-900">
                                                            {elementDetailAsElement?.class_detail || '-'}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500">시술 타입:</span>
                                                        <span className="ml-1 text-gray-900">
                                                            {elementDetailAsElement?.class_type || '-'}
                                                        </span>
                                                    </div>
                                                </div>
                                                
                                                {/* 플랜 정보 */}
                                                {elementDetailAsElement?.plan_state === 1 && (
                                                    <div className="grid grid-cols-2 gap-3 text-xs mb-3">
                                                        <div>
                                                            <span className="text-gray-500">플랜 횟수:</span>
                                                            <span className="ml-1 text-gray-900">
                                                                {elementDetailAsElement?.plan_count || '-'}회
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-500">플랜 주기:</span>
                                                            <span className="ml-1 text-gray-900">
                                                                {elementDetailAsElement?.plan_interval || '-'}일
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}
                            
                                                {/* 소모품 정보 */}
                                                {elementDetailAsElement?.consum_1_id && (
                                                    <div className="mt-3 pt-3 border-t border-gray-100">
                                                        <div className="text-xs text-gray-500 mb-2 font-medium">소모품 정보</div>
                                                        <div className="grid grid-cols-2 gap-3 text-xs">
                                                            <div>
                                                                <span className="text-gray-500">소모품 ID:</span>
                                                                <span className="ml-1 text-gray-900 font-medium">
                                                                    {elementDetailAsElement?.consum_1_id}
                                                                </span>
                                                            </div>
                                                            <div>
                                                                <span className="text-gray-500">소모품명:</span>
                                                                <span className="ml-1 text-gray-900 font-medium">
                                                                    {elementDetailAsElement?.consum_1_name}
                                                                </span>
                                                            </div>
                                                            <div>
                                                                <span className="text-gray-500">수량:</span>
                                                                <span className="ml-1 text-gray-900">
                                                                    {elementDetailAsElement?.consum_1_count} {elementDetailAsElement?.consum_1_unit}
                                                                </span>
                                                            </div>
                                                            <div>
                                                                <span className="text-gray-500">소모품 가격:</span>
                                                                <span className="ml-1 text-gray-900">
                                                                    {elementDetailAsElement?.procedure_cost?.toLocaleString()}원
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                            
                                                {/* 시술 설명 */}
                                                {elementDetailAsElement?.description && (
                                                    <div className="mt-3 pt-3 border-t border-gray-100">
                                                        <div className="text-xs text-gray-500 mb-1 font-medium">시술 설명</div>
                                                        <p className="text-xs text-gray-700">
                                                            {elementDetailAsElement?.description}
                                                        </p>
                                                    </div>
                                                )}
                                                
                                                {/* 시술 가격 정보 */}
                                                {elementDetailAsElement?.price && (
                                                    <div className="mt-3 pt-3 border-t border-gray-100">
                                                        <div className="text-xs text-gray-500 mb-1 font-medium">가격 정보</div>
                                                        <div className="grid grid-cols-2 gap-3 text-xs">
                                                            <div>
                                                                <span className="text-gray-500">시술 가격:</span>
                                                                <span className="ml-1 text-gray-900 font-medium">
                                                                    {elementDetailAsElement?.price.toLocaleString()}원
                                                                </span>
                                                            </div>
                                                            <div>
                                                                <span className="text-gray-500">시술 원가:</span>
                                                                <span className="ml-1 text-gray-900 font-medium">
                                                                    {elementDetailAsElement?.procedure_cost?.toLocaleString()}원
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
                </div>
            ) : (
                /* 커스텀, 시퀀스인 경우 element 상세 정보를 아코디언으로 표시 */
                <>
                    {/* 커스텀 기본 정보 */}
                    {newPackageType === '커스텀' && newSelectedProcedure && 'elements' in newSelectedProcedure && newSelectedProcedure.elements ? (
                        <div className="space-y-4">
                            {/* 커스텀 기본 정보 */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-gray-500">커스텀 ID</label>
                                    <p className="text-sm font-medium text-gray-900">
                                        {'group_id' in newSelectedProcedure ? newSelectedProcedure.group_id : 'ID 없음'}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500">커스텀명</label>
                                    <p className="text-sm font-medium text-gray-900">
                                        {newSelectedProcedure.name || '이름 없음'}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500">총 시술 수</label>
                                    <p className="text-sm font-medium text-gray-900">
                                        {newSelectedProcedure.elements?.length || 0}개
                                    </p>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500">배포 상태</label>
                                    <p className="text-sm font-medium text-gray-900">
                                        {'release' in newSelectedProcedure ? (newSelectedProcedure.release === 1 ? '배포됨' : '미배포') : '정보 없음'}
                                    </p>
                                </div>
                            </div>
                            
                            {/* 커스텀 설명 */}
                            <div>
                                <label className="text-xs text-gray-500">커스텀 설명</label>
                                <p className="text-sm text-gray-700 whitespace-pre-wrap mt-1">
                                    {newSelectedProcedure.description || '설명 없음'}
                                </p>
                            </div>
                            
                            {/* 커스텀 요약 정보 */}
                            <div className="bg-red-50 rounded-lg p-3 border border-red-200">
                                <h5 className="text-sm font-medium text-red-900 mb-2">커스텀 구성 요소 요약</h5>
                                <div className="grid grid-cols-2 gap-4 text-xs">
                                    <div>
                                        <span className="text-red-600">총 시술 원가:</span>
                                        <span className="ml-1 text-red-900 font-medium">
                                            {newSelectedProcedure.elements?.reduce((sum: number, element) => sum + (element.element_cost || 0), 0).toLocaleString()}원
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-red-600">총 소요 시간:</span>
                                        <span className="ml-1 text-red-900 font-medium">
                                            {newSelectedProcedure.elements?.reduce((sum: number, element) => {
                                                if ('element_detail' in element && element.element_detail && 'cost_time' in element.element_detail) {
                                                    return sum + (element.element_detail.cost_time || 0);
                                                }
                                                return sum;
                                            }, 0)}분
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : newPackageType === '시퀀스' && newSelectedProcedure && 'steps' in newSelectedProcedure && newSelectedProcedure.steps ? (
                        <div className="space-y-4">
                            {/* 시퀀스 기본 정보 */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-gray-500">시퀀스 ID</label>
                                    <p className="text-sm font-medium text-gray-900">
                                        {'group_id' in newSelectedProcedure ? newSelectedProcedure.group_id : 'ID 없음'}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500">시퀀스명</label>
                                    <p className="text-sm font-medium text-gray-900">
                                        {('name' in newSelectedProcedure && newSelectedProcedure.name) || '이름 없음'}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500">총 단계 수</label>
                                    <p className="text-sm font-medium text-gray-900">
                                        {newSelectedProcedure.steps?.length || 0}개
                                    </p>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500">배포 상태</label>
                                    <p className="text-sm font-medium text-gray-900">
                                        {'release' in newSelectedProcedure ? (newSelectedProcedure.release === 1 ? '배포됨' : '미배포') : '정보 없음'}
                                    </p>
                                </div>
                            </div>
                            
                            {/* 시퀀스 설명 */}
                            <div>
                                <label className="text-xs text-gray-500">시퀀스 설명</label>
                                <p className="text-sm text-gray-700 whitespace-pre-wrap mt-1">
                                    {('description' in newSelectedProcedure && newSelectedProcedure.description) || '설명 없음'}
                                </p>
                            </div>
                            
                            {/* 시퀀스 요약 정보 */}
                            <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                                <h5 className="text-sm font-medium text-purple-900 mb-2">시퀀스 구성 단계 요약</h5>
                                <div className="grid grid-cols-2 gap-4 text-xs">
                                    <div>
                                        <span className="text-purple-600">총 시술 원가:</span>
                                        <span className="ml-1 text-purple-900 font-medium">
                                            {newSelectedProcedure.steps?.reduce((sum: number, step) => {
                                                if (step && 'procedure_cost' in step && step.procedure_cost) {
                                                    return sum + step.procedure_cost;
                                                }
                                                return sum;
                                            }, 0).toLocaleString()}원
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-purple-600">가격 비율:</span>
                                        <span className="ml-1 text-purple-900 font-medium">
                                            {'price_ratio' in newSelectedProcedure && newSelectedProcedure.price_ratio 
                                                ? (newSelectedProcedure.price_ratio * 100).toFixed(1) 
                                                : '-'}%
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* 기본 시술 정보 (커스텀이나 시퀀스가 아닌 경우) */}
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="text-xs text-gray-500">시술명</label>
                                    <p className="text-sm font-medium text-gray-900">
                                        {getProcedureName(newSelectedProcedure)}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500">카테고리</label>
                                    <p className="text-sm text-gray-700">
                                        {getProcedureCategory(newSelectedProcedure)}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500">시술 원가</label>
                                    <p className="text-sm font-medium text-gray-900">
                                        {getProcedureCost(newSelectedProcedure).toLocaleString()}원
                                    </p>
                                </div>
                                {getProcedurePrice(newSelectedProcedure) > 0 && (
                                    <div>
                                        <label className="text-xs text-gray-500">시술 가격</label>
                                        <p className="text-sm font-medium text-gray-900">
                                            {getProcedurePrice(newSelectedProcedure).toLocaleString()}원
                                        </p>
                                    </div>
                                )}
                            </div>
                            
                            {/* 시술 설명 */}
                            {getProcedureDescription(newSelectedProcedure) !== '설명 없음' && (
                                <div className="mt-4 mb-4">
                                    <label className="text-xs text-gray-500">시술 설명</label>
                                    <p className="text-sm text-gray-700 whitespace-pre-wrap mt-1">
                                        {getProcedureDescription(newSelectedProcedure)}
                                    </p>
                                </div>
                            )}
                        </>
                    )}
                    {/* Element 상세 정보 아코디언 */}
                    {newSelectedProcedure && (('elements' in newSelectedProcedure && newSelectedProcedure.elements) || ('steps' in newSelectedProcedure && newSelectedProcedure.steps)) ? (
                        <ProcedureDetailAccordion
                            newSelectedProcedure={newSelectedProcedure}
                            newPackageType={newPackageType}
                        />
                    ) : null}
                </>
            )}
        </div>
    );
}
