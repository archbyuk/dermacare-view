import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/app/auth/_store/auth-store';
import { logoutAction } from '@/app/auth/_api/logout-api';
import { toast } from 'sonner';

export function useLogout() {
    const router = useRouter();
    const { logout } = useAuthStore();

    const handleLogout = async () => {
        
        try {
            
            // 서버에 로그아웃 요청 및 쿠키 삭제
            const result = await logoutAction();
            
            if (result.success) {
                // 클라이언트 상태 초기화
                logout();
                toast.success('로그아웃되었습니다.');
                router.push('/auth');
            } 
            
            else {
                toast.error(result.error || '로그아웃에 실패했습니다.');
            }
        } 
        
        catch (error: unknown) {
            console.error('로그아웃 에러:', error);
            toast.error('로그아웃 중 오류가 발생했습니다.');
        }
    };

    return { handleLogout };
}
