'use server'

import { cookies } from 'next/headers';
import { 
    ConsultationListResponse, 
    ConsultationQueryParams,
    ConsultationCreateRequest,
    ConsultationCreateResponse
} from '@/types/consultations';

const API_BASE_URL = process.env.NODE_ENV === 'development' 
    ? 'http://localhost:9000' 
    : (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://4.230.8.213:9000');

// 상담 목록 조회
export async function getConsultations(params: ConsultationQueryParams = {}): Promise<ConsultationListResponse> {
    try {
        const { cursor, limit = 30, sort_by = 'id', sort_order = 'desc' } = params;
        
        const token = (await cookies()).get('access_token')?.value;
        
        const url = new URL(`${API_BASE_URL}/consultations/read`);
        url.searchParams.set('limit', limit.toString());
        url.searchParams.set('sort_by', sort_by);
        url.searchParams.set('sort_order', sort_order);
        if (cursor) url.searchParams.set('cursor', cursor.toString());
        
        const response = await fetch(url.toString(), {
            headers: {
                'Authorization': token ? `Bearer ${token}` : '',
                'Content-Type': 'application/json',
            },
            cache: 'no-store',
        });
        
        if (!response.ok) {
            throw new Error(`상담 목록 조회 실패: ${response.status}`);
        }
        
        return response.json();
    } catch (error: unknown) {
        console.error('상담 목록 조회 에러:', error);
        throw new Error(error instanceof Error ? error.message : '상담 목록 조회에 실패했습니다.');
    }
}

// 상담 생성
export async function createConsultation(data: ConsultationCreateRequest): Promise<ConsultationCreateResponse> {
    try {
        const token = (await cookies()).get('access_token')?.value;
        
        const response = await fetch(`${API_BASE_URL}/consultations/create`, {
            method: 'POST',
            headers: {
                'Authorization': token ? `Bearer ${token}` : '',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
            cache: 'no-store',
        });
        
        if (!response.ok) {
            throw new Error(`상담 생성 실패: ${response.status}`);
        }
        
        return response.json();
    } catch (error: unknown) {
        console.error('상담 생성 에러:', error);
        throw new Error(error instanceof Error ? error.message : '상담 생성에 실패했습니다.');
    }
}
