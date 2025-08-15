import axios from 'axios';

// AWS 서버 URL로 강제 설정
const API_BASE_URL = '/api/backend';

const instance = axios.create({
  baseURL: API_BASE_URL,  
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
    console.error('API Error:', error.message);
    console.error('Status:', error.response?.status);
    console.error('URL:', error.config?.url);
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