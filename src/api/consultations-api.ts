'use server'

import { AxiosError } from 'axios';
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
        if (error instanceof AxiosError) {
            console.error('상담 목록 조회 에러 (AxiosError):', {
                message: error.message,
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                config: {
                    url: error.config?.url,
                    method: error.config?.method,
                    params: error.config?.params,
                }
            });
            const errorMessage = error.response?.data?.detail || error.message || '상담 목록 조회에 실패했습니다.';
            throw new Error(errorMessage);
        }
        
        console.error('상담 목록 조회 에러 (Unknown):', error);
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
        if (error instanceof AxiosError) {
            console.error('상담 생성 에러 (AxiosError):', {
                message: error.message,
                status: error.response?.status,
                data: error.response?.data,
                config: {
                    url: error.config?.url,
                    method: error.config?.method,
                }
            });
            const errorMessage = error.response?.data?.detail || error.message || '상담 생성에 실패했습니다.';
            throw new Error(errorMessage);
        }
        
        console.error('상담 생성 에러 (Unknown):', error);
        const errorMessage = error instanceof Error ? error.message : '상담 생성에 실패했습니다.';
        throw new Error(errorMessage);
    }
}
