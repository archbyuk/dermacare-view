import { Element } from '@/api/element-api';

/**
 * Element 타입별 필터링
 * @param elements Element 목록
 * @param classType 필터링할 클래스 타입
 * @returns 필터링된 Element 목록
 */
export const filterElementsByType = (elements: Element[], classType: string): Element[] => {
    return elements.filter(element => element.class_type === classType);
};

/**
 * Element 검색 (이름 기준)
 * @param elements Element 목록
 * @param searchTerm 검색어
 * @returns 검색된 Element 목록
 */
export const searchElementsByName = (elements: Element[], searchTerm: string): Element[] => {
    const term = searchTerm.toLowerCase();
    return elements.filter(element => 
        element.name?.toLowerCase().includes(term)
    );
};

/**
 * Element 가격 범위 필터링
 * @param elements Element 목록
 * @param minPrice 최소 가격
 * @param maxPrice 최대 가격
 * @returns 필터링된 Element 목록
 */
export const filterElementsByPriceRange = (
    elements: Element[], 
    minPrice: number, 
    maxPrice: number
): Element[] => {
    return elements.filter(element => 
        element.price && element.price >= minPrice && element.price <= maxPrice
    );
};

/**
 * Element 정렬
 * @param elements Element 목록
 * @param sortBy 정렬 기준 ('name' | 'price' | 'cost_time')
 * @param sortOrder 정렬 순서 ('asc' | 'desc')
 * @returns 정렬된 Element 목록
 */
export const sortElements = (
    elements: Element[], 
    sortBy: 'name' | 'price' | 'cost_time', 
    sortOrder: 'asc' | 'desc' = 'asc'
): Element[] => {
    return [...elements].sort((a, b) => {
        let aValue: string | number | undefined = a[sortBy];
        let bValue: string | number | undefined = b[sortBy];
        
        // undefined 값 처리
        if (aValue === undefined && bValue === undefined) return 0;
        if (aValue === undefined) return sortOrder === 'asc' ? -1 : 1;
        if (bValue === undefined) return sortOrder === 'asc' ? 1 : -1;
        
        // 문자열인 경우
        if (typeof aValue === 'string' && typeof bValue === 'string') {
            aValue = aValue.toLowerCase();
            bValue = bValue.toLowerCase();
        }
        
        // 숫자인 경우
        if (typeof aValue === 'number' && typeof bValue === 'number') {
            if (sortOrder === 'asc') {
                return aValue - bValue;
            } else {
                return bValue - aValue;
            }
        }
        
        // 문자열 비교
        if (sortOrder === 'asc') {
            return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        } else {
            return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
        }
    });
};
