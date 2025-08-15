'use client';

import { logoutAction } from '@/app/actions';

interface TopNavProps {
  activeTab: string;
}

const tabInfo = {
  treatments: {
    title: '시술목록',
    description: '모든 시술을 확인하세요'
  },
  search: {
    title: '검색',
    description: '원하는 시술을 찾아보세요'
  },
  admin: {
    title: '관리자',
    description: '엑셀 파일 업로드 및 관리'
  }
};

export function TopNav({ activeTab }: TopNavProps) {
  const handleLogout = async () => {
    try {
      await logoutAction();
    } catch (error) {
      console.error('로그아웃 에러:', error);
    }
  };

  const currentTab = tabInfo[activeTab as keyof typeof tabInfo];

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
      <div className="max-w-lg mx-auto px-4">
        <div className="flex items-center justify-between py-3">
          {/* 탭 정보 */}
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-gray-900">
              {currentTab?.title}
            </h1>
            <p className="text-sm text-gray-500">
              {currentTab?.description}
            </p>
          </div>

          {/* 로그아웃 버튼 */}
          <button
            onClick={handleLogout}
            className="ml-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="로그아웃"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </nav>
  );
}
