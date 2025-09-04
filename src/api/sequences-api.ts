import { instance } from './axios-instance';

// ============================================================================
// 타입 정의
// ============================================================================

export interface SequenceStepRequest {
  step_num: number;
  element_id?: number;
  bundle_id?: number;
  custom_id?: number;
  sequence_interval?: number;
  price_ratio: number;
}

export interface SequenceCreateRequest {
  group_id: number;
  name: string;
  release: number;
  steps: SequenceStepRequest[];
}

export interface SequenceUpdateRequest {
  sequence_name?: string;
  steps?: SequenceStepRequest[];
}

// 소모품 정보 타입
export interface ConsumableInfo {
  id: number;
  release: number;
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
}

// Element 정보 타입
export interface ElementInfo {
  id: number;
  name: string;
  description: string;
  class_major: string;
  class_sub: string;
  class_detail: string;
  class_type: string;
  procedure_cost: number;
  price: number;
  position_type?: string | null;
  cost_time?: number | null;
  plan_state?: number | null;
  plan_count?: number | null;
  plan_interval?: number | null;
  consum_1_id?: number | null;
  consum_1_count?: number | null;
  procedure_level?: string | null;
  release?: number | null;
  consumable_info?: ConsumableInfo | null;
}

// Bundle 정보 타입
export interface BundleElementInfo {
  id: number;
  name: string;
  description: string;
  class_major: string;
  class_sub: string;
  class_detail: string;
  class_type: string;
  procedure_cost: number;
  price: number;
  position_type?: string | null;
  cost_time?: number | null;
  plan_state?: number | null;
  plan_count?: number | null;
  plan_interval?: number | null;
  consum_1_id?: number | null;
  consum_1_count?: number | null;
  procedure_level?: string | null;
  release?: number | null;
  consumable_info?: ConsumableInfo | null;
}

export interface BundleInfo {
  group_id: number;
  name: string;
  description?: string;
  element_cost: number;
  price_ratio: number;
  elements: BundleElementInfo[];
}

// Custom 정보 타입 (필요시 추가)
export interface CustomInfo {
  group_id: number;
  name: string;
  description?: string;
  custom_count?: number;
  element_limit?: number;
  element_cost?: number;
  price_ratio?: number;
  elements?: ElementInfo[];
}

export interface SequenceStepResponse {
  id: number;
  group_id: number;
  name?: string;
  step_num: number;
  element_id?: number;
  bundle_id?: number;
  custom_id?: number;
  sequence_interval?: number;
  procedure_cost?: number;
  price_ratio: number;
  release: number;
  element_info?: ElementInfo;
  bundle_info?: BundleInfo;
  custom_info?: CustomInfo;
}

export interface SequenceResponse {
  group_id: number;
  sequence_name: string;
  procedure_cost?: number;
  price_ratio?: number;
  steps: SequenceStepResponse[];
}

export interface SequenceListResponse {
  group_id: number;
  sequence_name: string;
  procedure_cost?: number;
  price_ratio?: number;
  steps: SequenceStepResponse[];
}

// ============================================================================
// API 함수들
// ============================================================================

/**
 * Sequence 목록 조회 (GroupID별로 그룹화)
 */
export const getSequencesList = async (): Promise<SequenceListResponse[]> => {
  try {
    const response = await instance.get('/api/admin-tables/sequences/');
    return response.data;
  } catch (error: unknown) {
    console.error('Sequence 목록 조회 실패:', error);
    throw new Error(error instanceof Error ? error.message : 'Sequence 목록을 불러오는데 실패했습니다.');
  }
};

/**
 * 특정 Sequence 조회 (GroupID 기준)
 */
export const getSequenceDetail = async (group_id: number): Promise<SequenceResponse> => {
  try {
    if (group_id <= 0) {
      throw new Error('Group ID는 0보다 커야 합니다.');
    }
    
    const response = await instance.get(`/api/admin-tables/sequences/${group_id}`);
    return response.data;
  } catch (error: unknown) {
    console.error('Sequence 상세 조회 실패:', error);
    throw new Error(error instanceof Error ? error.message : 'Sequence 상세 정보를 불러오는데 실패했습니다.');
  }
};

/**
 * Sequence 생성
 */
export const createSequence = async (sequenceData: SequenceCreateRequest): Promise<SequenceResponse> => {
  try {
    // 유효성 검사
    if (sequenceData.group_id <= 0) {
      throw new Error('Group ID는 0보다 커야 합니다.');
    }
    
    if (!sequenceData.steps || sequenceData.steps.length === 0) {
      throw new Error('Sequence에는 최소 하나의 Step이 포함되어야 합니다.');
    }
    
    if (sequenceData.steps.length > 20) {
      throw new Error('Sequence에는 최대 20개의 Step만 포함할 수 있습니다.');
    }
    
    // Step Number 중복 확인
    const stepNums = sequenceData.steps.map(step => step.step_num);
    if (stepNums.length !== new Set(stepNums).size) {
      throw new Error('Step Number는 중복될 수 없습니다.');
    }
    
    // 각 Step에서 참조 타입 검증
    for (const step of sequenceData.steps) {
      const referenceCount = [
        step.element_id !== undefined && step.element_id !== null,
        step.bundle_id !== undefined && step.bundle_id !== null,
        step.custom_id !== undefined && step.custom_id !== null
      ].filter(Boolean).length;
      
      if (referenceCount !== 1) {
        throw new Error(`Step ${step.step_num}: Element, Bundle, Custom 중 정확히 하나만 선택해야 합니다.`);
      }
    }
    
    const response = await instance.post('/api/admin-tables/sequences/', sequenceData);
    return response.data;
  } catch (error: unknown) {
    console.error('Sequence 생성 실패:', error);
    throw new Error(error instanceof Error ? error.message : 'Sequence 생성에 실패했습니다.');
  }
};

/**
 * Sequence 수정
 */
export const updateSequence = async (group_id: number, sequenceData: SequenceUpdateRequest): Promise<SequenceResponse> => {
  try {
    if (group_id <= 0) {
      throw new Error('Group ID는 0보다 커야 합니다.');
    }
    
    // Steps가 제공된 경우 유효성 검사
    if (sequenceData.steps) {
      if (sequenceData.steps.length === 0) {
        throw new Error('Sequence에는 최소 하나의 Step이 포함되어야 합니다.');
      }
      
      if (sequenceData.steps.length > 20) {
        throw new Error('Sequence에는 최대 20개의 Step만 포함할 수 있습니다.');
      }
      
      // Step Number 중복 확인
      const stepNums = sequenceData.steps.map(step => step.step_num);
      if (stepNums.length !== new Set(stepNums).size) {
        throw new Error('Step Number는 중복될 수 없습니다.');
      }
      
      // 각 Step에서 참조 타입 검증
      for (const step of sequenceData.steps) {
        const referenceCount = [
          step.element_id !== undefined && step.element_id !== null,
          step.bundle_id !== undefined && step.bundle_id !== null,
          step.custom_id !== undefined && step.custom_id !== null
        ].filter(Boolean).length;
        
        if (referenceCount !== 1) {
          throw new Error(`Step ${step.step_num}: Element, Bundle, Custom 중 정확히 하나만 선택해야 합니다.`);
        }
      }
    }
    
    const response = await instance.put(`/api/admin-tables/sequences/${group_id}`, sequenceData);
    return response.data;
  } catch (error: unknown) {
    console.error('Sequence 수정 실패:', error);
    throw new Error(error instanceof Error ? error.message : 'Sequence 수정에 실패했습니다.');
  }
};

/**
 * Sequence 삭제
 */
export const deleteSequence = async (group_id: number): Promise<{ status: string; message: string }> => {
  try {
    if (group_id <= 0) {
      throw new Error('Group ID는 0보다 커야 합니다.');
    }
    
    const response = await instance.delete(`/api/admin-tables/sequences/${group_id}`);
    return response.data;
  } catch (error: unknown) {
    console.error('Sequence 삭제 실패:', error);
    throw new Error(error instanceof Error ? error.message : 'Sequence 삭제에 실패했습니다.');
  }
};

/**
 * Sequence 비활성화
 */
export const deactivateSequence = async (group_id: number): Promise<{ status: string; message: string }> => {
  try {
    if (group_id <= 0) {
      throw new Error('Group ID는 0보다 커야 합니다.');
    }
    
    const response = await instance.put(`/api/admin-tables/sequences/${group_id}/deactivate`);
    return response.data;
  } catch (error: unknown) {
    console.error('Sequence 비활성화 실패:', error);
    throw new Error(error instanceof Error ? error.message : 'Sequence 비활성화에 실패했습니다.');
  }
};

/**
 * Sequence 활성화
 */
export const activateSequence = async (group_id: number): Promise<{ status: string; message: string }> => {
  try {
    if (group_id <= 0) {
      throw new Error('Group ID는 0보다 커야 합니다.');
    }
    
    const response = await instance.put(`/api/admin-tables/sequences/${group_id}/activate`);
    return response.data;
  } catch (error: unknown) {
    console.error('Sequence 활성화 실패:', error);
    throw new Error(error instanceof Error ? error.message : 'Sequence 활성화에 실패했습니다.');
  }
};

// ============================================================================
// 유틸리티 함수들
// ============================================================================

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
