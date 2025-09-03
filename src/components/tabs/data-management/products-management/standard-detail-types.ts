import { Element } from '@/api/element-api';
import { BundleListResponse, BundleResponse } from '@/api/bundles-api';
import { CustomListResponse } from '@/api/customs-api';
import { SequenceListResponse } from '@/api/sequences-api';

// 시술 정보의 공통 속성들을 정의하는 타입
export interface ProcedureInfoBase {
    name?: string;
    description?: string;
    procedure_cost?: number;
    price?: number;
    category?: string;
    class_type?: string;
    position_type?: string;
    cost_time?: number;
    plan_state?: number;
    plan_count?: number;
    plan_interval?: number;
    procedure_level?: string;
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
    };
    // Element 특화 속성들
    consum_1_id?: number;
    consum_1_name?: string;
    consum_1_count?: number;
    consum_1_unit?: string;
    // Bundle/Custom/Sequence 특화 속성들
    total_cost?: number;
    elements?: Array<{
        element_cost?: number;
        element_detail?: {
            id?: number;
            name?: string;
            procedure_cost?: number;
            price?: number;
        };
    }>;
    steps?: Array<{
        element_info?: {
            procedure_cost?: number;
            name?: string;
        };
        step_num?: number;
    }>;
}

// 시술 정보 Union 타입
export type ProcedureInfo = Element | BundleListResponse | BundleResponse | CustomListResponse | SequenceListResponse | ProcedureInfoBase | null | undefined;

// 타입 가드 함수들
export const isElement = (procedure: ProcedureInfo): procedure is Element => {
    return procedure !== null && procedure !== undefined && 'id' in procedure && typeof procedure.id === 'number' && 'procedure_cost' in procedure;
};

export const isBundle = (procedure: ProcedureInfo): procedure is BundleListResponse | BundleResponse => {
    return procedure !== null && procedure !== undefined && 'group_id' in procedure && typeof procedure.group_id === 'number' && 'elements' in procedure && Array.isArray(procedure.elements);
};

export const isCustom = (procedure: ProcedureInfo): procedure is CustomListResponse => {
    return procedure !== null && procedure !== undefined && 'group_id' in procedure && typeof procedure.group_id === 'number' && 'elements' in procedure && Array.isArray(procedure.elements);
};

export const isSequence = (procedure: ProcedureInfo): procedure is SequenceListResponse => {
    return procedure !== null && procedure !== undefined && 'group_id' in procedure && typeof procedure.group_id === 'number' && 'sequence_name' in procedure && 'steps' in procedure && Array.isArray(procedure.steps);
};

// 더 구체적인 타입 가드 함수들
export const isBundleWithElements = (procedure: ProcedureInfo): procedure is (BundleListResponse | BundleResponse) & { elements: Array<{ element_cost?: number; element_detail?: { name?: string } }> } => {
    return isBundle(procedure) && Array.isArray(procedure.elements) && procedure.elements.length > 0;
};

export const isCustomWithElements = (procedure: ProcedureInfo): procedure is CustomListResponse & { elements: Array<{ element_cost?: number; element_id: number }> } => {
    return isCustom(procedure) && Array.isArray(procedure.elements) && procedure.elements.length > 0;
};

export const isSequenceWithSteps = (procedure: ProcedureInfo): procedure is SequenceListResponse & { steps: Array<{ procedure_cost?: number; name?: string; step_num: number }> } => {
    return isSequence(procedure) && Array.isArray(procedure.steps) && procedure.steps.length > 0;
};

// 안전한 속성 접근을 위한 헬퍼 함수들
export const getProcedureName = (procedure: ProcedureInfo): string => {
    if (!procedure || procedure === null || procedure === undefined) return '이름 없음';
    if (isElement(procedure)) return procedure.name || '이름 없음';
    if (isBundle(procedure)) return procedure.name || '이름 없음';
    if (isCustom(procedure)) return procedure.name || '이름 없음';
    if (isSequence(procedure)) return procedure.sequence_name || '이름 없음';
    return '이름 없음';
};

export const getProcedureDescription = (procedure: ProcedureInfo): string => {
    if (!procedure || procedure === null || procedure === undefined) return '설명 없음';
    if (isElement(procedure)) return procedure.description || '설명 없음';
    if (isBundle(procedure)) return procedure.description || '설명 없음';
    if (isCustom(procedure)) return procedure.description || '설명 없음';
    if (isSequence(procedure)) return '시퀀스 설명 없음'; // SequenceListResponse에는 description이 없음
    return '설명 없음';
};

export const getProcedureCost = (procedure: ProcedureInfo): number => {
    if (!procedure || procedure === null || procedure === undefined) return 0;
    if (isElement(procedure)) return procedure.procedure_cost || 0;
    if (isBundle(procedure)) {
        return procedure.elements?.reduce((total, element) => {
            return total + (element.element_cost || 0);
        }, 0) || 0;
    }
    if (isCustom(procedure)) {
        return procedure.elements?.reduce((total, element) => {
            return total + (element.element_cost || 0);
        }, 0) || 0;
    }
    if (isSequence(procedure)) {
        return procedure.steps?.reduce((total, step) => {
            return total + (step.procedure_cost || 0);
        }, 0) || 0;
    }
    return 0;
};

export const getProcedurePrice = (procedure: ProcedureInfo): number => {
    if (!procedure || procedure === null || procedure === undefined) return 0;
    if (isElement(procedure)) return procedure.price || 0;
    // Bundle, Custom, Sequence는 개별 가격이 없으므로 0 반환
    return 0;
};

export const getProcedureCategory = (procedure: ProcedureInfo): string => {
    if (!procedure || procedure === null || procedure === undefined) return '카테고리 없음';
    if (isElement(procedure)) return procedure.class_type || '카테고리 없음';
    // Bundle, Custom, Sequence는 카테고리가 없으므로 기본값 반환
    return '카테고리 없음';
};

// 시술 상세 정보를 안전하게 가져오는 헬퍼 함수들
export const getProcedureClassType = (procedure: ProcedureInfo): string | undefined => {
    if (!procedure || procedure === null || procedure === undefined) return undefined;
    if (isElement(procedure)) return procedure.class_type;
    return undefined;
};

export const getProcedurePositionType = (procedure: ProcedureInfo): string | undefined => {
    if (!procedure || procedure === null || procedure === undefined) return undefined;
    if (isElement(procedure)) return procedure.position_type;
    return undefined;
};

export const getProcedureCostTime = (procedure: ProcedureInfo): number | undefined => {
    if (!procedure || procedure === null || procedure === undefined) return undefined;
    if (isElement(procedure)) return procedure.cost_time;
    return undefined;
};

export const getProcedurePlanState = (procedure: ProcedureInfo): number | undefined => {
    if (!procedure || procedure === null || procedure === undefined) return undefined;
    if (isElement(procedure)) return procedure.plan_state;
    return undefined;
};

export const getProcedurePlanCount = (procedure: ProcedureInfo): number | undefined => {
    if (!procedure || procedure === null || procedure === undefined) return undefined;
    if (isElement(procedure)) return procedure.plan_count;
    return undefined;
};

export const getProcedurePlanInterval = (procedure: ProcedureInfo): number | undefined => {
    if (!procedure || procedure === null || procedure === undefined) return undefined;
    if (isElement(procedure)) return procedure.plan_interval;
    return undefined;
};

export const getProcedureLevel = (procedure: ProcedureInfo): string | undefined => {
    if (!procedure || procedure === null || procedure === undefined) return undefined;
    if (isElement(procedure)) return procedure.procedure_level;
    return undefined;
};

// 소모품 정보를 안전하게 가져오는 헬퍼 함수들
export const getProcedureConsumableInfo = (procedure: ProcedureInfo) => {
    if (!procedure || procedure === null || procedure === undefined) return undefined;
    if (isElement(procedure)) {
        // Element의 경우 consumable_info가 없으므로 개별 필드들을 조합
        if (procedure.consum_1_id || procedure.consum_1_name) {
            return {
                id: procedure.consum_1_id,
                name: procedure.consum_1_name,
                count: procedure.consum_1_count,
                unit: procedure.consum_1_unit
            };
        }
    }
    return undefined;
};

export const getProcedureConsum1Id = (procedure: ProcedureInfo): number | undefined => {
    if (!procedure || procedure === null || procedure === undefined) return undefined;
    if (isElement(procedure)) return procedure.consum_1_id;
    return undefined;
};

export const getProcedureConsum1Name = (procedure: ProcedureInfo): string | undefined => {
    if (!procedure || procedure === null || procedure === undefined) return undefined;
    if (isElement(procedure)) return procedure.consum_1_name;
    return undefined;
};

export const getProcedureConsum1Count = (procedure: ProcedureInfo): number | undefined => {
    if (!procedure || procedure === null || procedure === undefined) return undefined;
    if (isElement(procedure)) return procedure.consum_1_count;
    return undefined;
};

export const getProcedureConsum1Unit = (procedure: ProcedureInfo): string | undefined => {
    if (!procedure || procedure === null || procedure === undefined) return undefined;
    if (isElement(procedure)) return procedure.consum_1_unit;
    return undefined;
};

// 번들, 커스텀, 시퀀스의 상세 정보를 가져오는 헬퍼 함수들
export const getBundleElements = (procedure: ProcedureInfo) => {
    if (!procedure || procedure === null || procedure === undefined) return undefined;
    if (isBundle(procedure)) return procedure.elements;
    return undefined;
};

export const getCustomElements = (procedure: ProcedureInfo) => {
    if (!procedure || procedure === null || procedure === undefined) return undefined;
    if (isCustom(procedure)) return procedure.elements;
    return undefined;
};

export const getSequenceSteps = (procedure: ProcedureInfo) => {
    if (!procedure || procedure === null || procedure === undefined) return undefined;
    if (isSequence(procedure)) return procedure.steps;
    return undefined;
};

// 가격 계산 관련 헬퍼 함수들
export const calculateVAT = (sellPrice: number, taxableType: string) => {
    if (taxableType === '과세') {
        return Math.round(sellPrice * 0.1); // 10% 계산 후 반올림
    }
    return undefined; // 비과세인 경우 undefined
};

export const calculateOriginalPrice = (sellPrice: number, discountRate: number, roundedPlace: string) => {
    if (discountRate >= 1) return sellPrice; // 할인율이 100% 이상이면 정상가 = 판매가
    
    const basePrice = sellPrice / (1 - discountRate);
    
    switch (roundedPlace) {
        case '반올림 안함':
            return Math.round(basePrice);
        case '내림 - 천':
            return Math.floor(basePrice / 1000) * 1000;
        case '내림 - 만':
            return Math.floor(basePrice / 10000) * 10000;
        case '내림 - 십만':
            return Math.floor(basePrice / 100000) * 100000;
        case '올림 - 천':
            return Math.ceil(basePrice / 1000) * 1000;
        case '올림 - 만':
            return Math.ceil(basePrice / 10000) * 10000;
        case '올림 - 십만':
            return Math.ceil(basePrice / 100000) * 100000;
        default:
            return Math.round(basePrice);
    }
};

export const calculateActualDiscount = (originalPrice: number, sellPrice: number) => {
    if (originalPrice <= 0) return 0;
    return (originalPrice - sellPrice) / originalPrice;
};

export const calculateMargin = (sellPrice: number, packageType: string, procedureInfo: ProcedureInfo) => {
    let costPrice: number;
    
    // 번들인 경우 elements의 총 원가를 계산
    if (packageType === '번들' && isBundle(procedureInfo) && procedureInfo.elements) {
        costPrice = procedureInfo.elements.reduce((sum: number, element: { element_cost?: number }) => {
            return sum + (element.element_cost || 0);
        }, 0);
    }
    // 커스텀인 경우 elements의 총 원가를 계산
    else if (packageType === '커스텀' && isCustom(procedureInfo) && procedureInfo.elements) {
        costPrice = procedureInfo.elements.reduce((sum: number, element: { element_cost?: number }) => {
            return sum + (element.element_cost || 0);
        }, 0);
    }
    // 시퀀스인 경우 steps의 총 원가를 계산
    else if (packageType === '시퀀스' && isSequence(procedureInfo) && procedureInfo.steps) {
        costPrice = procedureInfo.steps.reduce((sum: number, step: { procedure_cost?: number }) => {
            if ('procedure_cost' in step && step.procedure_cost) {
                return sum + step.procedure_cost;
            }
            return sum;
        }, 0);
    }
    else {
        // 기존 방식: 단일 시술의 원가
        costPrice = getProcedureCost(procedureInfo);
    }
    
    const margin = sellPrice - costPrice;
    const marginRate = sellPrice > 0 ? margin / sellPrice : 0;
    
    return {
        margin: Math.round(margin),
        marginRate: Math.round(marginRate * 10000) / 10000 // 소수점 4자리까지
    };
};
