'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { debounce } from 'lodash';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { getConsumablesList, ConsumableResponse } from '@/api/consumables-api';
import { getGlobalSettings, GlobalResponse } from '@/api/global-api';
import GlobalCostsTab from './costs-management/global-costs-tab';
import ConsumablesTab from './costs-management/consumables-tab';


type CostsSubTab = 'labor' | 'consumables' | 'global';

export default function CostsTab() {
    const [activeSubTab, setActiveSubTab] = useState<CostsSubTab>('consumables');
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

    // 데이터 상태
    const [globalSettings, setGlobalSettings] = useState<GlobalResponse | null>(null);
    const [consumables, setConsumables] = useState<ConsumableResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // 데이터 로드 함수
    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            
            // 소모품 데이터 로드
            const consumablesData = await getConsumablesList();
            setConsumables(consumablesData);
            
            // Global 설정 데이터 로드
            const globalData = await getGlobalSettings();
            setGlobalSettings(globalData);
            
        } 
        
        catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            }
            
            else {
                setError('알 수 없는 오류가 발생했습니다');
            }
            
        } finally {
            setLoading(false);
        }
    }, []);

    // 데이터 로드
    useEffect(() => {
        loadData();
    }, [loadData]);

    // 검색 실행 함수
    const performSearch = useCallback((query: string) => {
        // 최소 1글자 이상일 때만 검색
        if (!query.trim() || query.trim().length < 1) {
            setDebouncedSearchQuery('');
            return;
        }

        const searchTerm = query.toLowerCase().trim();
        setDebouncedSearchQuery(searchTerm);
    }, []);

    // 디바운스된 검색 함수
    const debouncedSearch = useMemo(
        () => debounce((query: string) => {
            performSearch(query);
        }, 200),
        [performSearch]
    );

    // 검색어 변경 시 디바운스된 검색 실행
    useEffect(() => {
        debouncedSearch(searchQuery);
        
        // 컴포넌트 언마운트 시 디바운스 취소
        return () => {
            debouncedSearch.cancel();
        };
    }, [searchQuery, debouncedSearch]);

    // 필터링된 데이터 계산
    const filteredConsumables = useMemo(() => 
        consumables.filter(item => 
            !debouncedSearchQuery || 
            item.name.toLowerCase().includes(debouncedSearchQuery) ||
            (item.description && item.description.toLowerCase().includes(debouncedSearchQuery))
        ), 
        [consumables, debouncedSearchQuery]
    );

    const subTabs = [
        { id: 'consumables' as CostsSubTab, label: '소모품 관리' },
        { id: 'labor' as CostsSubTab, label: '인건비 관리' },
    ];

    // 검색 플레이스홀더 동적 변경
    const getSearchPlaceholder = () => {
        switch (activeSubTab) {
            case 'labor':
                return '역할명, 설명으로 검색...';
            case 'consumables':
                return '소모품명, 코드로 검색...';
            default:
                return '검색...';
        }
    };

    return (
        <div className="space-y-3 px-3">
            {/* 서브 탭 네비게이션 */}
            <div className="flex gap-0.5 overflow-x-auto justify-center mt-2">
                {subTabs.map((tab) => (
                    <Button
                        key={tab.id}
                        variant="ghost"
                        size="default"
                        onClick={() => setActiveSubTab(tab.id)}
                        className={`whitespace-nowrap py-1 px-4 transition-all duration-300 min-w-[20vw] max-w-[20vw] ${
                            activeSubTab === tab.id 
                                ? 'bg-gray-50 text-gray-900 font-semibold' 
                                : 'text-gray-400 font-semibold hover:bg-gray-50 hover:text-gray-800'
                        }`}
                    >
                        {tab.label}
                    </Button>
                ))}
            </div>

            {/* 검색 입력 */}
            <div className="mb-4 px-5">
                <div className="relative">
                    <Input
                        type="text"
                        placeholder={getSearchPlaceholder()}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-4 py-3 pl-12 border-gray-300 text-gray-500"
                    />
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                        <Search className="w-5 h-5 text-gray-400" />
                    </div>
                </div>
            </div>
            
            {/* 서브 탭 내용 */}
            <div>
                {activeSubTab === 'labor' && (
                    <GlobalCostsTab 
                        globalSettings={globalSettings}
                        loading={loading}
                        error={error}
                        searchQuery={debouncedSearchQuery}
                        onRefresh={loadData}
                    />
                )}
                {activeSubTab === 'consumables' && (
                    <ConsumablesTab 
                        consumables={filteredConsumables}
                        loading={loading}
                        error={error}
                        searchQuery={debouncedSearchQuery}
                        onRefresh={loadData}
                        totalConsumables={consumables.length}
                    />
                )}
            </div>
        </div>
    );
}
