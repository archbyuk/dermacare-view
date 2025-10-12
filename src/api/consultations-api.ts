'use server'

import { instance } from './axios-instance';
import { 
    ConsultationListResponse, 
    ConsultationQueryParams,
    ConsultationCreateRequest,
    ConsultationCreateResponse
} from '@/types/consultations';

// 상담 목록 조회
export async function getConsultations(params: ConsultationQueryParams = {}): Promise<ConsultationListResponse> {
    try {
        const { cursor, limit = 30, sort_by = 'id', sort_order = 'desc' } = params;
        
        const response = await instance.get('/consultations/read', {
            params: {
                cursor,
                limit,
                sort_by,
                sort_order
            }
        });
        
        return response.data;
    } catch (error: unknown) {
        console.error('상담 목록 조회 에러:', error);
        const errorMessage = error instanceof Error ? error.message : '상담 목록 조회에 실패했습니다.';
        throw new Error(errorMessage);
    }
}

// 상담 생성
export async function createConsultation(data: ConsultationCreateRequest): Promise<ConsultationCreateResponse> {
    try {
        const response = await instance.post('/consultations/create', data);
        return response.data;
    } catch (error: unknown) {
        console.error('상담 생성 에러:', error);
        const errorMessage = error instanceof Error ? error.message : '상담 생성에 실패했습니다.';
        throw new Error(errorMessage);
    }
}
