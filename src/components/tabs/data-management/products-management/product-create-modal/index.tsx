'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import ProductTypeSelector from './product-type-selector';
import ProductSettingsForm, { ProductFormData } from './product-settings-form';
import { Element } from '@/api/element-api';
import { BundleListResponse } from '@/api/bundles-api';
import { CustomListResponse } from '@/api/customs-api';
import { SequenceResponse } from '@/api/sequences-api';
import { createProduct } from '@/api/products-api';
import { ProductCreateResponseNew } from '@/types/products';

interface ProductCreateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    onRefresh?: (() => Promise<void>) | null;
}

export default function ProductCreateModal({ 
    isOpen, 
    onClose, 
    onSuccess,
    onRefresh
}: ProductCreateModalProps) {
    const [saving, setSaving] = useState(false);
    const [selectedProductType, setSelectedProductType] = useState<string | null>(null);
    const [selectedProcedureType, setSelectedProcedureType] = useState<string | null>(null);
    const [selectedProcedure, setSelectedProcedure] = useState<Element | BundleListResponse | CustomListResponse | SequenceResponse | null>(null);
    const [showProductSettings, setShowProductSettings] = useState(false);
    const [selectionComplete, setSelectionComplete] = useState(false);
    const [formData, setFormData] = useState<ProductFormData | null>(null);

    // 모달이 닫혀있으면 렌더링하지 않음
    if (!isOpen) return null;

    const handleClose = () => {
        onClose();
    };

    const handleSuccess = async () => {
        if (!formData || !selectedProductType || !selectedProcedureType || !selectedProcedure) {
            alert('필수 정보가 누락되었습니다.');
            return;
        }

        setSaving(true);
        try {
            // ProductSettingsForm의 transformFormDataToAPI 함수와 동일한 로직
            const procedureCost = getTotalProcedureCost(selectedProcedure);
            
            // package_type을 백엔드 형식으로 변환
            const getPackageTypeForAPI = (type: string) => {
                switch (type) {
                    case 'element': return '단일시술';
                    case 'bundle': return '번들';
                    case 'custom': return '커스텀';
                    case 'sequence': return '시퀀스';
                    default: return '단일시술';
                }
            };

            // procedure_info 구성
            const procedureInfo = {
                id: formData.productId ? parseInt(formData.productId) : null,
                release: 1,
                package_type: getPackageTypeForAPI(selectedProcedureType),
                element_id: formData.elementId,
                bundle_id: formData.bundleId,
                custom_id: formData.customId,
                sequence_id: formData.sequenceId,
                standard_info_id: formData.infoId ? parseInt(formData.infoId) : null,
                event_info_id: formData.infoId ? parseInt(formData.infoId) : null,
                procedure_grade: formData.procedureGrade
            };

            // standard_settings 구성
            const standardSettings = {
                enabled: selectedProductType === 'standard',
                procedure_cost: procedureCost,
                sell_price: parseFloat(formData.sellPrice),
                original_price: parseFloat(formData.originalPrice),
                vat: formData.vat,
                discount_rate: formData.discountRate * 100,
                margin: formData.margin,
                margin_rate: formData.marginRate,
                start_date: formData.startDate || undefined,
                end_date: formData.endDate || undefined,
                validity_period: formData.validityPeriod,
                covered_type: formData.coveredType,
                taxable_type: formData.taxableType,
                product_id: formData.productId ? parseInt(formData.productId) : null,
                standard_info_id: formData.infoId ? parseInt(formData.infoId) : null,
                product_standard_name: formData.productName,
                product_standard_description: formData.productDescription,
                precautions: formData.precautions
            };

            // event_settings 구성
            const eventSettings = {
                enabled: selectedProductType === 'event',
                procedure_cost: procedureCost,
                sell_price: parseFloat(formData.sellPrice),
                original_price: parseFloat(formData.originalPrice),
                vat: formData.vat,
                discount_rate: formData.discountRate * 100,
                margin: formData.margin,
                margin_rate: formData.marginRate,
                start_date: formData.startDate || undefined,
                end_date: formData.endDate || undefined,
                validity_period: formData.validityPeriod,
                covered_type: formData.coveredType,
                taxable_type: formData.taxableType,
                product_id: formData.productId ? parseInt(formData.productId) : null,
                event_info_id: formData.infoId ? parseInt(formData.infoId) : null,
                event_name: formData.productName,
                event_description: formData.productDescription,
                event_precautions: formData.precautions
            };

            const apiData = {
                procedure_info: procedureInfo,
                standard_settings: standardSettings,
                event_settings: eventSettings
            };

            // 필수 필드 검증
            if (!formData.productName?.trim()) {
                alert('상품명을 입력해주세요.');
                return;
            }
            if (!formData.productDescription?.trim()) {
                alert('상품 설명을 입력해주세요.');
                return;
            }
            if (!formData.precautions?.trim()) {
                alert('주의사항을 입력해주세요.');
                return;
            }
            if (!formData.infoId?.trim()) {
                alert('상품 정보 ID를 입력해주세요.');
                return;
            }
            if (!formData.productId?.trim()) {
                alert('상품 ID를 입력해주세요.');
                return;
            }

            // API 호출
            console.log('🔍 API 요청 데이터 상세:', {
                procedure_info: {
                    ...procedureInfo,
                    selectedProcedureType,
                    formDataIds: {
                        elementId: formData.elementId,
                        bundleId: formData.bundleId,
                        customId: formData.customId,
                        sequenceId: formData.sequenceId,
                        infoId: formData.infoId,
                        productId: formData.productId
                    }
                },
                standard_settings: standardSettings,
                event_settings: eventSettings
            });
            const result = await createProduct(apiData);
            console.log('📡 API 응답 결과:', result);
            
            // 새로운 백엔드 응답 구조에 맞춰 처리
            const response = result as unknown as ProductCreateResponseNew;
            if (response.status === "success") {
                const standardProduct = response.created_products?.standard;
                const eventProduct = response.created_products?.event;
                const productId = standardProduct?.id || eventProduct?.id;
                const productType = standardProduct ? 'Standard' : 'Event';
                
                // 생성된 상품 정보 상세 로그
                console.log('📋 생성된 상품 상세 정보:', {
                    status: response.status,
                    message: response.message,
                    procedure_info: response.procedure_info,
                    created_products: response.created_products,
                    standard: standardProduct,
                    event: eventProduct,
                    productId,
                    productType
                });
                
                alert(`${productType} 상품이 성공적으로 생성되었습니다!\n상품 ID: ${productId}`);
                
                // 상품 생성 성공 후 해당 타입의 데이터 새로고침
                // onRefresh 콜백이 있으면 호출 (이미 forceRefreshStandard/forceRefreshEvent를 포함)
                // Standard 상품: forceRefreshStandard() → getProductsList('procedure_grouped', 'standard')
                // Event 상품: forceRefreshEvent() → getProductsList('procedure_grouped', 'event')
                if (onRefresh) {
                    console.log(`🔄 ${selectedProductType === 'standard' ? 'Standard' : 'Event'} 상품 생성 후 데이터 새로고침 시작`);
                    await onRefresh();
                    console.log(`✅ ${selectedProductType === 'standard' ? 'Standard' : 'Event'} 상품 데이터 새로고침 완료`);
                }
                
                onSuccess();
                onClose();
            } else {
                alert(`상품 생성 실패: ${response.message}`);
            }
        } catch (error) {
            console.error('상품 생성 중 오류 발생:', error);
            alert(`상품 생성 중 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
        } finally {
            setSaving(false);
        }
    };

    // 시술 비용 계산 함수
    const getTotalProcedureCost = (procedure: Element | BundleListResponse | CustomListResponse | SequenceResponse) => {
        if ('id' in procedure && 'name' in procedure && !('group_id' in procedure)) {
            // Element
            return procedure.procedure_cost || 0;
        } else if ('group_id' in procedure && 'elements' in procedure) {
            // Bundle, Custom
            return (procedure.elements || []).reduce((total, element) => total + (element.element_cost || 0), 0);
        } else if ('group_id' in procedure && 'steps' in procedure) {
            // Sequence
            return (procedure.steps || []).reduce((total, step) => total + (step.procedure_cost || 0), 0);
        }
        return 0;
    };

    const handleProductTypeNext = (productType: string, procedureType: string) => {
        setSelectedProductType(productType);
        setSelectedProcedureType(procedureType);
    };

    const handleProcedureSelect = (procedure: Element | BundleListResponse | CustomListResponse | SequenceResponse) => {
        console.log('handleProcedureSelect 호출됨:', procedure);
        setSelectedProcedure(procedure);
    };

    const handleNext = () => {
        console.log('handleNext 호출됨, 현재 상태:', {
            selectedProductType,
            selectedProcedureType,
            selectedProcedure,
            showProductSettings,
            selectionComplete
        });
        setShowProductSettings(true);
    };

    const handleSelectionComplete = (isComplete: boolean) => {
        console.log('handleSelectionComplete 호출됨:', isComplete);
        setSelectionComplete(isComplete);
    };

    // 다음 단계로 진행할 수 있는지 확인하는 함수
    const canProceedToNext = () => {
        if (!showProductSettings) {
            // 시술 선택 단계: 모든 선택이 완료되었는지 확인
            return selectionComplete;
        } else {
            // 상품 설정 단계: 모든 필수 정보가 입력되었는지 확인
            if (!formData) return false;
            
            // 필수 필드 검증
            return !!(
                formData.productName?.trim() &&
                formData.productDescription?.trim() &&
                formData.precautions?.trim() &&
                formData.infoId?.trim() &&
                formData.productId?.trim()
            );
        }
    };

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center z-50 p-4 overflow-hidden">
            <div className="bg-white rounded-xl w-full max-w-4xl h-[85vh] flex flex-col shadow-2xl border border-gray-200">
                
                {/* 헤더 */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <div className="flex items-center space-x-3">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">새 상품 생성</h2>
                            <p className="text-xs text-gray-500">상품 타입과 시술을 선택하여 새로운 상품을 생성합니다</p>
                        </div>
                    </div>
                    <Button
                        onClick={handleClose}
                        variant="ghost"
                        size="sm"
                        className="!text-gray-500 hover:text-gray-600 p-0 h-auto"
                    >
                        <X className="!w-5 !h-5" />
                    </Button>
                </div>

                {/* 콘텐츠 */}
                <div className="flex-1 overflow-y-auto">
                    {/* 콘텐츠 */}
                    <div className="min-h-[500px]">
                        {!showProductSettings ? (
                            <div className="p-8">
                                <ProductTypeSelector 
                                    onNext={handleProductTypeNext} 
                                    onProcedureSelect={handleProcedureSelect}
                                    onSelectionComplete={handleSelectionComplete}
                                />
                            </div>
                        ) : (
                            <div className="p-8">
                                {selectedProductType && selectedProcedureType && selectedProcedure && (
                                    <ProductSettingsForm 
                                        selectedProductType={selectedProductType as 'standard' | 'event'}
                                        selectedProcedureType={selectedProcedureType as 'element' | 'bundle' | 'custom' | 'sequence'}
                                        selectedProcedure={selectedProcedure}
                                        onFormDataChange={setFormData}
                                    />
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* 하단 버튼 */}
                <div className="p-4 border-t border-gray-200 flex-shrink-0">
                    <div className="flex space-x-3">
                        <Button
                            onClick={handleClose}
                            className="flex-1 bg-gray-500 py-3 font-semibold text-white"
                            variant="secondary"
                            disabled={saving}
                        >
                            취소
                        </Button>
                        <Button
                            onClick={!showProductSettings ? handleNext : handleSuccess}
                            className="flex-1 bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700"
                            disabled={saving || !canProceedToNext()}
                        >
                            {saving ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    {!showProductSettings ? '처리 중...' : '생성 중...'}
                                </>
                            ) : (
                                <>
                                    {!showProductSettings ? '다음' : '생성하기'}
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
