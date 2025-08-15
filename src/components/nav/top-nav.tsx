'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { logoutAction } from '@/app/actions';
import { Button } from '@/components/ui/button';

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
  const router = useRouter();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = async () => {
    try {
      const result = await logoutAction();
      
      if (result.success) {
        // 로그아웃 성공 시 로그인 페이지로 리다이렉트
        router.push('/auth');
      } else {
        // 에러가 발생해도 쿠키는 삭제되었으므로 로그인 페이지로 리다이렉트
        console.error('로그아웃 에러:', result.error);
        router.push('/auth');
      }
    } catch (error) {
      console.error('로그아웃 에러:', error);
      // 에러가 발생해도 로그인 페이지로 리다이렉트
      router.push('/auth');
    }
  };

  const openLogoutModal = () => {
    setShowLogoutModal(true);
  };

  const closeLogoutModal = () => {
    setShowLogoutModal(false);
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
          <Button
            onClick={openLogoutModal}
            variant="ghost"
            size="sm"
            className="ml-4 text-gray-400 hover:text-gray-600"
            title="로그아웃"
          >
            <LogOut className="w-8 h-8" />
          </Button>
        </div>
      </div>

      {/* 로그아웃 Confirm 모달 */}
      {showLogoutModal && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-[70vw] shadow-xl mx-4">
            <div className="flex items-center mb-4">
              <LogOut className="w-6 h-6 text-red-500 mr-3" />
              <h3 className="text-lg font-medium text-gray-900">로그아웃</h3>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              정말 로그아웃하시겠습니까?
            </p>
            <div className="flex gap-3">
              <Button
                onClick={closeLogoutModal}
                variant="outline"
                className="flex-1 text-gray-500 hover:text-gray-700 border-gray-300 hover:border-gray-400"
              >
                취소
              </Button>
              <Button
                onClick={() => {
                  handleLogout();
                  closeLogoutModal();
                }}
                className="flex-1 bg-red-500 hover:bg-red-600"
              >
                로그아웃
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
