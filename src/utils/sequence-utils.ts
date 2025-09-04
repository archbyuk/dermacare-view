import { SequenceResponse, SequenceListResponse, SequenceStepResponse } from '@/api/sequences-api';

/**
 * Sequence의 총 비용 계산
 */
export const calculateSequenceTotalCost = (sequence: SequenceResponse): number => {
    return sequence.steps.reduce((total, step) => {
        return total + (step.procedure_cost || 0) * step.price_ratio;
    }, 0);
};

/**
 * Sequence의 총 기간 계산
 */
export const calculateSequenceTotalDuration = (sequence: SequenceResponse): number => {
    return sequence.steps.reduce((total, step) => {
        return total + (step.sequence_interval || 0);
    }, 0);
};

/**
 * Sequence에서 참조 타입 확인
 */
export const getStepReferenceType = (step: SequenceStepResponse): 'element' | 'bundle' | 'custom' | null => {
    if (step.element_id !== undefined && step.element_id !== null) {
        return 'element';
    }
    if (step.bundle_id !== undefined && step.bundle_id !== null) {
        return 'bundle';
    }
    if (step.custom_id !== undefined && step.custom_id !== null) {
        return 'custom';
    }
    return null;
};

/**
 * Sequence 검색 (이름 기반)
 */
export const searchSequencesByName = (sequences: SequenceListResponse[], searchTerm: string): SequenceListResponse[] => {
    if (!searchTerm.trim()) {
        return sequences;
    }
    
    const lowerSearchTerm = searchTerm.toLowerCase();
    
    return sequences.filter(sequence => {
        // Sequence 이름으로 검색
        if (sequence.sequence_name?.toLowerCase().includes(lowerSearchTerm)) {
            return true;
        }
        
        // Group ID로 검색
        if (sequence.group_id.toString().includes(lowerSearchTerm)) {
            return true;
        }
        
        // Step 정보로 검색 (실제로는 더 구체적인 검색 로직이 필요할 수 있음)
        return sequence.steps.some(step => {
            return step.step_num.toString().includes(lowerSearchTerm) ||
                   (step.element_id && step.element_id.toString().includes(lowerSearchTerm)) ||
                   (step.bundle_id && step.bundle_id.toString().includes(lowerSearchTerm)) ||
                   (step.custom_id && step.custom_id.toString().includes(lowerSearchTerm));
        });
    });
};
