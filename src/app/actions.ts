'use server'

import { cookies } from 'next/headers';
import { instance } from '../api/axios-instance';

// 로그인 함수
export async function loginAction(formData: FormData) {
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;
  
  try {
    const response = await instance.post('/auth/login', {
      username,
      password
    });
    
    if (response.data.success) {
      // 쿠키 설정
      const cookieStore = await cookies();
      
      // access_token 쿠키 설정
      cookieStore.set('access_token', response.data.access_token!, {
        httpOnly: false, // 클라이언트에서 접근 가능하도록 false로 설정
        secure: true,
        sameSite: 'lax',
        maxAge: 3600 // 1시간
      });
      
      // refresh_token 쿠키 설정
      if (response.data.refresh_token) {
        cookieStore.set('refresh_token', response.data.refresh_token, {
          httpOnly: false, // 클라이언트에서 접근 가능하도록 false로 설정
          secure: true,
          sameSite: 'lax',
          maxAge: 7 * 24 * 3600 // 7일
        });
      }
      
      // 성공 결과 반환
      return { 
        success: true, 
        message: '로그인 성공',
        user_id: response.data.user_id,
        role: response.data.role 
      };
      
    } else {
      // 실패 시에도 일관된 형식으로 반환
      return {
        success: false,
        error: response.data.message || '로그인에 실패했습니다.'
      };
    }
  } catch (error: unknown) {
    console.error('로그인 에러:', error);
    const errorMessage = error instanceof Error ? error.message : '로그인에 실패했습니다.';
    
    // 에러 시에도 일관된 형식으로 반환
    return {
      success: false,
      error: errorMessage
    };
  }
}

// 리프레시 토큰 갱신 함수
export async function refreshTokenAction() {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get('refresh_token')?.value;
    
    if (!refreshToken) {
      throw new Error('리프레시 토큰이 없습니다.');
    }
    
    const response = await instance.post('/auth/refresh', {
      refresh_token: refreshToken
    });
    
    if (response.data.success) {
      // 새로운 토큰으로 쿠키 업데이트
      cookieStore.set('access_token', response.data.access_token!, {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        maxAge: 3600 // 1시간
      });
      
      if (response.data.refresh_token) {
        cookieStore.set('refresh_token', response.data.refresh_token, {
          httpOnly: true,
          secure: true,
          sameSite: 'lax',
          maxAge: 7 * 24 * 3600 // 7일
        });
      }
      
      return { success: true, message: '토큰이 갱신되었습니다.' };
    } else {
      throw new Error(response.data.message || '토큰 갱신에 실패했습니다.');
    }
  } catch (error: unknown) {
    console.error('Refresh token error:', error);
    
    // 토큰 갱신 실패 시 쿠키 삭제
    await clearAuthCookies();
    
    const errorMessage = error instanceof Error ? error.message : '토큰 갱신에 실패했습니다.';
    throw new Error(errorMessage);
  }
}

// 로그아웃 함수
export async function logoutAction() {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get('refresh_token')?.value;
    
    if (refreshToken) {
      // 서버에 로그아웃 요청
      await instance.post('/auth/logout', {
        refresh_token: refreshToken
      });
    }
  
    // 쿠키 삭제
    await clearAuthCookies();
    
    return { success: true };
  } catch (error: unknown) {
    console.error('Logout error:', error);
    
    // 에러가 발생해도 쿠키는 삭제
    await clearAuthCookies();
    
    return { success: false, error: error instanceof Error ? error.message : '로그아웃 중 오류가 발생했습니다.' };
  }
}

// 쿠키 삭제 함수
async function clearAuthCookies() {
  const cookieStore = await cookies();
  
  // 쿠키 삭제
  cookieStore.delete('access_token');
  cookieStore.delete('refresh_token');
}