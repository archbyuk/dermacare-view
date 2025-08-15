'use server'

import { instance } from '@/api/axios-instance';

// 검색 파라미터 타입 정의
export interface SearchParams {
  q: string;
  product_type?: 'all' | 'standard' | 'event';
  page?: number;
  page_size?: number;
}

// 검색 결과 타입 정의
export interface SearchResult {
  ID: number;
  Product_Type: 'standard' | 'event';
  Package_Type: string;
  Sell_Price: number;
  Original_Price: number;
  Discount_Rate?: number;
  Product_Name?: string;
}

// 검색 응답 타입 정의
export interface SearchResponse {
  status: string;
  message: string;
  data: SearchResult[];
  pagination: {
    page: number;
    page_size: number;
    total_count: number;
    total_pages: number;
  };
  search_info: {
    query: string;
    product_type: string;
  };
}

// 상품 검색 API
export async function searchProducts(params: SearchParams): Promise<SearchResponse> {
  try {
    const { q, product_type = 'all', page = 1, page_size = 30 } = params;

    const response = await instance.get('/search/products', {
      params: {
        q,
        product_type,
        page,
        page_size
      }
    });

    return response.data;
  } catch (error: unknown) {
    console.error('상품 검색 에러:', error);
    const errorMessage = error instanceof Error ? error.message : '상품 검색에 실패했습니다.';
    throw new Error(errorMessage);
  }
}
