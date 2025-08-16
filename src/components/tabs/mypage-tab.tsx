'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LogOut, User, Settings, HelpCircle, Shield } from 'lucide-react';
import { logoutAction } from '@/app/actions';
import Image from 'next/image';

export function MyPageTab() {
  const router = useRouter();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = async () => {
    try {
      const result = await logoutAction();
      
      if (result.success) {
        router.push('/auth');
      } else {
        console.error('로그아웃 에러:', result.error);
        router.push('/auth');
      }
    } catch (error) {
      console.error('로그아웃 에러:', error);
      router.push('/auth');
    }
  };

  const menuItems = [
    {
      id: 'profile',
      title: '프로필',
      description: '내 정보 관리',
      icon: <User className="w-5 h-5" />,
      onClick: () => console.log('프로필 클릭')
    },
    {
      id: 'settings',
      title: '설정',
      description: '앱 설정',
      icon: <Settings className="w-5 h-5" />,
      onClick: () => console.log('설정 클릭')
    },
    {
      id: 'help',
      title: '도움말',
      description: '자주 묻는 질문',
      icon: <HelpCircle className="w-5 h-5" />,
      onClick: () => console.log('도움말 클릭')
    },
    {
      id: 'privacy',
      title: '개인정보처리방침',
      description: '개인정보 보호',
      icon: <Shield className="w-5 h-5" />,
      onClick: () => console.log('개인정보처리방침 클릭')
    }
  ];

  return (
    <div className="pb-1 px-7 slide-in-left">
      {/* 프로필 섹션 */}
      <div className="mb-4">
        <Card className="border-none shadow-none bg-gradient-to-r from-gray-50 to-gray-100">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                <Image src="/symbol_facefilter.svg" alt="프로필" width={32} height={32} />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-gray-900">사용자</h2>
                <p className="text-sm text-gray-600">dermacare@example.com</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 메뉴 목록 */}
      <div className="space-y-3">
        {menuItems.map((item) => (
          <Card key={item.id} className="border-none shadow-none">
            <CardContent className="p-0">
              <button
                onClick={item.onClick}
                className="w-full p-4 flex items-center space-x-3 hover:bg-gray-50 transition-colors"
              >
                <div className="text-gray-500">
                  {item.icon}
                </div>
                <div className="flex-1 text-left">
                  <h3 className="text-sm font-medium text-gray-900">{item.title}</h3>
                  <p className="text-xs text-gray-500">{item.description}</p>
                </div>
                <div className="text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 로그아웃 버튼 */}
      <div className="mt-8">
        <Button
          onClick={() => setShowLogoutModal(true)}
          variant="outline"
          className="w-full py-3 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
        >
          <LogOut className="w-4 h-4 mr-2" />
          로그아웃
        </Button>
      </div>

      {/* 로그아웃 확인 모달 */}
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
    </div>
  );
}
