'use client';

import { useState } from 'react';
import { GLB } from '@/components/navigation/global-nav';
import { FNB } from '@/components/navigation/footer-nav';
import { ProductList } from '@/components/tabs/product-list';
import { ProductSearch } from '@/components/tabs/product-search';
import { MyPage } from '@/components/tabs/mypage';
import { useModalStore } from '@/store/modal-store';

export default function MainPage() {
    const [activeTab, setActiveTab] = useState('treatments');
    const { activeModal } = useModalStore();

    // 탭 컨텐츠 렌더링
    const renderTabContent = () => {
        switch (activeTab) {
            case 'treatments':
                return <ProductList />;

            case 'search':
                return <ProductSearch />;
            
            case 'mypage':
                return <MyPage />;
            
            default:
                return <ProductList />;
        }
    };

    return (
        <div className="min-h-screen bg-white">
            {/* 상단 네비게이션바 - 항상 표시 */}
            <GLB activeTab={activeTab} onTabChange={setActiveTab} />
            
            {/* 메인 콘텐츠 */}
            <div className="pt-20 pb-10">
                <div className="max-w-lg mx-auto px-3 py-6">
                    {renderTabContent()}
                </div>
            </div>
            
            {/* 하단 네비게이션바 - 모달이 열려있으면 숨김 */}
            {!activeModal && <FNB activeTab={activeTab} onTabChange={setActiveTab} />}
        </div>
    );
}