'use client';

import { useState, useEffect } from 'react';
import { Logo } from '@/components/auth/login-logo';
import { LoginForm } from '@/components/auth/login-form';
import { loginAction } from '@/app/actions';
import { useRouter } from 'next/navigation';
import { tokenStorage, bfcacheHandler } from '@/lib/utils';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // iOS Safari bfcache 대응을 위한 이벤트 리스너
  useEffect(() => {
    // bfcache 복원 감지
    const handlePageShow = (event: PageTransitionEvent) => {
      bfcacheHandler.handlePageShow(event);
    };

    // 페이지 포커스 시 인증 상태 확인
    const handleFocus = () => {
      bfcacheHandler.handleFocus();
    };

    // 가시성 변경 시 인증 상태 확인
    const handleVisibilityChange = () => {
      bfcacheHandler.handleVisibilityChange();
    };

    // 이벤트 리스너 등록
    window.addEventListener('pageshow', handlePageShow);
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // 컴포넌트 언마운트 시 이벤트 리스너 제거
    return () => {
      window.removeEventListener('pageshow', handlePageShow);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const handleLogin = async (username: string, password: string, rememberMe: boolean) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // FormData 생성
      const formData = new FormData();
      formData.append('username', username);
      formData.append('password', password);
      
      // Server Action 호출
      const result = await loginAction(formData);

      // loginAction에서 성공 시에만 객체를 반환하므로 result가 있으면 성공
      if (result && result.success) {
        // 다중 저장소에 토큰 저장
        if (result.access_token && result.refresh_token) {
          tokenStorage.setTokens(result.access_token, result.refresh_token, rememberMe);
        }
        
        // 로그인 성공 시 홈페이지로 이동
        router.push('/');
        router.refresh(); // 페이지 새로고침하여 쿠키 반영
      } else if (result && !result.success) {
        // 로그인 실패 시 에러 메시지 표시
        console.error('로그인 실패:', result.error);
        setError(result.error || '로그인에 실패했습니다.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4 py-6">
      <div className="w-full max-w-sm mx-auto mt-7">
        {/* 로고 영역 */}
        <div className="mb-8">
          <Logo />
        </div>
        
        {/* 에러 메시지 */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}
        
        {/* 로그인 폼 */}
        <LoginForm onSubmit={handleLogin} isLoading={isLoading} />
      </div>
    </div>
  );
}
