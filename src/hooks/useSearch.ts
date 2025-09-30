import { useState, useEffect, useCallback, useMemo } from 'react';
import { debounce } from 'lodash';

// 초성 추출 함수
const extractChosung = (text: string): string => {
  const cho = ['ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
  
  let result = '';
  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i);
    if (charCode >= 44032 && charCode <= 55203) { // 한글 유니코드 범위
      const unicode = charCode - 44032;
      const choIndex = Math.floor(unicode / 588);
      result += cho[choIndex];
    } else {
      result += text[i];
    }
  }
  return result;
};

// 초성 검색 함수
const matchesChosung = (searchTerm: string, targetText: string): boolean => {
  // 검색어가 초성인지 확인
  const isChosungSearch = /^[ㄱ-ㅎ]+$/.test(searchTerm);
  if (!isChosungSearch) return false;
  
  // 대상 텍스트의 초성 추출
  const targetChosung = extractChosung(targetText);
  
  // 초성 매칭 확인
  return targetChosung.includes(searchTerm);
};

// 검색 결과 타입 정의
export interface SearchResult {
  ID: number;
  Product_Type: 'standard' | 'event';
  Package_Type: string;
  Sell_Price: number;
  Original_Price: number;
  Product_Name?: string;
  elements: string[];
  class_types: string[];
  class_type_count: number;
  Precautions?: string;
}

// 원본 데이터 타입 (API에서 받아오는 데이터)
export interface TreatmentData {
  ID: number;
  Product_Type: 'standard' | 'event';
  Package_Type: string;
  Sell_Price: number;
  Original_Price: number;
  Product_Name?: string;
  class_types?: string[];
  procedure_names?: string[];
  Product_Description?: string;
  Precautions?: string;
  element_details?: {
    Class_Major?: string;
    Class_Sub?: string;
    Class_Detail?: string;
    Class_Type?: string;
  };
  bundle_details?: Array<{
    Element_Info: {
      Class_Major?: string;
      Class_Sub?: string;
      Class_Detail?: string;
      Class_Type?: string;
      Name?: string;
    };
  }>;
  custom_details?: Array<{
    Element_Info: {
      Class_Major?: string;
      Class_Sub?: string;
      Class_Detail?: string;
      Class_Type?: string;
      Name?: string;
    };
  }>;
  sequence_details?: Array<{
    elements: Array<{
      Class_Major?: string;
      Class_Sub?: string;
      Class_Detail?: string;
      Class_Type?: string;
      Name?: string;
    }>;
  }>;
}

// 검색 상태 타입
export interface SearchState {
  searchQuery: string;
  searchResults: SearchResult[];
  hasSearched: boolean;
}

// 검색 옵션 타입
export interface SearchOptions {
  minQueryLength?: number;
  debounceDelay?: number;
  enableChosungSearch?: boolean;
}

// 정렬 옵션 타입
export type SortOption = 'latest' | 'oldest' | 'price_high' | 'price_low' | 'name';

// 카테고리 타입
export type CategoryType = 'all' | 'standard' | 'event';

export const useSearch = (
  data: TreatmentData[],
  options: SearchOptions = {}
) => {
  const {
    minQueryLength = 1,
    debounceDelay = 200,
    enableChosungSearch = true
  } = options;

  const [state, setState] = useState<SearchState>({
    searchQuery: '',
    searchResults: [],
    hasSearched: false
  });

  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('all');
  const [sortBy, setSortBy] = useState<SortOption>('latest');

  // 검색 실행 함수
  const performSearch = useCallback((query: string, category: CategoryType) => {
    // 최소 글자 수 체크
    if (!query.trim() || query.trim().length < minQueryLength) {
      setState(prev => ({ 
        ...prev, 
        searchResults: [], 
        hasSearched: false
      }));
      return;
    }

    const searchTerm = query.toLowerCase().trim();
    
    // 데이터에서 검색
    const filteredResults = data.filter(treatment => {
      // 카테고리 필터링을 먼저 (더 빠른 필터링)
      if (category !== 'all' && treatment.Product_Type !== category) {
        return false;
      }
      
      // 시술명 검색 (가장 빠른 매칭)
      if (treatment.Product_Name?.toLowerCase().includes(searchTerm)) {
        return true;
      }
      
      // 초성 검색 - 시술명
      if (enableChosungSearch && treatment.Product_Name && matchesChosung(searchTerm, treatment.Product_Name)) {
        return true;
      }
      
      // 분류 검색 (class_types)
      if (treatment.class_types?.some(type => type.toLowerCase().includes(searchTerm))) {
        return true;
      }
      
      // 초성 검색 - 분류
      if (enableChosungSearch && treatment.class_types?.some(type => matchesChosung(searchTerm, type))) {
        return true;
      }
      
      // 시술명 검색 (procedure_names)
      if (treatment.procedure_names?.some(procedure => procedure.toLowerCase().includes(searchTerm))) {
        return true;
      }
      
      // 초성 검색 - 시술명 배열
      if (enableChosungSearch && treatment.procedure_names?.some(procedure => matchesChosung(searchTerm, procedure))) {
        return true;
      }
      
      // 상품 설명 검색 (Product_Description)
      if (treatment.Product_Description?.toLowerCase().includes(searchTerm)) {
        return true;
      }
      
      // 초성 검색 - 상품 설명
      if (enableChosungSearch && treatment.Product_Description && matchesChosung(searchTerm, treatment.Product_Description)) {
        return true;
      }

      // 시술 주의사항 검색 - 주의사항
      if (treatment.Precautions?.toLowerCase().includes(searchTerm)) {
        return true;
      }
      
      // 초성 검색 - 주의사항
      if (enableChosungSearch && treatment.Precautions && matchesChosung(searchTerm, treatment.Precautions)) {
        return true;
      }
      
      // 대분류 검색 (Class_Major)
      if (treatment.element_details?.Class_Major?.toLowerCase().includes(searchTerm)) {
        return true;
      }
      
      // 초성 검색 - 대분류
      if (enableChosungSearch && treatment.element_details?.Class_Major && matchesChosung(searchTerm, treatment.element_details.Class_Major)) {
        return true;
      }
      
      // 중분류 검색 (Class_Sub)
      if (treatment.element_details?.Class_Sub?.toLowerCase().includes(searchTerm)) {
        return true;
      }
      
      // 초성 검색 - 중분류
      if (enableChosungSearch && treatment.element_details?.Class_Sub && matchesChosung(searchTerm, treatment.element_details.Class_Sub)) {
        return true;
      }
      
      // 소분류 검색 (Class_Detail)
      if (treatment.element_details?.Class_Detail?.toLowerCase().includes(searchTerm)) {
        return true;
      }
      
      // 초성 검색 - 소분류
      if (enableChosungSearch && treatment.element_details?.Class_Detail && matchesChosung(searchTerm, treatment.element_details.Class_Detail)) {
        return true;
      }
      
      // 시술 속성 검색 (Class_Type)
      if (treatment.element_details?.Class_Type?.toLowerCase().includes(searchTerm)) {
        return true;
      }
      
      // 초성 검색 - 시술 속성
      if (enableChosungSearch && treatment.element_details?.Class_Type && matchesChosung(searchTerm, treatment.element_details.Class_Type)) {
        return true;
      }
      
      // 번들 내부 element 검색
      if (treatment.bundle_details?.some(bundle => {
        const element = bundle.Element_Info;
        const found = (
          element.Class_Major?.toLowerCase().includes(searchTerm) ||
          element.Class_Sub?.toLowerCase().includes(searchTerm) ||
          element.Class_Detail?.toLowerCase().includes(searchTerm) ||
          element.Class_Type?.toLowerCase().includes(searchTerm) ||
          element.Name?.toLowerCase().includes(searchTerm) ||
          // 초성 검색
          (enableChosungSearch && element.Class_Major && matchesChosung(searchTerm, element.Class_Major)) ||
          (enableChosungSearch && element.Class_Sub && matchesChosung(searchTerm, element.Class_Sub)) ||
          (enableChosungSearch && element.Class_Detail && matchesChosung(searchTerm, element.Class_Detail)) ||
          (enableChosungSearch && element.Class_Type && matchesChosung(searchTerm, element.Class_Type)) ||
          (enableChosungSearch && element.Name && matchesChosung(searchTerm, element.Name))
        );
        
        if (found) {
          console.log('번들 내부 element 검색 성공:', {
            productId: treatment.ID,
            productName: treatment.Product_Name,
            bundleElement: element,
            searchTerm
          });
        }
        
        return found;
      })) {
        return true;
      }
      
      // 커스텀 내부 element 검색
      if (treatment.custom_details?.some(custom => {
        const element = custom.Element_Info;
        const found = (
          element.Class_Major?.toLowerCase().includes(searchTerm) ||
          element.Class_Sub?.toLowerCase().includes(searchTerm) ||
          element.Class_Detail?.toLowerCase().includes(searchTerm) ||
          element.Class_Type?.toLowerCase().includes(searchTerm) ||
          element.Name?.toLowerCase().includes(searchTerm) ||
          // 초성 검색
          (enableChosungSearch && element.Class_Major && matchesChosung(searchTerm, element.Class_Major)) ||
          (enableChosungSearch && element.Class_Sub && matchesChosung(searchTerm, element.Class_Sub)) ||
          (enableChosungSearch && element.Class_Detail && matchesChosung(searchTerm, element.Class_Detail)) ||
          (enableChosungSearch && element.Class_Type && matchesChosung(searchTerm, element.Class_Type)) ||
          (enableChosungSearch && element.Name && matchesChosung(searchTerm, element.Name))
        );
        
        if (found) {
          console.log('커스텀 내부 element 검색 성공:', {
            productId: treatment.ID,
            productName: treatment.Product_Name,
            customElement: element,
            searchTerm
          });
        }
        
        return found;
      })) {
        return true;
      }
      
      // 시퀀스 내부 element 검색
      if (treatment.sequence_details?.some(sequence => 
        sequence.elements?.some(element => {
          const found = (
            element.Class_Major?.toLowerCase().includes(searchTerm) ||
            element.Class_Sub?.toLowerCase().includes(searchTerm) ||
            element.Class_Detail?.toLowerCase().includes(searchTerm) ||
            element.Class_Type?.toLowerCase().includes(searchTerm) ||
            element.Name?.toLowerCase().includes(searchTerm) ||
            // 초성 검색
            (enableChosungSearch && element.Class_Major && matchesChosung(searchTerm, element.Class_Major)) ||
            (enableChosungSearch && element.Class_Sub && matchesChosung(searchTerm, element.Class_Sub)) ||
            (enableChosungSearch && element.Class_Detail && matchesChosung(searchTerm, element.Class_Detail)) ||
            (enableChosungSearch && element.Class_Type && matchesChosung(searchTerm, element.Class_Type)) ||
            (enableChosungSearch && element.Name && matchesChosung(searchTerm, element.Name))
          );
          
          if (found) {
            console.log('시퀀스 내부 element 검색 성공:', {
              productId: treatment.ID,
              productName: treatment.Product_Name,
              sequenceElement: element,
              searchTerm
            });
          }
          
          return found;
        })
      )) {
        return true;
      }
      
      // 패키지 타입 검색 (Package_Type) - 다양한 검색어 지원
      const packageType = treatment.Package_Type?.toLowerCase();
      if (packageType) {
        // 번들 → 패키지, 번들
        if (packageType === '번들' && (searchTerm === '패키지' || searchTerm === '번들')) {
          return true;
        }
        // 시퀀스 → 코스, 코스 패키지, 시퀀스
        if (packageType === '시퀀스' && (searchTerm === '코스' || searchTerm === '코스 패키지' || searchTerm === '시퀀스')) {
          return true;
        }
        // 단일시술 → 단일시술, 일반 시술, 단일
        if (packageType === '단일시술' && (searchTerm === '단일시술' || searchTerm === '일반 시술' || searchTerm === '단일')) {
          return true;
        }
        // 커스텀 → 커스텀
        if (packageType === '커스텀' && searchTerm === '커스텀') {
          return true;
        }
        // 기존 방식도 유지 (정확한 매칭)
        if (packageType.includes(searchTerm)) {
          return true;
        }
      }
      
      return false;
    });

    // SearchResult 타입으로 변환
    const searchResults: SearchResult[] = filteredResults.map(treatment => ({
      ID: treatment.ID,
      Product_Name: treatment.Product_Name,
      Product_Type: treatment.Product_Type,
      Package_Type: treatment.Package_Type,
      Sell_Price: treatment.Sell_Price,
      Original_Price: treatment.Original_Price,
      elements: treatment.class_types || [],
      class_types: treatment.class_types || [],
      class_type_count: treatment.class_types?.length || 0,
      Precautions: treatment.Precautions
    }));

    setState(prev => ({
      ...prev,
      searchResults,
      hasSearched: true
    }));
  }, [data, minQueryLength, enableChosungSearch]);

  // 디바운스된 검색 함수
  const debouncedSearch = useMemo(
    () => debounce((query: string, category: CategoryType) => {
      performSearch(query, category);
    }, debounceDelay),
    [performSearch, debounceDelay]
  );

  // 검색어 변경 시 디바운스된 검색 실행
  useEffect(() => {
    debouncedSearch(state.searchQuery, selectedCategory);
    
    // 컴포넌트 언마운트 시 디바운스 취소
    return () => {
      debouncedSearch.cancel();
    };
  }, [state.searchQuery, selectedCategory, debouncedSearch]);

  // 카테고리 변경 시 검색 재실행
  useEffect(() => {
    if (state.hasSearched && state.searchQuery.trim()) {
      performSearch(state.searchQuery, selectedCategory);
    }
  }, [selectedCategory, performSearch, state.hasSearched, state.searchQuery]);

  // 정렬된 결과 계산
  const getSortedResults = useCallback(() => {
    const results = [...state.searchResults];

    switch (sortBy) {
      case 'latest':
        // ID 기준 최신순 (높은 ID가 최신)
        results.sort((a, b) => b.ID - a.ID);
        break;
      case 'oldest':
        // ID 기준 오래된순 (낮은 ID가 오래됨)
        results.sort((a, b) => a.ID - b.ID);
        break;
      case 'price_high':
        results.sort((a, b) => b.Sell_Price - a.Sell_Price);
        break;
      case 'price_low':
        results.sort((a, b) => a.Sell_Price - b.Sell_Price);
        break;
      case 'name':
        results.sort((a, b) => (a.Product_Name || '').localeCompare(b.Product_Name || ''));
        break;
    }

    return results;
  }, [state.searchResults, sortBy]);

  const sortedResults = getSortedResults();

  // 검색어 설정
  const setSearchQuery = useCallback((query: string) => {
    setState(prev => ({ ...prev, searchQuery: query }));
  }, []);

  // 카테고리 설정
  const setCategory = useCallback((category: CategoryType) => {
    setSelectedCategory(category);
  }, []);

  // 정렬 설정
  const setSort = useCallback((sort: SortOption) => {
    setSortBy(sort);
  }, []);

  // 검색 초기화
  const resetSearch = useCallback(() => {
    setState({
      searchQuery: '',
      searchResults: [],
      hasSearched: false
    });
    setSelectedCategory('all');
    setSortBy('latest');
  }, []);

  return {
    // 상태
    searchQuery: state.searchQuery,
    searchResults: state.searchResults,
    sortedResults,
    hasSearched: state.hasSearched,
    selectedCategory,
    sortBy,
    
    // 액션
    setSearchQuery,
    setCategory,
    setSort,
    resetSearch,
    
    // 유틸리티
    totalResults: sortedResults.length,
    isEmpty: sortedResults.length === 0,
    isLoading: false // 필요시 로딩 상태 추가 가능
  };
};
