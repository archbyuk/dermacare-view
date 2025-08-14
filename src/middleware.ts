import { NextResponse, NextRequest } from 'next/server'
import { refreshTokenAction } from '@/app/actions'

export async function middleware(request: NextRequest) {
  const accessToken = request.cookies.get('access_token')
  const refreshToken = request.cookies.get('refresh_token')
  
  // 모든 경로에서 access_token이 없지만 refresh_token이 있는 경우 토큰 갱신 시도
  // (treatment_list, auth, 기타 모든 페이지에서 동작)
  if (!accessToken && refreshToken) {
    try {
      // 기존 refreshTokenAction 사용 (쿠키에서 직접 refresh_token 읽어옴)
      const result = await refreshTokenAction()
      
      if (result.success) {
        // 토큰 갱신 성공, 새로운 응답 생성
        const newResponse = NextResponse.next()
        
        // 새로운 토큰을 쿠키에 설정 (Server Action에서 이미 설정됨)
        // 여기서는 응답만 반환
        return newResponse
      }
    } catch (error) {
      // 토큰 갱신 실패 시 무시하고 계속 진행
      console.error('Token refresh failed:', error)
    }
  }
  
  const isAuthenticated = !!accessToken
  
  // 보호된 경로들 (인증 필요)
  const protectedPaths = ['/']
  const isProtectedPath = protectedPaths.some(path =>
    request.nextUrl.pathname.startsWith(path)
  )
  
  // 인증된 사용자가 접근할 수 없는 경로들 (로그인 페이지 등)
  const authPaths = ['/auth']
  const isAuthPath = authPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  )

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
    '/((?!api|_next/static|_next/image|favicon.ico|auth|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}
