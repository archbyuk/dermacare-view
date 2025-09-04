'use server'

import { instance } from './axios-instance';

// ============================================================================
// 타입 정의
// ============================================================================

export interface ProcedureInfo {
  type: 'element' | 'bundle' | 'custom' | 'sequence';
  id: number;
  name: string;
  description?: string;
  procedure_cost: number;
  category?: string;
  class_type?: string;
  element_count?: number;
  elements?: Array<{
    element_id: number;
    element_name: string;
    element_cost: number;
    price_ratio?: number;
    custom_count?: number;
  }>;
  step_count?: number;
  steps?: Array<{
    step_num: number;
    step_name: string;
    procedure_cost: number;
    sequence_interval: number;
    price_ratio: number;
    reference_type: string;
    reference_id: number;
  }>;
}

export interface ProductResponse {
  id: number;
  type: 'standard' | 'event';
  sell_price: number;
  original_price: number;
  discount_rate: number;
  start_date?: string;
  end_date?: string;
  covered_type?: string;
  taxable_type?: string;
  procedure_cost: number;
  margin: number;
  margin_rate: number;
  release: number;
  procedure_info: ProcedureInfo;
}

export interface ProductInfoResponse {
  type?: string;  // "standard" 또는 "event" (optional로 변경)
  id?: number;    // id도 optional로 변경
  name?: string;  // name도 optional로 변경
  description?: string;  // description도 optional로 변경
  precautions?: string;
}

export interface ProductListResponse {
  id: number;
  type: string;  // "standard" 또는 "event"
  sell_price: number;
  original_price: number;
  discount_rate: number;
  start_date?: string;
  end_date?: string;
  covered_type?: string;
  taxable_type?: string;
  procedure_cost: number;
  margin: number;
  margin_rate: number;
  info_standard?: ProductInfoResponse;
  info_event?: ProductInfoResponse;
}

export interface ProductDetailResponse {
  id: number;
  sell_price: number;
  original_price: number;
  discount_rate: number;
  start_date?: string;
  end_date?: string;
  covered_type?: string;
  taxable_type?: string;
  procedure_cost: number;
  margin: number;
  margin_rate: number;
  release: number;
  package_type: string;
  element_id?: number;
  bundle_id?: number;
  custom_id?: number;
  sequence_id?: number;
  standard_info_id?: number;
  event_info_id?: number;
  vat?: number;
  validity_period?: number;
  rounded_place?: string;
  actual_discount?: number;
  info_standard?: ProductInfoResponse;
  info_event?: ProductInfoResponse;
  procedure_info?: {
    type: string;
    id: number;
    name: string;
    description: string;
    procedure_cost: number;
    category?: string;
    class_type?: string;
    class_major?: string;
    class_sub?: string;
    class_detail?: string;
    position_type?: string;
    cost_time?: number;
    plan_state?: number;
    plan_count?: number;
    plan_interval?: number;
    consum_1_id?: number;
    consum_1_count?: number;
    consumable_info?: {
      id: number;
      name: string;
      description: string;
      unit_type: string;
      i_value: number;
      f_value: number | null;
      price: number;
      unit_price: number;
      vat: number;
      taxable_type: string;
      covered_type: string;
    };
    procedure_level?: string;
    price?: number;
  };  // 시술 정보 (상세 조회용)
  procedure_detail?: {
    type: string;
    id: number;
    name: string;
    description: string;
    class_major?: string;
    class_sub?: string;
    class_detail?: string;
    class_type?: string;
    position_type?: string;
    cost_time?: number;
    plan_state?: number;
    plan_count?: number;
    plan_interval?: number;
    consum_1_id?: number;
    consum_1_count?: number;
    consumable_info?: {
      id: number;
      name: string;
      description: string;
      unit_type: string;
      i_value: number;
      f_value: number | null;
      price: number;
      unit_price: number;
      vat: number;
      taxable_type: string;
      covered_type: string;
    };
    procedure_level?: string;
    procedure_cost?: number;
    price?: number;
    release?: number;
    element_count?: number;
    step_count?: number;
    bundle_element_cost?: number;
    price_ratio?: number;
    steps?: Array<{
      step_num: number;
      step_name: string;
      procedure_cost: number;
      sequence_interval: number;
      price_ratio: number;
      reference_type: string;
      reference_id: number;
      bundle_detail?: {
        id: number;
        name: string;
        element_count: number;
        elements: Array<{
          id: number;
          name: string;
          description: string;
          class_major: string;
          class_sub: string;
          class_detail: string;
          class_type: string;
          position_type: string;
          cost_time: number;
          plan_state: number;
          plan_count: number;
          plan_interval: number | null;
          consum_1_id: number | null;
          consum_1_count: number;
          consumable_info: {
            id: number;
            name: string;
            description: string | null;
            unit_type: string;
            i_value: number | null;
            f_value: number | null;
            price: number;
            unit_price: number;
            vat: number;
            taxable_type: string;
            covered_type: string;
          } | null;
          procedure_level: string;
          procedure_cost: number;
          price: number;
          bundle_element_cost: number;
          price_ratio: number;
        }>;
      };
      element_detail?: {
        id: number;
        name: string;
        description: string;
        class_major: string;
        class_sub: string;
        class_detail: string;
        class_type: string;
        position_type: string;
        cost_time: number;
        plan_state: number;
        plan_count: number;
        plan_interval: number | null;
        consum_1_id: number | null;
        consum_1_count: number;
        consumable_info: {
          id: number;
          name: string;
          description: string | null;
          unit_type: string;
          i_value: number | null;
          f_value: number | null;
          price: number;
          unit_price: number;
          vat: number;
          taxable_type: string;
          covered_type: string;
        } | null;
        procedure_level: string;
        procedure_cost: number;
        price: number;
      };
      custom_detail?: {
        id: number;
        name: string;
        description: string;
        class_major: string;
        class_sub: string;
        class_detail: string;
        class_type: string;
        position_type: string;
        cost_time: number;
        plan_state: number;
        plan_count: number;
        plan_interval: number | null;
        consum_1_id: number | null;
        consum_1_count: number;
        consumable_info: {
          id: number;
          name: string;
          description: string | null;
          unit_type: string;
          i_value: number | null;
          f_value: number | null;
          price: number;
          unit_price: number;
          vat: number;
          taxable_type: string;
          covered_type: string;
        } | null;
        procedure_level: string;
        procedure_cost: number;
        price: number;
        custom_count: number;
        price_ratio: number;
      };
    }>;
    all_elements?: Array<{
      id: number;
      name: string;
      description: string;
      class_major: string;
      class_sub: string;
      class_detail: string;
      class_type: string;
      position_type: string;
      cost_time: number;
      plan_state: number;
      plan_count: number;
      plan_interval: number | null;
      consum_1_id: number | null;
      consum_1_count: number;
      consumable_info: {
        id: number;
        name: string;
        description: string | null;
        unit_type: string;
        i_value: number | null;
        f_value: number | null;
        price: number;
        unit_price: number;
        vat: number;
        taxable_type: string;
        covered_type: string;
      } | null;
      procedure_level: string;
      procedure_cost: number;
      price: number;
      bundle_element_cost?: number;
      price_ratio?: number;
    }>;
    bundles?: Array<{
      id: number;
      element_id: number;
      element_cost: number;
      price_ratio: number;
      release: number;
    }>;
    customs?: Array<{
      id: number;
      element_id: number;
      element_cost: number;
      custom_count: number;
      price_ratio: number;
      release: number;
    }>;
    sequences?: Array<{
      id: number;
      sequence_name: string;
      step_num: number;
      element_id: number;
      bundle_id: number;
      custom_id: number;
      sequence_interval: number;
      procedure_cost: number;
      price_ratio: number;
      release: number;
    }>;
  };  // 시술 상세 정보 (상세 조회용)
}

export interface ProductGroupedResponse {
  procedure_info: {
    type: string;
    id: number;
    name: string;
    description: string;
    procedure_cost: number;
    category?: string;
    class_type?: string;
    class_major?: string;
    class_sub?: string;
    class_detail?: string;
    position_type?: string;
    cost_time?: number;
    plan_state?: number;
    plan_count?: number;
    plan_interval?: number;
    consum_1_id?: number;
    consum_1_count?: number;
    consumable_info?: {
      id: number;
      name: string;
      description: string;
      unit_type: string;
      i_value: number;
      f_value: number | null;
      price: number;
      unit_price: number;
      vat: number;
      taxable_type: string;
      covered_type: string;
    };
    procedure_level?: string;
    price?: number;
  };
  products: {
    standard: Array<{
      id: number;
      sell_price: number;
      original_price: number;
      discount_rate: number;
      start_date?: string;
      end_date?: string;
      covered_type?: string;
      taxable_type?: string;
      procedure_cost: number;
      margin: number;
      margin_rate: number;
      release: number;
      package_type: string;
      element_id?: number;
      bundle_id?: number;
      custom_id?: number;
      sequence_id?: number;
      standard_info_id?: number;
      info_standard?: ProductInfoResponse;
    }>;
    event: Array<{
      id: number;
      sell_price: number;
      original_price: number;
      discount_rate: number;
      start_date?: string;
      end_date?: string;
      covered_type?: string;
      taxable_type?: string;
      procedure_cost: number;
      margin: number;
      margin_rate: number;
      release: number;
      package_type: string;
      element_id?: number;
      bundle_id?: number;
      custom_id?: number;
      sequence_id?: number;
      event_info_id?: number;
      info_event?: ProductInfoResponse;
    }>;
  };
}

export interface ProductListApiResponse {
  status: string;
  message: string;
  data: ProductListResponse[] | ProductGroupedResponse[];
}

export interface ProductDetailApiResponse {
  status: string;
  message: string;
  data: ProductDetailResponse;
}

export interface ProcedureInfoRequest {
  release: number;
  package_type: string;
  element_id?: number | null;
  bundle_id?: number | null;
  custom_id?: number | null;
  sequence_id?: number | null;
  standard_info_id?: number | null;
  event_info_id?: number | null;
  procedure_grade: string; // 시술 담당자
}

export interface StandardSettingsRequest {
  enabled: boolean;
  procedure_cost: number;
  sell_price: number;
  original_price: number;
  vat: number;
  discount_rate: number;
  margin: number;
  margin_rate: number;
  start_date?: string;
  end_date?: string;
  validity_period: number;
  covered_type: string;
  taxable_type: string;
  standard_info_id?: number | null;
  product_standard_name: string;
  product_standard_description: string;
  precautions: string;
}

export interface EventSettingsRequest {
  enabled: boolean;
  procedure_cost?: number;
  sell_price?: number;
  original_price?: number;
  vat?: number;
  discount_rate?: number;
  margin?: number;
  margin_rate?: number;
  start_date?: string;
  end_date?: string;
  validity_period?: number;
  covered_type?: string;
  taxable_type?: string;
  event_info_id?: number | null;
  event_name?: string;
  event_description?: string;
  event_precautions?: string;
}

export interface ProductCreateRequest {
  procedure_info: ProcedureInfoRequest;
  standard_settings: StandardSettingsRequest;
  event_settings: EventSettingsRequest;
}

export interface ProductUpdateRequest {
  standard_settings?: StandardSettingsRequest;
  event_settings?: EventSettingsRequest;
}

export interface ProductByProcedureResponse {
  procedure_info: ProcedureInfo;
  products: {
    standard: Array<{
      id: number;
      sell_price: number;
      original_price: number;
      discount_rate: number;
      start_date?: string;
      end_date?: string;
      covered_type?: string;
      taxable_type?: string;
      procedure_cost: number;
      margin: number;
      margin_rate: number;
      standard_info_id?: number;
    }>;
    event: Array<{
      id: number;
      sell_price: number;
      original_price: number;
      discount_rate: number;
      start_date?: string;
      end_date?: string;
      covered_type?: string;
      taxable_type?: string;
      procedure_cost: number;
      margin: number;
      margin_rate: number;
      event_info_id?: number;
    }>;
  };
  summary: {
    total_standard: number;
    total_event: number;
    total_products: number;
  };
}

export interface ProductStandardResponse {
  id: number;
  sell_price: number;
  original_price: number;
  discount_rate: number;
  start_date?: string;
  end_date?: string;
  covered_type?: string;
  taxable_type?: string;
  procedure_cost: number;
  margin: number;
  margin_rate: number;
  release: number;
  procedure_info: ProcedureInfo;
}

// ============================================================================
// API 함수들
// ============================================================================

/**
 * Product 목록 조회
 */
export const getProductsList = async (
  viewType: string = 'procedure_grouped',
  productType?: 'standard' | 'event',
  search?: string, 
  coveredType?: string,
  taxableType?: string,
  minPrice?: number,
  maxPrice?: number
): Promise<ProductListApiResponse> => {
  try {
    const params = new URLSearchParams({
      view_type: viewType
    });

    if (productType) params.append('product_type', productType);
    if (search) params.append('search', search);
    if (coveredType) params.append('covered_type', coveredType);
    if (taxableType) params.append('taxable_type', taxableType);
    if (minPrice !== undefined) params.append('min_price', minPrice.toString());
    if (maxPrice !== undefined) params.append('max_price', maxPrice.toString());

    const response = await instance.get(`/products/?${params.toString()}`);
    return response.data;
  } catch (error: unknown) {
    console.error('Product 목록 조회 실패:', error);
    throw new Error(error instanceof Error ? error.message : 'Product 목록을 불러오는데 실패했습니다.');
  }
};

/**
 * 시술별 Product 현황 조회
 */
export const getProductsByProcedure = async (
  elementId?: number,
  bundleId?: number,
  customId?: number,
  sequenceId?: number
): Promise<ProductByProcedureResponse> => {
  try {
    const params = new URLSearchParams();
    if (elementId !== undefined) params.append('element_id', elementId.toString());
    if (bundleId !== undefined) params.append('bundle_id', bundleId.toString());
    if (customId !== undefined) params.append('custom_id', customId.toString());
    if (sequenceId !== undefined) params.append('sequence_id', sequenceId.toString());

    const response = await instance.get(`/products/by-procedure?${params.toString()}`);
    return response.data;
  } catch (error: unknown) {
    console.error('시술별 Product 조회 실패:', error);
    throw new Error(error instanceof Error ? error.message : '시술별 Product를 불러오는데 실패했습니다.');
  }
};

/**
 * Product 생성 (Standard/Event 동시 생성)
 */
export const createProduct = async (productData: ProductCreateRequest): Promise<{ success: boolean; message: string; product_id?: number; standard_info_id?: number; event_info_id?: number }> => {
  try {
    const response = await instance.post('/products/', productData);
    return response.data;
  } catch (error: unknown) {
    console.error('Product 생성 실패:', error);
    throw new Error(error instanceof Error ? error.message : 'Product 생성에 실패했습니다.');
  }
};

/**
 * Standard Product 상세 조회
 */
export const getStandardProductDetail = async (productId: number): Promise<ProductDetailApiResponse> => {
  try {
    const response = await instance.get(`/products/standard/${productId}`);
    return response.data; // 백엔드 응답 구조에 맞춰 .data 제거
  } catch (error: unknown) {
    console.error('Standard Product 상세 조회 실패:', error);
    throw new Error(error instanceof Error ? error.message : 'Standard Product 상세 정보를 불러오는데 실패했습니다.');
  }
};

/**
 * Event Product 상세 조회
 */
export const getEventProductDetail = async (productId: number): Promise<ProductDetailApiResponse> => {
  try {
    const response = await instance.get(`/products/event/${productId}`);
    return response.data; // 백엔드 응답 구조에 맞춰 .data 추가
  } catch (error: unknown) {
    console.error('Event Product 상세 조회 실패:', error);
    throw new Error(error instanceof Error ? error.message : 'Event Product 상세 정보를 불러오는데 실패했습니다.');
  }
};



/**
 * Event Product 수정
 */
export const updateEventProduct = async (productId: number, updateData: EventProductUpdateRequest): Promise<ProductResponse> => {
  try {
    const response = await instance.put(`/products/event/${productId}`, updateData);
    return response.data; // 백엔드 응답 구조에 맞춰 .data 추가
  } catch (error: unknown) {
    console.error('Event Product 수정 실패:', error);
    throw new Error(error instanceof Error ? error.message : 'Event Product 수정에 실패했습니다.');
  }
};

/**
 * Standard Product 삭제 (비활성화)
 */
export const deleteStandardProduct = async (productId: number): Promise<void> => {
  try {
    await instance.delete(`/products/standard/${productId}`);
  } catch (error: unknown) {
    console.error('Standard Product 삭제 실패:', error);
    throw new Error(error instanceof Error ? error.message : 'Standard Product 삭제에 실패했습니다.');
  }
};

/**
 * Event Product 삭제 (비활성화)
 */
export const deleteEventProduct = async (productId: number): Promise<void> => {
  try {
    await instance.delete(`/products/event/${productId}`);
  } catch (error: unknown) {
    console.error('Event Product 삭제 실패:', error);
    throw new Error(error instanceof Error ? error.message : 'Event Product 삭제에 실패했습니다.');
  }
};

/**
 * Standard Product 활성화
 */
export const activateStandardProduct = async (productId: number): Promise<void> => {
  try {
    await instance.post(`/products/standard/${productId}/activate`);
  } catch (error: unknown) {
    console.error('Standard Product 활성화 실패:', error);
    throw new Error(error instanceof Error ? error.message : 'Standard Product 활성화에 실패했습니다.');
  }
};

/**
 * Event Product 활성화
 */
export const activateEventProduct = async (productId: number): Promise<void> => {
  try {
    await instance.post(`/products/event/${productId}/activate`);
  } catch (error: unknown) {
    console.error('Event Product 활성화 실패:', error);
    throw new Error(error instanceof Error ? error.message : 'Event Product 활성화에 실패했습니다.');
  }
};

// ============================================================================
// Product 수정 관련 API 함수들
// ============================================================================

/**
 * Product 수정 요청 공통 베이스 타입
 */
interface BaseProductUpdateRequest {
  release?: number;
  package_type?: string;
  element_id?: number;
  bundle_id?: number;
  custom_id?: number;
  sequence_id?: number;
  info_id?: number;           // standard_info_id, event_info_id 대신 통일
  sell_price?: number;
  original_price?: number;
  discount_rate?: number;
  procedure_cost?: number;
  margin?: number;
  margin_rate?: number;
  start_date?: string;
  end_date?: string;
  validity_period?: number;
  vat?: number;
  covered_type?: string;
  taxable_type?: string;
  precautions?: string;
  rounded_place?: string;
  actual_discount?: number;
}

/**
 * Standard Product 수정 요청 타입
 */
export interface StandardProductUpdateRequest extends BaseProductUpdateRequest {
  product_standard_name?: string;       // 백엔드 모델에 맞춤
  product_standard_description?: string; // 백엔드 모델에 맞춤
}

/**
 * Event Product 수정 요청 타입
 */
export interface EventProductUpdateRequest extends BaseProductUpdateRequest {
  event_name?: string;                  // 백엔드 모델에 맞춤
  event_description?: string;           // 백엔드 모델에 맞춤
  event_precautions?: string;           // 백엔드 모델에 맞춤
}

/**
 * Standard Product 수정
 */
export const updateStandardProduct = async (
  productId: number,
  updateData: StandardProductUpdateRequest
): Promise<ProductDetailResponse> => {
  try {
    const response = await instance.put(`/products/standard/${productId}`, updateData);
    return response.data.data;
  } catch (error: unknown) {
    console.error('Standard Product 수정 실패:', error);
    throw new Error(error instanceof Error ? error.message : 'Standard Product 수정에 실패했습니다.');
  }
};

// ============================================================================
// Info 관련 API 함수들
// ============================================================================

// Standard Info 응답 타입 정의
export interface StandardInfoResponse {
  id: number;
  name: string;
  description: string;
  precautions?: string;
  created_at: string;
  updated_at: string;
}

export interface StandardInfoListResponse {
  status: string;
  message: string;
  data: {
    items: StandardInfoResponse[];
    total: number;
    page: number;
    page_size: number;
  };
}

/**
 * Standard Info 목록 조회
 */
export const getStandardInfoList = async (
  page: number = 1,
  pageSize: number = 30,
  search?: string
): Promise<StandardInfoListResponse> => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
    });

    if (search) params.append('search', search);

    const response = await instance.get(`/products/info/standard?${params.toString()}`);
    return response.data;
  } catch (error: unknown) {
    console.error('Standard Info 목록 조회 실패:', error);
    throw new Error(error instanceof Error ? error.message : 'Standard Info 목록을 불러오는데 실패했습니다.');
  }
};

// Event Info 응답 타입 정의
export interface EventInfoResponse {
  id: number;
  name: string;
  description: string;
  precautions?: string;
  created_at: string;
  updated_at: string;
}

export interface EventInfoListResponse {
  status: string;
  message: string;
  data: {
    items: EventInfoResponse[];
    total: number;
    page: number;
    page_size: number;
  };
}

/**
 * Event Info 목록 조회
 */
export const getEventInfoList = async (
  page: number = 1,
  pageSize: number = 30,
  search?: string
): Promise<EventInfoListResponse> => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
    });

    if (search) params.append('search', search);

    const response = await instance.get(`/products/info/event?${params.toString()}`);
    return response.data;
  } catch (error: unknown) {
    console.error('Event Info 목록 조회 실패:', error);
    throw new Error(error instanceof Error ? error.message : 'Event Info 목록을 불러오는데 실패했습니다.');
  }
};

export interface StandardInfoDetailResponse {
  status: string;
  message: string;
  data: StandardInfoResponse;
}

/**
 * Standard Info 상세 조회
 */
export const getStandardInfoDetail = async (infoId: number): Promise<StandardInfoDetailResponse> => {
  try {
    const response = await instance.get(`/products/info/standard/${infoId}`);
    return response.data;
  } catch (error: unknown) {
    console.error('Standard Info 상세 조회 실패:', error);
    throw new Error(error instanceof Error ? error.message : 'Standard Info 상세 정보를 불러오는데 실패했습니다.');
  }
};

export interface EventInfoDetailResponse {
  status: string;
  message: string;
  data: EventInfoResponse;
}

/**
 * Event Info 상세 조회
 */
export const getEventInfoDetail = async (infoId: number): Promise<EventInfoDetailResponse> => {
  try {
    const response = await instance.get(`/products/info/event/${infoId}`);
    return response.data;
  } catch (error: unknown) {
    console.error('Event Info 상세 조회 실패:', error);
    throw new Error(error instanceof Error ? error.message : 'Event Info 상세 정보를 불러오는데 실패했습니다.');
  }
};