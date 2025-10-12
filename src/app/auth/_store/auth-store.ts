import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthState, LoginResponse } from '@/app/auth/_types/auth';

export const useAuthStore = create<AuthState>()(
    // 메모: userID는 안 보이게 해놓을 예정 : mypage 수정할 때 다시 건들 예정
    // 상태 관리
    persist(
        (set) => ({
            user: null,
            isAuthenticated: false,
            error: null,
            
            // 로그인 성공 시 상태 업데이트
            login: (loginResponse: LoginResponse) => {
                
                if (loginResponse.success && loginResponse.user_id && loginResponse.role && loginResponse.username) {
                    set({ 
                        user: {
                            user_id: loginResponse.user_id,
                            role: loginResponse.role,
                            username: loginResponse.username
                        }, 
                        isAuthenticated: true,
                        error: null
                    });
                }
            },
            
            // 로그아웃 시 상태 업데이트
            logout: () => set({ 
                user: null, 
                isAuthenticated: false,
                error: null
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