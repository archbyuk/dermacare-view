'use client';

import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TopNavProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
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
  },
  mypage: {
    title: '마이페이지',
    description: '내 정보 확인'
  }
};

export function TopNav({ activeTab, onTabChange }: TopNavProps) {
  const handleSearchClick = () => {
    onTabChange('search');
  };

  const currentTab = tabInfo[activeTab as keyof typeof tabInfo];

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
      <div className="max-w-lg mx-auto px-4">
        <div className="flex items-center justify-between py-3">
          {/* 탭 정보 */}
          <div className="flex-1">
            <h1 className="text-lg font-semibold text-gray-900">
              {currentTab?.title}
            </h1>
            <p className="text-sm text-gray-500">
              {currentTab?.description}
            </p>
          </div>

          {/* 검색 버튼 */}
          <Button
            onClick={handleSearchClick}
            variant="outline"
            size="sm"
            className="mt-1 h-6 px-8 bg-white border-gray-200 hover:bg-gray-100 hover:border-gray-300 text-gray-600 hover:text-gray-700 transition-colors rounded-2xl border-none shadow-none"
            title="검색"
          >
            <Search className="!w-5 !h-5" />
            {/* <span className="text-xs mt-1">시술 검색하기</span> */}
          </Button>
        </div>
      </div>
    </nav>
  );
}
