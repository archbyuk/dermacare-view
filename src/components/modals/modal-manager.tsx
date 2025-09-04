'use client';

import { useModalStore } from '@/store/modal-store';
import { Package } from 'lucide-react';
import ElementCreateModal from '@/components/tabs/data-management/procedure-management/element/element-create-modal';
import ElementDetailModal from '@/components/tabs/data-management/procedure-management/element/element-detail-modal';
import BundleCreateModal from '@/components/tabs/data-management/procedure-management/bundle/bundle-create-modal';
import BundleDetailModal from '@/components/tabs/data-management/procedure-management/bundle/bundle-detail-modal';
import ConsumablesCreateModal from '@/components/tabs/data-management/costs-management/consumables-create-modal';
import ConsumableDetailModal from '@/components/tabs/data-management/costs-management/consumable-detail-modal';
import CustomCreateModal from '@/components/tabs/data-management/procedure-management/custom/custom-create-modal';
import MembershipDetailModal from '@/components/tabs/data-management/products-management/membership-detail-modal';
import CustomDetailModal from '@/components/tabs/data-management/procedure-management/custom/custom-detail-modal';
import SequenceCreateModal from '@/components/tabs/data-management/procedure-management/sequence/sequence-create-modal';
import SequenceDetailModal from '@/components/tabs/data-management/procedure-management/sequence/sequence-detail-modal';
import { ProductDetailModal } from '@/components/tabs/product-detail-modal';
import StandardDetailModal from '@/components/tabs/data-management/products-management/standard-detail-modal';
import EventDetailModal from '@/components/tabs/data-management/products-management/event-detail-modal-new';
import ProductCreateModal from '@/components/tabs/data-management/products-management/product-create-modal';

export default function ModalManager() {
    const { activeModal, modalData, onRefresh, closeModal } = useModalStore();

    // 모달이 없으면 아무것도 렌더링하지 않음
    if (!activeModal) return null;

    // 모달 타입에 따라 적절한 컴포넌트 렌더링
    const renderModal = () => {
        switch (activeModal) {
            case 'element-create':
                return (
                    <ElementCreateModal
                        isOpen={true}
                        onClose={closeModal}
                        onSuccess={closeModal}
                        onRefresh={onRefresh}
                    />
                );
            
            case 'element-detail':
                if (modalData?.type === 'element-detail') {
                    return (
                        <ElementDetailModal
                            element={modalData.data}
                            isOpen={true}
                            onClose={closeModal}
                            onDataUpdate={onRefresh}
                        />
                    );
                }
                return null;
            
            case 'bundle-create':
                return (
                    <BundleCreateModal
                        isOpen={true}
                        onClose={closeModal}
                        onSuccess={closeModal}
                        onRefresh={onRefresh}
                    />
                );
            
            case 'bundle-detail':
                if (modalData?.type === 'bundle-detail') {
                    return (
                        <BundleDetailModal
                            bundle={modalData.data}
                            isOpen={true}
                            onClose={closeModal}
                            onDataUpdate={onRefresh}
                        />
                    );
                }
                return null;
            
            case 'consumable-create':
                return (
                    <ConsumablesCreateModal
                        isOpen={true}
                        onClose={closeModal}
                        onSuccess={closeModal}
                        onRefresh={onRefresh}
                    />
                );
            
            case 'consumable-detail':
                if (modalData?.type === 'consumable-detail') {
                    return (
                        <ConsumableDetailModal
                            consumable={modalData.data}
                            isOpen={true}
                            onClose={closeModal}
                            onDataUpdate={closeModal}
                        />
                    );
                }
                return null;
            
            case 'custom-create':
                return (
                    <CustomCreateModal
                        isOpen={true}
                        onClose={closeModal}
                        onSuccess={closeModal}
                        onRefresh={onRefresh}
                    />
                );
            
            case 'custom-detail':
                if (modalData?.type === 'custom-detail') {
                    return (
                        <CustomDetailModal
                            custom={modalData.data}
                            isOpen={true}
                            onClose={closeModal}
                            onDataUpdate={onRefresh}
                            onRefresh={onRefresh}
                        />
                    );
                }
                return null;
            
            case 'membership-detail':
                if (modalData?.type === 'membership-detail') {
                    return (
                        <MembershipDetailModal
                            isOpen={true}
                            onClose={closeModal}
                            onSuccess={closeModal}
                            membership={modalData.data}
                            onRefresh={onRefresh}
                        />
                    );
                }
                return null;
            
            case 'membership-create':
                return (
                    <MembershipDetailModal
                        isOpen={true}
                        onClose={closeModal}
                        onSuccess={closeModal}
                        membership={null}
                        onRefresh={onRefresh}
                    />
                );
            
            case 'sequence-create':
                return (
                    <SequenceCreateModal
                        isOpen={true}
                        onClose={closeModal}
                        onSuccess={closeModal}
                        onRefresh={onRefresh}
                    />
                );
            
            case 'sequence-detail':
                if (modalData?.type === 'sequence-detail') {
                    return (
                        <SequenceDetailModal
                            isOpen={true}
                            onClose={closeModal}
                            onSuccess={closeModal}
                            sequence={modalData.data}
                            onRefresh={onRefresh}
                        />
                    );
                }
                return null;
            
            case 'product-standard-create':
                return (
                    <ProductCreateModal
                        isOpen={true}
                        onClose={closeModal}
                        onSuccess={closeModal}
                        onRefresh={onRefresh}
                    />
                );
            
            case 'product-event-create':
                return (
                    <ProductCreateModal
                        isOpen={true}
                        onClose={closeModal}
                        onSuccess={closeModal}
                        onRefresh={onRefresh}
                    />
                );
            
            case 'product-standard-detail':                
                if (modalData?.type === 'product-standard-detail') {
                    return (
                        <StandardDetailModal
                            product={modalData.data}
                            isOpen={true}
                            onClose={closeModal}
                            onRefresh={onRefresh || (() => Promise.resolve())}
                        />
                    );
                }
                return null;
            
            case 'product-event-detail':
                if (modalData?.type === 'product-event-detail') {
                    return (
                        <EventDetailModal
                            product={modalData.data}
                            onClose={closeModal}
                            onRefresh={onRefresh || (() => Promise.resolve())}
                        />
                    );
                }
                return null;
            
            case 'event-detail':
                if (modalData?.type === 'event-detail') {
                    return (
                        <EventDetailModal
                            product={modalData.data}
                            onClose={closeModal}
                            onRefresh={onRefresh || (() => Promise.resolve())}
                        />
                    );
                }
                return null;
            
            case 'product-detail':
                if (modalData?.type === 'product-detail') {
                    return (
                        <ProductDetailModal
                            isOpen={true}
                            onClose={closeModal}
                            productId={modalData.data.id}
                            productType={modalData.data.type}
                        />
                    );
                }
                return null;
            
            default:
                return null;
        }
    };

    return renderModal();
}
