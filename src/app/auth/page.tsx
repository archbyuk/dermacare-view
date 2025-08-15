'use client';

import { useState } from 'react';
import { Logo } from '@/components/auth/login-logo';
import { LoginForm } from '@/components/auth/login-form';
import { loginAction } from '@/app/actions';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (username: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // FormData 생성
      const formData = new FormData();
      formData.append('username', username);
      formData.append('password', password);
      
      // Server Action 호출
      await loginAction(formData);
      // 성공 시 Server Action에서 자동으로 리다이렉트됨
      
    } catch (error: unknown) {
      console.error('Login error:', error);
      const errorMessage = error instanceof Error ? error.message : '로그인에 실패했습니다.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4 py-6">
      <div className="w-full max-w-sm mx-auto mt-32">
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
