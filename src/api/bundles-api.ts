import { instance } from './axios-instance';
import { AxiosError } from 'axios';
import { Element } from './element-api';

// ============================================================================
// TypeScript 인터페이스
// ============================================================================

export interface BundleElementRequest {
    element_id: number;
    price_ratio: number;
}

export interface BundleCreateRequest {
    group_id: number;
    name: string;
    description?: string;
    release?: number;
    elements: BundleElementRequest[];
}

export interface BundleUpdateRequest {
    name?: string;
    description?: string;
    release?: number;
    elements?: BundleElementRequest[];
}

export interface BundleElementResponse {
    id: number;
    group_id: number;
    element_id: number;
    element_cost?: number;
    price_ratio: number;
    release: number;
    element_detail?: Element; // Element 상세 정보 추가
}

export interface BundleResponse {
    group_id: number;
    name?: string;
    description?: string;
    release: number;
    elements: BundleElementResponse[];
}

export interface BundleListResponse {
    group_id: number;
    name?: string;
    description?: string;
    release: number;
    elements: BundleElementResponse[];
}

export interface BundleCreateResponse {
    group_id: number;
    name?: string;
    description?: string;
    release: number;
    elements: BundleElementResponse[];
}

export interface BundleUpdateResponse {
    group_id: number;
    name?: string;
    description?: string;
    release: number;
    elements: BundleElementResponse[];
}

export interface BundleDeleteResponse {
    status: string;
    message: string;
}

export interface BundleActivateResponse {
    status: string;
    message: string;
}

// ============================================================================
// Bundle API 함수들
// ============================================================================

/**
 * Bundle 목록 조회 (GroupID별로 그룹화)
 * @returns Bundle 목록
 */
export const getBundlesList = async (): Promise<BundleListResponse[]> => {
    try {
        console.log('🔍 Bundle API 요청 시작');
        console.log('📍 요청 URL:', instance.defaults.baseURL + '/admin/bundles/');
        console.log('🌐 전체 요청 URL:', instance.defaults.baseURL + '/admin/bundles/');
        console.log('🔧 Axios 설정:', {
            baseURL: instance.defaults.baseURL,
            timeout: instance.defaults.timeout,
            withCredentials: instance.defaults.withCredentials
        });
        
        const response = await instance.get<BundleListResponse[]>('/admin/bundles/');
        
        console.log('✅ Bundle API 응답 성공:', response.status);
        console.log('📊 응답 데이터 길이:', response.data?.length || 0);
        
        return response.data;
    } catch (error: unknown) {
        console.error('❌ Bundle 목록 조회 중 오류:', error);
        
        if (error instanceof Error) {
            console.error('🚨 에러 상세 정보:', {
                name: error.name,
                message: error.message,
                stack: error.stack
            });
        }
        
        // Axios 에러인 경우 추가 정보 출력
        if (error && typeof error === 'object' && 'config' in error) {
            const axiosError = error as any;
            console.error('🌐 Axios 에러 상세:', {
                url: axiosError.config?.url,
                baseURL: axiosError.config?.baseURL,
                method: axiosError.config?.method,
                headers: axiosError.config?.headers,
                timeout: axiosError.config?.timeout,
                code: axiosError.code,
                status: axiosError.response?.status,
                statusText: axiosError.response?.statusText
            });
        }
        
        throw new Error(error instanceof Error ? error.message : 'Bundle 목록 조회 중 오류가 발생했습니다.');
    }
};

/**
 * 특정 Bundle 조회 (GroupID 기준)
 * @param groupId Bundle Group ID
 * @returns Bundle 상세 정보
 */
export const getBundleDetail = async (groupId: number): Promise<BundleResponse> => {
    try {
        const response = await instance.get<BundleResponse>(`/admin/bundles/${groupId}`);
        return response.data;
    } catch (error: unknown) {
        console.error('Bundle 상세 조회 중 오류:', error);
        throw new Error(error instanceof Error ? error.message : 'Bundle 상세 조회 중 오류가 발생했습니다.');
    }
};

/**
 * Bundle 생성
 * @param bundleData Bundle 생성 데이터
 * @returns 생성된 Bundle 정보
 */
export const createBundle = async (bundleData: BundleCreateRequest): Promise<BundleCreateResponse> => {
    try {
        const response = await instance.post<BundleCreateResponse>('/admin/bundles/', bundleData);
        return response.data;
    } catch (error: unknown) {
        console.error('Bundle 생성 중 오류:', error);
        
        // AxiosError 타입으로 안전하게 처리
        if (error instanceof AxiosError) {
            throw new Error(error.response?.data?.detail || 'Bundle 생성 중 오류가 발생했습니다.');
        }
        
        throw new Error('Bundle 생성 중 오류가 발생했습니다.');
    }
};

/**
 * Bundle 수정
 * @param groupId Bundle Group ID
 * @param bundleData Bundle 수정 데이터
 * @returns 수정된 Bundle 정보
 */
export const updateBundle = async (
    groupId: number, 
    bundleData: BundleUpdateRequest
): Promise<BundleUpdateResponse> => {
    try {
        const response = await instance.put<BundleUpdateResponse>(`/admin/bundles/${groupId}`, bundleData);
        return response.data;
    } catch (error: unknown) {
        console.error('Bundle 수정 중 오류:', error);
        throw new Error(error instanceof Error ? error.message : 'Bundle 수정 중 오류가 발생했습니다.');
    }
};

/**
 * Bundle 삭제
 * @param groupId Bundle Group ID
 * @returns 삭제 결과
 */
export const deleteBundle = async (groupId: number): Promise<BundleDeleteResponse> => {
    try {
        const response = await instance.delete<BundleDeleteResponse>(`/admin/bundles/${groupId}`);
        return response.data;
    } catch (error: unknown) {
        console.error('Bundle 삭제 중 오류:', error);
        throw new Error(error instanceof Error ? error.message : 'Bundle 삭제 중 오류가 발생했습니다.');
    }
};

/**
 * Bundle 비활성화
 * @param groupId Bundle Group ID
 * @returns 비활성화 결과
 */
export const deactivateBundle = async (groupId: number): Promise<BundleActivateResponse> => {
    try {
        const response = await instance.put<BundleActivateResponse>(`/admin/bundles/${groupId}/deactivate`);
        return response.data;
    } catch (error: unknown) {
        console.error('Bundle 비활성화 중 오류:', error);
        throw new Error(error instanceof Error ? error.message : 'Bundle 비활성화 중 오류가 발생했습니다.');
    }
};

/**
 * Bundle 활성화
 * @param groupId Bundle Group ID
 * @returns 활성화 결과
 */
export const activateBundle = async (groupId: number): Promise<BundleActivateResponse> => {
    try {
        const response = await instance.put<BundleActivateResponse>(`/admin/bundles/${groupId}/activate`);
        return response.data;
    } catch (error: unknown) {
        console.error('Bundle 활성화 중 오류:', error);
        throw new Error(error instanceof Error ? error.message : 'Bundle 활성화 중 오류가 발생했습니다.');
    }
};
