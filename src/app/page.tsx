'use client';

import { useState } from 'react';
import { TopNav } from '@/components/nav/top-nav';
import { BottomNav } from '@/components/nav/bottom-nav';
import { TreatmentListTab } from '@/components/tabs/treatment-list-tab';
import { SearchTab } from '@/components/tabs/search-tab';
import { AdminTab } from '@/components/tabs/admin-tab';
import { MyPageTab } from '@/components/tabs/mypage-tab';

export default function MainPage() {
  const [activeTab, setActiveTab] = useState('treatments');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'treatments':
        return <TreatmentListTab />;
      case 'search':
        return <SearchTab />;
      case 'admin':
        return <AdminTab />;
      case 'mypage':
        return <MyPageTab />;
      default:
        return <TreatmentListTab />;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* 상단 네비게이션바 */}
      <TopNav activeTab={activeTab} onTabChange={setActiveTab} />
      
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