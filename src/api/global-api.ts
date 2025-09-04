import { instance } from './axios-instance';

// ============================================================================
// TypeScript 인터페이스
// ============================================================================

export interface GlobalUpdateRequest {
    doc_price_minute: number;
    aesthetician_price_minute: number;
}

export interface GlobalResponse {
    doc_price_minute: number;
    aesthetician_price_minute: number;
}

export interface GlobalUpdateResponse {
    status: string;
    message: string;
    data: GlobalResponse;
    update_results: {
        elements_updated: number;
        bundles_updated: number;
        customs_updated: number;
        sequences_updated: number;
        products_updated: number;
    };
}

// ============================================================================
// Global API 함수들
// ============================================================================

/**
 * Global 설정 조회
 * @returns 현재 Global 설정 정보
 */
export const getGlobalSettings = async (): Promise<GlobalResponse> => {
    try {
        const response = await instance.get<GlobalResponse>('/admin/global/');
        return response.data;
    } catch (error: unknown) {
        console.error('Global 설정 조회 중 오류:', error);
        throw new Error(error instanceof Error ? error.message : 'Global 설정 조회 중 오류가 발생했습니다.');
    }
};

/**
 * Global 설정 수정 (전체 시스템 영향)
 * @param globalData Global 설정 수정 데이터
 * @returns 수정된 Global 설정 정보 및 업데이트 결과
 */
export const updateGlobalSettings = async (
    globalData: GlobalUpdateRequest
): Promise<GlobalUpdateResponse> => {
    try {
        const response = await instance.put<GlobalUpdateResponse>(
            '/admin/global/', 
            globalData
        );
        return response.data;
    } catch (error: unknown) {
        console.error('Global 설정 수정 중 오류:', error);
        throw new Error(error instanceof Error ? error.message : 'Global 설정 수정 중 오류가 발생했습니다.');
    }
};
