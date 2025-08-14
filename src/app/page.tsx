'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // 메인 페이지 접속 시 자동으로 로그인 페이지로 리다이렉트
    router.replace('/auth');
  }, [router]);

  // 여기도 추후 디벨롭
  return (
    <div className="min-h-screen from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">리다이렉트 중...</p>
      </div>
    </div>
  );
}