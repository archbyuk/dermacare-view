import { create } from 'zustand';
import { Product } from '@/types/treatments';

interface TreatmentsState {
  // 데이터
  treatments: Product[];
  loading: boolean;
  error: string | null;
  
  // 필터링 및 검색
  selectedProductType: 'all' | 'standard' | 'event';
  searchQuery: string;
  selectedCategory: string;
  
  // 페이지네이션
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  
  // 액션
  setTreatments: (treatments: Product[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSelectedProductType: (type: 'all' | 'standard' | 'event') => void;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: string) => void;
  setCurrentPage: (page: number) => void;
  setPagination: (pagination: { totalCount: number; totalPages: number }) => void;
  resetFilters: () => void;
}

export const useTreatmentsStore = create<TreatmentsState>((set) => ({
  // 초기 상태
  treatments: [],
  loading: false,
  error: null,
  selectedProductType: 'all',
  searchQuery: '',
  selectedCategory: '',
  currentPage: 1,
  pageSize: 30,
  totalCount: 0,
  totalPages: 0,
  
  // 액션
  setTreatments: (treatments) => set({ treatments }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setSelectedProductType: (selectedProductType) => set({ selectedProductType, currentPage: 1 }),
  setSearchQuery: (searchQuery) => set({ searchQuery, currentPage: 1 }),
  setSelectedCategory: (selectedCategory) => set({ selectedCategory, currentPage: 1 }),
  setCurrentPage: (currentPage) => set({ currentPage }),
  setPagination: ({ totalCount, totalPages }) => set({ totalCount, totalPages }),
  resetFilters: () => set({
    selectedProductType: 'all',
    searchQuery: '',
    selectedCategory: '',
    currentPage: 1
  }),
}));
