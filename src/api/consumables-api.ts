import { instance } from './axios-instance';

// ============================================================================
// TypeScript 인터페이스
// ============================================================================

export interface ConsumableCreateRequest {
    id: number;
    name: string;
    unit_price: number;
    unit_type: string;
    description?: string;
    price?: number;
    i_value?: number;
    f_value?: number;
    taxable_type?: string;
    covered_type?: string;
}

export interface ConsumableUpdateRequest {
    // Element Cost에 영향 없음
    name?: string;
    description?: string;
    release?: number;
    
    // Unit_Price 재계산 필요
    unit_type?: string;
    
    // Element Cost에 직접 영향 (연쇄 업데이트 필요)
    unit_price?: number;
    price?: number;
    i_value?: number;
    f_value?: number;
    
    // VAT 계산에 영향
    taxable_type?: string;
    
    // 급여분류 (Element Cost에 영향 없음)
    covered_type?: string;
}

export interface ConsumableResponse {
    id: number;
    name: string;
    unit_price: number;
    unit_type: string;
    description?: string;
    release: number;
    price: number;
    i_value?: number;
    f_value?: number;
    vat: number;
    taxable_type: string;
    covered_type: string;
}

export interface ConsumableListResponse {
    status: string;
    message: string;
    data: ConsumableResponse[];
}

export interface ConsumableDetailResponse {
    status: string;
    message: string;
    data: ConsumableResponse;
}

export interface ConsumableCreateResponse {
    status: string;
    message: string;
    data: ConsumableResponse;
}

export interface ConsumableUpdateResponse {
    status: string;
    message: string;
    data: ConsumableResponse;
    update_results: {
        elements_updated: number;
        bundles_updated: number;
        customs_updated: number;
        sequences_updated: number;
        products_updated: number;
    };
}

export interface ConsumableDeleteResponse {
    status: string;
    message: string;
}

export interface ConsumableActivateResponse {
    status: string;
    message: string;
    warning?: string;
}

// ============================================================================
// Consumables API 함수들
// ============================================================================

/**
 * 소모품 목록 조회 (검색어가 있으면 필터링, 없으면 전체 조회)
 * @param search 검색어 (선택사항)
 * @returns 소모품 목록
 */
export const getConsumablesList = async (search?: string): Promise<ConsumableResponse[]> => {
    try {
        const params = search ? { search } : {};
        const response = await instance.get<ConsumableResponse[]>('/api/admin-tables/consumables/', { params });
        return response.data;
    } catch (error: unknown) {
        console.error('소모품 목록 조회 중 오류:', error);
        throw new Error(error instanceof Error ? error.message : '소모품 목록 조회 중 오류가 발생했습니다.');
    }
};

/**
 * 소모품 상세 조회
 * @param consumableId 소모품 ID
 * @returns 소모품 상세 정보
 */
export const getConsumableDetail = async (consumableId: number): Promise<ConsumableResponse> => {
    try {
        const response = await instance.get<ConsumableResponse>(`/api/admin-tables/consumables/${consumableId}`);
        return response.data;
    } catch (error: unknown) {
        console.error('소모품 상세 조회 중 오류:', error);
        throw new Error(error instanceof Error ? error.message : '소모품 상세 조회 중 오류가 발생했습니다.');
    }
};

/**
 * 소모품 생성
 * @param consumableData 소모품 생성 데이터
 * @returns 생성된 소모품 정보
 */
export const createConsumable = async (consumableData: ConsumableCreateRequest): Promise<ConsumableCreateResponse> => {
    try {
        const response = await instance.post<ConsumableCreateResponse>('/api/admin-tables/consumables/', consumableData);
        return response.data;
    } catch (error: unknown) {
        console.error('소모품 생성 중 오류:', error);
        throw new Error(error instanceof Error ? error.message : '소모품 생성 중 오류가 발생했습니다.');
    }
};

/**
 * 소모품 수정 (관련 Element 영향)
 * @param consumableId 소모품 ID
 * @param consumableData 소모품 수정 데이터
 * @returns 수정된 소모품 정보 및 업데이트 결과
 */
export const updateConsumable = async (
    consumableId: number, 
    consumableData: ConsumableUpdateRequest
): Promise<ConsumableUpdateResponse> => {
    try {
        const response = await instance.put<ConsumableUpdateResponse>(
            `/api/admin-tables/consumables/${consumableId}`, 
            consumableData
        );
        return response.data;
    } catch (error: unknown) {
        console.error('소모품 수정 중 오류:', error);
        throw new Error(error instanceof Error ? error.message : '소모품 수정 중 오류가 발생했습니다.');
    }
};

/**
 * 소모품 삭제
 * @param consumableId 소모품 ID
 * @returns 삭제 결과
 */
export const deleteConsumable = async (consumableId: number): Promise<ConsumableDeleteResponse> => {
    try {
        const response = await instance.delete<ConsumableDeleteResponse>(`/api/admin-tables/consumables/${consumableId}`);
        return response.data;
    } catch (error: unknown) {
        console.error('소모품 삭제 중 오류:', error);
        throw new Error(error instanceof Error ? error.message : '소모품 삭제 중 오류가 발생했습니다.');
    }
};

/**
 * 소모품 비활성화
 * @param consumableId 소모품 ID
 * @returns 비활성화 결과
 */
export const deactivateConsumable = async (consumableId: number): Promise<ConsumableActivateResponse> => {
    try {
        const response = await instance.put<ConsumableActivateResponse>(
            `/api/admin-tables/consumables/${consumableId}/deactivate`
        );
        return response.data;
    } catch (error: unknown) {
        console.error('소모품 비활성화 중 오류:', error);
        throw new Error(error instanceof Error ? error.message : '소모품 비활성화 중 오류가 발생했습니다.');
    }
};

/**
 * 소모품 활성화
 * @param consumableId 소모품 ID
 * @returns 활성화 결과
 */
export const activateConsumable = async (consumableId: number): Promise<ConsumableActivateResponse> => {
    try {
        const response = await instance.put<ConsumableActivateResponse>(
            `/api/admin-tables/consumables/${consumableId}/activate`
        );
        return response.data;
    } catch (error: unknown) {
        console.error('소모품 활성화 중 오류:', error);
        throw new Error(error instanceof Error ? error.message : '소모품 활성화 중 오류가 발생했습니다.');
    }
};

// ============================================================================
// 기존 호환성 함수들 (하위 호환성 유지)
// ============================================================================

export interface Consumable {
    id: number;
    name: string;
    description?: string;
    unit?: string;
    cost?: number;
    created_at?: string;
    updated_at?: string;
}

/**
 * 소모품 목록 검색 (기존 호환성)
 * @param search 검색어 (필수)
 * @returns 검색된 소모품 목록
 */
export const searchConsumables = async (search: string): Promise<Consumable[]> => {
    try {
        const consumables = await getConsumablesList(search);
        return consumables.map(consumable => ({
            id: consumable.id,
            name: consumable.name,
            description: consumable.description,
            unit: consumable.unit_type,
            cost: consumable.unit_price
        }));
    } catch (error: unknown) {
        console.error('소모품 검색 중 오류:', error);
        throw new Error(error instanceof Error ? error.message : '소모품 검색 중 오류가 발생했습니다.');
    }
};

/**
 * 소모품 단가 정보 조회 (원가 계산용) (기존 호환성)
 * @param id 소모품 ID
 * @returns 소모품 단가 정보
 */
export const getConsumableUnitPrice = async (id: number): Promise<{ id: number; unit_price: number }> => {
    try {
        const consumable = await getConsumableDetail(id);
        return {
            id: consumable.id,
            unit_price: consumable.unit_price
        };
    } catch (error: unknown) {
        console.error('소모품 단가 정보 조회 중 오류:', error);
        return { id, unit_price: 0 };
    }
};
