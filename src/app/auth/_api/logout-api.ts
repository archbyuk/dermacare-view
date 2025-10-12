'use server'

import { cookies } from 'next/headers';
import { instance } from '@/api/axios-instance';
import { LogoutResponse } from '@/app/auth/_types/auth';
import { clearAuthCookies } from '@/app/auth/_api/auth-utils';

export async function logoutAction(): Promise<LogoutResponse> {
    
    try {
        const cookieStore = await cookies();
        const refreshToken = cookieStore.get('refresh_token')?.value;
        
        // 서버에 로그아웃 요청
        if (refreshToken) {
            await instance.post('/auth/logout', {
                refresh_token: refreshToken
            });
        }
    
        // 쿠키 삭제
        await clearAuthCookies();
        
        return { success: true };
    } 
    
    catch (error: unknown) {
        console.error('Logout error:', error);
        
        // 에러가 발생해도 쿠키는 삭제
        await clearAuthCookies();
        
        return { 
            success: false, 
            error: error instanceof Error ? error.message : '로그아웃 중 오류가 발생했습니다.' 
        };
    }
}
