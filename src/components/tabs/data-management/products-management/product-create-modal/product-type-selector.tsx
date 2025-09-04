'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useProceduresStore } from '@/store/procedures-store';
import { Search } from 'lucide-react';
import { searchElements, searchBundles, searchCustoms, searchSequences } from '@/utils/searchUtils';
import type { Element } from '@/api/element-api';
import type { BundleListResponse } from '@/api/bundles-api';
import type { CustomListResponse } from '@/api/customs-api';
import type { SequenceResponse } from '@/api/sequences-api';
import { getElementDetail } from '@/api/element-api';
import { getBundleDetail } from '@/api/bundles-api';
import { getCustomDetail } from '@/api/customs-api';
import { getSequenceDetail } from '@/api/sequences-api';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import ElementDetail from './procedure-detail/element-detail';
import BundleDetail from './procedure-detail/bundle-detail';
import CustomDetail from './procedure-detail/custom-detail';
import SequenceDetail from './procedure-detail/sequence-detail';

interface ProductTypeSelectorProps {
    onNext: (productType: string, procedureType: string) => void;
    onProcedureSelect?: (procedure: Element | BundleListResponse | CustomListResponse | SequenceResponse) => void;
    onSelectionComplete?: (isComplete: boolean) => void;
}

export default function ProductTypeSelector({ onNext, onProcedureSelect, onSelectionComplete }: ProductTypeSelectorProps) {
    const [selectedProductType, setSelectedProductType] = useState<string | null>(null);
    const [selectedProcedureType, setSelectedProcedureType] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [openAccordion, setOpenAccordion] = useState<string | undefined>(undefined);
    const [selectedProcedure, setSelectedProcedure] = useState<Element | BundleListResponse | CustomListResponse | SequenceResponse | null>(null);

    const handleProductTypeSelect = (productType: string) => {
        setSelectedProductType(productType);
        setSelectedProcedureType(null); // 시술 타입 초기화
    };

    const handleProcedureTypeSelect = (procedureType: string) => {
        setSelectedProcedureType(procedureType);
        setOpenAccordion(undefined); // 아코디언 닫기
        setSearchQuery(''); // 검색어도 초기화
    };

    // 시술 타입 이름 반환
    const getProcedureTypeName = (type: string | null) => {
        switch (type) {
            case 'element': return '단일 시술';
            case 'bundle': return '패키지';
            case 'sequence': return '코스 패키지';
            case 'custom': return '커스텀';
            default: return '시술';
        }
    };

    // Zustand store에서 시술 데이터 가져오기
    const { elements, bundles, customs, sequences, loading, error, loadAllProcedures } = useProceduresStore();
    
    // 선택된 시술 타입에 따른 실제 데이터 반환
    const getProceduresByType = (type: string | null) => {
        switch (type) {
            case 'element':
                return elements;
            case 'bundle':
                return bundles;
            case 'custom':
                return customs;
            case 'sequence':
                return sequences;
            default:
                return [];
        }
    };
    
    // 검색된 데이터 계산
    const filteredProcedures = useMemo((): (Element | BundleListResponse | CustomListResponse | SequenceResponse)[] => {
        if (!searchQuery.trim()) {
            return getProceduresByType(selectedProcedureType);
        }
        
        switch (selectedProcedureType) {
            case 'element':
                return searchElements(elements, searchQuery);
            case 'bundle':
                return searchBundles(bundles, searchQuery);
            case 'custom':
                return searchCustoms(customs, searchQuery);
            case 'sequence':
                return searchSequences(sequences, searchQuery);
            default:
                return getProceduresByType(selectedProcedureType);
        }
    }, [selectedProcedureType, searchQuery, elements, bundles, customs, sequences]);
    
    // 컴포넌트 마운트 시 데이터 로드
    useEffect(() => {
        loadAllProcedures();
    }, [loadAllProcedures]);

    // 선택 상태가 변경될 때마다 부모 컴포넌트에 알림
    useEffect(() => {
        if (onSelectionComplete) {
            const isComplete = Boolean(selectedProductType && selectedProcedureType && selectedProcedure !== null);
            onSelectionComplete(isComplete);
        }
    }, [selectedProductType, selectedProcedureType, selectedProcedure, onSelectionComplete]);

    // 선택된 시술 이름 가져오기
    const getSelectedProcedureName = () => {
        if (!selectedProcedure) return '';
        
        if (isElement(selectedProcedure)) return selectedProcedure.name;
        if (isBundle(selectedProcedure)) return selectedProcedure.name || `Bundle ${selectedProcedure.group_id}`;
        if (isCustom(selectedProcedure)) return selectedProcedure.name || `Custom ${selectedProcedure.group_id}`;
        if (isSequence(selectedProcedure)) return selectedProcedure.sequence_name || `Sequence ${selectedProcedure.group_id}`;
        return 'Unknown';
    };

    // 선택된 시술 타입 이름 가져오기
    const getSelectedProcedureTypeName = () => {
        switch (selectedProcedureType) {
            case 'element': return '단일 시술';
            case 'bundle': return '패키지';
            case 'custom': return '커스텀';
            case 'sequence': return '코스 패키지';
            default: return '시술';
        }
    };

    // 타입 가드 함수들
    const isElement = (procedure: Element | BundleListResponse | CustomListResponse | SequenceResponse): procedure is Element => {
        return 'id' in procedure && 'name' in procedure && !('group_id' in procedure);
    };
    
    const isBundle = (procedure: Element | BundleListResponse | CustomListResponse | SequenceResponse): procedure is BundleListResponse => {
        return selectedProcedureType === 'bundle' && 'group_id' in procedure && 'elements' in procedure;
    };
    
    const isCustom = (procedure: Element | BundleListResponse | CustomListResponse | SequenceResponse): procedure is CustomListResponse => {
        return selectedProcedureType === 'custom' && 'group_id' in procedure && 'elements' in procedure;
    };
    
    const isSequence = (procedure: Element | BundleListResponse | CustomListResponse | SequenceResponse): procedure is SequenceResponse => {
        return selectedProcedureType === 'sequence' && 'group_id' in procedure && 'steps' in procedure;
    };
    
    // 시술 선택 시 상세 정보 가져오기
    const fetchProcedureDetail = async (procedure: Element | BundleListResponse | CustomListResponse | SequenceResponse) => {
        try {
            let detailedProcedure = procedure;
            
            if (selectedProcedureType === 'element' && 'id' in procedure) {
                // Element 상세 정보 가져오기
                const elementDetail = await getElementDetail(procedure.id);
                detailedProcedure = elementDetail;
            } else if (selectedProcedureType === 'bundle' && 'group_id' in procedure) {
                // Bundle 상세 정보 가져오기
                const bundleDetail = await getBundleDetail(procedure.group_id);
                detailedProcedure = bundleDetail;
            } else if (selectedProcedureType === 'custom' && 'group_id' in procedure) {
                // Custom 상세 정보 가져오기
                const customDetail = await getCustomDetail(procedure.group_id);
                detailedProcedure = customDetail;
            } else if (selectedProcedureType === 'sequence' && 'group_id' in procedure) {
                // Sequence 상세 정보 가져오기
                const sequenceDetail = await getSequenceDetail(procedure.group_id);
                detailedProcedure = sequenceDetail;
            }
            
            return detailedProcedure;
        } catch (error) {
            console.error('시술 상세 정보 가져오기 실패:', error);
            // 에러 발생 시 원본 데이터 반환
            return procedure;
        }
    };

    // 시술 선택 처리
    const handleProcedureSelect = async (procedure: Element | BundleListResponse | CustomListResponse | SequenceResponse) => {
        // 여기서 선택된 시술 정보를 처리
        console.log('선택된 시술 (목록):', procedure);
        
        // 상세 정보 가져오기
        const detailedProcedure = await fetchProcedureDetail(procedure);
        console.log('선택된 시술 (상세):', detailedProcedure);
        
        setSelectedProcedure(detailedProcedure);
        
        // onProcedureSelect가 있으면 호출 (부모 컴포넌트에서 처리)
        if (onProcedureSelect) {
            onProcedureSelect(detailedProcedure);
        }
        
        // 시술이 선택되면 자동으로 다음 단계로 진행
        if (selectedProductType && selectedProcedureType) {
            onNext(selectedProductType, selectedProcedureType);
        } else {
            console.log('onNext 호출 안됨 - 값이 없음:', { selectedProductType, selectedProcedureType });
        }
    };

    return (
        <div>
            {/* 1단계: 상품 타입 선택 */}
            <div className="text-center mb-8">
                <p className="text-sm text-gray-600 mb-4">생성할 상품의 타입을 선택해주세요.</p>
                
                <div className="flex justify-center items-center space-x-4">
                    <Button
                        variant={selectedProductType === 'standard' ? 'default' : 'outline'}
                        className={`h-12 w-38 flex items-center justify-center px-4 py-2 border-2 transition-all duration-200 ${
                            selectedProductType === 'standard' 
                                ? 'border-gray-500 bg-gray-50' 
                                : 'hover:border-gray-700 hover:bg-gray-50'
                        }`}
                        onClick={() => handleProductTypeSelect('standard')}
                    >
                        <span className="font-semibold text-gray-900 text-sm">스탠다드 상품</span>
                    </Button>
                    
                    <Button
                        variant={selectedProductType === 'event' ? 'default' : 'outline'}
                        className={`h-12 w-38 flex items-center justify-center px-4 py-2 border-2 transition-all duration-200 ${
                            selectedProductType === 'event' 
                                ? 'border-gray-500 bg-gray-50' 
                                : 'hover:border-gray-700 hover:bg-gray-50'
                        }`}
                        onClick={() => handleProductTypeSelect('event')}
                    >
                        <span className="font-semibold text-gray-900 text-sm">이벤트 상품</span>
                    </Button>
                </div>
            </div>

            {/* 2단계: 시술 타입 선택 (상품 타입이 선택된 후에만 표시) */}
            {selectedProductType && (
                <div className="text-center flex flex-col items-center">
                    <p className="text-sm text-gray-600 mb-4">상품에 포함될 패키지 타입을 선택해주세요.</p>
                    
                    {/* 버튼 그리드 */}
                    <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto justify-center items-center">
                        <Button
                            variant={selectedProcedureType === 'element' ? 'default' : 'outline'}
                            className={`h-12 w-38 flex items-center justify-center px-4 py-2 border-2 transition-all duration-200 ${
                                selectedProcedureType === 'element' 
                                    ? 'border-gray-500 bg-gray-50' 
                                    : 'hover:border-gray-400 hover:bg-gray-50'
                            }`}
                            onClick={() => handleProcedureTypeSelect('element')}
                        >
                            <span className="font-semibold text-gray-900 text-sm">단일 시술</span>
                        </Button>
                        
                        <Button
                            variant={selectedProcedureType === 'bundle' ? 'default' : 'outline'}
                            className={`h-12 w-38 flex items-center justify-center px-4 py-2 border-2 transition-all duration-200 ${
                                selectedProcedureType === 'bundle' 
                                    ? 'border-gray-500 bg-gray-50' 
                                    : 'hover:border-orange-400 hover:bg-orange-50'
                            }`}
                            onClick={() => handleProcedureTypeSelect('bundle')}
                        >
                            <span className="font-semibold text-gray-900 text-sm">패키지</span>
                        </Button>
                        
                        <Button
                            variant={selectedProcedureType === 'custom' ? 'default' : 'outline'}
                            className={`h-12 w-38 flex items-center justify-center px-4 py-2 border-2 transition-all duration-200 ${
                                selectedProcedureType === 'custom' 
                                    ? 'border-gray-500 bg-gray-50' 
                                    : 'hover:border-red-400 hover:bg-gray-50'
                            }`}
                            onClick={() => handleProcedureTypeSelect('custom')}
                        >
                            <span className="font-semibold text-gray-900 text-sm">커스텀</span>
                        </Button>

                        <Button
                            variant={selectedProcedureType === 'sequence' ? 'default' : 'outline'}
                            className={`h-12 w-38 flex items-center justify-center px-4 py-2 border-2 transition-all duration-200 ${
                                selectedProcedureType === 'sequence' 
                                    ? 'border-gray-500 bg-gray-50' 
                                    : 'hover:border-purple-400 hover:bg-purple-50'
                            }`}
                            onClick={() => handleProcedureTypeSelect('sequence')}
                        >
                            <span className="font-semibold text-gray-900 text-sm">코스 패키지</span>
                        </Button>
                    </div>

                    {/* 선택된 시술 정보 표시 */}
                    {selectedProcedure && (
                        <div className="mt-8 mb-6 text-center">
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 inline-block">
                                <p className="text-blue-800 text-sm font-medium">
                                    {getSelectedProcedureTypeName()}의 &quot;{getSelectedProcedureName()}&quot;이(가) 선택되었습니다.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* 3단계: 시술 선택 (패키지 타입이 선택된 후에만 표시) */}
                    {selectedProcedureType && (
                        <div className="mt-8 w-full transition-all duration-500 ease-in-out">
                            <div className="text-center mb-4">
                                <p className="text-sm text-gray-600">
                                    사용할 {getProcedureTypeName(selectedProcedureType)}을 검색하고 선택해주세요.
                                </p>
                            </div>

                            {/* 검색창 */}
                            <div className="mb-6 max-w-2xl mx-auto relative">
                                <Input
                                    type="text"
                                    placeholder={`${getProcedureTypeName(selectedProcedureType)} 검색...`}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pr-10 placeholder:text-gray-500 placeholder:text-sm"
                                />
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                    <Search className="w-4 h-4 text-gray-400" />
                                </div>
                            </div>

                            {/* 목록 */}
                            <div className="max-w-2xl mx-auto">
                                <h4 className="text-sm font-medium text-gray-700 mb-3 text-left">
                                    {searchQuery.trim() 
                                        ? `검색 결과: ${filteredProcedures.length}개` 
                                        : `전체 ${getProcedureTypeName(selectedProcedureType)} 목록: ${getProceduresByType(selectedProcedureType).length}개`
                                    }
                                </h4>
                                
                                <Accordion 
                                    type="single" 
                                    collapsible 
                                    value={openAccordion}
                                    onValueChange={setOpenAccordion}
                                    className="w-full"
                                >
                                    {loading ? (
                                        <div className="text-center py-8">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                                            <p className="text-sm text-gray-600 mt-2">데이터를 불러오는 중...</p>
                                        </div>
                                    ) : error ? (
                                        <div className="text-center py-8">
                                            <p className="text-sm text-red-600">데이터 로드 중 오류가 발생했습니다: {error}</p>
                                        </div>
                                    ) : filteredProcedures.length === 0 ? (
                                        <div className="text-center py-8">
                                            <p className="text-sm text-gray-600">
                                                {searchQuery.trim() ? '검색 결과가 없습니다.' : `등록된 ${getProcedureTypeName(selectedProcedureType)}가 없습니다.`}
                                            </p>
                                        </div>
                                    ) : (
                                        filteredProcedures.map((procedure: Element | BundleListResponse | CustomListResponse | SequenceResponse, index: number) => (
                                            <AccordionItem key={index} value={`item-${index}`} className="border border-gray-200 rounded-lg mb-2">
                                                <AccordionTrigger 
                                                    className="px-4 py-3 hover:bg-gray-50 transition-all duration-300 ease-in-out cursor-pointer"
                                                >
                                                    <div className="flex items-center justify-between w-full text-left">
                                                        <div className="flex-1">
                                                            <h5 className="font-medium text-gray-900 mb-1">
                                                                {(() => {
                                                                    if (isElement(procedure)) return procedure.name;
                                                                    if (isBundle(procedure)) return procedure.name || `Bundle ${procedure.group_id}`;
                                                                    if (isCustom(procedure)) return procedure.name || `Custom ${procedure.group_id}`;
                                                                    if (isSequence(procedure)) return procedure.sequence_name || `Sequence ${procedure.group_id}`;
                                                                    return 'Unknown';
                                                                })()}
                                                            </h5>
                                                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                                                                {isElement(procedure) && procedure.cost_time && (
                                                                    <span>소요시간: {procedure.cost_time}분</span>
                                                                )}
                                                                {isBundle(procedure) && procedure.elements && (
                                                                    <span>포함 시술: {procedure.elements.length}개</span>
                                                                )}
                                                                {isCustom(procedure) && procedure.elements && (
                                                                    <span>포함 시술: {procedure.elements.length}개</span>
                                                                )}
                                                                {isSequence(procedure) && procedure.steps && (
                                                                    <span>포함 단계: {procedure.steps.length}개</span>
                                                                )}
                                                                <span className="text-gray-600 font-medium">
                                                                    {(() => {
                                                                        if (isElement(procedure)) {
                                                                            return procedure.price ? `${procedure.price.toLocaleString()}원` : '가격 정보 없음';
                                                                        }
                                                                        if (isBundle(procedure)) {
                                                                            const totalCost = procedure.elements.reduce((sum, element) => 
                                                                                sum + (element.element_cost || 0), 0
                                                                            );
                                                                            return `${totalCost.toLocaleString()}원`;
                                                                        }
                                                                        if (isCustom(procedure)) {
                                                                            const totalCost = procedure.elements.reduce((sum, element) => 
                                                                                sum + (element.element_cost || 0), 0
                                                                            );
                                                                            return `${totalCost.toLocaleString()}원`;
                                                                        }
                                                                        if (isSequence(procedure)) {
                                                                            const totalCost = procedure.steps?.reduce((sum, step) => 
                                                                                sum + (step.procedure_cost || 0), 0
                                                                            );
                                                                            return `${totalCost.toLocaleString()}원`;
                                                                        }
                                                                        return '가격 정보 없음';
                                                                    })()}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </AccordionTrigger>
                                                <AccordionContent className="px-4 pb-3 transition-all duration-300 ease-in-out cursor-pointer">
                                                    <div className="pt-2">
                                                        {isElement(procedure) && (
                                                            <ElementDetail 
                                                                element={procedure} 
                                                                onSelect={handleProcedureSelect} 
                                                            />
                                                        )}
                                                        {isBundle(procedure) && (
                                                            <BundleDetail 
                                                                bundle={procedure} 
                                                                onSelect={handleProcedureSelect} 
                                                            />
                                                        )}
                                                        {isCustom(procedure) && (
                                                            <CustomDetail 
                                                                custom={procedure} 
                                                                onSelect={handleProcedureSelect} 
                                                            />
                                                        )}
                                                        {isSequence(procedure) && (
                                                            <SequenceDetail 
                                                                sequence={procedure} 
                                                                onSelect={handleProcedureSelect} 
                                                            />
                                                        )}
                                                    </div>
                                                </AccordionContent>
                                            </AccordionItem>
                                        ))
                                    )}
                                </Accordion>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
