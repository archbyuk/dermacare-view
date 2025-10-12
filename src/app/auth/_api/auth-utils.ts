'use server'

import { cookies } from 'next/headers';

// 쿠키 삭제 유틸리티 함수
export async function clearAuthCookies(): Promise<void> {
    
    const cookieStore = await cookies();
    
    // 인증 관련 쿠키 삭제
    cookieStore.delete('access_token');
    cookieStore.delete('refresh_token');
    cookieStore.delete('autoLogin');
}
