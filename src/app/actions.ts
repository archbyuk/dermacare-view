'use server'

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
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
        httpOnly: true, // 클라이언트에서 접근 가능하도록 false로 설정
        secure: true,
        sameSite: 'lax',
        maxAge: 3600 // 1시간
      });
      
      // refresh_token 쿠키 설정
      if (response.data.refresh_token) {
        cookieStore.set('refresh_token', response.data.refresh_token, {
          httpOnly: true, // 클라이언트에서 접근 가능하도록 false로 설정
          secure: true,
          sameSite: 'lax',
          maxAge: 7 * 24 * 3600 // 7일
        });
      }
      
      redirect('/');
    } else {
      throw new Error(response.data.message || '로그인에 실패했습니다.');
    }
  } catch (error: any) {
    // NEXT_REDIRECT는 정상적인 리다이렉트이므로 무시
    if (error.message === 'NEXT_REDIRECT') {
      throw error; // 리다이렉트를 계속 진행
    }
    
    console.error('Login error:', error);
    
    let errorMessage = '로그인에 실패했습니다.';
    
    if (error.code === 'ECONNREFUSED') {
      errorMessage = '서버에 연결할 수 없습니다. 백엔드 서버가 실행 중인지 확인해주세요.';
    } else if (error.response?.data?.detail) {
      errorMessage = error.response.data.detail;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    throw new Error(errorMessage);
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
  } catch (error: any) {
    console.error('Refresh token error:', error);
    
    // 토큰 갱신 실패 시 쿠키 삭제
    await clearAuthCookies();
    
    const errorMessage = error.response?.data?.detail || error.message || '토큰 갱신에 실패했습니다.';
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
    
    // 로그인 페이지로 리다이렉트
    redirect('/auth');
  } catch (error: any) {
    console.error('Logout error:', error);
    
    // 에러가 발생해도 쿠키는 삭제
    await clearAuthCookies();
    redirect('/auth');
  }
}

// 쿠키 삭제 함수
async function clearAuthCookies() {
  const cookieStore = await cookies();
  
  // 쿠키 삭제
  cookieStore.delete('access_token');
  cookieStore.delete('refresh_token');
}