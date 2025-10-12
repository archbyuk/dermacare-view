// 상담 조회 요청 타입
export interface ConsultationReadRequest {
    cursor?: number;
    limit?: number;
    sort_by?: 'id' | 'consultation_date' | 'customer_name' | 'created_at';
    sort_order?: 'asc' | 'desc';
}

// 상담 조회 응답 타입
export interface ConsultationReadResponse {
    id: number;
    consultation_date: string;
    start_time: string;
    end_time: string;
    customer_name: string;
    chart_number: number;
    inflow_path: string;
    consultation_type: string;
    goal_treatment: boolean;
    concern_type: string;
    purchased_items: string;
    is_upselling: boolean;
    has_membership: boolean;
    payment_type: string;
    consultation_content: string;
    discount_rate: number;
    total_payment: number;
    created_at: string;
    updated_at: string;
}

// 상담 목록 응답 타입
export interface ConsultationListResponse {
    consultations: ConsultationReadResponse[];
    next_cursor?: number;
    has_next: boolean;
    total_count: number;
}

// 상담 조회 쿼리 파라미터 타입
export interface ConsultationQueryParams {
    cursor?: number;
    limit?: number;
    sort_by?: 'id' | 'consultation_date' | 'customer_name' | 'created_at';
    sort_order?: 'asc' | 'desc';
}

// 상담 생성 요청 타입
export interface ConsultationCreateRequest {
    consultation_date: string; // YYYY-MM-DD 형식
    start_time: string; // HH:MM 형식
    end_time: string; // HH:MM 형식
    customer_name: string;
    chart_number: number;
    inflow_path: string;
    consultation_type: string;
    goal_treatment: boolean;
    concern_type: string;
    purchased_items?: string; // 문자열로 변경 (쉼표로 구분)
    is_upselling: boolean;
    has_membership?: string; // 문자열로 변경 (쉼표로 구분)
    payment_type?: string;
    consultation_content: string;
    discount_rate?: number;
    total_payment?: number;
}

// 상담 생성 응답 타입
export interface ConsultationCreateResponse {
    success: boolean;
    message: string;
}
