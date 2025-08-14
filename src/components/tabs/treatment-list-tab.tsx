'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { logoutAction } from '@/app/actions';
import { getTreatments } from '@/api/treatments-api';
import { Product } from '@/types/treatments';
import { TreatmentDetailModal } from './treatment-detail-modal';

interface TreatmentsState {
  allTreatments: Product[];
  displayedTreatments: Product[];
  loading: boolean;
  error: string | null;
  currentPage: number;
  hasMore: boolean;
}

export function TreatmentListTab() {
  const router = useRouter();
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
  const itemsPerPage = 20;
  
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
      
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        error: error.message,
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
    const initialItems = filtered.slice(0, itemsPerPage);
    
    setState(prev => ({
      ...prev,
      displayedTreatments: initialItems,
      currentPage: 1,
      hasMore: initialItems.length < filtered.length
    }));
  }, [filteredAndSortedTreatments]);

  const handleLogout = async () => {
    try {
      await logoutAction();
    } catch (error) {
      console.error('로그아웃 에러:', error);
    }
  };

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
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">시술 목록</h1>
          <p className="text-sm text-gray-500">시술 전체 목록을 확인할 수 있습니다</p>
        </div>
        <button 
          onClick={handleLogout}
          className="p-2 rounded-lg hover:bg-gray-100"
          title="로그아웃"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>

      {/* 카테고리 탭 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center justify-between">
          <div className="flex space-x-1 overflow-x-auto">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryChange(category.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
          
          <select
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
          >
            {sortOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 메인 콘텐츠 영역 */}
      <div className="bg-white rounded-lg p-6">
        {/* 초기 로딩 상태 */}
        {state.loading && state.displayedTreatments.length === 0 && (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-sm text-gray-500">시술 목록을 불러오는 중...</p>
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
            <button 
              onClick={fetchAllTreatments}
              className="bg-blue-500 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
            >
              다시 시도
            </button>
          </div>
        )}

        {/* 데이터 표시 */}
        {!state.loading && !state.error && state.displayedTreatments.length > 0 && (
          <div>
            <h3 className="text-base font-medium text-gray-900 mb-3">
              시술 목록 ({filteredAndSortedTreatments().length}개)
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
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-xs text-gray-500">
                          {treatment.Product_Type === 'standard' ? 'S' : 'E'}
                        </span>
                        {treatment.procedure_names.length > 0 && (
                          <>
                            <span className="text-xs text-gray-400">||</span>
                            <span className="text-xs text-gray-500 truncate">
                              {treatment.procedure_names.slice(0, 2).join(' + ')}
                              {treatment.procedure_names.length > 2 && '...'}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="text-right ml-3 flex-shrink-0">
                      <p className="text-sm font-medium text-gray-900">
                        {treatment.Sell_Price?.toLocaleString()}원
                      </p>
                      {treatment.Original_Price && treatment.Original_Price > treatment.Sell_Price && (
                        <p className="text-xs text-gray-400 line-through">
                          {treatment.Original_Price.toLocaleString()}원
                        </p>
                      )}
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
            <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">시술 목록이 없습니다</h3>
            <p className="text-sm text-gray-500">선택한 조건에 맞는 시술이 없습니다</p>
          </div>
        )}
      </div>

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
