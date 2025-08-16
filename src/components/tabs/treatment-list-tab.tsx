'use client';

import { useState, useEffect, useCallback } from 'react';
import { Product } from '@/types/treatments';
import { TreatmentDetailModal } from './treatment-detail-modal';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTreatmentsStore } from '@/store/treatments-store';
import { RefreshCw, AlertTriangle } from 'lucide-react';
import Image from 'next/image';

export function TreatmentListTab() {
  // Zustand store에서 데이터 가져오기
  const { 
    treatments, 
    loading, 
    error, 
    fetchTreatments, 
    refreshTreatments 
  } = useTreatmentsStore();
  
  // 로컬 UI 상태
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('latest');
  const [currentPage, setCurrentPage] = useState(1);
  const [displayedTreatments, setDisplayedTreatments] = useState<Product[]>([]);
  const itemsPerPage = 100;
  
  // 모달 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTreatment, setSelectedTreatment] = useState<{ id: number; type: 'standard' | 'event' } | null>(null);

  // 초기 데이터 로드
  useEffect(() => {
    fetchTreatments();
  }, [fetchTreatments]);

  // 필터링 및 정렬된 데이터 계산
  const filteredAndSortedTreatments = useCallback(() => {
    let filtered = treatments;
    
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
  }, [treatments, selectedCategory, sortBy]);

  // 페이지네이션 처리
  useEffect(() => {
    const filtered = filteredAndSortedTreatments();
    const nextItems = filtered.slice(0, currentPage * itemsPerPage);
    setDisplayedTreatments(nextItems);
  }, [filteredAndSortedTreatments, currentPage]);

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
    setCurrentPage(1);
  };

  // 정렬 변경 시
  const handleSortChange = (sort: string) => {
    setSortBy(sort);
    setCurrentPage(1);
  };

  // 새로고침 버튼 클릭
  const handleRefresh = () => {
    refreshTreatments();
    setCurrentPage(1);
  };

  const categories = [
    { id: 'all', label: 'ALL' },
    { id: 'standard', label: '스탠다드' },
    { id: 'event', label: '이벤트' }
  ];

  const sortOptions = [
    { id: 'latest', label: '최신순' },
    { id: 'price-asc', label: '가격낮은순' },
    { id: 'price-desc', label: '가격높은순' },
    { id: 'name', label: '이름순' }
  ];

  return (
    <div className="px-3">
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
                className={`whitespace-nowrap py-0 px-1.5 transition-colors ${
                  selectedCategory === category.id 
                    ? 'bg-gray-400 text-white hover:bg-gray-200' 
                    : 'bg-white text-gray-600 hover:bg-gray-200 hover:text-white border-gray-300 '
                }`}
              >
                {category.label}
              </Button>
            ))}
          </div>
          
          <div className="flex items-center gap-2">
            <Select value={sortBy} onValueChange={handleSortChange}>
              <SelectTrigger className="w-28 bg-white text-gray-600 border-gray-300">
                <SelectValue placeholder="정렬" />
              </SelectTrigger>
              
              <SelectContent className="w-16 z-10 bg-white border-gray-300 text-gray-500 shadow-lg" position="popper" side="bottom" align="end">
                {sortOptions.map((option) => (
                  <SelectItem key={option.id} value={option.id} className="text-gray-500 hover:bg-white border-gray-300 text-xs">
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 영역 */}
      <Card className="border-none shadow-none">
        <CardContent className="px-6 py-2">
          
          {/* 로딩 상태 */}
          {loading && (
            <div className="text-center py-8 fade-in">
              <Image src="/symbol_facefilter.svg" alt="로딩" width={32} height={32} className="animate-spin mx-auto mb-4" />
              <p className="text-sm text-gray-600">로딩 중입니다</p>
            </div>
          )}

          {/* 데이터 없음 */}
          {!loading && !error && displayedTreatments.length === 0 && (
            <div className="text-center py-8 fade-in">
              <div className="w-16 h-11 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Image src="/symbol_facefilter.svg" alt="데이터 없음" width={32} height={32} />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">시술 목록이 없습니다</h3>
              <p className="text-sm text-gray-500">선택한 조건에 맞는 시술이 없습니다</p>
            </div>
          )}

          {/* 에러 상태 */}
          {error && (
            <div className="text-center py-8 fade-in">
              <div className="w-16 h-16 bg-red-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">오류 발생</h3>
              <p className="text-sm text-gray-500 mb-4">{error}</p>
              <Button onClick={handleRefresh}>
                다시 시도
              </Button>
            </div>
          )}

          {/* 데이터 표시 */}
          {!loading && !error && displayedTreatments.length > 0 && (
            <div className="slide-up">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-md font-medium text-gray-900">
                  총 상품 개수: {filteredAndSortedTreatments().length}개
                </h3>
                
                {/* 새로고침 버튼 */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={loading}
                  className="bg-white text-gray-600 border-none shadow-none mb-1"
                >
                  <RefreshCw 
                    className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}
                  />
                </Button>
              </div>
              
              <div className="space-y-1">
                {displayedTreatments.map((treatment: Product, index: number) => (
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
