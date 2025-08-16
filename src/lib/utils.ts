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
