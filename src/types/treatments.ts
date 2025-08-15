// 치료 목록 조회 관련 타입 정의

export interface Product {
  ID: number;
  Product_Type: 'standard' | 'event';
  Package_Type: string;
  Sell_Price: number;
  Original_Price: number;
  Standard_Start_Date?: string;
  Standard_End_Date?: string;
  Event_Start_Date?: string;
  Event_End_Date?: string;
  Validity_Period: number;
  Product_Name?: string;
  Product_Description?: string;
  procedure_names: string[];
  procedure_count: number;
}

export interface PaginationInfo {
  page: number;
  page_size: number;
  total_count: number;
  total_pages: number;
}

export interface ProductsResponse {
  status: string;
  message: string;
  data: Product[];
  pagination: PaginationInfo;
}

export interface ProductDetail {
  ID: number;
  Product_Type: 'standard' | 'event';
  Package_Type: string;
  Element_ID?: number;
  Bundle_ID?: number;
  Custom_ID?: number;
  Sequence_ID?: number;
  Sell_Price: number;
  Original_Price: number;
  Discount_Rate: number;
  Validity_Period: number;
  Standard_Start_Date?: string;
  Standard_End_Date?: string;
  Event_Start_Date?: string;
  Event_End_Date?: string;
  Product_Name?: string;
  Product_Description?: string;
  Precautions?: string;
  element_details?: ElementDetails;
  bundle_name?: string;
  bundle_details?: BundleDetail[];
  custom_name?: string;
  custom_count?: number;
  custom_details?: CustomDetail[];
  sequence_details?: SequenceDetail[];
}

export interface ElementDetails {
  Class_Major: string;
  Class_Sub: string;
  Class_Detail: string;
  Class_Type: string;
  Name: string;
  Cost_Time: number;
  Plan_State: string;
  Plan_Count: number;
}

export interface BundleDetail {
  ID: number;
  Element_ID: number;
  Element_Cost: number;
  Element_Info: ElementDetails;
}

export interface CustomDetail {
  ID: number;
  Element_ID: number;
  Custom_Count: number;
  Element_Limit: number;
  Element_Cost: number;
  Element_Info: ElementDetails;
}

export interface SequenceDetail {
  Step_Num: number;
  elements: (ElementDetails & { Custom_Count?: number; Element_Limit?: number; Element_Cost?: number })[];
}

export interface ProductDetailResponse {
  status: string;
  message: string;
  data: ProductDetail;
}

// 쿼리 파라미터 타입
export interface ProductsQueryParams {
  page?: number;
  page_size?: number;
  product_type?: 'all' | 'standard' | 'event';
}

export interface ProductDetailQueryParams {
  product_id: number;
  product_type: 'standard' | 'event';
}
