'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { debounce } from 'lodash';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, RefreshCw } from 'lucide-react';
import MembershipTab from './products-management/membership-tab';
import StandardTab from './products-management/standard-tab';
import EventTab from './products-management/event-tab';
import { searchMembershipsByName } from '@/utils/membership-utils'; 
import { ProductGroupedResponse } from '@/api/products-api';
import { useProductsStore } from '@/store/products-store';

type ProductSubTab = 'standard' | 'event' | 'membership';

export default function ProductManagement() {
  const [activeSubTab, setActiveSubTab] = useState<ProductSubTab>('standard');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

    // Zustand store에서 데이터 가져오기
  const {
    standardProducts,
    eventProducts,
    memberships,
    loading,
    error,
    loadStandardProducts,
    loadEventProducts,
    loadMemberships,
    forceRefreshStandard,
    forceRefreshEvent,
    forceRefreshMemberships
  } = useProductsStore();

  // 초기 데이터 로드 (Standard만)
  const loadInitialData = useCallback(async () => {
    await loadStandardProducts();
  }, [loadStandardProducts]);

  // 탭 전환 시 데이터 로드
  const loadTabData = useCallback(async (tab: ProductSubTab) => {
    switch (tab) {
      case 'standard':
        await loadStandardProducts();
        break;
      case 'event':
        await loadEventProducts();
        break;
      case 'membership':
        await loadMemberships();
        break;
    }
  }, [loadStandardProducts, loadEventProducts, loadMemberships]);

  // 초기 데이터 로드 (Standard만)
  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // 탭 전환 시 데이터 로드
  useEffect(() => {
    loadTabData(activeSubTab);
  }, [activeSubTab, loadTabData]);

  // 강제 새로고침 함수 (1시간 캐시 무효화)
  const handleForceRefresh = useCallback(async () => {
    switch (activeSubTab) {
      case 'standard':
        await forceRefreshStandard();
        break;
      case 'event':
        await forceRefreshEvent();
        break;
      case 'membership':
        await forceRefreshMemberships();
        break;
    }
  }, [activeSubTab, forceRefreshStandard, forceRefreshEvent, forceRefreshMemberships]);

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
  const filteredStandardProducts = useMemo(() => {
    if (!debouncedSearchQuery.trim()) {
      return standardProducts;
    }
    
    // 검색어로 필터링 (시술 이름과 상품 이름으로 검색)
    return standardProducts.filter((product: ProductGroupedResponse) => {
      const searchTerm = debouncedSearchQuery.toLowerCase();
      
      // 안전한 검색을 위해 null 체크 추가
      const procedureName = product.procedure_info?.name || '';
      const procedureDescription = product.procedure_info?.description || '';
      
      return (
        procedureName.toLowerCase().includes(searchTerm) ||
        procedureDescription.toLowerCase().includes(searchTerm) ||
        product.products?.standard?.some(standardProduct => {
          const standardName = standardProduct.info_standard?.name || '';
          const standardDescription = standardProduct.info_standard?.description || '';
          return (
            standardName.toLowerCase().includes(searchTerm) ||
            standardDescription.toLowerCase().includes(searchTerm)
          );
        }) || false
      );
    });
  }, [standardProducts, debouncedSearchQuery]);

  const filteredEventProducts = useMemo(() => {
    if (!debouncedSearchQuery.trim()) {
      return eventProducts;
    }
    
    // 검색어로 필터링 (시술 이름과 상품 이름으로 검색)
    return eventProducts.filter((product: ProductGroupedResponse) => {
      const searchTerm = debouncedSearchQuery.toLowerCase();
      
      // 안전한 검색을 위해 null 체크 추가
      const procedureName = product.procedure_info?.name || '';
      const procedureDescription = product.procedure_info?.description || '';
      
      return (
        procedureName.toLowerCase().includes(searchTerm) ||
        procedureDescription.toLowerCase().includes(searchTerm) ||
        product.products?.event?.some(eventProduct => {
          const eventName = eventProduct.info_event?.name || '';
          const eventDescription = eventProduct.info_event?.description || '';
          return (
            eventName.toLowerCase().includes(searchTerm) ||
            eventDescription.toLowerCase().includes(searchTerm)
          );
        }) || false
      );
    });
  }, [eventProducts, debouncedSearchQuery]);

  const filteredMemberships = useMemo(() => 
    searchMembershipsByName(memberships, debouncedSearchQuery), 
    [memberships, debouncedSearchQuery]
  );

  // 🔥 검색 중인지 여부 (페이지네이션 제어용)
  const isSearching = useMemo(() => debouncedSearchQuery.trim().length > 0, [debouncedSearchQuery]);

  const subTabs = [
    { id: 'standard' as ProductSubTab, label: '스탠다드' },
    { id: 'event' as ProductSubTab, label: '이벤트' },
    { id: 'membership' as ProductSubTab, label: '멤버십' }
  ];

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

        {/* 검색 입력 및 새로고침 */}
        <div className="mb-4 px-5">
            <div className="flex gap-3 items-center">
                <div className="relative flex-1">
                    <Input
                        type="text"
                        placeholder={`${activeSubTab === 'standard' ? 'Standard' : activeSubTab === 'event' ? 'Event' : 'Membership'} Product를 검색해주세요`}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-4 py-3 pl-12 border-gray-300 text-gray-500"
                    />
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                        <Search className="w-5 h-5 text-gray-400" />
                    </div>
                </div>
                <div className="flex flex-col gap-2">
                    <Button
                        onClick={handleForceRefresh}
                        disabled={loading}
                        variant="outline"
                        size="sm"
                        className="p-2"
                        title={loading ? '새로고침 중...' : '새로고침'}
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </Button>
                    
                </div>
            </div>
        </div>
      
        {/* 서브 탭 내용 */}
        <div>
            {activeSubTab === 'standard' && (
                <StandardTab 
                    products={filteredStandardProducts}
                    loading={loading}
                    error={error}
                    searchQuery={debouncedSearchQuery}
                    onRefresh={forceRefreshStandard}
                    totalProducts={standardProducts.length}
                    isSearching={isSearching}
                />
            )}
            {activeSubTab === 'event' && (
                <EventTab 
                    products={filteredEventProducts}
                    loading={loading}
                    error={error}
                    onRefresh={forceRefreshEvent}
                />
            )}
            {activeSubTab === 'membership' && (
                <MembershipTab 
                    memberships={filteredMemberships}
                    loading={loading}
                    error={error}
                    searchQuery={debouncedSearchQuery}
                    onRefresh={forceRefreshMemberships}
                    totalMemberships={memberships.length}
                />
            )}
        </div>
    </div>
  );
}
