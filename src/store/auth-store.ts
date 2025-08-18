import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// 로그인 응답 타입 (JWT 토큰 제외)
interface LoginResponse {
  success: boolean;
  message?: string;
  user_id?: number;
  role?: string;
  access_token?: string;
  refresh_token?: string;
  username?: string;
}

// 사용자 정보 타입
interface User {
  user_id: number;
  role: string;
  username: string;
}

// 인증 상태 관리
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (loginResponse: LoginResponse) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // 초기 상태
      user: null,
      isAuthenticated: false,
      
      // 액션
      login: (loginResponse) => {
        if (loginResponse.success && loginResponse.user_id && loginResponse.role && loginResponse.username) {
          set({ 
            user: {
              user_id: loginResponse.user_id,
              role: loginResponse.role,
              username: loginResponse.username
            }, 
            isAuthenticated: true 
          });
        }
      },
      
      logout: () => set({ 
        user: null, 
        isAuthenticated: false 
      }),
    }),
    {
      name: 'auth-storage', // localStorage 키 이름
      // 선택적으로 특정 필드만 저장
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);