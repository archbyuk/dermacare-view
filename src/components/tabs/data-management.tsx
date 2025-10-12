'use client';

import { useState, useRef, useEffect } from 'react';
import { Tabs } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import ProductTab from '@/components/tabs/data-management/product-management';
import CostsTab from '@/components/tabs/data-management/costs-management';
import ProceduresManagement from '@/components/tabs/data-management/procedures-management';

export default function DataManagement() {
    const [activeMainTab, setActiveMainTab] = useState('procedures');
    const [indicatorStyle, setIndicatorStyle] = useState({ left: '0px', width: '0px' });
    const tabsRef = useRef<HTMLDivElement>(null);
    const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

    const mainTabs = [
        { id: 'procedures', label: '시술 관리' },
        { id: 'products', label: '상품 관리' },
        { id: 'costs', label: '비용 관리' },
    ];

    // 인디케이터 위치 업데이트
    useEffect(() => {
        const activeIndex = mainTabs.findIndex(tab => tab.id === activeMainTab);
        const activeTabElement = tabRefs.current[activeIndex];
        
        if (activeTabElement && tabsRef.current) {
            const containerRect = tabsRef.current.getBoundingClientRect();
            const tabRect = activeTabElement.getBoundingClientRect();
            
            const left = tabRect.left - containerRect.left;
            const width = tabRect.width;
            
            setIndicatorStyle({
                left: `${left}px`,
                width: `${width}px`
            });
        }
    }, [activeMainTab]);

    return (
        <div className="h-full flex flex-col bg-white p-2">
            <Tabs value={activeMainTab} onValueChange={setActiveMainTab} className="h-full flex flex-col !gap-1">
                {/* 메인 탭 */}
                <div className="border-b border-gray-200 max-w-2xl mx-auto relative">
                    <div 
                        ref={tabsRef}
                        className="flex gap-10 mx-auto justify-center"
                    >
                        {mainTabs.map((tab, index) => (
                            <Button
                                key={tab.id}
                                ref={(el) => {
                                    tabRefs.current[index] = el;
                                }}
                                variant="ghost"
                                size="default"
                                onClick={() => setActiveMainTab(tab.id)}
                                className={`whitespace-nowrap py-2 px-5 transition-all duration-200 font-semibold rounded-none transform-none select-none pointer-events-auto focus:outline-none focus:ring-0 active:transform-none ${
                                    activeMainTab === tab.id 
                                        ? 'text-gray-700' 
                                        : 'text-gray-400'
                                }`}
                            >
                                {tab.label}
                            </Button>
                        ))}
                    </div>
                    
                    {/* 슬라이드 인디케이터 */}
                    <div
                        className="absolute bottom-0 h-0.5 bg-gray-700 transition-all duration-300 ease-out"
                        style={indicatorStyle}
                    />
                </div>
                
                {/* 콘텐츠 영역 */}
                <div className="flex-1 overflow-hidden">
                    {/* 시술 관리 페이지 */}
                    {activeMainTab === 'procedures' && (
                        <div>
                            <ProceduresManagement />
                        </div>
                    )}
                    
                    {/* 상품 관리 페이지 */}
                    {activeMainTab === 'products' && (
                        <div>
                            <ProductTab/>
                        </div>
                    )}
                    
                    {/* 비용 관리 페이지 */}
                    {activeMainTab === 'costs' && (
                        <div>
                            <CostsTab />
                        </div>
                    )}
                </div>
            </Tabs>
        </div>
    );
}

