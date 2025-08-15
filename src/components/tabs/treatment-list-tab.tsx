'use client';

import { useState, useEffect, useCallback } from 'react';
import { getTreatments } from '@/api/treatments-api';
import { Product } from '@/types/treatments';
import { TreatmentDetailModal } from './treatment-detail-modal';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Image from 'next/image';

interface TreatmentsState {
  allTreatments: Product[];
  displayedTreatments: Product[];
  loading: boolean;
  error: string | null;
  currentPage: number;
  hasMore: boolean;
}

export function TreatmentListTab() {
  const [state, setState] = useState<TreatmentsState>({
    allTreatments: [],
    displayedTreatments: [],
    loading: false,
    error: null,
    currentPage: 1,
    hasMore: true
  });
  
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('latest');
  const itemsPerPage = 100; // 더 많은 아이템을 한 번에 표시
  
  // 모달 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTreatment, setSelectedTreatment] = useState<{ id: number; type: 'standard' | 'event' } | null>(null);

  // 전체 데이터 로드
  const fetchAllTreatments = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      // 전체 데이터를 한 번에 받기 (page_size를 충분히 크게)
      const response = await getTreatments({
        page: 1,
        page_size: 1000, // 충분히 큰 값으로 전체 데이터 요청
        product_type: 'all'
      });
      
      setState(prev => ({
        ...prev,
        allTreatments: response.data,
        loading: false
      }));
      
    } catch (error: unknown) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : '시술 목록을 불러오는데 실패했습니다.',
        loading: false
      }));
    }
  }, []);

  // 초기 로딩
  useEffect(() => {
    fetchAllTreatments();
  }, [fetchAllTreatments]);

  // 필터링 및 정렬된 데이터 계산
  const filteredAndSortedTreatments = useCallback(() => {
    let filtered = state.allTreatments;
    
    // 카테고리 필터링
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.Product_Type === selectedCategory);
    }
    
    // 정렬
    switch (sortBy) {
      case 'price-asc':
        filtered = [...filtered].sort((a, b) => (a.Sell_Price || 0) - (b.Sell_Price || 0));
        break;
      case 'price-desc':
        filtered = [...filtered].sort((a, b) => (b.Sell_Price || 0) - (a.Sell_Price || 0));
        break;
      case 'name':
        filtered = [...filtered].sort((a, b) => 
          (a.Product_Name || '').localeCompare(b.Product_Name || '')
        );
        break;
      case 'latest':
      default:
        filtered = [...filtered].sort((a, b) => (b.ID || 0) - (a.ID || 0));
        break;
    }
    
    return filtered;
  }, [state.allTreatments, selectedCategory, sortBy]);

  // 무한 스크롤 로드
  const loadMoreItems = useCallback(() => {
    const filtered = filteredAndSortedTreatments();
    const nextItems = filtered.slice(0, state.currentPage * itemsPerPage);
    
    setState(prev => ({
      ...prev,
      displayedTreatments: nextItems,
      currentPage: prev.currentPage + 1,
      hasMore: nextItems.length < filtered.length
    }));
  }, [filteredAndSortedTreatments, state.currentPage, itemsPerPage]);

  // 시술 상세 보기 모달 열기
  const openTreatmentDetail = (treatment: Product) => {
    setSelectedTreatment({
      id: treatment.ID,
      type: treatment.Product_Type
    });
    setIsModalOpen(true);
  };

  // 모달 닫기
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedTreatment(null);
  };

  // 카테고리 변경 시
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setState(prev => ({ ...prev, currentPage: 1, hasMore: true }));
  };

  // 정렬 변경 시
  const handleSortChange = (sort: string) => {
    setSortBy(sort);
    setState(prev => ({ ...prev, currentPage: 1, hasMore: true }));
  };

  // 스크롤 이벤트 처리
  useEffect(() => {
    const handleScroll = () => {
      if (state.loading || !state.hasMore) return;
      
      const scrollTop = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      
      if (scrollTop + windowHeight >= documentHeight - 100) {
        loadMoreItems();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [state.loading, state.hasMore, loadMoreItems]);

  // 필터링/정렬 변경 시 displayedTreatments 업데이트
  useEffect(() => {
    const filtered = filteredAndSortedTreatments();
    
    setState(prev => ({
      ...prev,
      displayedTreatments: filtered, // 전체 데이터 표시
      currentPage: 1,
      hasMore: false // 더 이상 로드할 필요 없음
    }));
  }, [filteredAndSortedTreatments]);

  const categories = [
    { id: 'all', label: '전체' },
    { id: 'standard', label: '기본시술' },
    { id: 'event', label: '이벤트시술' }
  ];

  const sortOptions = [
    { id: 'latest', label: '최신순' },
    { id: 'price-asc', label: '가격낮은순' },
    { id: 'price-desc', label: '가격높은순' },
    { id: 'name', label: '이름순' }
  ];

  return (
    <div>
      {/* 카테고리 탭 */}
      <div className="flex items-center justify-between mx-4">
        <div className="flex items-center justify-between w-full gap-5">
          <div className="flex gap-1 overflow-x-auto">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant="outline"
                size="default"
                onClick={() => handleCategoryChange(category.id)}
                className={`whitespace-nowrap py-1 px-3 transition-colors ${
                  selectedCategory === category.id 
                    ? 'bg-gray-400 text-white hover:bg-gray-200' 
                    : 'bg-white text-gray-600 hover:bg-gray-200 hover:text-white border-gray-300 '
                }`}
              >
                {category.label}
              </Button>
            ))}
          </div>
          
          <Select value={sortBy} onValueChange={handleSortChange}>
            <SelectTrigger className="w-32 bg-white text-gray-600 border-gray-300">
              <SelectValue placeholder="정렬" />
            </SelectTrigger>
            
            <SelectContent className="w-24 z-10 bg-white border-gray-300 text-gray-500 shadow-lg" position="popper" side="bottom" align="end">
              {sortOptions.map((option) => (
                <SelectItem key={option.id} value={option.id} className="text-gray-500 hover:bg-white border-gray-300">
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 메인 콘텐츠 영역 */}
      <Card className="border-none shadow-none">
        <CardContent className="px-6 py-2">
          
          {/* 초기 로딩 상태 */}
          {state.loading && state.displayedTreatments.length === 0 && (
            <div className="text-center py-8">
              <Image src="/symbol_facefilter.svg" alt="로딩" width={32} height={32} className="animate-spin mx-auto mb-4" />
              <p className="text-sm text-gray-600">로딩 중입니다</p>
            </div>
          )}

          {/* 에러 상태 */}
          {state.error && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-red-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">오류 발생</h3>
              <p className="text-sm text-gray-500 mb-4">{state.error}</p>
              <Button onClick={fetchAllTreatments}>
                다시 시도
              </Button>
            </div>
          )}

          {/* 데이터 표시 */}
          {!state.loading && !state.error && state.displayedTreatments.length > 0 && (
            <div>
              <h3 className="text-md font-medium text-gray-900 mb-3">
                총 상품 개수: {filteredAndSortedTreatments().length}개
              </h3>
              
              <div className="space-y-1">
                {state.displayedTreatments.map((treatment: Product, index: number) => (
                  <div 
                    key={`${treatment.ID}-${index}`} 
                    className="border-b border-gray-100 py-3 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => openTreatmentDetail(treatment)}
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
                          {treatment.class_types && treatment.class_types.length > 0 && (
                            <span className="text-xs text-gray-500 truncate">
                              #{treatment.class_types.slice(0, 3).join(' #')}
                              {treatment.class_types.length > 3 && '...'}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right ml-3 flex-shrink-0">
                        {treatment.Original_Price && treatment.Original_Price > treatment.Sell_Price && (
                          <p className="text-xs text-gray-400 line-through mb-0.5">
                            {treatment.Original_Price.toLocaleString()}원
                          </p>
                        )}
                        <p className="text-sm font-medium text-gray-900 pr-1.5">
                          {treatment.Sell_Price?.toLocaleString()}원
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 데이터 없음 */}
          {!state.loading && !state.error && state.displayedTreatments.length === 0 && (
            <div className="text-center py-8">
              <div className="w-16 h-11 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Image src="/symbol_facefilter.svg" alt="데이터 없음" width={32} height={32} />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">시술 목록이 없습니다</h3>
              <p className="text-sm text-gray-500">선택한 조건에 맞는 시술이 없습니다</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 시술 상세 모달 */}
      {selectedTreatment && (
        <TreatmentDetailModal
          isOpen={isModalOpen}
          onClose={closeModal}
          productId={selectedTreatment.id}
          productType={selectedTreatment.type}
        />
      )}
    </div>
  );
}
