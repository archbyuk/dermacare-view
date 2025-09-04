'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { AlertTriangle } from 'lucide-react';
import { ProductDetailResponse, getEventProductDetail, updateEventProduct, EventProductUpdateRequest} from '@/api/products-api';
import { getElementDetail } from '@/api/element-api';
import { getBundleDetail } from '@/api/bundles-api';
import { getCustomDetail } from '@/api/customs-api';
import { getSequenceDetail } from '@/api/sequences-api';
import { ProcedureInfo } from './standard-ui/standard-detail-types';
import ModalHeader from './standard-ui/modal-header';
import ModalFooter from './standard-ui/modal-footer';
import BasicInfoSection from './standard-ui/basic-info-section';
import ProductInfoSection from './standard-ui/product-info-section';
import PriceInfoSection from './standard-ui/price-info-section';
import ProcedureInfoSection from './standard-ui/procedure-info-section';

interface EventDetailModalProps {
    product: ProductDetailResponse;
    onClose: () => void;
    onRefresh: () => Promise<void>;
}

export default function EventDetailModal({ product, onClose, onRefresh }: EventDetailModalProps) {
    const [detailProduct, setDetailProduct] = useState<ProductDetailResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState<Partial<ProductDetailResponse>>({});
    const [saving, setSaving] = useState(false);
    
    // 연결된 시술 이름 정보
    const [connectedProcedureName, setConnectedProcedureName] = useState<string>('');
    
    // 새로 선택된 시술 정보 (미리보기용)
    const [newSelectedProcedure, setNewSelectedProcedure] = useState<ProcedureInfo | null>(null);
    
    // 첫 마운트 상태 초기화
    const isFirstMount = useRef(true);

    // 기존 번들 상품의 상세 정보 가져오기 (읽기 모드용)
    const [existingBundleInfo, setExistingBundleInfo] = useState<ProcedureInfo | null>(null);
    
    const fetchExistingBundleInfo = useCallback(async (bundleId: number): Promise<void> => {
        try {
            
            const bundleInfo = await getBundleDetail(bundleId);
            
            setExistingBundleInfo(bundleInfo);
        } catch (error) {
            console.error('기존 번들 정보 가져오기 실패:', error);
            setExistingBundleInfo(null);
        }
    }, []);

    // 기존 커스텀 상품의 상세 정보 가져오기 (읽기 모드용)
    const [existingCustomInfo, setExistingCustomInfo] = useState<ProcedureInfo | null>(null);
    
    const fetchExistingCustomInfo = useCallback(async (customId: number): Promise<void> => {
        try {
            const customInfo = await getCustomDetail(customId);
            setExistingCustomInfo(customInfo);
        } catch (error) {
            console.error('기존 커스텀 정보 가져오기 실패:', error);
            setExistingCustomInfo(null);
        }
    }, []);

    // 기존 시퀀스 상품의 상세 정보 가져오기 (읽기 모드용)
    const [existingSequenceInfo, setExistingSequenceInfo] = useState<ProcedureInfo | null>(null);
    
    const fetchExistingSequenceInfo = useCallback(async (sequenceId: number): Promise<void> => {
        try {
            const sequenceInfo = await getSequenceDetail(sequenceId);
            setExistingSequenceInfo(sequenceInfo);
        } catch (error) {
            console.error('기존 시퀀스 정보 가져오기 실패:', error);
            setExistingSequenceInfo(null);
        }
    }, []);

    // 모달이 열릴 때 상세 정보 가져오기
    useEffect(() => {
        if (product && product.id) {
            setLoading(true);
            setError(null);
            
            getEventProductDetail(product.id)
                .then((detailData) => {
                    setDetailProduct(detailData.data);
                    
                    // 번들 상품인 경우 번들 상세 정보도 가져오기
                    if (detailData.data.package_type === '번들' && detailData.data.bundle_id) {
                        
                        fetchExistingBundleInfo(detailData.data.bundle_id);
                    }
                    
                    // 커스텀 상품인 경우 커스텀 상세 정보도 가져오기
                    if (detailData.data.package_type === '커스텀' && detailData.data.custom_id) {
                        fetchExistingCustomInfo(detailData.data.custom_id);
                    }
                    
                    // 시퀀스 상품인 경우 시퀀스 상세 정보도 가져오기
                    if (detailData.data.package_type === '시퀀스' && detailData.data.sequence_id) {
                        fetchExistingSequenceInfo(detailData.data.sequence_id);
                    }
                })
                .catch((err) => {
                    setError(err.message);
                    // 에러가 발생해도 기본 정보는 표시
                    setDetailProduct(product);
                })
                .finally(() => {
                    setLoading(false);
                });
        }
    }, [product, fetchExistingBundleInfo]);

    // 표시할 데이터 결정
    const displayProduct = detailProduct || product;

    // 시술 선택 핸들러
    const handleProcedureSelect = (type: 'element' | 'bundle' | 'custom' | 'sequence', id: number, name: string) => {
        const newEditData = { ...editData };
        
        if (type === 'element') {
            newEditData.element_id = id;
            newEditData.bundle_id = undefined;
            newEditData.custom_id = undefined;
            newEditData.sequence_id = undefined;
        } else if (type === 'bundle') {
            newEditData.bundle_id = id;
            newEditData.element_id = undefined;
            newEditData.custom_id = undefined;
            newEditData.sequence_id = undefined;
        } else if (type === 'custom') {
            newEditData.custom_id = id;
            newEditData.element_id = undefined;
            newEditData.bundle_id = undefined;
            newEditData.sequence_id = undefined;
        } else if (type === 'sequence') {
            newEditData.sequence_id = id;
            newEditData.element_id = undefined;
            newEditData.bundle_id = undefined;
            newEditData.custom_id = undefined;
        }
        
        setEditData(newEditData);
        setConnectedProcedureName(name);
    };

    const handleClearSelection = () => {
        const packageType = editData.package_type || displayProduct.package_type;
        const newEditData = { ...editData };
        
        if (packageType === '단일시술') {
            newEditData.element_id = undefined;
        } else if (packageType === '번들') {
            newEditData.bundle_id = undefined;
        } else if (packageType === '커스텀') {
            newEditData.custom_id = undefined;
        } else if (packageType === '시퀀스') {
            newEditData.sequence_id = undefined;
        }
        
        setEditData(newEditData);
        setNewSelectedProcedure(null);
        setConnectedProcedureName('');
    };

    const handlePackageTypeChange = (value: string) => {
        // Package Type 변경 시 다른 시술 ID들 초기화
        const newEditData = { ...editData, package_type: value };
        
        if (value === '단일시술') {
            newEditData.bundle_id = undefined;
            newEditData.custom_id = undefined;
            newEditData.sequence_id = undefined;
        } else if (value === '번들') {
            newEditData.element_id = undefined;
            newEditData.custom_id = undefined;
            newEditData.sequence_id = undefined;
        } else if (value === '커스텀') {
            newEditData.element_id = undefined;
            newEditData.bundle_id = undefined;
            newEditData.sequence_id = undefined;
        } else if (value === '시퀀스') {
            newEditData.element_id = undefined;
            newEditData.bundle_id = undefined;
            newEditData.custom_id = undefined;
        }
        
        // 패키지 타입이 변경되면 선택된 시술 정보도 초기화
        setNewSelectedProcedure(null);
        setConnectedProcedureName('');
        
        // editData 업데이트
        setEditData(newEditData);
    };

    // 새로 선택된 시술 정보 가져오기
    const fetchNewProcedureInfo = async (type: 'element' | 'bundle' | 'custom' | 'sequence', id: number): Promise<void> => {
        try {
            let procedureInfo: ProcedureInfo = null;
            if (type === 'element') {
                procedureInfo = await getElementDetail(id);
            } else if (type === 'bundle') {
                procedureInfo = await getBundleDetail(id);
            
            } else if (type === 'custom') {
                procedureInfo = await getCustomDetail(id);
            
            } else if (type === 'sequence') {
                procedureInfo = await getSequenceDetail(id);
            
            }
            
            setNewSelectedProcedure(procedureInfo);
            
        } catch (error) {
            console.error('시술 정보 가져오기 실패:', error);
            setNewSelectedProcedure(null);
        }
    };

    const handleSave = async () => {
        if (!displayProduct?.id) return;
        
        setSaving(true);
        try {
            // API 호출로 상품 정보 수정
            const { info_event, ...restEditData } = editData;
            
            // API 요청 데이터 구성
            const apiData: EventProductUpdateRequest = { ...restEditData } as EventProductUpdateRequest;
            
            // info_event 객체를 개별 필드로 분해
            if (info_event) {
                apiData.event_name = info_event.name;
                apiData.event_description = info_event.description;
                apiData.event_precautions = info_event.precautions;
            }

            await updateEventProduct(displayProduct.id, apiData);
            
            // 수정된 데이터로 상태 업데이트는 하지 않음 (재조회로 처리)
            
            // 시술 정보나 상품 정보가 변경된 경우, 상세 정보를 다시 가져와서 완전한 데이터로 업데이트
            if (editData.element_id || editData.bundle_id || editData.custom_id || editData.sequence_id || editData.info_event) {
                try {
                    const fullProductDataResponse = await getEventProductDetail(displayProduct.id);
                    setDetailProduct(fullProductDataResponse.data);
                } catch (error) {
                    console.warn('상품 정보 재조회 실패:', error);
                    // 재조회가 실패해도 기본 업데이트는 유지
                }
            }
            
            setIsEditing(false);
            setEditData({});
            setNewSelectedProcedure(null);
            setConnectedProcedureName('');

            // 성공 메시지 표시
            alert('이벤트 상품 정보가 성공적으로 수정되었습니다.');
            
            // 부모 컴포넌트에 데이터 업데이트 알림
            if (onRefresh) {        
                onRefresh();
            }
            
            // 모달은 그대로 유지 (닫지 않음)
        } catch (error: unknown) {
            console.error('수정 실패:', error);
            alert(`수정 중 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center z-[60] p-4 overflow-hidden">
            <div className="bg-white rounded-xl w-full max-w-2xl h-[85vh] flex flex-col shadow-2xl border border-gray-200">
                
                {/* 헤더 */}
                <ModalHeader 
                    isEditing={isEditing}
                    onClose={() => {
                            setIsEditing(false);
                            setEditData({});
                            setNewSelectedProcedure(null);
                            isFirstMount.current = true;
                            onClose();
                        }}
                />

                {/* 내용 */}
                <div className="p-4 flex-1 overflow-y-auto relative">
                    {loading && (
                        <div className="absolute inset-0 flex flex-col items-center justify-start pt-20 bg-white bg-opacity-90">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-600 mx-auto mb-2"></div>
                            <p className="text-sm text-gray-600">상세 정보를 불러오는 중...</p>
                        </div>
                    )}

                    {error && (
                        <div className="text-center py-3 bg-red-50 rounded-lg border border-red-200 mb-4">
                            <AlertTriangle className="w-4 h-4 text-red-500 mx-auto mb-1" />
                            <p className="text-sm text-red-600">{error}</p>
                            <p className="text-xs text-red-500">기본 정보만 표시됩니다.</p>
                        </div>
                    )}

                    {!loading && displayProduct ? (
                        <div className="space-y-6">
                            
                            <BasicInfoSection
                                displayProduct={displayProduct}
                                isEditing={isEditing}
                                editData={editData}
                                setEditData={setEditData}
                                onPackageTypeChange={handlePackageTypeChange}
                            />

                                <div className="border-t border-gray-200 my-4" />

                                <ProductInfoSection
                                    displayProduct={displayProduct}
                                    isEditing={isEditing}
                                    editData={editData}
                                    setEditData={setEditData}
                                    infoType="event"
                                />

                                <div className="border-t border-gray-200 my-4" />

                                <PriceInfoSection
                                    displayProduct={displayProduct}
                                    isEditing={isEditing}
                                    editData={editData}
                                    setEditData={setEditData}
                                    newSelectedProcedure={newSelectedProcedure}
                                    packageType={editData.package_type || displayProduct.package_type}
                                />

                            <ProcedureInfoSection
                                displayProduct={displayProduct}
                                isEditing={isEditing}
                                editData={editData}
                                newSelectedProcedure={newSelectedProcedure}
                                existingBundleInfo={existingBundleInfo}
                                existingCustomInfo={existingCustomInfo}
                                existingSequenceInfo={existingSequenceInfo}
                                connectedProcedureName={connectedProcedureName}
                                onProcedureSelect={handleProcedureSelect}
                                onProcedureInfoFetch={fetchNewProcedureInfo}
                                onClearSelection={handleClearSelection}
                            />

                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-sm text-gray-600">데이터를 불러올 수 없습니다.</p>
                        </div>
                    )}
                </div>

                {/* 하단 버튼 */}
                <ModalFooter
                    isEditing={isEditing}
                    saving={saving}
                    onCancel={() => {
                        if (isEditing) {
                            setIsEditing(false);
                            setEditData({});
                            setNewSelectedProcedure(null);
                            setConnectedProcedureName('');
                        } else {
                            setIsEditing(false);
                            setEditData({});
                            isFirstMount.current = true;
                            onClose();
                        }
                        
                        // 상태 초기화
                        setExistingBundleInfo(null);
                        setExistingCustomInfo(null);
                        setExistingSequenceInfo(null);
                    }}
                    onSave={handleSave}
                    onEdit={() => setIsEditing(true)}
                />
            </div>
        </div>
    );
}
