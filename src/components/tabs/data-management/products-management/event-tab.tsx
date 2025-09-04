'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, CreditCard, AlertTriangle } from 'lucide-react';
import { useModalStore } from '@/store/modal-store';
import { ProductGroupedResponse, ProductDetailResponse, getEventProductDetail } from '@/api/products-api';
// EventDetailModal은 이제 모달 스토어에서 관리됨

interface EventTabProps {
  products: ProductGroupedResponse[];
  loading: boolean;
  error: string | null;
  onRefresh: () => Promise<void>;
}

export default function EventTab({ products, loading, error, onRefresh }: EventTabProps) {
  const { openProductEventCreate, openEventDetail } = useModalStore();
  
  // Event products만 필터링
  const eventProducts = useMemo(() => {
    return products.filter(product => 
      product.products?.event && product.products.event.length > 0
    );
  }, [products]);

  // 총 상품 개수
  const totalProducts = eventProducts.reduce((total, product) => 
    total + (product.products?.event?.length || 0), 0
  );

  // 상품 상세 보기
  const handleProductClick = async (product: ProductGroupedResponse) => {
    if (!product.products?.event || product.products.event.length === 0) {
      console.warn('No event product found for:', product);
      return;
    }
    
    try {
      // API를 통해 상세 정보를 가져옴
      const eventProduct = product.products.event[0];
      
      const productDetailResponse = await getEventProductDetail(eventProduct.id);
      
      // ProductDetailResponse 형태로 변환
      const productDetail: ProductDetailResponse = productDetailResponse.data;
      
      // 모달 스토어를 통해 모달 열기
      openEventDetail(productDetail, onRefresh);
    } catch (error) {
      console.error('Event 상품 상세 정보 조회 실패:', error);
      // 에러 발생 시 기존 방식으로 처리
      const eventProduct = product.products.event[0];
      const productDetail: ProductDetailResponse = {
        id: eventProduct.id,
        sell_price: eventProduct.sell_price,
        original_price: eventProduct.original_price,
        discount_rate: eventProduct.discount_rate,
        start_date: eventProduct.start_date,
        end_date: eventProduct.end_date,
        covered_type: eventProduct.covered_type,
        taxable_type: eventProduct.taxable_type,
        procedure_cost: eventProduct.procedure_cost,
        margin: eventProduct.margin,
        margin_rate: eventProduct.margin_rate,
        release: eventProduct.release,
        package_type: eventProduct.package_type,
        element_id: eventProduct.element_id,
        bundle_id: eventProduct.bundle_id,
        custom_id: eventProduct.custom_id,
        sequence_id: eventProduct.sequence_id,
        standard_info_id: undefined,
        event_info_id: eventProduct.event_info_id,
        info_standard: undefined,
        info_event: eventProduct.info_event,
        procedure_info: {
          type: product.procedure_info.type as string,
          id: product.procedure_info.id,
          name: product.procedure_info.name,
          description: product.procedure_info.description,
          procedure_cost: product.procedure_info.procedure_cost,
          category: product.procedure_info.category,
          class_type: product.procedure_info.class_type
        },
        procedure_detail: undefined
      };
      // 모달 스토어를 통해 모달 열기
      openEventDetail(productDetail, onRefresh);
    }
  };

  // 상품 생성 모달 열기
  const handleCreateProduct = () => {
    // TODO: ProductEventCreate 모달 구현 후 연결
    
    openProductEventCreate(onRefresh);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <span className="text-gray-500">Event 상품 목록을 불러오는 중...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={onRefresh} variant="outline">
            다시 시도
          </Button>
        </div>
      </div>
    );
  }



  return (
    <div className="space-y-2 h-full overflow-hidden">
      {/* 메인 콘텐츠 영역 */}
      <Card className="border-none shadow-none h-[calc(100vh-265px)] mx-auto max-w-2xl px-0">
        <CardContent className="h-full overflow-y-auto scroll-consistent">
          
          {/* 로딩 상태 */}
          {loading && (
            <div className="text-center py-8 fade-in">
              <div className="w-8 h-8 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
              </div>
              <p className="text-sm text-gray-600">로딩 중입니다</p>
            </div>
          )}

          {/* 에러 상태 */}
          {error && (
            <div className="text-center py-8 fade-in">
              <div className="w-16 h-16 bg-red-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <p className="text-red-500 mb-4">{error}</p>
              <Button onClick={onRefresh} variant="outline">
                다시 시도
              </Button>
            </div>
          )}

          {/* 데이터 표시 */}
          {!loading && !error && (
            <div className="slide-up">
              
              {/* 헤더 */}
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-md font-medium text-gray-900">
                  총 이벤트 상품 개수: {totalProducts}개
                </h3>

                <Button 
                  variant="outline" 
                  size="sm"
                  className='mb-2 bg-white hover:bg-gray-50 border-gray-300 text-gray-700 hover:text-gray-900 transition-colors'
                  onClick={handleCreateProduct}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  새 상품
                </Button>
              </div>

              {/* 일관된 컨테이너 */}
              <div className="space-y-1">
            
                {/* 데이터가 있을 때만 목록 표시 */}
                {eventProducts.length > 0 ? (
                  eventProducts.map((product) => {
                    // 데이터 검증
                    if (!product || !product.procedure_info || !product.products?.event) {
                      console.warn('Invalid product data:', product);
                      return null;
                    }
                    
                    const eventProduct = product.products.event[0];
                    if (!eventProduct) {
                      console.warn('No event product found:', product);
                      return null;
                    }

                    return (
                      <div 
                        key={`${product.procedure_info.type}-${product.procedure_info.id}-${eventProduct.id}`}
                        className="border-b border-gray-100 py-3 cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => handleProductClick(product)}
                      >
                        <div className="flex items-start justify-between">
                          
                          {/* 왼쪽 컨테이너 */}
                          <div className="flex-1 min-w-0 pr-4">
                            <div className="flex items-center space-x-2 mb-1">
                              <h4 className="text-sm font-medium text-gray-900 truncate">
                                {eventProduct.info_event?.name || '이름 없음'}
                              </h4>
                            </div>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className="text-xs text-gray-500">
                                ID: {eventProduct.id}
                              </span>
                              <span className={`text-xs px-1.5 py-0.5 rounded-full bg-white border ${
                                eventProduct.package_type === '단일시술' ? 'border-gray-400 text-gray-400' :
                                eventProduct.package_type === '번들' ? 'border-orange-400 text-orange-400' :
                                eventProduct.package_type === '커스텀' ? 'border-red-400 text-red-400' :
                                eventProduct.package_type === '시퀀스' ? 'border-purple-400 text-purple-400' :
                                'border-gray-400 text-gray-400'
                              }`}>
                                {eventProduct.package_type}
                              </span>
                            </div>
                            
                            {eventProduct.info_event?.description && (
                              <p className="text-xs text-gray-500 mt-2 line-clamp-1">
                                {eventProduct.info_event.description}
                              </p>
                            )}
                          </div>
                          
                          {/* 오른쪽 컨테이너 */}
                          <div className="flex flex-col text-left justify-start items-start w-36 mt-1 gap-1">
                            <div className="flex items-center space-x-1">
                              <CreditCard className="w-3 h-3 text-gray-500" />
                              <span className="text-sm font-medium text-gray-900">
                                {(eventProduct.sell_price || 0).toLocaleString()}원
                              </span>
                            </div>
                            <div className="text-xs text-gray-500">
                              정상가: {(eventProduct.original_price || 0).toLocaleString()}원
                            </div>
                            <div className="text-xs text-gray-500">
                              마진: {(eventProduct.margin || 0).toLocaleString()}원 ({((eventProduct.margin_rate || 0) * 100).toFixed(1)}%)
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  // 데이터 없음
                  <div className="text-center py-8 fade-in">
                    <div className="w-16 h-11 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <Image src="/logo.svg" alt="데이터 없음" width={32} height={32} />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Event 상품이 없습니다
                    </h3>
                    <p className="text-sm text-gray-500">
                      새로운 Event 상품을 생성해보세요.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  );
}
