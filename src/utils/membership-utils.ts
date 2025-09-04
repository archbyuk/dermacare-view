import { MembershipResponse } from '@/api/membership-api';

/**
 * Membership의 총 혜택 계산
 */
export const calculateMembershipTotalBenefits = (membership: MembershipResponse): number => {
    const bonusPointValue = membership.bonus_point || 0;
    const creditValue = membership.credit || 0;
    const discountValue = (membership.payment_amount || 0) * (membership.discount_rate || 0);
    
    return bonusPointValue + creditValue + discountValue;
};

/**
 * Membership의 할인된 가격 계산
 */
export const calculateDiscountedPrice = (membership: MembershipResponse): number => {
    const originalPrice = membership.payment_amount || 0;
    const discountRate = membership.discount_rate || 0;
    
    return originalPrice * (1 - discountRate);
};

/**
 * Membership의 유효기간 확인
 */
export const isMembershipValid = (membership: MembershipResponse): boolean => {
    const now = new Date();
    const startDate = membership.release_start_date ? new Date(membership.release_start_date) : null;
    const endDate = membership.release_end_date ? new Date(membership.release_end_date) : null;
    
    if (startDate && now < startDate) {
        return false;
    }
    
    if (endDate && now > endDate) {
        return false;
    }
    
    return membership.release === 1;
};

/**
 * Membership 검색 (이름 기반)
 */
export const searchMembershipsByName = (memberships: MembershipResponse[], searchTerm: string): MembershipResponse[] => {
    if (!searchTerm.trim()) {
        return memberships;
    }
    
    const lowerSearchTerm = searchTerm.toLowerCase();
    
    return memberships.filter(membership => {
        // Membership ID로 검색
        if (membership.id.toString().includes(lowerSearchTerm)) {
            return true;
        }
        
        // Info 이름으로 검색
        if (membership.info?.membership_name?.toLowerCase().includes(lowerSearchTerm)) {
            return true;
        }
        
        // 패키지 타입으로 검색
        if (membership.package_type.toLowerCase().includes(lowerSearchTerm)) {
            return true;
        }
        
        // 참조 ID로 검색
        if ((membership.element_id && membership.element_id.toString().includes(lowerSearchTerm)) ||
            (membership.bundle_id && membership.bundle_id.toString().includes(lowerSearchTerm)) ||
            (membership.custom_id && membership.custom_id.toString().includes(lowerSearchTerm)) ||
            (membership.sequence_id && membership.sequence_id.toString().includes(lowerSearchTerm))) {
            return true;
        }
        
        return false;
    });
};

/**
 * 패키지 타입별 Membership 필터링
 */
export const filterMembershipsByPackageType = (memberships: MembershipResponse[], packageType: string): MembershipResponse[] => {
    if (!packageType) {
        return memberships;
    }
    
    return memberships.filter(membership => membership.package_type === packageType);
};

/**
 * 활성화된 Membership만 필터링
 */
export const filterActiveMemberships = (memberships: MembershipResponse[]): MembershipResponse[] => {
    return memberships.filter(membership => membership.release === 1);
};
