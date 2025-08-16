import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// 사용자 정보 타입
interface User {
  id: string;
  username: string;
  role: string;
}

// 인증 상태 관리
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (userData: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // 초기 상태
      user: null,
      isAuthenticated: false,
      
      // 액션
      login: (userData) => set({ 
        user: userData, 
        isAuthenticated: true 
      }),
      
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
