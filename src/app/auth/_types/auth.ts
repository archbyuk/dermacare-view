import { z } from 'zod';

// Login 응답 타입
export interface LoginResponse {
    success: boolean;
    message?: string;
    role?: string;
    username?: string;
    error?: string;
}

// RefreshToken 응답 타입
export interface RefreshTokenResponse {
    success: boolean;
    message?: string;
    error?: string;
}

// Logout 응답 타입
export interface LogoutResponse {
    success: boolean;
    error?: string;
}

// ===== Form 관련 타입들 ===== // 
export const loginSchema = z.object(
    {
        // 아이디 유효성 검사: 필수 입력, 최소 2글자 이상
        username: z.string()
            .min(1, '아이디를 입력해주세요')
            .min(2, '아이디는 최소 2글자 이상이어야 합니다'),
    
        // 비밀번호 유효성 검사: 필수 입력, 최소 4글자 이상
        password: z.string()
            .min(1, '비밀번호를 입력해주세요')
            .min(4, '비밀번호는 최소 4글자 이상이어야 합니다'),
    
        // 로그인 정보 저장 체크박스: 기본값 false
        autoLogin: z.boolean()
    }
);

export type LoginSchema = z.infer<typeof loginSchema>;


// store: 사용자 정보 타입
export interface User {
    role: string;
    username: string;
}

// store: 인증 상태 관리 인터페이스
export interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    error: string | null;
    login: (loginResponse: LoginResponse) => void;
    logout: () => void;
}
