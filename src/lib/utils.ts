import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// 클라이언트에서 쿠키 접근 확인 함수
export function checkCookies() {
  if (typeof window === 'undefined') {
    console.log('🚫 서버사이드에서는 document.cookie 접근 불가');
    return;
  }

  console.log('🔍 클라이언트에서 쿠키 확인:');
  console.log('🍪 전체 쿠키:', document.cookie);
  
  // httponly 쿠키는 접근 불가능하므로 확인
  const hasAccessToken = document.cookie.includes('access_token');
  const hasRefreshToken = document.cookie.includes('refresh_token');
  
  console.log('🔐 access_token 쿠키 존재:', hasAccessToken);
  console.log('🔐 refresh_token 쿠키 존재:', hasRefreshToken);
  
  // httponly 쿠키는 document.cookie에서 보이지 않음
  if (!hasAccessToken && !hasRefreshToken) {
    console.log('✅ httponly 쿠키가 제대로 설정됨 (클라이언트에서 접근 불가)');
  } else {
    console.log('⚠️ httponly가 아닌 쿠키가 설정됨');
  }
  
  return {
    hasAccessToken,
    hasRefreshToken,
    isHttpOnly: !hasAccessToken && !hasRefreshToken
  };
}

// 기기별 호환성을 위한 토큰 관리 유틸리티
export const tokenStorage = {
  // 토큰 저장 (다중 저장소 사용)
  setTokens: (accessToken: string, refreshToken: string, rememberMe: boolean = false) => {
    if (typeof window === 'undefined') return;
    
    try {
      // 1. 쿠키 (기본)
      document.cookie = `access_token=${accessToken}; path=/; secure; samesite=lax; max-age=3600`;
      document.cookie = `refresh_token=${refreshToken}; path=/; secure; samesite=lax; max-age=${7 * 24 * 3600}`;
      
      // 2. localStorage (장기 저장, rememberMe가 true인 경우)
      if (rememberMe) {
        localStorage.setItem('access_token', accessToken);
        localStorage.setItem('refresh_token', refreshToken);
        localStorage.setItem('remember_me', 'true');
      } else {
        // 3. sessionStorage (세션 동안만 저장)
        sessionStorage.setItem('access_token', accessToken);
        sessionStorage.setItem('refresh_token', refreshToken);
        sessionStorage.setItem('remember_me', 'false');
      }
      
      console.log('✅ 토큰이 다중 저장소에 저장되었습니다.');
    } catch (error) {
      console.error('❌ 토큰 저장 실패:', error);
    }
  },
  
  // 토큰 가져오기 (우선순위: 쿠키 > localStorage > sessionStorage)
  getAccessToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    
    try {
      // 1. 쿠키에서 먼저 확인
      const cookieToken = getCookie('access_token');
      if (cookieToken) return cookieToken;
      
      // 2. localStorage 확인
      const localToken = localStorage.getItem('access_token');
      if (localToken) return localToken;
      
      // 3. sessionStorage 확인
      const sessionToken = sessionStorage.getItem('access_token');
      if (sessionToken) return sessionToken;
      
      return null;
    } catch (error) {
      console.error('❌ 토큰 가져오기 실패:', error);
      return null;
    }
  },
  
  getRefreshToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    
    try {
      // 1. 쿠키에서 먼저 확인
      const cookieToken = getCookie('refresh_token');
      if (cookieToken) return cookieToken;
      
      // 2. localStorage 확인
      const localToken = localStorage.getItem('refresh_token');
      if (localToken) return localToken;
      
      // 3. sessionStorage 확인
      const sessionToken = sessionStorage.getItem('refresh_token');
      if (sessionToken) return sessionToken;
      
      return null;
    } catch (error) {
      console.error('❌ 리프레시 토큰 가져오기 실패:', error);
      return null;
    }
  },
  
  // 토큰 삭제 (모든 저장소에서)
  clearTokens: () => {
    if (typeof window === 'undefined') return;
    
    try {
      // 쿠키 삭제
      document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      document.cookie = 'refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      
      // localStorage 삭제
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('remember_me');
      
      // sessionStorage 삭제
      sessionStorage.removeItem('access_token');
      sessionStorage.removeItem('refresh_token');
      sessionStorage.removeItem('remember_me');
      
      console.log('✅ 모든 저장소에서 토큰이 삭제되었습니다.');
    } catch (error) {
      console.error('❌ 토큰 삭제 실패:', error);
    }
  },
  
  // 인증 상태 확인
  isAuthenticated: (): boolean => {
    return !!tokenStorage.getAccessToken();
  }
};

// 쿠키에서 값을 가져오는 함수
export function getCookie(name: string): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  
  if (parts.length === 2) {
    const result = parts.pop()!.split(';').shift()!;
    return result;
  }
  
  return null;
}

// iOS Safari bfcache 대응을 위한 유틸리티
export const bfcacheHandler = {
  // bfcache 복원 감지 및 인증 상태 재확인
  handlePageShow: (event: PageTransitionEvent) => {
    if (event.persisted) {
      console.log('🔄 bfcache에서 복원됨, 인증 상태 재확인');
      
      // 인증 상태 재확인
      if (!tokenStorage.isAuthenticated()) {
        console.log('❌ 인증 토큰이 없음, 로그인 페이지로 리다이렉트');
        window.location.replace('/auth');
      }
    }
  },
  
  // 페이지 포커스 시 인증 상태 확인
  handleFocus: () => {
    console.log('🔍 페이지 포커스, 인증 상태 확인');
    if (!tokenStorage.isAuthenticated()) {
      console.log('❌ 인증 토큰이 없음, 로그인 페이지로 리다이렉트');
      window.location.replace('/auth');
    }
  },
  
  // 가시성 변경 시 인증 상태 확인
  handleVisibilityChange: () => {
    if (!document.hidden) {
      console.log('👁️ 페이지 가시성 변경, 인증 상태 확인');
      if (!tokenStorage.isAuthenticated()) {
        console.log('❌ 인증 토큰이 없음, 로그인 페이지로 리다이렉트');
        window.location.replace('/auth');
      }
    }
  }
};
