import { Element } from '@/api/element-api';
import { BundleListResponse } from '@/api/bundles-api';
import { CustomListResponse } from '@/api/customs-api';
import { SequenceListResponse } from '@/api/sequences-api';

// 초성 추출 함수
export const extractChosung = (text: string): string => {
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
export const matchesChosung = (searchTerm: string, targetText: string): boolean => {
  // 검색어가 초성인지 확인
  const isChosungSearch = /^[ㄱ-ㅎ]+$/.test(searchTerm);
  if (!isChosungSearch) return false;
  
  // 대상 텍스트의 초성 추출
  const targetChosung = extractChosung(targetText);
  
  // 초성 매칭 확인
  return targetChosung.includes(searchTerm);
};

// Element 검색 함수
export const searchElements = (elements: Element[], searchQuery: string): Element[] => {
  if (!searchQuery.trim()) {
    return elements;
  }
  
  const query = searchQuery.toLowerCase().trim();
  return elements.filter(element => {
    // 이름 검색
    if (element.name?.toLowerCase().includes(query)) {
      return true;
    }
    
    // 초성 검색 - 이름
    if (element.name && matchesChosung(query, element.name)) {
      return true;
    }
    
    // 분류 검색
    if (element.class_major?.toLowerCase().includes(query) ||
        element.class_sub?.toLowerCase().includes(query) ||
        element.class_detail?.toLowerCase().includes(query)) {
      return true;
    }
    
    // 초성 검색 - 분류
    if ((element.class_major && matchesChosung(query, element.class_major)) ||
        (element.class_sub && matchesChosung(query, element.class_sub)) ||
        (element.class_detail && matchesChosung(query, element.class_detail))) {
      return true;
    }
    
    // Position Type 검색
    if (element.position_type?.toLowerCase().includes(query)) {
      return true;
    }
    
    // 초성 검색 - Position Type
    if (element.position_type && matchesChosung(query, element.position_type)) {
      return true;
    }
    
    // 설명 검색
    if (element.description?.toLowerCase().includes(query)) {
      return true;
    }
    
    // 초성 검색 - 설명
    if (element.description && matchesChosung(query, element.description)) {
      return true;
    }
    
    return false;
  });
};

// Bundle 검색 함수
export const searchBundles = (bundles: BundleListResponse[], searchQuery: string): BundleListResponse[] => {
  if (!searchQuery.trim()) {
    return bundles;
  }
  
  const query = searchQuery.toLowerCase().trim();
  return bundles.filter(bundle => {
    // 이름 검색
    if (bundle.name?.toLowerCase().includes(query)) {
      return true;
    }
    
    // 초성 검색 - 이름
    if (bundle.name && matchesChosung(query, bundle.name)) {
      return true;
    }
    
    // 설명 검색
    if (bundle.description?.toLowerCase().includes(query)) {
      return true;
    }
    
    // 초성 검색 - 설명
    if (bundle.description && matchesChosung(query, bundle.description)) {
      return true;
    }
    
    return false;
  });
};

// Custom 검색 함수
export const searchCustoms = (customs: CustomListResponse[], searchQuery: string): CustomListResponse[] => {
  if (!searchQuery.trim()) {
    return customs;
  }
  
  const query = searchQuery.toLowerCase().trim();
  return customs.filter(custom => {
    // 이름 검색
    if (custom.name?.toLowerCase().includes(query)) {
      return true;
    }
    
    // 초성 검색 - 이름
    if (custom.name && matchesChosung(query, custom.name)) {
      return true;
    }
    
    // 설명 검색
    if (custom.description?.toLowerCase().includes(query)) {
      return true;
    }
    
    // 초성 검색 - 설명
    if (custom.description && matchesChosung(query, custom.description)) {
      return true;
    }
    
    return false;
  });
};

// Sequence 검색 함수
export const searchSequences = (sequences: SequenceListResponse[], searchQuery: string): SequenceListResponse[] => {
  if (!searchQuery.trim()) {
    return sequences;
  }
  
  const query = searchQuery.toLowerCase().trim();
  return sequences.filter(sequence => {
    // 이름 검색 (sequence_name)
    if (sequence.sequence_name?.toLowerCase().includes(query)) {
      return true;
    }
    
    // 초성 검색 - 이름
    if (sequence.sequence_name && matchesChosung(query, sequence.sequence_name)) {
      return true;
    }
    
    // ID 검색 (group_id)
    if (sequence.group_id?.toString().includes(query)) {
      return true;
    }
    
    return false;
  });
};
