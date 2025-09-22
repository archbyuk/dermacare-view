'use server'

import { instance } from './axios-instance';
import { AxiosError } from 'axios';

// ============================================================================
// Types
// ============================================================================

export interface Element {
  id: number;
  name?: string;
  class_major?: string;
  class_sub?: string;
  class_detail?: string;
  class_type?: string;
  description?: string;
  position_type?: string;
  cost_time?: number;
  plan_state?: number;
  plan_count?: number;
  plan_interval?: number;
  consum_1_id?: number;
  consum_1_name?: string;
  consum_1_count?: number;
  procedure_level?: string;
  procedure_cost?: number;
  price?: number;
  release?: number;
  consum_1_unit?: string;
}

export interface ElementCreateRequest {
  id: number;
  name: string;
  class_major: string;
  class_sub: string;
  class_detail: string;
  class_type: string;
  description?: string;
  position_type: string;
  cost_time: number;
  plan_state?: number;
  plan_count?: number;
  plan_interval?: number;
  consum_1_id?: number;
  consum_1_name?: string;
  consum_1_count?: number;
  consum_1_unit?: string;
  procedure_level?: string;
  price: number;
  release: number;
}

export interface ElementUpdateRequest {
  id?: number;
  name?: string;
  class_major?: string;
  class_sub?: string;
  class_detail?: string;
  class_type?: string;
  description?: string;
  procedure_level?: string;
  price?: number;
  release?: number;
  position_type?: string;
  cost_time?: number;
  plan_state?: number;
  plan_count?: number;
  plan_interval?: number;
  consum_1_id?: number;
  consum_1_name?: string;
  consum_1_count?: number;
  consum_1_unit?: string;
}

export interface ApiResponse<T = unknown> {
  status: string;
  message: string;
  data?: T;
  update_results?: {
    bundles: number;
    customs: number;
    sequences: number;
    products: number;
  };
}

export interface GlobalSettings {
  Doc_Price_Minute: number;
  Aesthetician_Price_Minute: number;
}

// ============================================================================
// Element API Functions
// ============================================================================

/**
 * Element 목록 조회
 * @returns 사용 가능한 모든 Element 목록
 */
export const getElementsList = async (): Promise<Element[]> => {
  try {
    console.log('[getElementsList] Starting API call to /elements/');
    const response = await instance.get('/elements/');
    console.log('[getElementsList] API call successful, data length:', response.data?.length || 0);
    return response.data;
  } catch (error: unknown) {
    console.error('[getElementsList] Element 목록 조회 중 오류:', error);
    
    // AxiosError인 경우 더 자세한 정보 출력
    if (error instanceof AxiosError) {
      console.error('[getElementsList] AxiosError details:', {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers,
          baseURL: error.config?.baseURL
        }
      });
    } else {
      console.error('[getElementsList] Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        name: error instanceof Error ? error.name : 'UnknownError',
        stack: error instanceof Error ? error.stack : undefined
      });
    }
    
    throw new Error(error instanceof Error ? error.message : 'Element 목록 조회 중 오류가 발생했습니다.');
  }
};

/**
 * Element 상세 조회
 * @param elementId Element ID
 * @returns 특정 Element의 상세 정보
 */
export const getElementDetail = async (elementId: number): Promise<Element> => {
  try {
    const response = await instance.get(`/elements/${elementId}`);
    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.detail || 'Element 상세 조회 중 오류가 발생했습니다.');
    }
    throw new Error('Element 상세 조회 중 오류가 발생했습니다.');
  }
};

/**
 * Element 생성
 * @param elementData 생성할 Element 데이터
 * @returns 생성된 Element 정보
 */
export const createElement = async (elementData: ElementCreateRequest): Promise<ApiResponse<Element>> => {
  try {
    const response = await instance.post('/elements/', elementData);
    return response.data;
  } catch (error: unknown) {
    throw new Error(error instanceof Error ? error.message : 'Element 생성 중 오류가 발생했습니다.');
  }
};

/**
 * Element 수정 (연쇄 업데이트 포함)
 * @param elementId 수정할 Element ID
 * @param elementData 수정할 Element 데이터
 * @returns 수정된 Element 정보와 업데이트 결과
 */
export const updateElement = async (
  elementId: number, 
  elementData: ElementUpdateRequest
): Promise<Element> => {
  try {
    const response = await instance.put(`/elements/${elementId}`, elementData);
    return response.data;
  } catch (error: unknown) {
    throw new Error(error instanceof Error ? error.message : 'Element 수정 중 오류가 발생했습니다.');
  }
};

/**
 * Element 완전 삭제
 * @param elementId 삭제할 Element ID
 * @returns 삭제 결과
 */
export const deleteElement = async (elementId: number): Promise<ApiResponse> => {
  try {
    const response = await instance.delete(`/elements/${elementId}`);
    return response.data;
  } catch (error: unknown) {
    throw new Error(error instanceof Error ? error.message : 'Element 삭제 중 오류가 발생했습니다.');
  }
};

/**
 * Element 비활성화
 * @param elementId 비활성화할 Element ID
 * @returns 비활성화 결과
 */
export const deactivateElement = async (elementId: number): Promise<ApiResponse> => {
  try {
    const response = await instance.put(`/elements/${elementId}/deactivate`);
    return response.data;
  } catch (error: unknown) {
    throw new Error(error instanceof Error ? error.message : 'Element 비활성화 중 오류가 발생했습니다.');
  }
};



/**
 * Element 활성화
 * @param elementId 활성화할 Element ID
 * @returns 활성화 결과
 */
export const activateElement = async (elementId: number): Promise<ApiResponse> => {
  try {
    const response = await instance.put(`/elements/${elementId}/activate`);
    return response.data;
  } catch (error: unknown) {
    throw new Error(error instanceof Error ? error.message : 'Element 활성화 중 오류가 발생했습니다.');
  }
};

/**
 * Global 설정 조회
 * @returns Global 설정 정보
 */
export const getGlobalSettings = async (): Promise<GlobalSettings> => {
  try {
    const response = await instance.get('/global/');
    return response.data;
  } catch (error: unknown) {
    console.error('Global 설정 조회 실패:', error);
    // 기본값 반환
    return {
      Doc_Price_Minute: 4000,
      Aesthetician_Price_Minute: 400
    };
  }
};
