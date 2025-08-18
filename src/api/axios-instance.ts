import axios from 'axios';

const instance = axios.create({
  baseURL: process.env.NODE_ENV === 'development' 
    ? 'http://localhost:9000' 
    : process.env.NEXT_PUBLIC_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // 쿠키 주고받기 위해 필요
  timeout: 10000, // 10초 타임아웃 추가
});

// 서버사이드와 클라이언트사이드 모두에서 토큰을 헤더에 추가
instance.interceptors.request.use(async (config) => {
  if (typeof window === 'undefined') {
    // 서버 사이드 로직 (Server Actions, API Routes, SSR 등)
    const { cookies } = await import('next/headers');
    const token = (await cookies()).get('access_token')?.value;
    if (token) config.headers['Authorization'] = `Bearer ${token}`;
  } else {
    // 클라이언트 사이드 로직
    const token = getCookie('access_token');
    if (token) config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// 에러 인터셉터 추가
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    // 에러 로깅 (개발 환경에서만)
    if (process.env.NODE_ENV === 'development') {
      console.error('API Error:', error.message);
      console.error('Status:', error.response?.status);
      console.error('URL:', error.config?.url);
    }
    
    // 사용자 친화적인 에러 메시지로 변환 (에러 표시는 하지 않고 메시지만 변경)
    if (error.response?.status === 401) {
      error.message = '아이디 또는 비밀번호가 올바르지 않습니다.';
    } else if (error.response?.status === 403) {
      error.message = '접근 권한이 없습니다.';
    } else if (error.response?.status === 404) {
      error.message = '요청한 정보를 찾을 수 없습니다.';
    } else if (error.response?.status >= 500) {
      error.message = '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
    } else if (error.code === 'ECONNABORTED') {
      error.message = '요청 시간이 초과되었습니다.';
    } else if (!error.response) {
      error.message = '네트워크 연결을 확인해주세요.';
    }
    
    return Promise.reject(error);
  }
);

// 클라이언트에서 쿠키를 가져오는 함수
export function getCookie(name: string): string | null {
  if (typeof window === 'undefined') {
    return null; // 서버 사이드 렌더링에서는 null 반환
  }
  
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  
  if (parts.length === 2) {
    const result = parts.pop()!.split(';').shift()!;
    return result;
  }
  
  return null;
}

export { instance };