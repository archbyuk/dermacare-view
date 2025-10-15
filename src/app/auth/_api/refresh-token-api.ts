'use server'

import { cookies } from 'next/headers';
import { instance } from '@/api/axios-instance';
import { RefreshTokenResponse } from '@/app/auth/_types/auth';
import { clearAuthCookies } from '@/app/auth/_api/auth-utils';

// 리프레시 토큰 갱신 함수
export async function refreshTokenAction(): Promise<RefreshTokenResponse> {
    
    try {
        const cookieStore = await cookies();
        const refreshToken = cookieStore.get('refresh_token')?.value;
        
        // refresh_token이 없으면 갱신 불가
        if (!refreshToken) {
            return {
                success: false,
                error: '리프레시 토큰이 없습니다.'
            };
        }
        
        const response = await instance.post('/refresh', {
            refresh_token: refreshToken
        });
        
        console.log('[Refresh Token] 백엔드 응답:', response.data);
        console.log('[Refresh Token] Set-Cookie 헤더:', response.headers['set-cookie']);
        
        if (response.data.success) {
            // 백엔드가 보낸 Set-Cookie 헤더 파싱하여 쿠키 설정
            const setCookieHeaders = response.headers['set-cookie'];
            
            if (setCookieHeaders) {
                // 배열로 변환 (단일 문자열일 수도 있음)
                const cookieArray = Array.isArray(setCookieHeaders) ? setCookieHeaders : [setCookieHeaders];
                
                cookieArray.forEach((cookieString: string) => {
                    const [nameValue, ...attributes] = cookieString.split('; ');
                    const [name, value] = nameValue.split('=');
                    
                    // 쿠키 속성 파싱
                    const options: Record<string, string | number | boolean> = {};
                    
                    attributes.forEach(
                        (attr: string) => {
                            const [key, val] = attr.split('=');
                            
                            if (key.toLowerCase() === 'max-age') options.maxAge = parseInt(val);
                            else if (key.toLowerCase() === 'httponly') options.httpOnly = true;
                            else if (key.toLowerCase() === 'secure') options.secure = true;
                            else if (key.toLowerCase() === 'samesite') {
                                // 보안을 위해 strict 강제
                                options.sameSite = 'strict';
                            }
                            else if (key.toLowerCase() === 'path') options.path = val;
                        }
                    );
                    
                    cookieStore.set(name, value, options as never);
                });
            }
            
            return { 
                success: true, 
                message: '토큰이 갱신되었습니다.'
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