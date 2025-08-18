'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { debounce } from 'lodash';
import { TreatmentDetailModal } from './treatment-detail-modal';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTreatmentsStore } from '@/store/treatments-store';
import Image from 'next/image';

// 초성 매핑 테이블
const CHOSUNG_MAP: { [key: string]: string } = {
  'ㄱ': '가', 'ㄲ': '까', 'ㄴ': '나', 'ㄷ': '다', 'ㄸ': '따',
  'ㄹ': '라', 'ㅁ': '마', 'ㅂ': '바', 'ㅃ': '빠', 'ㅅ': '사',
  'ㅆ': '싸', 'ㅇ': '아', 'ㅈ': '자', 'ㅉ': '짜', 'ㅊ': '차',
  'ㅋ': '카', 'ㅌ': '타', 'ㅍ': '파', 'ㅎ': '하'
};

// 초성 추출 함수
const extractChosung = (text: string): string => {
  const cho = ['ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
  
  let result = '';
  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i);
    if (charCode >= 44032 && charCode <= 55203) { // 한글 유니코드 범위
      const unicode = charCode - 44032;
      const choIndex = Math.floor(unicode / 588);
      result += cho[choIndex];
    } else {
      result += text[i];
    }
  }
  return result;
};

// 초성 검색 함수
const matchesChosung = (searchTerm: string, targetText: string): boolean => {
  // 검색어가 초성인지 확인
  const isChosungSearch = /^[ㄱ-ㅎ]+$/.test(searchTerm);
  if (!isChosungSearch) return false;
  
  // 대상 텍스트의 초성 추출
  const targetChosung = extractChosung(targetText);
  
  // 초성 매칭 확인
  return targetChosung.includes(searchTerm);
};

// 검색 결과 타입 정의 (API 의존성 제거)
interface SearchResult {
  ID: number;
  Product_Type: 'standard' | 'event';
  Package_Type: string;
  Sell_Price: number;
  Original_Price: number;
  Product_Name?: string;
  elements: string[];
  class_types: string[];
  class_type_count: number;
  Precautions?: string;
}

interface SearchState {
  searchQuery: string;
  searchResults: SearchResult[];
  hasSearched: boolean;
}

export function SearchTab() {
  const [state, setState] = useState<SearchState>({
    searchQuery: '',
    searchResults: [],
    hasSearched: false
  });

  const [selectedCategory, setSelectedCategory] = useState<'all' | 'standard' | 'event'>('all');
  const [sortBy, setSortBy] = useState('latest');

  // 모달 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTreatment, setSelectedTreatment] = useState<{ id: number; type: 'standard' | 'event' } | null>(null);

  // Zustand store에서 캐시된 데이터 가져오기
  const { 
    treatments, 
    loading: storeLoading, 
    error: storeError, 
    fetchTreatments 
  } = useTreatmentsStore();

  // 초기 데이터 로드
  useEffect(() => {
    fetchTreatments();
  }, [fetchTreatments]);

  // 클라이언트 사이드 검색 실행
  const performSearch = useCallback((query: string, category: 'all' | 'standard' | 'event') => {
    // 최소 2글자 이상일 때만 검색
    if (!query.trim() || query.trim().length < 1) {
      setState(prev => ({ 
        ...prev, 
        searchResults: [], 
        hasSearched: false
      }));
      return;
    }

    const searchTerm = query.toLowerCase().trim();
    
    // 캐시된 데이터에서 검색 (성능 최적화)
    const filteredResults = treatments.filter(treatment => {
      // 카테고리 필터링을 먼저 (더 빠른 필터링)
      if (category !== 'all' && treatment.Product_Type !== category) {
        return false;
      }
      
      // 시술명 검색 (가장 빠른 매칭)
      if (treatment.Product_Name?.toLowerCase().includes(searchTerm)) {
        return true;
      }
      
      // 초성 검색 - 시술명
      if (treatment.Product_Name && matchesChosung(searchTerm, treatment.Product_Name)) {
        return true;
      }
      
      // 분류 검색 (class_types)
      if (treatment.class_types?.some(type => type.toLowerCase().includes(searchTerm))) {
        return true;
      }
      
      // 초성 검색 - 분류
      if (treatment.class_types?.some(type => matchesChosung(searchTerm, type))) {
        return true;
      }
      
      // 시술명 검색 (procedure_names)
      if (treatment.procedure_names?.some(procedure => procedure.toLowerCase().includes(searchTerm))) {
        return true;
      }
      
      // 초성 검색 - 시술명 배열
      if (treatment.procedure_names?.some(procedure => matchesChosung(searchTerm, procedure))) {
        return true;
      }
      
      // 상품 설명 검색 (Product_Description)
      if (treatment.Product_Description?.toLowerCase().includes(searchTerm)) {
        return true;
      }
      
      // 초성 검색 - 상품 설명
      if (treatment.Product_Description && matchesChosung(searchTerm, treatment.Product_Description)) {
        return true;
      }

      // 시술 주의사항 검색 - 주의사항
      if (treatment.Precautions?.toLowerCase().includes(searchTerm)) {
        return true;
      }
      
      // 초성 검색 - 주의사항
      if (treatment.Precautions && matchesChosung(searchTerm, treatment.Precautions)) {
        return true;
      }
      
      // 패키지 타입 검색 (Package_Type) - 다양한 검색어 지원
      const packageType = treatment.Package_Type?.toLowerCase();
      if (packageType) {
        // 번들 → 패키지, 번들
        if (packageType === '번들' && (searchTerm === '패키지' || searchTerm === '번들')) {
          return true;
        }
        // 시퀀스 → 코스, 코스 패키지, 시퀀스
        if (packageType === '시퀀스' && (searchTerm === '코스' || searchTerm === '코스 패키지' || searchTerm === '시퀀스')) {
          return true;
        }
        // 단일시술 → 단일시술, 일반 시술, 단일
        if (packageType === '단일시술' && (searchTerm === '단일시술' || searchTerm === '일반 시술' || searchTerm === '단일')) {
          return true;
        }
        // 커스텀 → 커스텀
        if (packageType === '커스텀' && searchTerm === '커스텀') {
          return true;
        }
        // 기존 방식도 유지 (정확한 매칭)
        if (packageType.includes(searchTerm)) {
          return true;
        }
      }
      
      return false;
    });

    // SearchResult 타입으로 변환
    const searchResults: SearchResult[] = filteredResults.map(treatment => ({
      ID: treatment.ID,
      Product_Name: treatment.Product_Name,
      Product_Type: treatment.Product_Type,
      Package_Type: treatment.Package_Type,
      Sell_Price: treatment.Sell_Price,
      Original_Price: treatment.Original_Price,
      elements: treatment.class_types || [],
      class_types: treatment.class_types || [],
      class_type_count: treatment.class_types?.length || 0,
      Precautions: treatment.Precautions
    }));

    setState(prev => ({
      ...prev,
      searchResults,
      hasSearched: true
    }));
  }, [treatments]);

  // 디바운스된 검색 함수 (시간 증가)
  const debouncedSearch = useMemo(
    () => debounce((query: string, category: 'all' | 'standard' | 'event') => {
      performSearch(query, category);
    }, 200),
    [performSearch]
  );

  // 검색어 변경 시 디바운스된 검색 실행
  useEffect(() => {
    debouncedSearch(state.searchQuery, selectedCategory);
    
    // 컴포넌트 언마운트 시 디바운스 취소
    return () => {
      debouncedSearch.cancel();
    };
  }, [state.searchQuery, selectedCategory, debouncedSearch]);

  // 카테고리 변경 시 검색 재실행
  useEffect(() => {
    if (state.hasSearched && state.searchQuery.trim()) {
      performSearch(state.searchQuery, selectedCategory);
    }
  }, [selectedCategory, performSearch, state.hasSearched, state.searchQuery]);

  // 정렬된 결과 계산 (클라이언트 사이드 정렬)
  const getSortedResults = () => {
    const results = [...state.searchResults];

    switch (sortBy) {
      case 'latest':
        // ID 기준 최신순 (높은 ID가 최신)
        results.sort((a, b) => b.ID - a.ID);
        break;
      case 'oldest':
        // ID 기준 오래된순 (낮은 ID가 오래됨)
        results.sort((a, b) => a.ID - b.ID);
        break;
      case 'price_high':
        results.sort((a, b) => b.Sell_Price - a.Sell_Price);
        break;
      case 'price_low':
        results.sort((a, b) => a.Sell_Price - b.Sell_Price);
        break;
      case 'name':
        results.sort((a, b) => (a.Product_Name || '').localeCompare(b.Product_Name || ''));
        break;
    }

    return results;
  };

  const sortedResults = getSortedResults();

  // 시술 상세 모달 열기
  const handleTreatmentClick = (treatment: SearchResult) => {
    setSelectedTreatment({ id: treatment.ID, type: treatment.Product_Type });
    setIsModalOpen(true);
  };

  return (
    <div className="pb-20 px-7 slide-in-right">
      {/* 검색 입력 */}
      <div className="mb-6">
        <div className="relative">
          <Input
            type="text"
            placeholder="시술명, 분류, 상품명으로 검색..."
            value={state.searchQuery}
            onChange={(e) => setState(prev => ({ ...prev, searchQuery: e.target.value }))}
            className="w-full px-4 py-3 pl-12 border-gray-300 text-gray-500"
          />
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* 필터 및 정렬 */}
      {state.hasSearched && (
        <div className="mb-2 flex items-center justify-between">
          {/* 카테고리 필터 */}
          <div className="flex gap-1 overflow-x-auto">
            {[
              { value: 'all' as const, label: 'ALL' },
              { value: 'standard' as const, label: '스탠다드' },
              { value: 'event' as const, label: '이벤트' }
            ].map((category) => (
              <Button
                key={category.value}
                variant="outline"
                size="default"
                onClick={() => setSelectedCategory(category.value)}
                className={`whitespace-nowrap py-0 px-1.5 transition-colors ${
                  selectedCategory === category.value 
                    ? 'bg-gray-400 text-white hover:bg-gray-200' 
                    : 'bg-white text-gray-600 hover:bg-gray-200 hover:text-white border-gray-300'
                }`}
              >
                {category.label}
              </Button>
            ))}
          </div>

          {/* 정렬 옵션 */}
          <Select value={sortBy} onValueChange={(value) => setSortBy(value)}>
            <SelectTrigger className="w-28 bg-white text-gray-600 border-gray-300">
              <SelectValue placeholder="정렬 선택" />
            </SelectTrigger>
            <SelectContent className="w-16 z-10 bg-white border-gray-300 text-gray-500 shadow-lg" position="popper" side="bottom" align="end">
              <SelectItem value="latest" className="w-full text-gray-500 hover:bg-white border-gray-300 text-xs">최신순</SelectItem>
              <SelectItem value="oldest" className="w-full text-gray-500 hover:bg-white border-gray-300 text-xs">오래된순</SelectItem>
              <SelectItem value="price_high" className="w-full text-gray-500 hover:bg-white border-gray-300 text-xs">가격 높은순</SelectItem>
              <SelectItem value="price_low" className="w-full text-gray-500 hover:bg-white border-gray-300 text-xs">가격 낮은순</SelectItem>
              <SelectItem value="name" className="w-full text-gray-500 hover:bg-white border-gray-300 text-xs">이름순</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* 로딩 상태 */}
      {(storeLoading) && (
        <div className="text-center py-8">
          <Image src="/symbol_facefilter.svg" alt="로딩" width={32} height={32} className="animate-spin mx-auto mb-4" />
          <p className="text-sm text-gray-600">로딩 중입니다</p>
        </div>
      )}

      {/* 에러 메시지 */}
      {(storeError) && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{storeError}</p>
        </div>
      )}

      {/* 검색 결과 */}
      {state.hasSearched && !storeLoading && (
        <Card className="border-none shadow-none" key={`search-results-${state.searchQuery}-${selectedCategory}`}>
          <CardContent className="px-3 py-2">
            <div className="mb-4 slide-up">
              <h3 className="text-md font-medium text-gray-900 mb-3">
                검색 결과: {sortedResults.length}개
              </h3>
            </div>

            {sortedResults.length === 0 ? (
              <div className="text-center py-8 slide-up">
                <div className="w-16 h-11 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Image src="/symbol_facefilter.svg" alt="검색 결과 없음" width={32} height={32} />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">검색 결과가 없습니다</h3>
                <p className="text-sm text-gray-500">다른 검색어를 시도해보세요</p>
              </div>
            ) : (
              <div className="space-y-1 slide-up">
                {sortedResults.map((treatment) => (
                  <div 
                    key={`${treatment.ID}-${treatment.Product_Type}`}
                    className="border-b border-gray-100 py-3 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => handleTreatmentClick(treatment)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {treatment.Product_Name || `시술 ${treatment.ID}`}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-xs px-2 py-0.5 rounded-full min-w-fit ${
                            treatment.Package_Type === '단일시술' 
                              ? 'bg-gray-100 text-gray-600' 
                              : treatment.Package_Type === '번들'
                              ? 'bg-orange-50 text-orange-400'
                              : treatment.Package_Type === '시퀀스'
                              ? 'bg-purple-50 text-purple-400'
                              : treatment.Package_Type === '커스텀'
                              ? 'bg-red-50 text-red-400'
                              : 'bg-gray-100 text-gray-400'
                          }`}>
                            {treatment.Package_Type === '단일시술' ? '단일시술' : 
                            treatment.Package_Type === '번들' ? '패키지' :
                            treatment.Package_Type === '시퀀스' ? '코스 패키지' :
                            treatment.Package_Type === '커스텀' ? '커스텀' : treatment.Package_Type}
                          </span>
                          {treatment.elements && treatment.elements.length > 0 && (
                            <span className="text-xs text-gray-500 truncate">
                              #{[...new Set(treatment.elements)].slice(0, 3).join(' #')}
                              {[...new Set(treatment.elements)].length > 3 && '...'}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right ml-3 flex-shrink-0">
                        {treatment.Original_Price > treatment.Sell_Price && (
                          <p className="text-xs text-gray-400 line-through mb-0.5">
                            {treatment.Original_Price.toLocaleString()}원
                          </p>
                        )}
                        <p className="text-sm font-medium text-gray-900 pr-1.5">
                          {treatment.Sell_Price.toLocaleString()}원
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* 초기 상태 */}
      {!state.hasSearched && !storeLoading && (
        <Card className="border-none shadow-none">
          <CardContent className="px-6 py-2">
            <div className="text-center py-8">
              <div className="w-16 h-11 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Image src="/symbol_facefilter.svg" alt="검색" width={32} height={32} />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">시술을 검색해보세요</h3>
              <p className="text-sm text-gray-500">시술명, 분류, 상품명으로 검색할 수 있습니다</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 시술 상세 모달 */}
      {isModalOpen && selectedTreatment && (
        <TreatmentDetailModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedTreatment(null);
          }}
          productId={selectedTreatment.id}
          productType={selectedTreatment.type}
        />
      )}
    </div>
  );
}
