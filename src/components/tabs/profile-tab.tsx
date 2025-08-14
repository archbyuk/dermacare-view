'use client';

import { logoutAction } from '@/app/actions';

export function ProfileTab() {
  const handleLogout = async () => {
    try {
      await logoutAction();
    } catch (error) {
      console.error('로그아웃 에러:', error);
    }
  };

  return (
    <div>
      {/* 헤더 */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">프로필</h1>
        <p className="text-sm text-gray-500">내 정보 및 설정</p>
      </div>

      {/* 메인 콘텐츠 영역 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-green-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">프로필 기능 준비 중</h3>
          <p className="text-sm text-gray-500 mb-6">곧 프로필 기능을 이용할 수 있습니다</p>
          
          <button 
            onClick={handleLogout}
            className="bg-red-500 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
          >
            로그아웃
          </button>
        </div>
      </div>
    </div>
  );
}
