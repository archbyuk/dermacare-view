'use client';

import { useState, useEffect } from 'react';
import { TopNav } from '@/components/nav/top-nav';
import { BottomNav } from '@/components/nav/bottom-nav';
import { TreatmentListTab } from '@/components/tabs/treatment-list-tab';
import { SearchTab } from '@/components/tabs/search-tab';
import { AdminTab } from '@/components/tabs/admin-tab';
import { bfcacheHandler } from '@/lib/utils';

export default function MainPage() {
  const [activeTab, setActiveTab] = useState('treatments');

  // iOS Safari bfcache 대응을 위한 이벤트 리스너
  useEffect(() => {
    // bfcache 복원 감지
    const handlePageShow = (event: PageTransitionEvent) => {
      bfcacheHandler.handlePageShow(event);
    };

    // 페이지 포커스 시 인증 상태 확인
    const handleFocus = () => {
      bfcacheHandler.handleFocus();
    };

    // 가시성 변경 시 인증 상태 확인
    const handleVisibilityChange = () => {
      bfcacheHandler.handleVisibilityChange();
    };

    // 이벤트 리스너 등록
    window.addEventListener('pageshow', handlePageShow);
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // 컴포넌트 언마운트 시 이벤트 리스너 제거
    return () => {
      window.removeEventListener('pageshow', handlePageShow);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'treatments':
        return <TreatmentListTab />;
      case 'search':
        return <SearchTab />;
      case 'admin':
        return <AdminTab />;
      default:
        return <TreatmentListTab />;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* 상단 네비게이션바 */}
      <TopNav activeTab={activeTab} />
      
      {/* 메인 콘텐츠 */}
      <div className="pt-20 pb-10">
        <div className="max-w-lg mx-auto px-3 py-6">
          {renderTabContent()}
        </div>
      </div>
      
      {/* 하단 네비게이션바 */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}