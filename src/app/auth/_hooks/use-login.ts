import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/app/auth/_store/auth-store';
import { LoginSchema } from '@/app/auth/_types/auth';
import { loginAction } from '@/app/auth/_api/login-api';
import toast from 'react-hot-toast';

export function useLogin() {
    const router = useRouter();
    const { login } = useAuthStore();    // useAuthStore의 login, loginError 함수 가져오기

    async function handleLogin(data: LoginSchema) {
        
        try {
            
            // 로그인 요청 데이터 생성
            const formData = new FormData();

            formData.append('username', data.username);
            formData.append('password', data.password);
            formData.append('autoLogin', data.autoLogin.toString());
            
            // 로그인 요청
            const result = await loginAction(formData);
            
            if (result && result.success) {
                login(result);                   // useAuthStore의 login 함수 호출: 사용자 로그인 정보 저장

                // 타우리 환경 감지 (여러 방법 시도)
                const isTauri = 
                    (typeof window !== 'undefined' && '__TAURI__' in window) ||
                    (typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window) ||
                    (typeof window !== 'undefined' && window.navigator.userAgent.includes('Tauri'));

                if (isTauri) {
                    // 타우리 환경(데스크톱 앱)에서는 /mso로 이동
                    router.push('/mso');
                } else {
                    // 웹 환경에서는 역할 상관없이 /로 이동
                    router.push('/');
                }

                toast.success(
                    result?.message || '로그인에 성공했습니다.'
                );
            }
            
            else {
                toast.error(
                    result?.error || '로그인에 실패했습니다.'
                );
            }
        } 
        
        catch (error: unknown) {
            console.error('로그인 에러:', error);
            
            toast.error(
                error instanceof Error ? error.message : '로그인에 실패했습니다.'
            );
        }
    };

    return { handleLogin };
}