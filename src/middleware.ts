import { NextResponse, NextRequest } from 'next/server'
import { refreshTokenAction } from '@/app/auth/_api/refresh-token-api'

export async function middleware(request: NextRequest) {
    const accessToken = request.cookies.get('access_token')
    const refreshToken = request.cookies.get('refresh_token')
    
    console.log('[Middleware] Path:', request.nextUrl.pathname)
    console.log('[Middleware] access_token:', accessToken?.value ? '존재' : '없음')
    console.log('[Middleware] refresh_token:', refreshToken?.value ? '존재' : '없음')
    
    let isAuthenticated = !!accessToken
    
    // 보호된 경로들 (인증 필요)
    const protectedPaths = ['/']
    const isProtectedPath = protectedPaths.some(path => 
        request.nextUrl.pathname.startsWith(path) && request.nextUrl.pathname !== '/auth'
    )
    
    // 인증된 사용자가 접근할 수 없는 경로들 (로그인 페이지 등)
    const authPaths = ['/auth']
    const isAuthPath = authPaths.some(path => request.nextUrl.pathname.startsWith(path))
    
    // access_token이 없지만 refresh_token이 있는 경우 토큰 갱신 시도
    if (!accessToken && refreshToken && (isProtectedPath || isAuthPath)) {
        try {
            const result = await refreshTokenAction()
        
            if (result.success) {
                // 토큰 갱신 성공 - 백엔드가 새로운 토큰을 Set-Cookie로 설정
                isAuthenticated = true
          
                if (isAuthPath) {
                    // /auth 페이지에서 토큰 갱신 성공 시 환경에 따라 리다이렉트
                    const userAgent = request.headers.get('user-agent') || ''
                    const isTauri = userAgent.includes('Tauri')
                    const redirectUrl = isTauri ? '/mso' : '/'
                    return NextResponse.redirect(new URL(redirectUrl, request.url))
                }
            }
        }
      
        catch (error: unknown) {
            console.error('Token refresh failed:', error)
          
            // 토큰 갱신 실패 시 로그인 페이지로 리다이렉트
            if (isProtectedPath) {
                const response = NextResponse.redirect(new URL('/auth', request.url))
                response.cookies.delete('access_token')
                response.cookies.delete('refresh_token')
              
                return response
            }
        }
    }
    
    // 보호된 경로에 접근하려는데 인증되지 않은 경우
    if (isProtectedPath && !isAuthenticated) {
        console.log('[Middleware] 리다이렉트: /auth (인증 필요)')
        return NextResponse.redirect(new URL('/auth', request.url))
    }
    
    // 이미 인증된 사용자가 로그인 페이지에 접근하는 경우
    if (isAuthPath && isAuthenticated) {
        console.log('[Middleware] 리다이렉트: 로그인된 사용자')
        // 타우리 환경 감지
        const userAgent = request.headers.get('user-agent') || ''
        const isTauri = userAgent.includes('Tauri')
        const redirectUrl = isTauri ? '/mso' : '/'
        
        const response = NextResponse.redirect(new URL(redirectUrl, request.url))
        response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
        response.headers.set('Pragma', 'no-cache')
        response.headers.set('Expires', '0')
        return response
    }
    
    return NextResponse.next()
}

export const config = {
    matcher: [
        // svg/png/jpg/webp/ico/manifest 같은 정적 파일은 제외
        '/((?!api|_next/static|_next/image|favicon.ico|manifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|json)$).*)',
    ],
}