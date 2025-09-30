import { create } from 'zustand';
import { ProductGroupedResponse, ProductInfoResponse, getProductsList } from '@/api/products-api';
import { MembershipResponse, getMembershipList } from '@/api/membership-api';

// 타입 가드 함수 추가
function isProductGroupedResponse(item: unknown): item is ProductGroupedResponse {
  return item !== null && 
         typeof item === 'object' && 
         'products' in item && 
         'procedure_info' in item;
}

interface ProductsState {
  // 데이터 상태
  standardProducts: ProductGroupedResponse[];
  eventProducts: ProductGroupedResponse[];
  memberships: MembershipResponse[];
  
  // 로딩 상태
  loading: boolean;
  error: string | null;
  
  // 캐시 상태
  lastUpdated: {
    standard: number | null;
    event: number | null;
    memberships: number | null;
  };
  
  // 액션
  setStandardProducts: (products: ProductGroupedResponse[]) => void;
  setEventProducts: (products: ProductGroupedResponse[]) => void;
  setMemberships: (memberships: MembershipResponse[]) => void;
  
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // 개별 상품 업데이트 (수정 후 실시간 반영용)
  updateStandardProduct: (procedureId: number, productId: number, updatedData: Partial<ProductInfoResponse>) => void;
  updateEventProduct: (procedureId: number, productId: number, updatedData: Partial<ProductGroupedResponse['products']['event'][0]>) => void;
  updateMembership: (membershipId: number, updatedData: Partial<MembershipResponse>) => void;
  
  // 캐시 무효화
  invalidateCache: (type: 'standard' | 'event' | 'memberships') => void;
  
  // 캐시 상태 확인
  isCacheValid: (type: 'standard' | 'event' | 'memberships') => boolean;
  
  // 데이터 로드 함수들 (캐시 확인 후 API 호출)
  loadStandardProducts: () => Promise<void>;
  loadEventProducts: () => Promise<void>;
  loadMemberships: () => Promise<void>;
  
  // 강제 새로고침 (캐시 무효화 후 API 호출)
  forceRefreshStandard: () => Promise<void>;
  forceRefreshEvent: () => Promise<void>;
  forceRefreshMemberships: () => Promise<void>;
}

export const useProductsStore = create<ProductsState>((set, get) => ({
  // 초기 상태
  standardProducts: [],
  eventProducts: [],
  memberships: [],
  loading: false,
  error: null,
  lastUpdated: {
    standard: null,
    event: null,
    memberships: null,
  },
  
  // 액션들
  setStandardProducts: (products) => set({
    standardProducts: products,
    lastUpdated: { ...get().lastUpdated, standard: Date.now() }
  }),
  
  setEventProducts: (products) => set({
    eventProducts: products,
    lastUpdated: { ...get().lastUpdated, event: Date.now() }
  }),
  
  setMemberships: (memberships) => set({
    memberships,
    lastUpdated: { ...get().lastUpdated, memberships: Date.now() }
  }),
  
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  
  // 개별 상품 업데이트
  updateStandardProduct: (procedureId, productId, updatedData) => {
    const { standardProducts } = get();
    const updatedProducts = standardProducts.map(product => {
      if (product.procedure_info.id === procedureId) {
        const updatedStandardProducts = product.products.standard.map(standardProduct => 
          standardProduct.id === productId ? {
            ...standardProduct,
            info_standard: standardProduct.info_standard ? {
              ...standardProduct.info_standard,
              ...updatedData  // name: "진욱이진욱이"를 info_standard.name에 적용
            } : updatedData
          } : standardProduct
        );
        return {
          ...product,
          products: {
            ...product.products,
            standard: updatedStandardProducts
          }
        };
      }
      return product;
    });
    set({ 
      standardProducts: updatedProducts,
      lastUpdated: { ...get().lastUpdated, standard: Date.now() }
    });
  },
  
  updateEventProduct: (procedureId, productId, updatedData) => {
    const { eventProducts } = get();
    const updatedProducts = eventProducts.map(product => {
      if (product.procedure_info.id === procedureId) {
        const updatedEventProducts = product.products.event.map(eventProduct => 
          eventProduct.id === productId ? { ...eventProduct, ...updatedData } : eventProduct
        );
        return {
          ...product,
          products: {
            ...product.products,
            event: updatedEventProducts
          }
        };
      }
      return product;
    });
    set({ 
      eventProducts: updatedProducts,
      lastUpdated: { ...get().lastUpdated, event: Date.now() }
    });
  },
  
  updateMembership: (membershipId, updatedData) => {
    const { memberships } = get();
    const updatedMemberships = memberships.map(membership => 
      membership.id === membershipId ? { ...membership, ...updatedData } : membership
    );
    set({ 
      memberships: updatedMemberships,
      lastUpdated: { ...get().lastUpdated, memberships: Date.now() }
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
  loadStandardProducts: async () => {
    const { isCacheValid, setLoading, setError, setStandardProducts } = get();
    
    // 캐시가 유효하면 API 호출하지 않음
    if (isCacheValid('standard')) {
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await getProductsList('procedure_grouped', 'standard');
      
      if (response.status === 'success') {
        // 타입 가드로 ProductGroupedResponse[] 확인
        if (Array.isArray(response.data) && response.data.length > 0 && 'procedure_info' in response.data[0]) {
          const products = response.data as ProductGroupedResponse[];
          console.log(`Standard 상품 데이터 로드 완료: 총 ${products.length}개`);
          setStandardProducts(products);
        } else {
          console.log('Standard 상품 데이터 없음: 0개');
          setStandardProducts([]);
        }
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load standard products');
    } finally {
      setLoading(false);
    }
  },

  loadEventProducts: async () => {
    const { isCacheValid, setLoading, setError, setEventProducts } = get();
    
    // 캐시가 유효하면 API 호출하지 않음
    if (isCacheValid('event')) {
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await getProductsList('procedure_grouped', 'event');
      
      if (response.status === 'success') {
        // 타입 가드로 ProductGroupedResponse[] 확인
        if (Array.isArray(response.data) && response.data.length > 0 && 'procedure_info' in response.data[0]) {
          const products = response.data as ProductGroupedResponse[];
          console.log(`Event 상품 데이터 로드 완료: 총 ${products.length}개`);
          setEventProducts(products);
        } else {
          console.log('Event 상품 데이터 없음: 0개');
          setEventProducts([]);
        }
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load event products');
    } finally {
      setLoading(false);
    }
  },
  
  loadMemberships: async () => {
    const { isCacheValid, setLoading, setError, setMemberships } = get();
    
    // 캐시가 유효하면 API 호출하지 않음
    if (isCacheValid('memberships')) {
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      const memberships = await getMembershipList();
      
      // memberships와 lastUpdated를 함께 설정
      set({ 
        memberships,
        lastUpdated: { ...get().lastUpdated, memberships: Date.now() }
      });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load memberships');
    } finally {
      setLoading(false);
    }
  },
  
  // 강제 새로고침 (캐시 무효화 후 API 호출)
  forceRefreshStandard: async () => {
    const { invalidateCache, setLoading, setError, setStandardProducts, standardProducts } = get();
    
    try {
      setLoading(true);
      setError(null);
      
      // 새로고침 전 데이터 개수
      const beforeCount = standardProducts.length;
      console.log(`🔄 Standard 상품 데이터 강제 새로고침 시작 (이전: ${beforeCount}개)`);
      
      invalidateCache('standard');
      console.log('🗑️ 캐시 무효화 완료');
      
      const response = await getProductsList('procedure_grouped', 'standard');
      console.log('📡 API 응답:', {
        status: response.status,
        dataLength: Array.isArray(response.data) ? response.data.length : 'Not Array',
        firstItem: Array.isArray(response.data) && response.data.length > 0 ? response.data[0] : null
      });
      
      if (response.status === 'success') {
        // 타입 가드로 ProductGroupedResponse[] 확인
        if (Array.isArray(response.data) && response.data.length > 0 && 'procedure_info' in response.data[0]) {
          const products = response.data as ProductGroupedResponse[];
          const afterCount = products.length;
          console.log(`🔄 Standard 상품 데이터 강제 새로고침 완료: 총 ${afterCount}개 (변화: ${afterCount - beforeCount > 0 ? '+' : ''}${afterCount - beforeCount}개)`);
          
          // 마지막 5개 상품 정보 로그
          if (products.length > 0) {
            console.log('📋 마지막 5개 상품 정보:', products.slice(-5).map(p => ({
              id: p.procedure_info.id,
              name: p.procedure_info.name,
              type: p.procedure_info.type,
              standardCount: p.products?.standard?.length || 0
            })));
          }
          
          setStandardProducts(products);
        } else {
          console.log('🔄 Standard 상품 데이터 강제 새로고침: 0개');
          setStandardProducts([]);
        }
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to refresh standard products');
    } finally {
      setLoading(false);
    }
  },
  
  forceRefreshEvent: async () => {
    const { invalidateCache, setLoading, setError, setEventProducts } = get();
    
    try {
      setLoading(true);
      setError(null);
      invalidateCache('event');
      const response = await getProductsList('procedure_grouped', 'event');
      if (response.status === 'success') {
        // 타입 가드로 ProductGroupedResponse[] 확인
        if (Array.isArray(response.data) && response.data.length > 0 && 'procedure_info' in response.data[0]) {
          const products = response.data as ProductGroupedResponse[];
          console.log(`🔄 Event 상품 데이터 강제 새로고침 완료: 총 ${products.length}개`);
          setEventProducts(products);
        } else {
          console.log('🔄 Event 상품 데이터 강제 새로고침: 0개');
          setEventProducts([]);
        }
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to refresh event products');
    } finally {
      setLoading(false);
    }
  },
  
  forceRefreshMemberships: async () => {
    const { invalidateCache, setLoading, setError } = get();
    
    try {
      setLoading(true);
      setError(null);
      invalidateCache('memberships');
      const memberships = await getMembershipList();
      
      // memberships와 lastUpdated를 함께 설정
      set({ 
        memberships,
        lastUpdated: { ...get().lastUpdated, memberships: Date.now() }
      });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to refresh memberships');
    } finally {
      setLoading(false);
    }
  },
  
}));