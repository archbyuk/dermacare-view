import { Element } from '@/api/element-api';
import { BundleListResponse } from '@/api/bundles-api';
import { CustomListResponse } from '@/api/customs-api';
import { SequenceResponse } from '@/api/sequences-api';

// 타입 가드 함수들
export const isElement = (procedure: Element | BundleListResponse | CustomListResponse | SequenceResponse): procedure is Element => {
    return 'id' in procedure && 'name' in procedure && !('group_id' in procedure);
};

export const isBundle = (procedure: Element | BundleListResponse | CustomListResponse | SequenceResponse): procedure is BundleListResponse => {
    return 'group_id' in procedure && 'elements' in procedure;
};

export const isCustom = (procedure: Element | BundleListResponse | CustomListResponse | SequenceResponse): procedure is CustomListResponse => {
    return 'group_id' in procedure && 'elements' in procedure;
};

export const isSequence = (procedure: Element | BundleListResponse | CustomListResponse | SequenceResponse): procedure is SequenceResponse => {
    return 'group_id' in procedure && 'steps' in procedure;
};

// 선택된 시술의 총 비용 계산
export const getTotalProcedureCost = (selectedProcedure: Element | BundleListResponse | CustomListResponse | SequenceResponse) => {
    if (isElement(selectedProcedure)) {
        return selectedProcedure.procedure_cost || 0;
    } else if (isBundle(selectedProcedure)) {
        return selectedProcedure.elements?.reduce((total, element) => total + (element.element_cost || 0), 0) || 0;
    } else if (isCustom(selectedProcedure)) {
        return selectedProcedure.elements?.reduce((total, element) => total + (element.element_cost || 0), 0) || 0;
    } else if (isSequence(selectedProcedure)) {
        return selectedProcedure.steps?.reduce((total, step) => total + (step.procedure_cost || 0), 0) || 0;
    }
    return 0;
};
