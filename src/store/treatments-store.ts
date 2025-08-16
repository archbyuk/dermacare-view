import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '@/types/treatments';
import { getTreatments } from '@/api/treatments-api';

interface TreatmentsState {
  // 원본 데이터
  treatments: Product[];
  
  // UI 상태
  loading: boolean;
  error: string | null;
  
  // 캐시 관리
  lastFetched: number;
  isExpired: boolean;
  
  // 액션
  fetchTreatments: () => Promise<void>;
  refreshTreatments: () => Promise<void>;
  clearCache: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

// 캐시 만료 시간 (1시간)
const CACHE_DURATION = 60 * 60 * 2000; // 2시간 (밀리초)

export const useTreatmentsStore = create<TreatmentsState>()(
  persist(
    (set, get) => ({
      // 초기 상태
      treatments: [],
      loading: false,
      error: null,
      lastFetched: 0,
      isExpired: false,
      
      // 액션
      fetchTreatments: async () => {
        const state = get();
        
        // 캐시가 유효한지 확인
        const now = Date.now();
        const isExpired = now - state.lastFetched > CACHE_DURATION;
        
        // 캐시가 유효하고 데이터가 있으면 캐시 사용
        if (!isExpired && state.treatments.length > 0) {
          set({ isExpired: false });
          return;
        }
        
        // 캐시가 만료되었거나 데이터가 없으면 API 호출
        try {
          set({ loading: true, error: null });
          
          const response = await getTreatments({
            page: 1,
            page_size: 1000,
            product_type: 'all'
          });
          
          set({
            treatments: response.data,
            loading: false,
            lastFetched: now,
            isExpired: false
          });
          
        } catch (error: unknown) {
          const errorMessage = error instanceof Error 
            ? error.message 
            : '시술 목록을 불러오는데 실패했습니다.';
          
          set({
            error: errorMessage,
            loading: false
          });
        }
      },
      
      refreshTreatments: async () => {
        // 강제로 캐시를 무효화하고 새로 가져오기
        set({ lastFetched: 0, isExpired: true });
        await get().fetchTreatments();
      },
      
      clearCache: () => {
        set({
          treatments: [],
          lastFetched: 0,
          isExpired: true
        });
      },
      
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
    }),
    {
      name: 'treatments-cache',
      // 캐시에 저장할 데이터만 선택
      partialize: (state) => ({
        treatments: state.treatments,
        lastFetched: state.lastFetched
      }),
    }
  )
);
