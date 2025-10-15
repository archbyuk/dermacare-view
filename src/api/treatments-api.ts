'use server'

import { instance } from './axios-instance';
import { 
  ProductsResponse, 
  ProductDetailResponse, 
  ProductsQueryParams, 
  ProductDetailQueryParams 
} from '@/types/treatments';

// 시술 목록 조회
export async function getProducts(params: ProductsQueryParams = {}): Promise<ProductsResponse> {
  try {
    // const { product_type = 'all' } = params;
    
    const response = await instance.get('/read/products');
    // console.log('response:', response.data.errors);
    
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
