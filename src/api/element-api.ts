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
    const response = await instance.get('/admin/elements/');
    return response.data;
  } catch (error: unknown) {
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
    const response = await instance.get(`/admin/elements/${elementId}`);
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
    const response = await instance.post('/admin/elements/', elementData);
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
    const response = await instance.put(`/admin/elements/${elementId}`, elementData);
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
    const response = await instance.delete(`/admin/elements/${elementId}`);
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
    const response = await instance.put(`/admin/elements/${elementId}/deactivate`);
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
    const response = await instance.put(`/admin/elements/${elementId}/activate`);
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
    const response = await instance.get('/admin/global/');
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

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Element 타입별 필터링
 * @param elements Element 목록
 * @param classType 필터링할 클래스 타입
 * @returns 필터링된 Element 목록
 */
export const filterElementsByType = (elements: Element[], classType: string): Element[] => {
  return elements.filter(element => element.class_type === classType);
};

/**
 * Element 검색 (이름 기준)
 * @param elements Element 목록
 * @param searchTerm 검색어
 * @returns 검색된 Element 목록
 */
export const searchElementsByName = (elements: Element[], searchTerm: string): Element[] => {
  const term = searchTerm.toLowerCase();
  return elements.filter(element => 
    element.name?.toLowerCase().includes(term)
  );
};

/**
 * Element 가격 범위 필터링
 * @param elements Element 목록
 * @param minPrice 최소 가격
 * @param maxPrice 최대 가격
 * @returns 필터링된 Element 목록
 */
export const filterElementsByPriceRange = (
  elements: Element[], 
  minPrice: number, 
  maxPrice: number
): Element[] => {
  return elements.filter(element => 
    element.price && element.price >= minPrice && element.price <= maxPrice
  );
};

/**
 * Element 정렬
 * @param elements Element 목록
 * @param sortBy 정렬 기준 ('name' | 'price' | 'cost_time')
 * @param sortOrder 정렬 순서 ('asc' | 'desc')
 * @returns 정렬된 Element 목록
 */
export const sortElements = (
  elements: Element[], 
  sortBy: 'name' | 'price' | 'cost_time', 
  sortOrder: 'asc' | 'desc' = 'asc'
): Element[] => {
  return [...elements].sort((a, b) => {
    let aValue: string | number | undefined = a[sortBy];
    let bValue: string | number | undefined = b[sortBy];
    
    // undefined 값 처리
    if (aValue === undefined && bValue === undefined) return 0;
    if (aValue === undefined) return sortOrder === 'asc' ? -1 : 1;
    if (bValue === undefined) return sortOrder === 'asc' ? 1 : -1;
    
    // 문자열인 경우
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }
    
    // 숫자인 경우
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      if (sortOrder === 'asc') {
        return aValue - bValue;
      } else {
        return bValue - aValue;
      }
    }
    
    // 문자열 비교
    if (sortOrder === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });
};