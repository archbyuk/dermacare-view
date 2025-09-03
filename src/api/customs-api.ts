import { instance } from './axios-instance';
import { Element } from './element-api';

// ============================================================================
// Types
// ============================================================================

export interface CustomElementRequest {
    element_id: number;
    custom_count?: number;
    element_limit?: number;
    price_ratio?: number;
}

export interface CustomCreateRequest {
    group_id: number;
    name: string;
    description?: string;
    release: number;
    elements: CustomElementRequest[];
}

export interface CustomUpdateRequest {
    name?: string;
    description?: string;
    release?: number;
    elements?: CustomElementRequest[];
}

export interface CustomElementResponse {
    id: number;
    group_id: number;
    element_id: number;
    custom_count: number;
    element_limit?: number;
    element_cost?: number;
    price_ratio: number;
    release: number;
    element_detail?: Element;
}

export interface CustomResponse {
    group_id: number;
    name?: string;
    description?: string;
    release: number;
    elements: CustomElementResponse[];
}

export interface CustomListResponse {
    group_id: number;
    name?: string;
    description?: string;
    release: number;
    elements: CustomElementResponse[];
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * Custom 목록 조회 (GroupID별로 그룹화)
 */
export const getCustomsList = async (): Promise<CustomListResponse[]> => {
    try {
        const response = await instance.get('/admin/customs/');        
        return response.data;
    } catch (error: unknown) {
        console.error('Custom 목록 조회 실패:', error);
        throw new Error(error instanceof Error ? error.message : 'Custom 목록 조회 중 오류가 발생했습니다.');
    }
};

/**
 * 특정 Custom 조회 (GroupID 기준)
 */
export const getCustomDetail = async (group_id: number): Promise<CustomResponse> => {
    try {
        const response = await instance.get(`/admin/customs/${group_id}`);
        return response.data;
    } catch (error: unknown) {
        console.error('Custom 상세 조회 실패:', error);
        throw new Error(error instanceof Error ? error.message : 'Custom 상세 조회 중 오류가 발생했습니다.');
    }
};

/**
 * Custom 생성
 */
export const createCustom = async (customData: CustomCreateRequest): Promise<CustomResponse> => {
    try {
        const response = await instance.post('/admin/customs/', customData);
        return response.data;
    } catch (error: unknown) {
        console.error('Custom 생성 실패:', error);
        throw new Error(error instanceof Error ? error.message : 'Custom 생성 중 오류가 발생했습니다.');
    }
};

/**
 * Custom 수정
 */
export const updateCustom = async (group_id: number, customData: CustomUpdateRequest): Promise<CustomResponse> => {
    try {
        const response = await instance.put(`/admin/customs/${group_id}`, customData);
        return response.data;
    } catch (error: unknown) {
        console.error('Custom 수정 실패:', error);
        throw new Error(error instanceof Error ? error.message : 'Custom 수정 중 오류가 발생했습니다.');
    }
};

/**
 * Custom 삭제
 */
export const deleteCustom = async (group_id: number): Promise<{ status: string; message: string }> => {
    try {
        const response = await instance.delete(`/admin/customs/${group_id}`);
        return response.data;
    } catch (error: unknown) {
        console.error('Custom 삭제 실패:', error);
        throw new Error(error instanceof Error ? error.message : 'Custom 삭제 중 오류가 발생했습니다.');
    }
};

/**
 * Custom 비활성화
 */
export const deactivateCustom = async (group_id: number): Promise<{ status: string; message: string }> => {
    try {
        const response = await instance.put(`/admin/customs/${group_id}/deactivate`);
        return response.data;
    } catch (error: unknown) {
        console.error('Custom 비활성화 실패:', error);
        throw new Error(error instanceof Error ? error.message : 'Custom 비활성화 중 오류가 발생했습니다.');
    }
};

/**
 * Custom 활성화
 */
export const activateCustom = async (group_id: number): Promise<{ status: string; message: string }> => {
    try {
        const response = await instance.put(`/admin/customs/${group_id}/activate`);
        return response.data;
    } catch (error: unknown) {
        console.error('Custom 활성화 실패:', error);
        throw new Error(error instanceof Error ? error.message : 'Custom 활성화 중 오류가 발생했습니다.');
    }
};
