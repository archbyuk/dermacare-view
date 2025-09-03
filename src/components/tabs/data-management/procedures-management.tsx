'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { debounce } from 'lodash';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

import { searchElements, searchBundles, searchCustoms, searchSequences } from '@/utils/searchUtils';
import BundleTab from './procedure-management/bundle/bundle-tab';
import ElementTab from './procedure-management/element/element-tab';
import CustomTab from './procedure-management/custom/custom-tab';
import SequenceTab from './procedure-management/sequence/sequence-tab';
import { useProceduresStore } from '@/store/procedures-store';

type ProcedureSubTab = 'all' | 'element' | 'bundle' | 'custom' | 'sequence';

export default function ProceduresManagement() {
  const [activeSubTab, setActiveSubTab] = useState<ProcedureSubTab>('element');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

  // Zustand store 사용
  const {
    elements,
    bundles,
    customs,
    sequences,
    loading,
    error,
    loadAllProcedures,
    forceRefreshAllProcedures
  } = useProceduresStore();

  // 데이터 로드 함수
  const loadData = useCallback(async () => {
    try {
      await loadAllProcedures();
    } catch (err: unknown) {
      // 에러는 store에서 처리되므로 여기서는 추가 처리 불필요
      console.error('데이터 로드 중 오류:', err);
    }
  }, [loadAllProcedures]);

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

  const subTabs = [
    { id: 'element' as ProcedureSubTab, label: '단일시술' },
    { id: 'bundle' as ProcedureSubTab, label: '패키지' },
    { id: 'custom' as ProcedureSubTab, label: '커스텀' },
    { id: 'sequence' as ProcedureSubTab, label: '코스 패키지' }
  ];

  // 현재 탭에 따른 placeholder 텍스트
  const getSearchPlaceholder = () => {
    switch (activeSubTab) {
      case 'element':
        return '단일시술을 검색해주세요';
      case 'bundle':
        return '패키지를 검색해주세요';
      case 'custom':
        return '커스텀을 검색해주세요';
      case 'sequence':
        return '코스 패키지를 검색해주세요';
      default:
        return '검색어를 입력해주세요';
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
            {activeSubTab === 'element' && (
            <ElementTab 
                searchQuery={debouncedSearchQuery}
            />
            )}
            {activeSubTab === 'bundle' && (
            <BundleTab 
                searchQuery={debouncedSearchQuery}
            />
            )}
            {activeSubTab === 'custom' && (
            <CustomTab 
                searchQuery={debouncedSearchQuery}
            />
            )}
            {activeSubTab === 'sequence' && (
            <SequenceTab 
                searchQuery={debouncedSearchQuery}
            />
            )}
        </div>
    </div>
  );
}
