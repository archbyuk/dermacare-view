'use server'

import { instance } from './axios-instance';
import { 
  ProductsResponse, 
  ProductDetailResponse, 
  ProductsQueryParams, 
  ProductDetailQueryParams 
} from '@/types/treatments';

// 시술 목록 조회
export async function getProducts() {
  try {
    const startTime = performance.now();
    console.log('[API] /read/products 요청 시작');
    
    const response = await instance.get('/read/products');
    
    const endTime = performance.now();
    const duration = (endTime - startTime).toFixed(2);
    console.log(`[API] /read/products 응답 완료 - 소요 시간: ${duration}ms`);
    
    return response.data;
  } 
  
  catch (error: unknown) {
    console.error('시술 목록 조회 에러:', error);
    const errorMessage = error instanceof Error ? error.message : '시술 목록 조회에 실패했습니다.';
    throw new Error(errorMessage);
  }
}

// 시술 상세 조회
export async function getTreatmentDetail(params: ProductDetailQueryParams): Promise<ProductDetailResponse> {
  try {
    const { product_id, product_type } = params;
    
    const response = await instance.get(`/read/products/${product_id}`, {
      params: {
        product_type
      }
    });
    
    return response.data;
  } catch (error: unknown) {
    console.error('시술 상세 조회 에러:', error);
    const errorMessage = error instanceof Error ? error.message : '시술 상세 조회에 실패했습니다.';
    throw new Error(errorMessage);
  }
}
