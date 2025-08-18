'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LogOut, User, Users, X, ChevronRight } from 'lucide-react';
import { logoutAction } from '@/app/actions';
import { useAuthStore } from '@/store/auth-store';
import { AdminTab } from './admin-tab';
import Image from 'next/image';

export function MyPageTab() {
  const router = useRouter();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showAdminTab, setShowAdminTab] = useState(false);
  const [isClosingAdminTab, setIsClosingAdminTab] = useState(false);
  const { user, isAuthenticated, logout } = useAuthStore();

  const handleLogout = async () => {
    try {
      const result = await logoutAction();
      
      if (result.success) {
        // Zustand store에서도 로그아웃
        logout();
        router.push('/auth');
      } else {
        console.error('로그아웃 에러:', result.error);
        // 에러가 발생해도 store는 초기화
        logout();
        router.push('/auth');
      }
    } catch (error) {
      console.error('로그아웃 에러:', error);
      // 에러가 발생해도 store는 초기화
      logout();
      router.push('/auth');
    }
  };

  const menuItems = [
    {
      id: 'profile',
      title: '프로필',
      description: '내 정보 관리',
      icon: <User className="w-5 h-5" />,
    },
    {
      id: 'admin',
      title: '관리자',
      description: '시술 데이터 관리',
      icon: <Users className="w-5 h-5" />,
      onClick: () => setShowAdminTab(true),
      showOnlyForRole: '관리자' // 관리자만 보이도록
    },
  ];

  return (
    <>
      {/* 애니메이션 적용할 내용 영역 */}
      <div className="px-7 slide-in-left">
        {/* 프로필 섹션 */}
        <div className="mb-6">
          <Card className="border-none shadow-none bg-gradient-to-br from-gray-100 via-white to-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm">
                  <Image src="/symbol_facefilter.svg" alt="프로필" width={32} height={32} />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-semibold text-gray-900 truncate">
                    {isAuthenticated ? user?.username : '사용자'}
                  </h2>
                  <div className="flex items-center space-x-3 mt-1">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                      {isAuthenticated ? `No. ${user?.user_id}` : 'Guest'}
                    </span>
                    {isAuthenticated && user?.role && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-200 text-gray-800">
                        {user.role}
                      </span>
                    )}
                  </div>
                  {!isAuthenticated && (
                    <p className="text-sm text-gray-500 mt-1">
                      로그인이 필요합니다
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 메뉴 목록 */}
        <div className="space-y-3">
          {menuItems
            .filter(item => {
              // showOnlyForRole이 있고, 사용자 역할이 일치하지 않으면 숨김
              if (item.showOnlyForRole && user?.role !== item.showOnlyForRole) {
                return false;
              }
              return true;
            })
            .map((item) => (
              <Card key={item.id} className="border-none shadow-none">
                <CardContent>
                  <Button
                    onClick={item.onClick}
                    variant="ghost"
                    className="w-full flex items-center space-x-4 hover:bg-gray-50 transition-colors justify-start p-0 h-auto"
                  >
                    <div className="text-gray-500">
                      {item.icon}
                    </div>
                    <div className="flex-1 text-left">
                      <h3 className="text-sm font-medium text-gray-900">{item.title}</h3>
                      <p className="text-xs text-gray-500">{item.description}</p>
                    </div>
                    <div className="text-gray-400">
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </Button>
                </CardContent>
              </Card>
            ))}
        </div>
        
        {/* 로그아웃 버튼 공간 확보 */}
        <div className="h-32"></div>
      </div>

      {/* 로그아웃 버튼 - 애니메이션과 분리된 fixed 요소 */}
      {!showAdminTab && !isClosingAdminTab && (
        <div className="fixed bottom-18 left-0 right-0 px-7 py-4 bg-white z-40">
          <Button
            onClick={() => setShowLogoutModal(true)}
            variant="outline"
            className="w-full py-5 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
          >
            <LogOut className="w-4 h-4 mr-2" />
            로그아웃
          </Button>
        </div>
      )}

      {/* 로그아웃 확인 모달 */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center p-4 z-50">
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
                onClick={() => setShowLogoutModal(false)}
                variant="outline"
                className="flex-1 text-gray-500 hover:text-gray-700 border-gray-300 hover:border-gray-400"
              >
                취소
              </Button>
              <Button
                onClick={() => {
                  handleLogout();
                  setShowLogoutModal(false);
                }}
                className="flex-1 bg-red-500 hover:bg-red-600"
              >
                로그아웃
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 관리자 탭 슬라이드 오버레이 */}
      {(showAdminTab || isClosingAdminTab) && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50">
          <div className={`absolute top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl transform transition-transform duration-300 slide-in-right ease-in-out ${
            showAdminTab && !isClosingAdminTab ? 'translate-x-0' : 'translate-x-full'
          }`}>
            {/* 헤더 */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mt-1">관리자 페이지</h2>
              <Button
                onClick={() => {
                  setIsClosingAdminTab(true);
                  setTimeout(() => {
                    setShowAdminTab(false);
                    setIsClosingAdminTab(false);
                  }, 300);
                }}
                variant="ghost"
                size="sm"
                className="!text-gray-500 hover:text-gray-600 p-0 h-auto"
              >
                <X className="!w-5 !h-5" />
              </Button>
            </div>
            
            {/* 관리자 탭 내용 */}
            <div className="h-full overflow-y-auto">
              <AdminTab />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
