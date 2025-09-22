import { create } from 'zustand';
import { Element, getElementsList } from '@/api/element-api';
import { BundleListResponse, getBundlesList } from '@/api/bundles-api';
import { CustomListResponse, getCustomsList } from '@/api/customs-api';
import { SequenceResponse, getSequencesList } from '@/api/sequences-api';

interface ProceduresState {
  // 데이터 상태
  elements: Element[];
  bundles: BundleListResponse[];
  customs: CustomListResponse[];
  sequences: SequenceResponse[];
  
  // 로딩 상태
  loading: boolean;
  error: string | null;
  
  // 캐시 상태
  lastUpdated: {
    elements: number | null;
    bundles: number | null;
    customs: number | null;
    sequences: number | null;
  };
  
  // 액션
  setElements: (elements: Element[]) => void;
  setBundles: (bundles: BundleListResponse[]) => void;
  setCustoms: (customs: CustomListResponse[]) => void;
  setSequences: (sequences: SequenceResponse[]) => void;
  
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // 개별 시술 업데이트 (수정 후 실시간 반영용)
  updateElement: (elementId: number, updatedData: Partial<Element>) => void;
  updateBundle: (groupId: number, updatedData: Partial<BundleListResponse>) => void;
  updateCustom: (groupId: number, updatedData: Partial<CustomListResponse>) => void;
  updateSequence: (groupId: number, updatedData: Partial<SequenceResponse>) => void;
  
  // 캐시 무효화
  invalidateCache: (type: 'elements' | 'bundles' | 'customs' | 'sequences') => void;
  
  // 캐시 상태 확인
  isCacheValid: (type: 'elements' | 'bundles' | 'customs' | 'sequences') => boolean;
  
  // 데이터 로드 함수들 (캐시 확인 후 API 호출)
  loadElements: () => Promise<void>;
  loadBundles: () => Promise<void>;
  loadCustoms: () => Promise<void>;
  loadSequences: () => Promise<void>;
  
  // 모든 시술 데이터 한번에 로드
  loadAllProcedures: () => Promise<void>;
  
  // 강제 새로고침 (캐시 무효화 후 API 호출)
  forceRefreshElements: () => Promise<void>;
  forceRefreshBundles: () => Promise<void>;
  forceRefreshCustoms: () => Promise<void>;
  forceRefreshSequences: () => Promise<void>;
  
  // 모든 시술 데이터 강제 새로고침
  forceRefreshAllProcedures: () => Promise<void>;
}

export const useProceduresStore = create<ProceduresState>((set, get) => ({
  // 초기 상태
  elements: [],
  bundles: [],
  customs: [],
  sequences: [],
  loading: false,
  error: null,
  lastUpdated: {
    elements: null,
    bundles: null,
    customs: null,
    sequences: null,
  },
  
  // 액션들
  setElements: (elements) => set({
    elements,
    lastUpdated: { ...get().lastUpdated, elements: Date.now() }
  }),
  
  setBundles: (bundles) => set({
    bundles,
    lastUpdated: { ...get().lastUpdated, bundles: Date.now() }
  }),
  
  setCustoms: (customs) => set({
    customs,
    lastUpdated: { ...get().lastUpdated, customs: Date.now() }
  }),
  
  setSequences: (sequences) => set({
    sequences,
    lastUpdated: { ...get().lastUpdated, sequences: Date.now() }
  }),
  
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  
  // 개별 시술 업데이트
  updateElement: (elementId, updatedData) => {
    const { elements } = get();
    const updatedElements = elements.map(element => 
      element.id === elementId ? { ...element, ...updatedData } : element
    );
    set({ 
      elements: updatedElements,
      lastUpdated: { ...get().lastUpdated, elements: Date.now() }
    });
  },
  
  updateBundle: (groupId, updatedData) => {
    const { bundles } = get();
    const updatedBundles = bundles.map(bundle => 
      bundle.group_id === groupId ? { ...bundle, ...updatedData } : bundle
    );
    set({ 
      bundles: updatedBundles,
      lastUpdated: { ...get().lastUpdated, bundles: Date.now() }
    });
  },
  
  updateCustom: (groupId, updatedData) => {
    const { customs } = get();
    const updatedCustoms = customs.map(custom => 
      custom.group_id === groupId ? { ...custom, ...updatedData } : custom
    );
    set({ 
      customs: updatedCustoms,
      lastUpdated: { ...get().lastUpdated, customs: Date.now() }
    });
  },
  
  updateSequence: (groupId, updatedData) => {
    const { sequences } = get();
    const updatedSequences = sequences.map(sequence => 
      sequence.group_id === groupId ? { ...sequence, ...updatedData } : sequence
    );
    set({ 
      sequences: updatedSequences,
      lastUpdated: { ...get().lastUpdated, sequences: Date.now() }
    });
  },
  
  // 캐시 무효화
  invalidateCache: (type) => set({
    lastUpdated: { ...get().lastUpdated, [type]: null }
  }),
  
  // 캐시 유효성 확인 (1시간)
  isCacheValid: (type) => {
    const lastUpdated = get().lastUpdated[type];
    if (!lastUpdated) return false;
    return Date.now() - lastUpdated < 60 * 60 * 1000; // 1시간
  },
  
  // 데이터 로드 함수들 (캐시 확인 후 API 호출)
  loadElements: async () => {
    const { isCacheValid, setLoading, setError, setElements } = get();
    
    // 캐시가 유효하면 API 호출하지 않음
    if (isCacheValid('elements')) {
      console.log('📦 Elements cache is valid, skipping API call');
      return;
    }
    
    try {
      console.log('🔄 Loading elements...');
      setLoading(true);
      setError(null);
      
      const elementsData = await getElementsList();
      console.log('✅ Elements loaded successfully:', elementsData.length, 'items');
      setElements(elementsData);
    } catch (error) {
      console.error('❌ loadElements failed:', error);
      setError(error instanceof Error ? error.message : 'Failed to load elements');
    } finally {
      setLoading(false);
    }
  },

  loadBundles: async () => {
    const { isCacheValid, setLoading, setError, setBundles } = get();
    
    // 캐시가 유효하면 API 호출하지 않음
    if (isCacheValid('bundles')) {
      console.log('📦 Bundles cache is valid, skipping API call');
      return;
    }
    
    try {
      console.log('🔄 Loading bundles...');
      setLoading(true);
      setError(null);
      
      const bundlesData = await getBundlesList();
      console.log('✅ Bundles loaded successfully:', bundlesData.length, 'items');
      setBundles(bundlesData);
    } catch (error) {
      console.error('❌ loadBundles failed:', error);
      setError(error instanceof Error ? error.message : 'Failed to load bundles');
    } finally {
      setLoading(false);
    }
  },
  
  loadCustoms: async () => {
    const { isCacheValid, setLoading, setError, setCustoms } = get();
    
    // 캐시가 유효하면 API 호출하지 않음
    if (isCacheValid('customs')) {
      console.log('📦 Customs cache is valid, skipping API call');
      return;
    }
    
    try {
      console.log('🔄 Loading customs...');
      setLoading(true);
      setError(null);
      
      const customsData = await getCustomsList();
      console.log('✅ Customs loaded successfully:', customsData.length, 'items');
      setCustoms(customsData);
    } catch (error) {
      console.error('❌ loadCustoms failed:', error);
      setError(error instanceof Error ? error.message : 'Failed to load customs');
    } finally {
      setLoading(false);
    }
  },
  
  loadSequences: async () => {
    const { isCacheValid, setLoading, setError, setSequences } = get();
    
    // 캐시가 유효하면 API 호출하지 않음
    if (isCacheValid('sequences')) {
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const sequencesData = await getSequencesList();
      setSequences(sequencesData);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load sequences');
    } finally {
      setLoading(false);
    }
  },
  
  // 모든 시술 데이터 한번에 로드
  loadAllProcedures: async () => {
    const { loadElements, loadBundles, loadCustoms, loadSequences, setLoading, setError } = get();
    
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Starting to load all procedures...');
      
      // 모든 시술 데이터를 병렬로 로드 (개별 실패 허용)
      const results = await Promise.allSettled([
        loadElements().catch(err => {
          console.error('❌ loadElements failed:', err);
          throw err;
        }),
        loadBundles().catch(err => {
          console.error('❌ loadBundles failed:', err);
          throw err;
        }),
        loadCustoms().catch(err => {
          console.error('❌ loadCustoms failed:', err);
          throw err;
        }),
        loadSequences().catch(err => {
          console.error('❌ loadSequences failed:', err);
          throw err;
        })
      ]);
      
      // 결과 분석
      const successCount = results.filter(result => result.status === 'fulfilled').length;
      const failureCount = results.filter(result => result.status === 'rejected').length;
      
      console.log(`✅ Procedures loading completed: ${successCount} successful, ${failureCount} failed`);
      
      // 일부만 성공해도 전체 성공으로 처리
      if (successCount > 0) {
        console.log('✅ Some procedures loaded successfully');
      } else {
        console.error('❌ All procedures failed to load');
        setError('모든 시술 데이터 로드에 실패했습니다.');
      }
    } catch (error) {
      console.error('❌ loadAllProcedures failed:', error);
      setError(error instanceof Error ? error.message : 'Failed to load all procedures');
    } finally {
      setLoading(false);
    }
  },
  
  // 강제 새로고침 (캐시 무효화 후 API 호출)
  forceRefreshElements: async () => {
    const { invalidateCache, setLoading, setError, setElements } = get();
    
    try {
      setLoading(true);
      setError(null);
      invalidateCache('elements');
      const elementsData = await getElementsList();
      setElements(elementsData);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to refresh elements');
    } finally {
      setLoading(false);
    }
  },
  
  forceRefreshBundles: async () => {
    const { invalidateCache, setLoading, setError, setBundles } = get();
    
    try {
      setLoading(true);
      setError(null);
      invalidateCache('bundles');
      const bundlesData = await getBundlesList();
      setBundles(bundlesData);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to refresh bundles');
    } finally {
      setLoading(false);
    }
  },
  
  forceRefreshCustoms: async () => {
    const { invalidateCache, setLoading, setError, setCustoms } = get();
    
    try {
      setLoading(true);
      setError(null);
      invalidateCache('customs');
      const customsData = await getCustomsList();
      setCustoms(customsData);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to refresh customs');
    } finally {
      setLoading(false);
    }
  },
  
  forceRefreshSequences: async () => {
    const { invalidateCache, setLoading, setError, setSequences } = get();
    
    try {
      setLoading(true);
      setError(null);
      invalidateCache('sequences');
      const sequencesData = await getSequencesList();
      setSequences(sequencesData);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to refresh sequences');
    } finally {
      setLoading(false);
    }
  },
  
  // 모든 시술 데이터 강제 새로고침
  forceRefreshAllProcedures: async () => {
    const { invalidateCache, setLoading, setError, setElements, setBundles, setCustoms, setSequences } = get();
    
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Starting force refresh all procedures...');
      
      // 모든 캐시 무효화
      invalidateCache('elements');
      invalidateCache('bundles');
      invalidateCache('customs');
      invalidateCache('sequences');
      
      // 모든 시술 데이터를 병렬로 새로고침 (개별 실패 허용)
      const results = await Promise.allSettled([
        getElementsList().catch(err => {
          console.error('❌ getElementsList failed:', err);
          throw err;
        }),
        getBundlesList().catch(err => {
          console.error('❌ getBundlesList failed:', err);
          throw err;
        }),
        getCustomsList().catch(err => {
          console.error('❌ getCustomsList failed:', err);
          throw err;
        }),
        getSequencesList().catch(err => {
          console.error('❌ getSequencesList failed:', err);
          throw err;
        })
      ]);
      
      // 결과 분석 및 데이터 설정
      let successCount = 0;
      
      // elements 결과 처리
      if (results[0].status === 'fulfilled') {
        setElements(results[0].value);
        successCount++;
        console.log('✅ Elements refreshed successfully');
      } else {
        console.error('❌ Elements refresh failed:', results[0].reason);
      }
      
      // bundles 결과 처리
      if (results[1].status === 'fulfilled') {
        setBundles(results[1].value);
        successCount++;
        console.log('✅ Bundles refreshed successfully');
      } else {
        console.error('❌ Bundles refresh failed:', results[1].reason);
      }
      
      // customs 결과 처리
      if (results[2].status === 'fulfilled') {
        setCustoms(results[2].value);
        successCount++;
        console.log('✅ Customs refreshed successfully');
      } else {
        console.error('❌ Customs refresh failed:', results[2].reason);
      }
      
      // sequences 결과 처리
      if (results[3].status === 'fulfilled') {
        setSequences(results[3].value);
        successCount++;
        console.log('✅ Sequences refreshed successfully');
      } else {
        console.error('❌ Sequences refresh failed:', results[3].reason);
      }
      
      console.log(`✅ Force refresh completed: ${successCount} successful, ${4 - successCount} failed`);
      
      if (successCount === 0) {
        setError('모든 시술 데이터 새로고침에 실패했습니다.');
      }
    } catch (error) {
      console.error('❌ forceRefreshAllProcedures failed:', error);
      setError(error instanceof Error ? error.message : 'Failed to refresh all procedures');
    } finally {
      setLoading(false);
    }
  },
}));
