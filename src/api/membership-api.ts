'use server'

import { instance } from './axios-instance';

// ============================================================================
// 타입 정의
// ============================================================================

export interface InfoMembershipResponse {
  id: number;
  membership_name?: string;
  membership_description?: string;
  precautions?: string;
  release: number;
}

export interface MembershipCreateRequest {
  id?: number;
  membership_info_id: number;
  payment_amount: number;
  bonus_point?: number;
  credit?: number;
  discount_rate?: number;
  package_type: '단일시술' | '번들' | '커스텀' | '시퀀스';
  element_id?: number;
  bundle_id?: number;
  custom_id?: number;
  sequence_id?: number;
  validity_period: number;
  release_start_date?: string;
  release_end_date?: string;
  release?: number;
}

export interface MembershipUpdateRequest {
  id?: number;
  membership_info_id?: number;
  payment_amount?: number;
  bonus_point?: number;
  credit?: number;
  discount_rate?: number;
  package_type?: '단일시술' | '번들' | '커스텀' | '시퀀스';
  element_id?: number;
  bundle_id?: number;
  custom_id?: number;
  sequence_id?: number;
  validity_period?: number;
  release_start_date?: string;
  release_end_date?: string;
  release?: number;
  info?: {
    membership_name?: string;
    membership_description?: string;
    precautions?: string;
    release?: number;
  };
}

export interface MembershipResponse {
  id: number;
  membership_info_id: number;
  payment_amount: number;
  bonus_point: number;
  credit: number;
  discount_rate: number;
  package_type: string;
  element_id?: number;
  bundle_id?: number;
  custom_id?: number;
  sequence_id?: number;
  validity_period: number;
  release_start_date?: string;
  release_end_date?: string;
  release: number;
  info?: InfoMembershipResponse;
}

// ============================================================================
// API 함수들
// ============================================================================

/**
 * Membership 목록 조회
 */
export const getMembershipList = async (): Promise<MembershipResponse[]> => {
  try {
    const response = await instance.get('/membership/');
    return response.data;
  } catch (error: unknown) {
    console.error('Membership 목록 조회 실패:', error);
    throw new Error(error instanceof Error ? error.message : 'Membership 목록을 불러오는데 실패했습니다.');
  }
};

/**
 * 특정 Membership 조회
 */
export const getMembershipDetail = async (membership_id: number): Promise<MembershipResponse> => {
  try {
    if (membership_id <= 0) {
      throw new Error('Membership ID는 0보다 커야 합니다.');
    }
    
    const response = await instance.get(`/membership/${membership_id}`);
    return response.data;
  } catch (error: unknown) {
    console.error('Membership 상세 조회 실패:', error);
    throw new Error(error instanceof Error ? error.message : 'Membership 상세 정보를 불러오는데 실패했습니다.');
  }
};

/**
 * Membership 생성
 */
export const createMembership = async (membershipData: MembershipCreateRequest): Promise<MembershipResponse> => {
  try {
    // 유효성 검사
    if (membershipData.payment_amount <= 0) {
      throw new Error('결제 금액은 0보다 커야 합니다.');
    }
    
    if (membershipData.bonus_point && membershipData.bonus_point < 0) {
      throw new Error('보너스 포인트는 0 이상이어야 합니다.');
    }
    
    if (membershipData.credit && membershipData.credit < 0) {
      throw new Error('적립금은 0 이상이어야 합니다.');
    }
    
    if (membershipData.discount_rate && (membershipData.discount_rate < 0 || membershipData.discount_rate > 1)) {
      throw new Error('할인율은 0과 1 사이의 값이어야 합니다.');
    }
    
    const validPackageTypes = ['단일시술', '번들', '커스텀', '시퀀스'];
    if (!validPackageTypes.includes(membershipData.package_type)) {
      throw new Error(`패키지 타입은 ${validPackageTypes.join(', ')} 중 하나여야 합니다.`);
    }
    
    if (membershipData.validity_period <= 0) {
      throw new Error('유효기간은 0보다 커야 합니다.');
    }
    
    // 패키지 타입별 참조 ID 검증
    if (membershipData.package_type === '단일시술' && !membershipData.element_id) {
      throw new Error('단일시술 패키지의 경우 Element ID가 필요합니다.');
    }
    if (membershipData.package_type === '번들' && !membershipData.bundle_id) {
      throw new Error('번들 패키지의 경우 Bundle ID가 필요합니다.');
    }
    if (membershipData.package_type === '커스텀' && !membershipData.custom_id) {
      throw new Error('커스텀 패키지의 경우 Custom ID가 필요합니다.');
    }
    if (membershipData.package_type === '시퀀스' && !membershipData.sequence_id) {
      throw new Error('시퀀스 패키지의 경우 Sequence ID가 필요합니다.');
    }
    
    const response = await instance.post('/membership/', membershipData);
    return response.data;
  } catch (error: unknown) {
    console.error('Membership 생성 실패:', error);
    throw new Error(error instanceof Error ? error.message : 'Membership 생성에 실패했습니다.');
  }
};

/**
 * Membership 수정
 */
export const updateMembership = async (membership_id: number, membershipData: MembershipUpdateRequest): Promise<MembershipResponse> => {
  try {
    if (membership_id <= 0) {
      throw new Error('Membership ID는 0보다 커야 합니다.');
    }
    
    // 유효성 검사 (값이 제공된 경우에만)
    if (membershipData.payment_amount !== undefined && membershipData.payment_amount <= 0) {
      throw new Error('결제 금액은 0보다 커야 합니다.');
    }
    
    if (membershipData.bonus_point !== undefined && membershipData.bonus_point < 0) {
      throw new Error('보너스 포인트는 0 이상이어야 합니다.');
    }
    
    if (membershipData.credit !== undefined && membershipData.credit < 0) {
      throw new Error('적립금은 0 이상이어야 합니다.');
    }
    
    if (membershipData.discount_rate !== undefined && (membershipData.discount_rate < 0 || membershipData.discount_rate > 1)) {
      throw new Error('할인율은 0과 1 사이의 값이어야 합니다.');
    }
    
    if (membershipData.package_type !== undefined) {
      const validPackageTypes = ['단일시술', '번들', '커스텀', '시퀀스'];
      if (!validPackageTypes.includes(membershipData.package_type)) {
        throw new Error(`패키지 타입은 ${validPackageTypes.join(', ')} 중 하나여야 합니다.`);
      }
    }
    
    if (membershipData.validity_period !== undefined && membershipData.validity_period <= 0) {
      throw new Error('유효기간은 0보다 커야 합니다.');
    }
    
    const response = await instance.put(`/membership/${membership_id}`, membershipData);
    return response.data;
  } catch (error: unknown) {
    console.error('Membership 수정 실패:', error);
    throw new Error(error instanceof Error ? error.message : 'Membership 수정에 실패했습니다.');
  }
};

/**
 * Membership 삭제
 */
export const deleteMembership = async (membership_id: number): Promise<{ status: string; message: string }> => {
  try {
    if (membership_id <= 0) {
      throw new Error('Membership ID는 0보다 커야 합니다.');
    }
    
    const response = await instance.delete(`/membership/${membership_id}`);
    return response.data;
  } catch (error: unknown) {
    console.error('Membership 삭제 실패:', error);
    throw new Error(error instanceof Error ? error.message : 'Membership 삭제에 실패했습니다.');
  }
};

/**
 * Membership 비활성화
 */
export const deactivateMembership = async (membership_id: number): Promise<{ status: string; message: string }> => {
  try {
    if (membership_id <= 0) {
      throw new Error('Membership ID는 0보다 커야 합니다.');
    }
    
    const response = await instance.put(`/membership/${membership_id}/deactivate`);
    return response.data;
  } catch (error: unknown) {
    console.error('Membership 비활성화 실패:', error);
    throw new Error(error instanceof Error ? error.message : 'Membership 비활성화에 실패했습니다.');
  }
};

/**
 * Membership 활성화
 */
export const activateMembership = async (membership_id: number): Promise<{ status: string; message: string }> => {
  try {
    if (membership_id <= 0) {
      throw new Error('Membership ID는 0보다 커야 합니다.');
    }
    
    const response = await instance.put(`/membership/${membership_id}/activate`);
    return response.data;
  } catch (error: unknown) {
    console.error('Membership 활성화 실패:', error);
    throw new Error(error instanceof Error ? error.message : 'Membership 활성화에 실패했습니다.');
  }
};

