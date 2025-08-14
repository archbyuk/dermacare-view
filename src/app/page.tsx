'use client';

import { useState } from 'react';
import { BottomNav } from '@/components/nav/bottom-nav';
import { TreatmentListTab } from '@/components/tabs/treatment-list-tab';
import { AppointmentsTab } from '@/components/tabs/appointments-tab';
import { ProfileTab } from '@/components/tabs/profile-tab';

export default function MainPage() {
  const [activeTab, setActiveTab] = useState('treatments');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'treatments':
        return <TreatmentListTab />;
      case 'appointments':
        return <AppointmentsTab />;
      case 'profile':
        return <ProfileTab />;
      default:
        return <TreatmentListTab />;
    }
  };

  return (
    <div className="min-h-screen bg-white pb-20">
      <div className="max-w-lg mx-auto px-4 py-8">
        {renderTabContent()}
      </div>
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}