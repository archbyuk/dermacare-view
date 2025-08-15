'use client';

import { useState, useEffect, useCallback } from 'react';
import { searchProducts, SearchResult } from '@/api/search-api';
import { TreatmentDetailModal } from './treatment-detail-modal';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Image from 'next/image';

interface SearchState {
  searchQuery: string;
  searchResults: SearchResult[];
  loading: boolean;
  error: string | null;
  hasSearched: boolean;
  pagination: {
    page: number;
    page_size: number;
    total_count: number;
    total_pages: number;
  };
}

export function SearchTab() {
  const [state, setState] = useState<SearchState>({
    searchQuery: '',
    searchResults: [],
    loading: false,
    error: null,
    hasSearched: false,
    pagination: {
      page: 1,
      page_size: 30,
      total_count: 0,
      total_pages: 0
    }
  });

  const [selectedCategory, setSelectedCategory] = useState<'all' | 'standard' | 'event'>('all');
  const [sortBy, setSortBy] = useState('latest');

  // 모달 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTreatment, setSelectedTreatment] = useState<{ id: number; type: 'standard' | 'event' } | null>(null);

  // 검색 실행
  const handleSearch = useCallback(async (page: number = 1) => {
    if (!state.searchQuery.trim()) {
      setState(prev => ({ 
        ...prev, 
        searchResults: [], 
        hasSearched: false,
        pagination: {
          page: 1,
          page_size: 30,
          total_count: 0,
          total_pages: 0
        }
      }));
      return;
    }

    try {
      setState(prev => ({ ...prev, loading: true, error: null, hasSearched: true }));
      
      const response = await searchProducts({
        q: state.searchQuery.trim(),
        product_type: selectedCategory,
        page,
        page_size: 30
      });

      setState(prev => ({
        ...prev,
        searchResults: response.data,
        loading: false,
        pagination: response.pagination
      }));
    } catch (error: unknown) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : '검색에 실패했습니다.',
        loading: false
      }));
    }
  }, [state.searchQuery, selectedCategory]);

  // 검색어 변경 시 자동 검색 (디바운싱)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (state.searchQuery.trim()) {
        handleSearch(1);
      } else {
        setState(prev => ({ 
          ...prev, 
          searchResults: [], 
          hasSearched: false,
          pagination: {
            page: 1,
            page_size: 30,
            total_count: 0,
            total_pages: 0
          }
        }));
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [state.searchQuery, handleSearch]);

  // 카테고리 변경 시 검색 재실행
  useEffect(() => {
    if (state.hasSearched && state.searchQuery.trim()) {
      handleSearch(1);
    }
  }, [selectedCategory, handleSearch, state.hasSearched, state.searchQuery]);

  // 정렬된 결과 계산 (클라이언트 사이드 정렬)
  const getSortedResults = () => {
    const results = [...state.searchResults];

    switch (sortBy) {
      case 'latest':
        // 서버에서 이미 정렬된 결과를 사용하므로 그대로 반환
        break;
      case 'oldest':
        results.reverse();
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

  // 페이지 변경
  const handlePageChange = (newPage: number) => {
    handleSearch(newPage);
  };

  return (
    <div className="pb-20 px-4">
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
          <div className="flex gap-2">
            {[
              { value: 'all' as const, label: '전체' },
              { value: 'standard' as const, label: '일반' },
              { value: 'event' as const, label: '이벤트' }
            ].map((category) => (
              <Button
                key={category.value}
                variant={selectedCategory === category.value ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.value)}
                className={selectedCategory === category.value 
                  ? "bg-gray-500 text-white hover:bg-gray-200" 
                  : "bg-white text-gray-600 hover:bg-gray-200 hover:text-white border-gray-400"
                }
              >
                {category.label}
              </Button>
            ))}
          </div>

          {/* 정렬 옵션 */}
          <Select value={sortBy} onValueChange={(value) => setSortBy(value)}>
            <SelectTrigger className="w-32 bg-white text-gray-600 border-gray-300">
              <SelectValue placeholder="정렬 선택" />
            </SelectTrigger>
            <SelectContent className="w-24 z-10 bg-white border-gray-300 text-gray-500 shadow-lg" position="popper" side="bottom" align="end">
              <SelectItem value="latest" className="text-gray-500 hover:bg-white border-gray-300">최신순</SelectItem>
              <SelectItem value="oldest" className="text-gray-500 hover:bg-white border-gray-300">오래된순</SelectItem>
              <SelectItem value="price_high" className="text-gray-500 hover:bg-white border-gray-300">가격 높은순</SelectItem>
              <SelectItem value="price_low" className="text-gray-500 hover:bg-white border-gray-300">가격 낮은순</SelectItem>
              <SelectItem value="name" className="text-gray-500 hover:bg-white border-gray-300">이름순</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* 로딩 상태 */}
      {state.loading && (
        <div className="text-center py-8">
          <Image src="/symbol_facefilter.svg" alt="로딩" width={32} height={32} className="animate-spin mx-auto mb-4" />
          <p className="text-sm text-gray-600">로딩 중입니다</p>
        </div>
      )}

      {/* 에러 메시지 */}
      {state.error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{state.error}</p>
        </div>
      )}

      {/* 검색 결과 */}
      {state.hasSearched && !state.loading && (
        <Card className="border-none shadow-none">
          <CardContent className="px-3 py-2">
            <div className="mb-4">
              <h3 className="text-md font-medium text-gray-900 mb-3">
                검색 결과: {state.pagination.total_count}개
              </h3>
            </div>

            {sortedResults.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-11 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Image src="/symbol_facefilter.svg" alt="검색 결과 없음" width={32} height={32} />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">검색 결과가 없습니다</h3>
                <p className="text-sm text-gray-500">다른 검색어를 시도해보세요</p>
              </div>
            ) : (
              <>
                <div className="space-y-1">
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
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-xs text-gray-500"> | </span>
                            <span className="text-xs text-gray-500 truncate">
                              {treatment.Package_Type}
                            </span>
                          </div>
                        </div>
                        <div className="text-right ml-3 flex-shrink-0">
                          <p className="text-sm font-medium text-gray-900">
                            {treatment.Sell_Price.toLocaleString()}원
                          </p>
                          {treatment.Original_Price > treatment.Sell_Price && (
                            <p className="text-xs text-gray-400 line-through">
                              {treatment.Original_Price.toLocaleString()}원
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* 페이지네이션 */}
                {state.pagination.total_pages > 1 && (
                  <div className="mt-6 flex justify-center">
                    <div className="flex gap-2">
                      {state.pagination.page > 1 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(state.pagination.page - 1)}
                        >
                          이전
                        </Button>
                      )}
                      
                      {Array.from({ length: Math.min(5, state.pagination.total_pages) }, (_, i) => {
                        const pageNum = i + 1;
                        return (
                          <Button
                            key={pageNum}
                            variant={pageNum === state.pagination.page ? "default" : "outline"}
                            size="sm"
                            onClick={() => handlePageChange(pageNum)}
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                      
                      {state.pagination.page < state.pagination.total_pages && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(state.pagination.page + 1)}
                        >
                          다음
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* 초기 상태 */}
      {!state.hasSearched && !state.loading && (
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
