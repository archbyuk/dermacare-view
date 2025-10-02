'use server'

import { cookies } from 'next/headers';
import { instance } from '@/api/axios-instance';
import { RefreshTokenResponse } from '@/app/auth/_types/auth';
import { clearAuthCookies } from '@/app/auth/_api/auth-utils';

// 리프레시 토큰 갱신 함수
export async function refreshTokenAction(): Promise<RefreshTokenResponse> {
    
    try {

        const cookieStore = await cookies();                                // 쿠키 가져오기
        const refreshToken = cookieStore.get('refresh_token')?.value;       // refresh_token 가져오기
        const autoLogin = cookieStore.get('autoLogin')?.value === 'true';   // autoLogin 가져오기
        
        // 애초에 refresh_token이 없으면 갱신 X
        if (!refreshToken) {
            return {
                success: false,
                error: '리프레시 토큰이 없습니다.'
            };
        }
        
        const response = await instance.post('/auth/refresh', {
            refresh_token: refreshToken
        });
        
        if (response.data.success) {
            
            // 새로운 토큰으로 쿠키 업데이트 (access_token)
            cookieStore.set('access_token', response.data.access_token!, {
                httpOnly: true,
                secure: true,
                sameSite: 'lax',
                maxAge: 3600 // 1시간
            });
            
            // 새로운 토큰으로 쿠키 업데이트 (refresh_token: autoLogin에 따라 조건부 설정)
            if (response.data.refresh_token && autoLogin) {
                
                cookieStore.set('refresh_token', response.data.refresh_token, {
                    httpOnly: true,
                    secure: true,
                    sameSite: 'lax',
                    maxAge: 7 * 24 * 3600 // 7일
                });
            }
            
            // 토큰 정보도 함께 반환
            return { 
                success: true, 
                message: '토큰이 갱신되었습니다.',
                accessToken: response.data.access_token,
                refreshToken: response.data.refresh_token
            };
        } 
        
        else {
            return {
                success: false,
                error: response.data.message || '토큰 갱신에 실패했습니다.'
            };
        }

    }

    catch (error: unknown) {
        console.error('Refresh token error:', error);
        
        // 토큰 갱신 실패 시 쿠키 삭제
        await clearAuthCookies();
        
        const errorMessage = error instanceof Error ? error.message : '토큰 갱신에 실패했습니다.';
        
        return {
            success: false,
            error: errorMessage
        };
    }
}