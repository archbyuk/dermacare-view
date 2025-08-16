import { NextResponse, NextRequest } from 'next/server'
import { refreshTokenAction } from '@/app/actions'

export async function middleware(request: NextRequest) {
  const accessToken = request.cookies.get('access_token')
  const refreshToken = request.cookies.get('refresh_token')
  
  let isAuthenticated = !!accessToken
  
  // 보호된 경로들 (인증 필요)
  const protectedPaths = ['/']
  const isProtectedPath = protectedPaths.some(path => 
    request.nextUrl.pathname.startsWith(path) && request.nextUrl.pathname !== '/auth'
  )
  
  // 인증된 사용자가 접근할 수 없는 경로들 (로그인 페이지 등)
  const authPaths = ['/auth']
  const isAuthPath = authPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  )
  
  // access_token이 없지만 refresh_token이 있는 경우에만 토큰 갱신 시도
  if (!accessToken && refreshToken && (isProtectedPath || isAuthPath)) {
    try {
      const result = await refreshTokenAction()
      
      if (result.success) {
        // 토큰 갱신 성공 - refreshTokenAction에서 이미 쿠키를 설정했으므로
        // 단순히 리다이렉트만 처리
        isAuthenticated = true
        
        if (isAuthPath) {
          // /auth 페이지에서 토큰 갱신 성공 시 홈으로 리다이렉트
          return NextResponse.redirect(new URL('/', request.url))
        }
        // 보호된 경로에서는 계속 진행
      }
    } catch (error) {
      console.error('Token refresh failed:', error)
      // 토큰 갱신 실패 시 토큰들 삭제
      if (isProtectedPath) {
        const response = NextResponse.redirect(new URL('/auth', request.url))
        response.cookies.delete('access_token')
        response.cookies.delete('refresh_token')
        return response
      }
    }
  }
  
  // 갱신된 토큰이 있다면 인증 상태 업데이트
  if (!accessToken && refreshToken) {
    // refresh_token만 있는 경우는 아직 인증되지 않은 것으로 처리
    isAuthenticated = false
  }
  
  // 보호된 경로에 접근하려는데 토큰이 없는 경우
  if (isProtectedPath && !isAuthenticated) {
    return NextResponse.redirect(new URL('/auth', request.url))
  }
  
  // 이미 인증된 사용자가 로그인 페이지에 접근하는 경우
  if (isAuthPath && isAuthenticated) {
    return NextResponse.redirect(new URL('/', request.url))
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    // svg/png/jpg/webp/ico 같은 정적 파일은 제외
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}