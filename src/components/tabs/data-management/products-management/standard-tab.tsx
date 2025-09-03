'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, AlertTriangle, CreditCard } from 'lucide-react';
import { useModalStore } from '@/store/modal-store';
import { ProductGroupedResponse, ProductDetailResponse, getStandardProductDetail, updateStandardProduct } from '@/api/products-api';

interface StandardTabProps {
    products: ProductGroupedResponse[];
    loading: boolean;
    error: string | null;
    searchQuery: string;
    onRefresh: () => Promise<void>;
    totalProducts: number;
    isSearching: boolean;
}

export default function StandardTab({ 
    products, 
    loading, 
    error, 
    searchQuery, 
    onRefresh, 
    totalProducts, 
    isSearching 
}: StandardTabProps) {
    // 상태 관리
    const [displayedProducts, setDisplayedProducts] = useState<ProductGroupedResponse[]>([]);

    // 모달 스토어 사용
    const { openProductStandardCreate, openProductStandardDetail } = useModalStore();
    
    // 표준 상품만 필터링 (props에서 받은 products 사용)
    const filteredProducts = useMemo(() => {
        if (!products || products.length === 0) {
            return [];
        }
        
        return products.filter(product => {
            // product와 procedure_info가 존재하는지 확인
            if (!product || !product.procedure_info) {
                console.warn('Invalid product data:', product);
                return false;
            }
            
            // standard products가 존재하는지 확인
            if (!product.products || !product.products.standard || product.products.standard.length === 0) {
                return false;
            }
            
            return true;
        });
    }, [products]);

    // 표시할 데이터 설정
    useEffect(() => {
        setDisplayedProducts(filteredProducts);
    }, [filteredProducts]);

    // 상품 상세 보기
    const handleProductClick = async (product: ProductGroupedResponse) => {
        if (!product.products?.standard || product.products.standard.length === 0) {
            console.warn('No standard product found for:', product);
            return;
        }
        
        try {
            // API를 통해 상세 정보를 가져옴
            const standardProduct = product.products.standard[0];
            
            const productDetailResponse = await getStandardProductDetail(standardProduct.id);
            
            // ProductDetailResponse 형태로 변환
            const productDetail: ProductDetailResponse = productDetailResponse.data; 
            openProductStandardDetail(productDetail, onRefresh);
        } catch (error) {
            console.error('상품 상세 정보 조회 실패:', error);
        }
    };

    // 상품 생성 모달 열기
    const handleCreateProduct = () => {
        openProductStandardCreate(onRefresh);
    };

    // 검색 중인지 여부
    const isSearchingState = searchQuery.trim().length > 0;
    // 표시할 데이터 개수 (검색 중이면 검색 결과, 아니면 원본 데이터)
    const displayCount = isSearchingState ? displayedProducts.length : (totalProducts || filteredProducts.length);

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
                            <h3 className="text-lg font-medium text-gray-900 mb-2">오류 발생</h3>
                            <p className="text-sm text-gray-500 mb-4">{error}</p>
                            <Button onClick={onRefresh}>
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
                                    총 스탠다드 개수: {isSearchingState ? `${displayedProducts.length}개 (검색 결과)` : `${displayCount}개`}
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

                            {/* 일관된 컨테이너 - 검색 전후 동일한 구조 */}
                            <div className="space-y-1">
                                
                                {/* 데이터가 있을 때만 목록 표시 */}
                                {displayedProducts.length > 0 ? (
                                    <>
                                        {displayedProducts.map((product) => {
                                            // 데이터 검증
                                            if (!product || !product.procedure_info || !product.products?.standard) {
                                                console.warn('Invalid product data:', product);
                                                return null;
                                            }
                                            
                                            const standardProduct = product.products.standard[0];
                                            if (!standardProduct) {
                                                console.warn('No standard product found:', product);
                                                return null;
                                            }

                                            return (
                                                <div 
                                                    key={`${product.procedure_info.type}-${product.procedure_info.id}-${standardProduct.id}`}
                                                    className="border-b border-gray-100 py-3 cursor-pointer hover:bg-gray-50 transition-colors"
                                                    onClick={() => handleProductClick(product)}
                                                >
                                                    <div className="flex items-start justify-between">
                                                        
                                                        {/* 왼쪽 컨테이너 */}
                                                        <div className="flex-1 min-w-0 pr-4">
                                                            <div className="flex items-center space-x-2 mb-1">
                                                                <h4 className="text-sm font-medium text-gray-900 truncate">
                                                                    {standardProduct.info_standard?.name || '이름 없음'}
                                                                </h4>
                                                            </div>
                                                            <div className="flex items-center space-x-2 mt-1">
                                                                <span className="text-xs text-gray-500">
                                                                    ID: {standardProduct.id}
                                                                </span>
                                                                <span className={`text-xs px-1.5 py-0.5 rounded-full bg-white border ${
                                                                    standardProduct.package_type === '단일시술' ? 'border-gray-400 text-gray-400' :
                                                                    standardProduct.package_type === '번들' ? 'border-orange-400 text-orange-400' :
                                                                    standardProduct.package_type === '커스텀' ? 'border-red-400 text-red-400' :
                                                                    standardProduct.package_type === '시퀀스' ? 'border-purple-400 text-purple-400' :
                                                                    'border-gray-400 text-gray-400'
                                                                }`}>
                                                                    {standardProduct.package_type}
                                                                </span>
                                                            </div>
                                                            {/* 시술 정보 추가
                                                            <div className="flex items-center space-x-2 mt-1">
                                                                <span className="text-xs text-gray-500">
                                                                    시술: {product.procedure_info.name}
                                                                </span>
                                                            </div> */}
                                                            {standardProduct.info_standard?.description && (
                                                                <p className="text-xs text-gray-500 mt-2 line-clamp-1">
                                                                    {standardProduct.info_standard.description}
                                                                </p>
                                                            )}
                                                        </div>
                                                        
                                                        {/* 오른쪽 컨테이너 */}
                                                        <div className="flex flex-col text-left justify-start items-start w-36 mt-1 gap-1">
                                                            <div className="flex items-center space-x-1">
                                                                <CreditCard className="w-3 h-3 text-gray-500" />
                                                                <span className="text-sm font-medium text-gray-900">
                                                                    {(standardProduct.sell_price || 0).toLocaleString()}원
                                                                </span>
                                                            </div>
                                                            <div className="text-xs text-gray-500">
                                                                정상가: {(standardProduct.original_price || 0).toLocaleString()}원
                                                            </div>
                                                            <div className="text-xs text-gray-500">
                                                                마진: {(standardProduct.margin || 0).toLocaleString()}원 ({((standardProduct.margin_rate || 0) * 100).toFixed(1)}%)
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        

                                    </>
                                ) : (
                                    // 데이터 없음 - 실제로 데이터가 없을 때만 표시
                                    products.length === 0 ? (
                                        <div className="text-center py-8 fade-in">
                                            <div className="w-16 h-11 rounded-full mx-auto mb-4 flex items-center justify-center">
                                                <Image src="/logo.svg" alt="데이터 없음" width={32} height={32} />
                                            </div>
                                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                                검색된 상품이 없습니다
                                            </h3>
                                            <p className="text-sm text-gray-500">
                                                새로운 스탠다드 상품을 생성해보세요.
                                            </p>
                                        </div>
                                    ) : (
                                        // 검색 결과가 없을 때만 표시
                                        <div className="text-center py-8 fade-in">
                                            <div className="w-16 h-11 rounded-full mx-auto mb-4 flex items-center justify-center">
                                                <Image src="/logo.svg" alt="데이터 없음" width={32} height={32} />
                                            </div>
                                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                                검색 결과가 없습니다
                                            </h3>
                                            <p className="text-sm text-gray-500">
                                                다른 검색어를 시도해보세요.
                                            </p>
                                        </div>
                                    )
                                )}
                            </div>
                        </div>
                    )}
                    
                </CardContent>
            </Card>
        </div>
    );
}