'use client';

import { useState } from 'react';
import { Logo } from '@/components/auth/login-logo';
import { LoginForm } from '@/components/auth/login-form';
import { loginAction } from '@/app/actions';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (username: string, password: string, rememberMe: boolean) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // FormData 생성
      const formData = new FormData();
      formData.append('username', username);
      formData.append('password', password);
      formData.append('rememberMe', rememberMe.toString());
      
      // Server Action 호출
      const result = await loginAction(formData);

      // loginAction에서 성공 시에만 객체를 반환하므로 result가 있으면 성공
      if (result && result.success) {
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
