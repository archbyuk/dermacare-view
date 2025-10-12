'use server'

import { instance } from './axios-instance';
import { 
    ConsultationListResponse, 
    ConsultationQueryParams,
    ConsultationCreateRequest,
    ConsultationCreateResponse
} from '@/types/consultations';

import { cookies } from 'next/headers';

export async function getConsultations(params: ConsultationQueryParams = {}): Promise<ConsultationListResponse> {
    const { cursor, limit = 30, sort_by = 'id', sort_order = 'desc' } = params;
    
    // Next.js 서버의 쿠키에서 토큰 가져오기
    const token = (await cookies()).get('access_token')?.value;
    
    const url = new URL('http://4.230.8.213:9000/consultations/read');
    url.searchParams.set('limit', limit.toString());
    url.searchParams.set('sort_by', sort_by);
    url.searchParams.set('sort_order', sort_order);
    if (cursor) url.searchParams.set('cursor', cursor.toString());
    
    const response = await fetch(url.toString(), {
        headers: {
            'Authorization': token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json',
        },
    });
    
    if (!response.ok) {
        throw new Error('상담 목록 조회에 실패했습니다.');
    }
    
    return response.json();
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
