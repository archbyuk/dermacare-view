'use server'

import { cookies } from 'next/headers';
import { instance } from '@/api/axios-instance';
import { LoginResponse } from '../_types/auth';

export async function loginAction(formData: FormData): Promise<LoginResponse> {
    
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;
    
    try {
        
        // 로그인 요청
        const response = await instance.post('/login', {
            username: username,
            password: password
        });

        // 응답 데이터가 성공인 경우
        if (response.data.success) {
            
            // login api에서 받은 Set-Cookie 헤더 가져오기
            const setCookieHeaders = response.headers['set-cookie'];
            
            // Set-Cookie 헤더가 있으면 브라우저에 쿠키 설정: 여기서 받아온 쿠키는 next.js 서버에서 받는 것이기 때문에 수동으로 브라우저에 올려줬음.
            if (setCookieHeaders) {
                const cookieStore = await cookies();
                
                // 배열로 변환 (단일 문자열일 수도 있음)
                const cookieArray = Array.isArray(setCookieHeaders) ? setCookieHeaders : [setCookieHeaders];
                
                // 각 쿠키 파싱하여 설정
                cookieArray.forEach(
                    (cookieString: string) => {
                        // tokenName: access_token, refresh_token
                        // tokenAttributes: HttpOnly, Max-Age, Secure, SameSite, Path
                        const [tokenName, ...tokenAttributes] = cookieString.split('; ');
                        
                        // access token, refresh token 따로 파싱
                        const [name, value] = tokenName.split('=');
                        
                        // 쿠키 속성 파싱
                        const options: Record<string, string | number | boolean> = {};
                        
                        // access token, refresh token 제외한 나머지 쿠키 속성 파싱 
                        tokenAttributes.forEach(
                            (tokenAttributes: string) => {
                                const [key, value] = tokenAttributes.split('=');
                                
                                if (key === 'Max-Age') options.maxAge = parseInt(value);
                                else if (key === 'HttpOnly') options.httpOnly = true;
                                else if (key === 'Secure') options.secure = true;
                                else if (key === 'SameSite') options.sameSite = value as 'strict' | 'lax';
                                else if (key === 'Path') options.path = value;
                            }
                        );
                        
                        cookieStore.set( name, value, options as Record<string, string | object> );
                    }
                );
            }
            
            return {
                success: true, 
                message: '로그인 성공',
                role: response.data.role,
                username: response.data.username
            };
        } 
        
        else {
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
