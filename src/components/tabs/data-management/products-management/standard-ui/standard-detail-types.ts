import { Element } from '@/api/element-api';
import { BundleListResponse, BundleResponse, BundleElementResponse } from '@/api/bundles-api';
import { CustomListResponse } from '@/api/customs-api';
import { SequenceListResponse, SequenceResponse } from '@/api/sequences-api';

export interface BundleElement {
    element_id: number;
    element_name?: string;
    element_cost: number;
    price?: number;
    price_ratio?: number;
    element_detail?: Element;
}

export interface CustomElement {
    element_id: number;
    element_name?: string;
    element_cost: number;
    price?: number;
    procedure_cost?: number;
    cost_time?: number;
    class_major?: string;
    class_minor?: string;
}

export interface SequenceStep {
    step_num: number;
    name?: string;
    procedure_cost?: number;
    cost_time?: number;
    element_info?: Element;
    bundle_info?: {
        elements: BundleElement[];
        price_ratio?: number;
    };
    custom_info?: {
        elements: CustomElement[];
        price_ratio?: number;
    };
}

export type ProcedureInfo = Element | BundleListResponse | BundleResponse | CustomListResponse | SequenceListResponse | SequenceResponse | {
    bundle_name?: string;
    description?: string;
    elements: BundleElement[];
} | {
    custom_name?: string;
    description?: string;
    elements: CustomElement[];
} | {
    sequence_name?: string;
    description?: string;
    steps: SequenceStep[];
} | {
    group_id?: number;
    steps: SequenceStep[];
} | null | undefined;

// 타입 가드 함수들
export const isElement = (procedure: ProcedureInfo): procedure is Element => {
    return procedure !== null && procedure !== undefined && 'element_id' in procedure && 'procedure_cost' in procedure;
};

export const isBundle = (procedure: ProcedureInfo): procedure is { bundle_name?: string; description?: string; elements: BundleElement[] } => {
    return procedure !== null && procedure !== undefined && 'elements' in procedure && Array.isArray(procedure.elements) && procedure.elements.length > 0 && 'element_id' in procedure.elements[0];
};

export const isCustom = (procedure: ProcedureInfo): procedure is { custom_name?: string; description?: string; elements: CustomElement[] } => {
    return procedure !== null && procedure !== undefined && 'elements' in procedure && Array.isArray(procedure.elements) && procedure.elements.length > 0 && 'element_id' in procedure.elements[0];
};

export const isSequence = (procedure: ProcedureInfo): procedure is { sequence_name?: string; description?: string; steps: SequenceStep[] } | { group_id?: number; steps: SequenceStep[] } | SequenceListResponse | SequenceResponse => {
    if (procedure === null || procedure === undefined) {
        console.log('isSequence check: procedure is null/undefined');
        return false;
    }
    
    // SequenceListResponse 또는 SequenceResponse 타입인지 확인
    if ('steps' in procedure && Array.isArray(procedure.steps)) {
        console.log('isSequence check: procedure has steps array');
        return true;
    }
    
    // 기존 시퀀스 타입 체크
    const hasSteps = 'steps' in procedure;
    const stepsIsArray = hasSteps ? Array.isArray(procedure.steps) : false;
    
    console.log('isSequence check:', {
        procedure,
        hasSteps,
        stepsIsArray,
        result: hasSteps && stepsIsArray
    });
    
    return hasSteps && stepsIsArray;
};

export const isSequenceWithSteps = (procedure: ProcedureInfo): procedure is { sequence_name?: string; description?: string; steps: SequenceStep[] } => {
    return procedure !== null && procedure !== undefined && 'steps' in procedure && Array.isArray(procedure.steps) && procedure.steps.length > 0;
};

export const isBundleWithElements = (procedure: ProcedureInfo): procedure is { bundle_name?: string; description?: string; elements: BundleElement[] } => {
    return procedure !== null && procedure !== undefined && 'elements' in procedure && Array.isArray(procedure.elements) && procedure.elements.length > 0;
};

export const isCustomWithElements = (procedure: ProcedureInfo): procedure is { custom_name?: string; description?: string; elements: CustomElement[] } => {
    return procedure !== null && procedure !== undefined && 'elements' in procedure && Array.isArray(procedure.elements) && procedure.elements.length > 0;
};

// 시술 정보에서 특정 속성을 가져오는 헬퍼 함수들
export const getProcedureCost = (procedure: ProcedureInfo): number => {
    if (!procedure || procedure === null || procedure === undefined) return 0;
    if (isElement(procedure)) return procedure.procedure_cost || 0;
    return 0;
};

export const getProcedurePrice = (procedure: ProcedureInfo): number => {
    if (!procedure || procedure === null || procedure === undefined) return 0;
    if (isElement(procedure)) return procedure.price || 0;
    return 0;
};

export const getProcedureCategory = (procedure: ProcedureInfo): string => {
    if (!procedure || procedure === null || procedure === undefined) return '';
    if (isElement(procedure)) {
        if (procedure.class_major) {
            return procedure.class_major;
        }
    }
    return '';
};

export const getProcedureName = (procedure: ProcedureInfo): string => {
    if (!procedure || procedure === null || procedure === undefined) return '';
    if (isElement(procedure)) return procedure.name || '';
    if (isBundle(procedure)) return procedure.bundle_name || '';
    if (isCustom(procedure)) return procedure.custom_name || '';
    if (isSequence(procedure)) {
        if ('sequence_name' in procedure) return procedure.sequence_name || '';
        if ('group_id' in procedure) return `시퀀스 ${procedure.group_id}`;
    }
    return '';
};

export const getProcedureDescription = (procedure: ProcedureInfo): string => {
    if (!procedure || procedure === null || procedure === undefined) return '';
    if (isElement(procedure)) return procedure.description || '';
    if (isBundle(procedure)) return procedure.description || '';
    if (isCustom(procedure)) return procedure.description || '';
    if (isSequence(procedure)) {
        if ('description' in procedure) return procedure.description || '';
        return '시퀀스 시술';
    }
    return '';
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
    
    // SequenceListResponse 또는 SequenceResponse 타입인지 확인
    if ('steps' in procedure && Array.isArray(procedure.steps)) {
        return procedure.steps;
    }
    
    // 기존 시퀀스 타입 체크
    if (isSequence(procedure)) {
        return procedure.steps;
    }
    
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
    if (!procedureInfo) return { margin: 0, marginRate: 0 };
    
    let costPrice: number = 0;
    
    // 번들인 경우 elements의 총 원가를 계산
    if (packageType === '번들' && isBundle(procedureInfo) && procedureInfo.elements) {
        costPrice = procedureInfo.elements.reduce((sum: number, element: BundleElement) => {
            return sum + (element.element_cost || 0);
        }, 0);
    }
    // 커스텀인 경우 elements의 총 원가를 계산
    else if (packageType === '커스텀' && isCustom(procedureInfo) && procedureInfo.elements) {
        costPrice = procedureInfo.elements.reduce((sum: number, element: CustomElement) => {
            return sum + (element.element_cost || 0);
        }, 0);
    }
    // 시퀀스인 경우 steps의 총 원가를 계산
    else if (packageType === '시퀀스' && 'steps' in procedureInfo && Array.isArray(procedureInfo.steps)) {
        costPrice = procedureInfo.steps.reduce((sum: number, step) => {
            const stepCost = 'procedure_cost' in step ? (step.procedure_cost || 0) : 0;
            return sum + stepCost;
        }, 0);
        
    } else if (packageType === '시퀀스') {
        // 일단 비워둬
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

// 총 원가 계산 함수
export const calculateTotalCost = (procedureInfo: ProcedureInfo, packageType: string): number => {
    if (!procedureInfo) return 0;
    
    switch (packageType) {
        case '번들':
        case '커스텀':
            if ('elements' in procedureInfo && Array.isArray(procedureInfo.elements)) {
                return procedureInfo.elements.reduce((sum, element) => sum + (element.element_cost || 0), 0);
            }
            break;
            
        case '시퀀스':
            if ('steps' in procedureInfo && Array.isArray(procedureInfo.steps)) {
                return procedureInfo.steps.reduce((sum, step) => {
                    const stepCost = 'procedure_cost' in step ? (step.procedure_cost || 0) : 0;
                    return sum + stepCost;
                }, 0);
            }
            break;
            
        default:
            // 단일시술 또는 기타
            if ('procedure_cost' in procedureInfo && procedureInfo.procedure_cost) {
                return procedureInfo.procedure_cost;
            }
            break;
    }
    
    return 0;
};

// 새로운 통합 마진 계산 함수
export const calculateMarginUnified = (sellPrice: number, packageType: string, procedureInfo: ProcedureInfo) => {
    if (!procedureInfo) return { margin: 0, marginRate: 0 };
    
    const costPrice = calculateTotalCost(procedureInfo, packageType);
    const margin = sellPrice - costPrice;
    const marginRate = sellPrice > 0 ? margin / sellPrice : 0;
    
    return {
        margin: Math.round(margin),
        marginRate: Math.round(marginRate * 10000) / 10000 // 소수점 4자리까지
    };
};