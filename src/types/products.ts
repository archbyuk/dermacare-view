// 상품 생성 관련 타입 정의

// 시술 정보 타입
export interface ProcedureInfo {
    id?: number;
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

// Standard 상품 설정 타입
export interface StandardSettings {
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

// Event 상품 설정 타입
export interface EventSettings {
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

// 상품 생성 요청 타입
export interface ProductCreateRequest {
    procedure_info: ProcedureInfo;
    standard_settings: StandardSettings;
    event_settings: EventSettings;
}

// 상품 생성 응답 타입 (기존)
export interface ProductCreateResponse {
    success: boolean;
    message: string;
    product_id?: number;
    standard_info_id?: number;
    event_info_id?: number;
}

// 상품 생성 응답 타입 (새로운 백엔드 구조)
export interface ProductCreateResponseNew {
    status: "success" | "error";
    message: string;
    procedure_info: {
        type: string;
        id: number;
        name: string;
        description: string;
        procedure_cost: number;
        element_count: number;
        release: number;
        package_type: string;
        element_id: number | null;
        bundle_id: number | null;
        custom_id: number | null;
        sequence_id: number | null;
        standard_info_id: number | null;
        event_info_id: number | null;
        procedure_grade: string;
    };
    created_products: {
        standard?: {
            id: number;
            sell_price: number;
            original_price: number;
            procedure_cost: number;
            vat: number;
            margin: number;
            margin_rate: number;
            discount_rate: number;
            info: {
                id: number;
                name: string;
                description: string;
                precautions: string;
            };
        };
        event?: {
            id: number;
            sell_price: number;
            original_price: number;
            procedure_cost: number;
            vat: number;
            margin: number;
            margin_rate: number;
            discount_rate: number;
            info: {
                id: number;
                name: string;
                description: string;
                precautions: string;
            };
        };
    };
}

// 상품 타입 상수
export const PRODUCT_TYPES = {
    STANDARD: 'standard',
    EVENT: 'event'
} as const;

export type ProductType = typeof PRODUCT_TYPES[keyof typeof PRODUCT_TYPES];

// 시술 담당자 상수
export const PROCEDURE_GRADES = {
    DIRECTOR: '원장지정',
    DOCTOR: '지정없음',
    MANAGER: '대표원장'
} as const;

export type ProcedureGrade = typeof PROCEDURE_GRADES[keyof typeof PROCEDURE_GRADES];

// 급여구분 상수
export const COVERED_TYPES = {
    INSURED: '급여',
    UNINSURED: '비급여'
} as const;

export type CoveredType = typeof COVERED_TYPES[keyof typeof COVERED_TYPES];

// 과세구분 상수
export const TAXABLE_TYPES = {
    TAXABLE: '과세',
    TAX_FREE: '면세'
} as const;

export type TaxableType = typeof TAXABLE_TYPES[keyof typeof TAXABLE_TYPES];
