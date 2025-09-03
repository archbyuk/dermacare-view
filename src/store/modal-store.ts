import { create } from 'zustand';
import { Element } from '@/api/element-api';
import { BundleListResponse } from '@/api/bundles-api';
import { ConsumableResponse } from '@/api/consumables-api';
import { CustomListResponse } from '@/api/customs-api';
import { MembershipResponse } from '@/api/membership-api';
import { SequenceResponse } from '@/api/sequences-api';
import { ProductDetailResponse } from '@/api/products-api';


// 모달 타입 정의
export type ModalType = 
    | 'element-create'
    | 'element-detail' 
    | 'bundle-create'
    | 'bundle-detail'
    | 'consumable-create'
    | 'consumable-detail'
    | 'custom-create'
    | 'custom-detail'
    | 'product-detail'
    | 'membership-detail'
    | 'membership-create'
    | 'sequence-create'
    | 'sequence-detail'
    | 'product-standard-create'
    | 'product-standard-detail'
    | 'product-event-create'
    | 'product-event-detail'
    | 'event-detail';

// 모달 데이터 타입 정의
export type ModalData = 
    | { type: 'element-detail'; data: Element }
    | { type: 'bundle-detail'; data: BundleListResponse }
    | { type: 'consumable-detail'; data: ConsumableResponse }
    | { type: 'custom-detail'; data: CustomListResponse }
    | { type: 'product-detail'; data: { id: number; type: 'standard' | 'event' } }
    | { type: 'membership-detail'; data: MembershipResponse }
    | { type: 'sequence-detail'; data: SequenceResponse }
    | { type: 'product-standard-detail'; data: ProductDetailResponse }
    | { type: 'product-event-detail'; data: ProductDetailResponse }
    | { type: 'event-detail'; data: ProductDetailResponse }
    | { type: 'element-create' | 'bundle-create' | 'consumable-create' | 'custom-create' | 'membership-create' | 'sequence-create' | 'product-standard-create' | 'product-event-create'; data: null };

// 모달 상태 인터페이스
interface ModalState {
    // 현재 열린 모달 정보
    activeModal: ModalType | null;
    modalData: ModalData | null;
    onRefresh: (() => Promise<void>) | null;
    
    // 멤버십으로 돌아가기 위한 정보
    returnToMembership: MembershipResponse | null;
    
    // 모달 닫기
    closeModal: () => void;
    
    // 특정 모달 열기 (타입별 헬퍼 함수)
    openElementCreate: (onRefresh?: () => Promise<void>) => void;
    openElementDetail: (element: Element, onRefresh?: () => Promise<void>, returnToMembership?: MembershipResponse) => void;
    openBundleCreate: (onRefresh?: () => Promise<void>) => void;
    openBundleDetail: (bundle: BundleListResponse, onRefresh?: () => Promise<void>, returnToMembership?: MembershipResponse) => void;
    openConsumableCreate: (onRefresh?: () => Promise<void>) => void;
    openConsumableDetail: (consumable: ConsumableResponse, onRefresh?: () => Promise<void>) => void;
    openCustomCreate: (onRefresh?: () => Promise<void>) => void;
    openCustomDetail: (custom: CustomListResponse, onRefresh?: () => Promise<void>, returnToMembership?: MembershipResponse) => void;
    openProductDetail: (productId: number, productType: 'standard' | 'event') => void;
    openMembershipCreate: (onRefresh?: () => Promise<void>) => void;
    openMembershipDetail: (membership: MembershipResponse, onRefresh?: () => Promise<void>) => void;
    openSequenceCreate: (onRefresh?: () => Promise<void>) => void;
    openSequenceDetail: (sequence: SequenceResponse, onRefresh?: () => Promise<void>, returnToMembership?: MembershipResponse) => void;
    openProductStandardCreate: (onRefresh?: () => Promise<void>) => void;
    openProductStandardDetail: (product: ProductDetailResponse, onRefresh?: () => Promise<void>) => void;
    openProductEventCreate: (onRefresh?: () => Promise<void>) => void;
    openProductEventDetail: (product: ProductDetailResponse, onRefresh?: () => Promise<void>) => void;
    openEventDetail: (product: ProductDetailResponse, onRefresh?: () => Promise<void>) => void;
}

export const useModalStore = create<ModalState>((set) => ({
    activeModal: null,
    modalData: null,
    onRefresh: null,
    returnToMembership: null,
    
    closeModal: () => {
        set({ 
            activeModal: null, 
            modalData: null, 
            onRefresh: null,
            returnToMembership: null
        });
    },
    
    // Element 관련 모달
    openElementCreate: (onRefresh?: () => Promise<void>) => {
        set({ 
            activeModal: 'element-create', 
            modalData: { type: 'element-create', data: null },
            onRefresh: onRefresh || null,
            returnToMembership: null
        });
    },
    
    openElementDetail: (element: Element, onRefresh?: () => Promise<void>, returnToMembership?: MembershipResponse) => {
        set({ 
            activeModal: 'element-detail', 
            modalData: { type: 'element-detail', data: element },
            onRefresh: onRefresh || null,
            returnToMembership: returnToMembership || null
        });
    },
    
    // Bundle 관련 모달
    openBundleCreate: (onRefresh?: () => Promise<void>) => {
        set({ 
            activeModal: 'bundle-create', 
            modalData: { type: 'bundle-create', data: null },
            onRefresh: onRefresh || null,
            returnToMembership: null
        });
    },
    
    openBundleDetail: (bundle: BundleListResponse, onRefresh?: () => Promise<void>, returnToMembership?: MembershipResponse) => {
        set({ 
            activeModal: 'bundle-detail', 
            modalData: { type: 'bundle-detail', data: bundle },
            onRefresh: onRefresh || null,
            returnToMembership: returnToMembership || null
        });
    },
    
    // Consumable 관련 모달
    openConsumableCreate: (onRefresh?: () => Promise<void>) => {
        set({ 
            activeModal: 'consumable-create', 
            modalData: { type: 'consumable-create', data: null },
            onRefresh: onRefresh || null,
            returnToMembership: null
        });
    },
    
    openConsumableDetail: (consumable: ConsumableResponse, onRefresh?: () => Promise<void>) => {
        set({ 
            activeModal: 'consumable-detail', 
            modalData: { type: 'consumable-detail', data: consumable },
            onRefresh: onRefresh || null,
            returnToMembership: null
        });
    },
    
    // Custom 관련 모달
    openCustomCreate: (onRefresh?: () => Promise<void>) => {
        set({ 
            activeModal: 'custom-create', 
            modalData: { type: 'custom-create', data: null },
            onRefresh: onRefresh || null,
            returnToMembership: null
        });
    },
    
    openCustomDetail: (custom: CustomListResponse, onRefresh?: () => Promise<void>, returnToMembership?: MembershipResponse) => {
        set({ 
            activeModal: 'custom-detail', 
            modalData: { type: 'custom-detail', data: custom },
            onRefresh: onRefresh || null,
            returnToMembership: returnToMembership || null
        });
    },
    
    // Product 관련 모달
    openProductDetail: (productId: number, productType: 'standard' | 'event') => {
        set({ 
            activeModal: 'product-detail', 
            modalData: { type: 'product-detail', data: { id: productId, type: productType } },
            onRefresh: null,
            returnToMembership: null
        });
    },
    
    // Membership 관련 모달
    openMembershipCreate: (onRefresh?: () => Promise<void>) => {
        set({ 
            activeModal: 'membership-create', 
            modalData: { type: 'membership-create', data: null },
            onRefresh: onRefresh || null,
            returnToMembership: null
        });
    },
    
    openMembershipDetail: (membership: MembershipResponse, onRefresh?: () => Promise<void>) => {
        set({ 
            activeModal: 'membership-detail', 
            modalData: { type: 'membership-detail', data: membership },
            onRefresh: onRefresh || null,
            returnToMembership: null
        });
    },
    
    // Sequence 관련 모달
    openSequenceCreate: (onRefresh?: () => Promise<void>) => {
        set({ 
            activeModal: 'sequence-create', 
            modalData: { type: 'sequence-create', data: null },
            onRefresh: onRefresh || null,
            returnToMembership: null
        });
    },
    
    openSequenceDetail: (sequence: SequenceResponse, onRefresh?: () => Promise<void>, returnToMembership?: MembershipResponse) => {
        set({ 
            activeModal: 'sequence-detail', 
            modalData: { type: 'sequence-detail', data: sequence },
            onRefresh: onRefresh || null,
            returnToMembership: returnToMembership || null
        });
    },
    
    // Product Standard 관련 모달
    openProductStandardCreate: (onRefresh?: () => Promise<void>) => {
        set({ 
            activeModal: 'product-standard-create', 
            modalData: { type: 'product-standard-create', data: null },
            onRefresh: onRefresh || null,
            returnToMembership: null
        });
    },
    
    openProductStandardDetail: (product: ProductDetailResponse, onRefresh?: () => Promise<void>) => {
        
        set({ 
            activeModal: 'product-standard-detail', 
            modalData: { type: 'product-standard-detail', data: product },
            onRefresh: onRefresh || null,
            returnToMembership: null
        });
    },
    
    openProductEventCreate: (onRefresh?: () => Promise<void>) => {
        set({ 
            activeModal: 'product-event-create', 
            modalData: { type: 'product-event-create', data: null },
            onRefresh: onRefresh || null,
            returnToMembership: null
        });
    },
    
    openProductEventDetail: (product: ProductDetailResponse, onRefresh?: () => Promise<void>) => {
        set({ 
            activeModal: 'product-event-detail', 
            modalData: { type: 'product-event-detail', data: product },
            onRefresh: onRefresh || null,
            returnToMembership: null
        });
    },
    
    openEventDetail: (product: ProductDetailResponse, onRefresh?: () => Promise<void>) => {
        set({ 
            activeModal: 'event-detail', 
            modalData: { type: 'event-detail', data: product },
            onRefresh: onRefresh || null,
            returnToMembership: null
        });
    },
}));
