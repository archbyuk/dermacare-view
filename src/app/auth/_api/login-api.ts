'use server'

import { cookies } from 'next/headers';
import { instance } from '@/api/axios-instance';
import { LoginResponse } from '../_types/auth';

export async function loginAction(formData: FormData): Promise<LoginResponse> {
    
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;
    const autoLogin = formData.get('autoLogin') === 'true';
    
    try {
        // 로그인 요청
        const response = await instance.post('/auth/login', {
            username: username,
            password: password
        });
        
        // 응답 데이터가 성공인 경우
        if (response.data.success) {
            const cookieStore = await cookies();
            
            // 환경에 따른 secure 옵션 설정
            const isProduction = process.env.NODE_ENV === 'production';
            
            // access_token 쿠키 설정 - 환경별 최적화
            cookieStore.set('access_token', response.data.access_token!, {
                httpOnly: false,
                secure: isProduction, // 프로덕션에서만 secure: true
                sameSite: 'lax',
                maxAge: 3600, // 1시간 
                path: '/'
            });
            
            // refresh_token 쿠키 설정 - autoLogin에 따라 조건부 설정
            if (response.data.refresh_token && autoLogin) {
                // 로그인 정보 저장 선택 시에만 refresh_token 제공
                cookieStore.set('refresh_token', response.data.refresh_token, {
                    httpOnly: false,
                    secure: isProduction, // 프로덕션에서만 secure: true
                    sameSite: 'lax',
                    maxAge: 7 * 24 * 3600, // 7일
                    path: '/'
                });
            }
            
            return { 
                success: true, 
                message: '로그인 성공',
                user_id: response.data.user_id,
                role: response.data.role,
                access_token: response.data.access_token,
                refresh_token: response.data.refresh_token,
                username: response.data.username
            };

        } 
        
        else {
            // 실패 시 에러 객체 반환 (throw 대신)
            return {
                success: false,
                error: response.data.message || '로그인에 실패했습니다.'
            };
        }
    } 
    
    catch (error: unknown) {
        console.error('로그인 에러:', error);
        
        // 에러 객체 반환 (throw 대신)
        return {
            success: false,
            error: error instanceof Error ? error.message : '로그인에 실패했습니다.'
        };
    }
}
