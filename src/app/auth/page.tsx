'use client';

import { useState } from 'react';
import { LoginForm } from '@/components/auth/login-form';
import { loginAction } from '@/app/actions';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { WordMark } from '@/components/brand/word-mark';


export default function LoginPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    
    const { login } = useAuthStore();   // zustand

    const handleLogin = async (username: string, password: string, rememberMe: boolean) => {
        setIsLoading(true);
        setError(null);
          
        try {
            // FormData 생성
            const formData = new FormData();
            
            formData.append('username', username);
            formData.append('password', password);
            formData.append('rememberMe', rememberMe.toString());
            
            // 로그인 API 호출
            const result = await loginAction(formData);

            // loginAction API 성공 시 객체 반환
            if (result && result.success) {     
                login(result);  // zustand store에 사용자 정보 저장  
                
                router.push('/');
            } 
            
            else if (result && !result.success) {
                console.error('로그인 실패:', result.error);
                setError(result.error || '로그인에 실패했습니다.');
            }
        } 
        
        catch (error) {
            console.error('로그인 에러:', error);
            setError('로그인 중 오류가 발생했습니다.');
        } 
        
        finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4 py-6">
            <div className="w-full max-w-sm mx-auto mt-7">
                {/* 워드마크 */}
                <div className="mb-8">
                    <WordMark />
                </div>
                
                {/* 에러 메시지 */}
                {error && (
                    <div className="mb-1 p-3 px-10 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm text-center">
                        {error}
                    </div>
                )}
                
                {/* 로그인 폼 */}
                <LoginForm onSubmit={handleLogin} isLoading={isLoading} />
            </div>
        </div>
    );
}
