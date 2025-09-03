'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Plus } from 'lucide-react';
import { Element, getElementsList, searchElementsByName } from '@/api/element-api';
import { BundleListResponse, getBundlesList, getBundleDetail } from '@/api/bundles-api';
import { CustomListResponse, getCustomsList, getCustomDetail } from '@/api/customs-api';
import { ConsumableResponse, getConsumableDetail } from '@/api/consumables-api';

// 공통 인터페이스 정의
interface ProcedureItem {
    id?: number;
    group_id?: number;
    name?: string;
    description?: string;
    procedure_cost?: number;
    position_type?: string;
    class_major?: string;
    class_sub?: string;
    class_detail?: string;
    class_type?: string;
    cost_time?: number;
    plan_state?: number;
    plan_count?: number;
    plan_interval?: number;
    consum_1_id?: number;
    consum_1_name?: string;
    consum_1_unit?: string;
    consum_1_count?: number;
    procedure_level?: string;
    price?: number;
    release?: number;
    // Bundle 관련 필드
    elements?: Array<{
        id: number;
        group_id: number;
        element_id: number;
        element_cost?: number;
        price_ratio: number;
        release: number;
        element_detail?: Element;
        consumable_info?: ConsumableResponse;
    }>;
    // Custom 관련 필드
    custom_elements?: Array<{
        id: number;
        group_id: number;
        element_id: number;
        custom_count: number;
        element_limit?: number;
        element_cost?: number;
        price_ratio: number;
        release: number;
        element_detail?: Element;
        consumable_info?: ConsumableResponse;
    }>;
    // 소모품 정보 필드
    consumable_info?: ConsumableResponse;
}

interface AddStepModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (procedure: ProcedureItem, packageType: 'element' | 'bundle' | 'custom') => void;
}

export default function SequnceStepModal({ isOpen, onClose, onConfirm }: AddStepModalProps) {
    const [selectedPackageType, setSelectedPackageType] = useState<'element' | 'bundle' | 'custom' | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<ProcedureItem[]>([]);
    const [selectedProcedure, setSelectedProcedure] = useState<ProcedureItem | null>(null);
    const [isClosingDetail, setIsClosingDetail] = useState(false);
    const [isOpeningDetail, setIsOpeningDetail] = useState(false);

    // 검색 함수들
    const searchBundlesByName = (bundles: BundleListResponse[], query: string): ProcedureItem[] => {
        return bundles.filter(bundle => 
            bundle.name?.toLowerCase().includes(query.toLowerCase()) ||
            bundle.group_id.toString().includes(query)
        ).map(bundle => ({
            id: bundle.group_id,
            group_id: bundle.group_id,
            name: bundle.name,
            description: bundle.description,
            procedure_cost: undefined, // Bundle은 개별 가격이 없음
            release: bundle.release,
            elements: bundle.elements
        }));
    };
    
    const searchCustomsByName = (customs: CustomListResponse[], query: string): ProcedureItem[] => {
        return customs.filter(custom => 
            custom.name?.toLowerCase().includes(query.toLowerCase()) ||
            custom.group_id.toString().includes(query)
        ).map(custom => ({
            id: custom.group_id,
            group_id: custom.group_id,
            name: custom.name,
            description: custom.description,
            procedure_cost: undefined // Custom은 개별 가격이 없음
        }));
    };

    // 패키지 타입별 데이터 로드 함수들
    const loadElements = async () => {
        try {
            const elements = await getElementsList();
            
            const results = elements.map(element => ({
                id: element.id,
                name: element.name,
                description: element.description,
                procedure_cost: element.procedure_cost,
                position_type: element.position_type,
                class_major: element.class_major,
                class_sub: element.class_sub,
                class_detail: element.class_detail,
                class_type: element.class_type,
                cost_time: element.cost_time,
                plan_state: element.plan_state,
                plan_count: element.plan_count,
                plan_interval: element.plan_interval,
                consum_1_id: element.consum_1_id,
                consum_1_name: element.consum_1_name,
                consum_1_unit: element.consum_1_unit,
                consum_1_count: element.consum_1_count,
                procedure_level: element.procedure_level,
                price: element.price,
                release: element.release
            }));
            setSearchResults(results);
        } catch (error) {
            console.error('Element 데이터 로드 실패:', error);
            setSearchResults([]);
        }
    };

    const loadBundles = async () => {
        try {
            const bundles = await getBundlesList();
            const results = bundles.map(bundle => {
                return {
                    id: bundle.group_id,
                    group_id: bundle.group_id,
                    name: bundle.name,
                    description: bundle.description,
                    procedure_cost: undefined,
                    release: bundle.release,
                    elements: bundle.elements
                };
            });
            setSearchResults(results);
        } catch (error) {
            console.error('Bundle 데이터 로드 실패:', error);
            setSearchResults([]);
        }
    };

    const loadCustoms = async () => {
        try {
            const customs = await getCustomsList();
            const results = customs.map(custom => ({
                id: custom.group_id,
                group_id: custom.group_id,
                name: custom.name,
                description: custom.description,
                procedure_cost: undefined
            }));
            setSearchResults(results);
        } catch (error) {
            console.error('Custom 데이터 로드 실패:', error);
            setSearchResults([]);
        }
    };

    // 패키지 타입 선택
    const handlePackageTypeSelect = async (type: 'element' | 'bundle' | 'custom') => {
        setSelectedPackageType(type);
        setSearchQuery('');
        setSelectedProcedure(null);
        
        // 선택된 타입에 맞는 API 즉시 실행
        switch (type) {
            case 'element':
                await loadElements();
                break;
            case 'bundle':
                await loadBundles();
                break;
            case 'custom':
                await loadCustoms();
                break;
        }
    };

    // 검색 (필터링)
    const handleSearch = async (query: string) => {
        if (!selectedPackageType || !query.trim()) {
            return;
        }

        try {
            let results: ProcedureItem[] = [];
            switch (selectedPackageType) {
                case 'element':
                    const elements = await getElementsList();
                    const filteredElements = searchElementsByName(elements, query);
                    console.log(filteredElements);
                    results = filteredElements.map(element => ({
                        id: element.id,
                        name: element.name,
                        description: element.description,
                        procedure_cost: element.procedure_cost,
                        position_type: element.position_type,
                        class_major: element.class_major,
                        class_sub: element.class_sub,
                        class_detail: element.class_detail,
                        class_type: element.class_type,
                        cost_time: element.cost_time,
                        plan_state: element.plan_state,
                        plan_count: element.plan_count,
                        plan_interval: element.plan_interval,
                        consum_1_id: element.consum_1_id,
                        consum_1_name: element.consum_1_name,
                        consum_1_unit: element.consum_1_unit,
                        consum_1_count: element.consum_1_count,
                        procedure_level: element.procedure_level,
                        price: element.price,
                        release: element.release
                    }));
                    break;
                case 'bundle':
                    const bundles = await getBundlesList();
                    results = searchBundlesByName(bundles, query);
                    break;
                case 'custom':
                    const customs = await getCustomsList();
                    results = searchCustomsByName(customs, query);
                    break;
            }
            setSearchResults(results);         
        } 
        
        catch (error) {
            console.error('검색 실패:', error);
            setSearchResults([]);
        }
    };

    // 시술 선택
    const handleProcedureSelect = async (procedure: ProcedureItem) => {
        let detailedProcedure = { ...procedure };

        // Bundle인 경우 상세 정보를 가져옴
        if (selectedPackageType === 'bundle' && procedure.group_id) {
            try {
                const bundleDetail = await getBundleDetail(procedure.group_id);
                detailedProcedure = {
                    id: bundleDetail.group_id,
                    group_id: bundleDetail.group_id,
                    name: bundleDetail.name,
                    description: bundleDetail.description,
                    procedure_cost: undefined,
                    release: bundleDetail.release,
                    elements: bundleDetail.elements
                };
            } catch (error) {
                console.error('Bundle 상세 정보 로드 실패:', error);
            }
        } 
        // Custom인 경우 상세 정보를 가져옴
        else if (selectedPackageType === 'custom' && procedure.group_id) {
            try {
                const customDetail = await getCustomDetail(procedure.group_id);
                detailedProcedure = {
                    id: customDetail.group_id,
                    group_id: customDetail.group_id,
                    name: customDetail.name,
                    description: customDetail.description,
                    procedure_cost: undefined,
                    release: customDetail.release,
                    custom_elements: customDetail.elements
                };
            } catch (error) {
                console.error('Custom 상세 정보 로드 실패:', error);
            }
        }

        // 소모품 정보가 있는 경우 가져오기
        if (detailedProcedure.consum_1_id) {
            try {
                const consumableDetail = await getConsumableDetail(detailedProcedure.consum_1_id);
                detailedProcedure.consumable_info = consumableDetail;
            } catch (error) {
                console.error('소모품 상세 정보 로드 실패:', error);
            }
        }

        // Bundle이나 Custom의 element들에서도 소모품 정보 가져오기
        if (detailedProcedure.elements) {
            for (const element of detailedProcedure.elements) {
                if (element.element_detail?.consum_1_id) {
                    try {
                        const consumableDetail = await getConsumableDetail(element.element_detail.consum_1_id);
                        element.consumable_info = consumableDetail;
                    } catch (error) {
                        console.error('Element 소모품 상세 정보 로드 실패:', error);
                    }
                }
            }
        }

        // Custom의 element들에서도 소모품 정보 가져오기
        if (detailedProcedure.custom_elements) {
            for (const element of detailedProcedure.custom_elements) {
                if (element.element_detail?.consum_1_id) {
                    try {
                        const consumableDetail = await getConsumableDetail(element.element_detail.consum_1_id);
                        element.consumable_info = consumableDetail;
                    } catch (error) {
                        console.error('Custom Element 소모품 상세 정보 로드 실패:', error);
                    }
                }
            }
        }

        setSelectedProcedure(detailedProcedure);
        
        setIsClosingDetail(false);
        setIsOpeningDetail(true);
        // 다음 프레임에서 애니메이션 시작
        setTimeout(() => {
            setIsOpeningDetail(false);
        }, 10);
    };

    // 상세 정보 닫기
    const handleCloseDetail = () => {
        setIsClosingDetail(true);
        setTimeout(() => {
            setSelectedProcedure(null);
            setIsClosingDetail(false);
        }, 200); // 애니메이션 지속 시간과 동일
    };

    // 확인
    const handleConfirm = () => {
        if (!selectedProcedure || !selectedPackageType) return;
        onConfirm(selectedProcedure, selectedPackageType);
        handleClose();
    };

    // 모달 닫기
    const handleClose = () => {
        setSelectedPackageType(null);
        setSearchQuery('');
        setSearchResults([]);
        setSelectedProcedure(null);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
            <div className="bg-white rounded-xl w-full max-w-2xl h-[75vh] flex flex-col shadow-2xl border border-gray-200">
                {/* 헤더 */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
                    <h2 className="text-lg font-semibold text-gray-900">코스 패키지 Step 추가</h2>
                    <Button
                        onClick={handleClose}
                        variant="ghost"
                        size="sm"
                        className="!text-gray-500 hover:text-gray-600 p-0 h-auto"
                    >
                        <X className="!w-5 !h-5" />
                    </Button>
                </div>

                {/* 내용 */}
                <div className="p-4 flex-1 overflow-y-auto">
                    
                    {/* 패키지 타입 선택 */}
                    {!selectedPackageType && (
                        <div className="space-y-4 h-full flex flex-col justify-center">
                            <h3 className="text-lg font-medium text-gray-900 text-center mb-6">패키지 타입을 선택하세요</h3>
                            <div className="space-y-3 max-w-md mx-auto w-full">
                                <Button
                                    onClick={() => handlePackageTypeSelect('element')}
                                    variant="secondary"
                                    className="w-full p-4 h-auto justify-start"
                                >
                                    <div className="flex items-center justify-between w-full">
                                        <div className="flex-1 text-left">
                                            <h4 className="font-medium text-gray-900 text-base">단일 시술</h4>
                                            <p className="text-sm text-gray-500 mt-1">개별 시술을 선택합니다</p>
                                        </div>
                                        <span className="text-xs text-gray-400 rounded-full px-2 py-1 border border-gray-400">
                                            단일시술
                                        </span>
                                    </div>
                                </Button>
                                <Button
                                    onClick={() => handlePackageTypeSelect('bundle')}
                                    variant="secondary"
                                    className="w-full p-4 h-auto justify-start"
                                >
                                    <div className="flex items-center justify-between w-full">
                                        <div className="flex-1 text-left">
                                            <h4 className="font-medium text-gray-900 text-base">패키지</h4>
                                            <p className="text-sm text-gray-500 mt-1">여러 시술이 포함된 패키지를 선택합니다</p>
                                        </div>
                                        <span className="text-xs text-orange-400 rounded-full px-2 py-1 border border-orange-400">
                                            패키지
                                        </span>
                                    </div>
                                </Button>
                                <Button
                                    onClick={() => handlePackageTypeSelect('custom')}
                                    variant="secondary"
                                    className="w-full p-4 h-auto justify-start"
                                >
                                    <div className="flex items-center justify-between w-full">
                                        <div className="flex-1 text-left">
                                            <h4 className="font-medium text-gray-900 text-base">커스텀</h4>
                                            <p className="text-sm text-gray-500 mt-1">사용자 정의 시술을 선택합니다</p>
                                        </div>
                                        <span className="text-xs text-red-400 rounded-full px-2 py-1 border border-red-400">
                                            커스텀
                                        </span>
                                    </div>
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* 시술 검색 및 선택 */}
                    {selectedPackageType && (
                        <div className="space-y-4 h-full flex flex-col relative">
                            <div className="flex items-center justify-between flex-shrink-0">
                                <h3 className="text-md font-medium text-gray-900">
                                    {selectedPackageType === 'element' && '단일 시술'}
                                    {selectedPackageType === 'bundle' && '패키지'}
                                    {selectedPackageType === 'custom' && '커스텀'}
                                    {' '} 선택
                                </h3>
                            </div>

                            {/* 검색 입력 */}
                            <div className="relative flex-shrink-0">
                                <Input
                                    placeholder={`${selectedPackageType === 'element' ? '단일 시술' : selectedPackageType === 'bundle' ? '패키지' : '커스텀'} 검색...`}
                                    value={searchQuery}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setSearchQuery(value);
                                        // 검색어가 비어있으면 전체 목록, 있으면 필터링된 결과 표시
                                        if (!value.trim()) {
                                            switch (selectedPackageType) {
                                                case 'element':
                                                    loadElements();
                                                    break;
                                                case 'bundle':
                                                    loadBundles();
                                                    break;
                                                case 'custom':
                                                    loadCustoms();
                                                    break;
                                            }
                                        } else {
                                            handleSearch(value);
                                        }
                                    }}
                                    className="w-full"
                                />
                            </div>

                            {/* 검색 결과 */}
                            <div className="space-y-1 flex-1 overflow-y-auto min-h-0">
                                {searchResults.length > 0 ? (
                                    searchResults.map((procedure, index) => {
                                        // Bundle과 Custom의 경우 element들의 cost 합산
                                        let totalCost = procedure.procedure_cost || 0;
                                        if (selectedPackageType === 'bundle' && procedure.elements) {
                                            totalCost = procedure.elements.reduce((sum, element) => sum + (element.element_cost || 0), 0);
                                        } else if (selectedPackageType === 'custom' && procedure.custom_elements) {
                                            totalCost = procedure.custom_elements.reduce((sum, element) => sum + (element.element_cost || 0), 0);
                                        }

                                        return (
                                            <div
                                                key={index}
                                                onClick={() => handleProcedureSelect(procedure)}
                                                className={`p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors bg-white ${
                                                    selectedProcedure?.id === procedure.id || 
                                                    selectedProcedure?.group_id === procedure.group_id
                                                        ? 'bg-blue-50 border-blue-200'
                                                        : ''
                                                }`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center space-x-2 mb-1">
                                                            <h4 className="font-medium text-gray-900 text-sm truncate">
                                                                {procedure.name}
                                                            </h4>
                                                            <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            {procedure.description && (
                                                                <span className="truncate">{procedure.description}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="ml-3 flex-shrink-0">
                                                        {totalCost > 0 && (
                                                            <div className="text-right">
                                                                {procedure.position_type && (
                                                                    <span className={`text-xs rounded-full px-2 py-0.5 ${
                                                                        procedure.position_type === '의사' 
                                                                            ? 'text-sky-300 border border-sky-300' 
                                                                            : 'text-pink-300 border border-pink-300'
                                                                    }`}>
                                                                        {procedure.position_type}
                                                                    </span>
                                                                )}
                                                                <div className="text-sm font-medium text-gray-900">
                                                                    <span className="text-xs text-gray-500">원가: </span>
                                                                    {totalCost.toLocaleString()}원
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })) : (
                                        <div className="text-center py-8 text-gray-500">
                                            <p>검색 결과가 없습니다.</p>
                                        </div>
                                    )
                                }
                                </div>

                            {/* 선택된 시술 상세 정보 */}
                            {(selectedProcedure || isClosingDetail) && selectedProcedure && (
                                <div className={`absolute bottom-0 left-0 right-0 bg-white border-t-4 border-gray-500 rounded-t-2xl shadow-2xl transform transition-transform duration-300 ease-out z-10 max-h-[100%] ${
                                    isClosingDetail ? 'translate-y-full' : isOpeningDetail ? 'translate-y-full' : 'translate-y-0'
                                }`}>
                                    {/* 상단 핸들 */}
                                    <div className="flex justify-center pt-2 pb-1">
                                        <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
                                    </div>
                                    
                                    <div className="p-5">
                                        {/* 상단 헤더 */}
                                        <div className="flex items-center justify-between mb-4">
                                            <h4 className="font-medium text-gray-900">선택된 시술 정보</h4>
                                            <Button
                                                onClick={handleCloseDetail}
                                                variant="ghost"
                                                size="sm"
                                                className="text-gray-500 hover:text-gray-700"
                                            >
                                                <X className="!w-4 !h-4" />
                                            </Button>
                                        </div>
                                        
                                        <div className="space-y-4 text-sm overflow-y-auto max-h-96 pl-4">
                                            {/* Element 상세 정보 */}
                                            {selectedPackageType === 'element' && selectedProcedure && (
                                                <>
                                                    {/* 기본 정보 */}
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div>
                                                            <span className="text-gray-500">이름:</span>
                                                            <span className="ml-2 text-gray-900">{selectedProcedure.name}</span>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-500">ID:</span>
                                                            <span className="ml-2 text-gray-900">{selectedProcedure.id || selectedProcedure.group_id}</span>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-500">설명:</span>
                                                            <span className="ml-2 text-gray-900">{selectedProcedure.description || '설명 없음'}</span>
                                                        </div>
                                                        {selectedProcedure.procedure_cost && (
                                                            <div>
                                                                <span className="text-gray-500">원가:</span>
                                                                <span className="ml-2 text-gray-900">{selectedProcedure.procedure_cost.toLocaleString()}원</span>
                                                            </div>
                                                        )}
                                                        {selectedProcedure.price && (
                                                            <div>
                                                                <span className="text-gray-500">가격:</span>
                                                                <span className="ml-2 text-gray-900">{selectedProcedure.price.toLocaleString()}원</span>
                                                            </div>
                                                            
                                                        )}
                                                        {selectedProcedure.cost_time && (
                                                            <div>
                                                                <span className="text-gray-500">소요시간:</span>
                                                                <span className="ml-2 text-gray-900">{selectedProcedure.cost_time ? `${selectedProcedure.cost_time}분` : '데이터 없음'}</span>
                                                            </div>
                                                        )}
                                                        {selectedProcedure.release && (
                                                            <div>
                                                                <span className="text-gray-500">릴리즈:</span>
                                                                <span className="ml-2 text-gray-900">{selectedProcedure.release ? 'O' : 'X'}</span>
                                                            </div>
                                                        )}
                                                        {selectedProcedure.position_type && (
                                                            <div>
                                                                <span className="text-gray-500">담당자:</span>
                                                                <span className={`ml-2 rounded-full px-2 py-0.5 text-xs ${
                                                                    selectedProcedure.position_type === '의사' 
                                                                        ? 'text-sky-300 border border-sky-300' 
                                                                        : 'text-pink-300 border border-pink-300'
                                                                }`}>
                                                                    {selectedProcedure.position_type}
                                                                </span>
                                                            </div>
                                                        )}
                                                        {selectedProcedure.procedure_level && (
                                                            <div>
                                                                <span className="text-gray-500">난이도:</span>
                                                                <span className="ml-2 text-gray-900">{selectedProcedure.procedure_level}</span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* 분류 정보 */}
                                                    <div className="border-t border-gray-100 pt-3">
                                                        <h5 className="font-medium text-gray-900 mb-2">분류 정보</h5>
                                                        <div className="grid grid-cols-2 gap-3">
                                                            <div>
                                                                <span className="text-gray-500">대분류:</span>
                                                                <span className="ml-2 text-gray-900">{selectedProcedure.class_major || '데이터 없음'}</span>
                                                            </div>
                                                            <div>
                                                                <span className="text-gray-500">중분류:</span>
                                                                <span className="ml-2 text-gray-900">{selectedProcedure.class_sub || '데이터 없음'}</span>
                                                            </div>
                                                            <div>
                                                                <span className="text-gray-500">상세분류:</span>
                                                                <span className="ml-2 text-gray-900">{selectedProcedure.class_detail || '데이터 없음'}</span>
                                                            </div>
                                                            <div>
                                                                <span className="text-gray-500">타입:</span>
                                                                <span className="ml-2 text-gray-900">{selectedProcedure.class_type || '데이터 없음'}</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* 계획 정보 */}
                                                    <div className="border-t border-gray-100 pt-3">
                                                        <h5 className="font-medium text-gray-900 mb-2">플랜 정보</h5>
                                                        <div className="grid grid-cols-2 gap-3">
                                                            <div>
                                                                <span className="text-gray-500">플랜 상태:</span>
                                                                <span className="ml-2 text-gray-900">
                                                                    {selectedProcedure.plan_state === 1 ? 'O' : 'X'}
                                                                </span>
                                                            </div>
                                                            <div>
                                                                <span className="text-gray-500">플랜 횟수:</span>
                                                                <span className="ml-2 text-gray-900">{selectedProcedure.plan_count ? `${selectedProcedure.plan_count}회` : '데이터 없음'}</span>
                                                            </div>
                                                            <div>
                                                                <span className="text-gray-500">플랜 주기:</span>
                                                                <span className="ml-2 text-gray-900">{selectedProcedure.plan_interval ? `${selectedProcedure.plan_interval}일` : 'X'}</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* 소모품 정보 */}
                                                    <div className="border-t border-gray-100 pt-3">
                                                        <h5 className="font-medium text-gray-900 mb-2">소모품 정보</h5>
                                                        <div className="grid grid-cols-2 gap-3">
                                                            <div>
                                                                <span className="text-gray-500">소모품명:</span>
                                                                <span className="ml-2 text-gray-900">{selectedProcedure.consum_1_name || '데이터 없음'}</span>
                                                            </div>
                                                            <div>
                                                                <span className="text-gray-500">소모품 개수:</span>
                                                                <span className="ml-2 text-gray-900">{selectedProcedure.consum_1_count || '데이터 없음'}</span>
                                                            </div>
                                                            <div>
                                                                <span className="text-gray-500">소모품 단위:</span>
                                                                <span className="ml-2 text-gray-900">{selectedProcedure.consum_1_unit || '데이터 없음'}</span>
                                                            </div>
                                                            <div>
                                                                <span className="text-gray-500">소모품 ID:</span>
                                                                <span className="ml-2 text-gray-900">{selectedProcedure.consum_1_id || '데이터 없음'}</span>
                                                            </div>
                                                        </div>
                                                        {/* 소모품 상세 정보 */}
                                                        {selectedProcedure.consumable_info && (
                                                            <div className="mt-3 pt-3 border-t border-gray-100">
                                                                <h6 className="font-medium text-gray-800 mb-2 text-xs">소모품 상세 정보</h6>
                                                                <div className="grid grid-cols-2 gap-2 text-xs pl-3">
                                                                    <div>
                                                                        <span className="text-gray-500">단가:</span>
                                                                        <span className="ml-2 text-gray-900">{selectedProcedure.consumable_info.unit_price?.toLocaleString() || '0'}원</span>
                                                                    </div>
                                                                    <div>
                                                                        <span className="text-gray-500">단위:</span>
                                                                        <span className="ml-2 text-gray-900">{selectedProcedure.consumable_info.unit_type || '데이터 없음'}</span>
                                                                    </div>
                                                                    <div>
                                                                        <span className="text-gray-500">가격:</span>
                                                                        <span className="ml-2 text-gray-900">{selectedProcedure.consumable_info.price?.toLocaleString() || '0'}원</span>
                                                                    </div>
                                                                    <div>
                                                                        <span className="text-gray-500">설명:</span>
                                                                        <span className="ml-2 text-gray-900">{selectedProcedure.consumable_info.description || '데이터 없음'}</span>
                                                                    </div>
                                                                    <div>
                                                                        <span className="text-gray-500">VAT:</span>
                                                                        <span className="ml-2 text-gray-900">{selectedProcedure.consumable_info.vat || '0'}%</span>
                                                                    </div>
                                                                    <div>
                                                                        <span className="text-gray-500">과세 유형:</span>
                                                                        <span className="ml-2 text-gray-900">{selectedProcedure.consumable_info.taxable_type || '데이터 없음'}</span>
                                                                    </div>
                                                                    <div>
                                                                        <span className="text-gray-500">급여 분류:</span>
                                                                        <span className="ml-2 text-gray-900">{selectedProcedure.consumable_info.covered_type || '데이터 없음'}</span>
                                                                    </div>
                                                                    <div>
                                                                        <span className="text-gray-500">릴리즈:</span>
                                                                        <span className="ml-2 text-gray-900">
                                                                            {selectedProcedure.consumable_info.release === 1 ? 'O' : 'X'}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                        
                                                    </div>
                                                </>
                                            )}

                                            {/* Bundle 상세 정보 */}
                                            {selectedPackageType === 'bundle' && selectedProcedure && (
                                                <>
                                                    {/* 기본 정보 */}
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div>
                                                            <span className="text-gray-500">패키지명:</span>
                                                            <span className="ml-2 text-gray-900">{selectedProcedure.name}</span>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-500">패키지 ID:</span>
                                                            <span className="ml-2 text-gray-900">{selectedProcedure.group_id}</span>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-500">설명:</span>
                                                            <span className="ml-2 text-gray-900">{selectedProcedure.description || '설명 없음'}</span>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-500">릴리즈:</span>
                                                            <span className="ml-2 text-gray-900">
                                                                {selectedProcedure.release === 1 ? 'O' : 'X'}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* 포함된 시술 정보 */}
                                                    {selectedProcedure.elements && selectedProcedure.elements.length > 0 && (
                                                        <div className="border-t border-gray-100 pt-3">
                                                            <h5 className="font-medium text-gray-900 mb-2">포함된 시술 ({selectedProcedure.elements.length}개)</h5>
                                                            <div className="space-y-2">
                                                                {selectedProcedure.elements.map((element, index) => (
                                                                    <div key={element.id} className="border border-gray-200 rounded-lg p-3">
                                                                        <div className="grid grid-cols-2 gap-2 text-xs">
                                                                            <div>
                                                                                <span className="text-gray-500">시술 ID:</span>
                                                                                <span className="ml-2 text-gray-900">{element.element_id}</span>
                                                                            </div>
                                                                            <div>
                                                                                <span className="text-gray-500">시술 비용:</span>
                                                                                <span className="ml-2 text-gray-900">{element.element_cost?.toLocaleString() || '0'}원</span>
                                                                            </div>
                                                                            <div>
                                                                                <span className="text-gray-500">가격 비율:</span>
                                                                                <span className="ml-2 text-gray-900">{(element.price_ratio * 100).toFixed(1)}%</span>
                                                                            </div>
                                                                            <div>
                                                                                <span className="text-gray-500">릴리즈:</span>
                                                                                <span className="ml-2 text-gray-900">
                                                                                    {element.release === 1 ? 'O' : 'X'}
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                        
                                                                        {/* Element 상세 정보 */}
                                                                        {element.element_detail && (
                                                                            <div className="mt-3 pt-3 border-t border-gray-100">
                                                                                <h6 className="font-medium text-gray-800 mb-2 text-xs">시술 상세 정보</h6>
                                                                                <div className="grid grid-cols-2 gap-2 text-xs">
                                                                                    <div>
                                                                                        <span className="text-gray-500">시술명:</span>
                                                                                        <span className="ml-2 text-gray-900">{element.element_detail.name || '데이터 없음'}</span>
                                                                                    </div>
                                                                                    <div>
                                                                                        <span className="text-gray-500">설명:</span>
                                                                                        <span className="ml-2 text-gray-900">{element.element_detail.description || '데이터 없음'}</span>
                                                                                    </div>
                                                                                    <div>
                                                                                        <span className="text-gray-500">대분류:</span>
                                                                                        <span className="ml-2 text-gray-900">{element.element_detail.class_major || '데이터 없음'}</span>
                                                                                    </div>
                                                                                    <div>
                                                                                        <span className="text-gray-500">중분류:</span>
                                                                                        <span className="ml-2 text-gray-900">{element.element_detail.class_sub || '데이터 없음'}</span>
                                                                                    </div>
                                                                                    <div>
                                                                                        <span className="text-gray-500">상세분류:</span>
                                                                                        <span className="ml-2 text-gray-900">{element.element_detail.class_detail || '데이터 없음'}</span>
                                                                                    </div>
                                                                                    <div>
                                                                                        <span className="text-gray-500">타입:</span>
                                                                                        <span className="ml-2 text-gray-900">{element.element_detail.class_type || '데이터 없음'}</span>
                                                                                    </div>
                                                                                    <div>
                                                                                        <span className="text-gray-500">담당자:</span>
                                                                                        <span className={`ml-2 rounded-full px-1 py-0.5 text-xs ${
                                                                                            element.element_detail.position_type === '의사' 
                                                                                                ? 'text-sky-300 border border-sky-300' 
                                                                                                : 'text-pink-300 border border-pink-300'
                                                                                        }`}>
                                                                                            {element.element_detail.position_type || '데이터 없음'}
                                                                                        </span>
                                                                                    </div>
                                                                                    <div>
                                                                                        <span className="text-gray-500">난이도:</span>
                                                                                        <span className="ml-2 text-gray-900">{element.element_detail.procedure_level || '데이터 없음'}</span>
                                                                                    </div>
                                                                                    <div>
                                                                                        <span className="text-gray-500">소요시간:</span>
                                                                                        <span className="ml-2 text-gray-900">{element.element_detail.cost_time ? `${element.element_detail.cost_time}분` : '데이터 없음'}</span>
                                                                                    </div>
                                                                                    <div>
                                                                                        <span className="text-gray-500">원가:</span>
                                                                                        <span className="ml-2 text-gray-900">{element.element_detail.procedure_cost?.toLocaleString() || '0'}원</span>
                                                                                    </div>
                                                                                    <div>
                                                                                        <span className="text-gray-500">가격:</span>
                                                                                        <span className="ml-2 text-gray-900">{element.element_detail.price?.toLocaleString() || '0'}원</span>
                                                                                    </div>
                                                                                    <div>
                                                                                        <span className="text-gray-500">릴리즈:</span>
                                                                                        <span className="ml-2 text-gray-900">
                                                                                            {element.element_detail.release === 1 ? 'O' : 'X'}
                                                                                        </span>
                                                                                    </div>
                                                                                </div>
                                                                                
                                                                                {/* Element 소모품 정보 */}
                                                                                {element.consumable_info && (
                                                                                    <div className="mt-3 pt-3 border-t border-gray-100">
                                                                                        <h6 className="font-medium text-gray-800 mb-2 text-xs">소모품 정보</h6>
                                                                                        <div className="grid grid-cols-2 gap-2 text-xs">
                                                                                            <div>
                                                                                                <span className="text-gray-500">소모품명:</span>
                                                                                                <span className="ml-2 text-gray-900">{element.consumable_info.name || '데이터 없음'}</span>
                                                                                            </div>
                                                                                            <div>
                                                                                                <span className="text-gray-500">단가:</span>
                                                                                                <span className="ml-2 text-gray-900">{element.consumable_info.unit_price?.toLocaleString() || '0'}원</span>
                                                                                            </div>
                                                                                            <div>
                                                                                                <span className="text-gray-500">단위:</span>
                                                                                                <span className="ml-2 text-gray-900">{element.consumable_info.unit_type || '데이터 없음'}</span>
                                                                                            </div>
                                                                                            <div>
                                                                                                <span className="text-gray-500">가격:</span>
                                                                                                <span className="ml-2 text-gray-900">{element.consumable_info.price?.toLocaleString() || '0'}원</span>
                                                                                            </div>
                                                                                            <div>
                                                                                                <span className="text-gray-500">설명:</span>
                                                                                                <span className="ml-2 text-gray-900">{element.consumable_info.description || '데이터 없음'}</span>
                                                                                            </div>
                                                                                            <div>
                                                                                                <span className="text-gray-500">VAT:</span>
                                                                                                <span className="ml-2 text-gray-900">{element.consumable_info.vat || '0'}%</span>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </>
                                            )}

                                            {/* Custom 상세 정보 */}
                                            {selectedPackageType === 'custom' && selectedProcedure && (
                                                <>
                                                    {/* 기본 정보 */}
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div>
                                                            <span className="text-gray-500">커스텀명:</span>
                                                            <span className="ml-2 text-gray-900">{selectedProcedure.name}</span>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-500">커스텀 ID:</span>
                                                            <span className="ml-2 text-gray-900">{selectedProcedure.group_id}</span>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-500">설명:</span>
                                                            <span className="ml-2 text-gray-900">{selectedProcedure.description || '설명 없음'}</span>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-500">릴리즈:</span>
                                                            <span className="ml-2 text-gray-900">
                                                                {selectedProcedure.release === 1 ? 'O' : 'X'}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* 포함된 Element 정보 */}
                                                    {selectedProcedure.custom_elements && selectedProcedure.custom_elements.length > 0 && (
                                                        <div className="mt-4 pt-4 border-t border-gray-200">
                                                            <h6 className="font-medium text-gray-800 mb-3 text-sm">포함된 시술 정보</h6>
                                                            <div className="space-y-3">
                                                                {selectedProcedure.custom_elements.map((element, index) => (
                                                                    <div key={index} className="bg-gray-50 rounded-lg p-3">
                                                                        <div className="grid grid-cols-2 gap-2 text-xs">
                                                                            <div>
                                                                                <span className="text-gray-500">시술 ID:</span>
                                                                                <span className="ml-2 text-gray-900">{element.element_id}</span>
                                                                            </div>
                                                                            <div>
                                                                                <span className="text-gray-500">커스텀 수량:</span>
                                                                                <span className="ml-2 text-gray-900">{element.custom_count}</span>
                                                                            </div>
                                                                            <div>
                                                                                <span className="text-gray-500">시술 제한:</span>
                                                                                <span className="ml-2 text-gray-900">{element.element_limit || '제한 없음'}</span>
                                                                            </div>
                                                                            <div>
                                                                                <span className="text-gray-500">시술 비용:</span>
                                                                                <span className="ml-2 text-gray-900">{element.element_cost?.toLocaleString() || '0'}원</span>
                                                                            </div>
                                                                            <div>
                                                                                <span className="text-gray-500">가격 비율:</span>
                                                                                <span className="ml-2 text-gray-900">{(element.price_ratio * 100).toFixed(1)}%</span>
                                                                            </div>
                                                                            <div>
                                                                                <span className="text-gray-500">릴리즈:</span>
                                                                                <span className="ml-2 text-gray-900">
                                                                                    {element.release === 1 ? 'O' : 'X'}
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                        
                                                                        {/* Element 상세 정보 */}
                                                                        {element.element_detail && (
                                                                            <div className="mt-3 pt-3 border-t border-gray-100">
                                                                                <h6 className="font-medium text-gray-800 mb-2 text-xs">시술 상세 정보</h6>
                                                                                <div className="grid grid-cols-2 gap-2 text-xs">
                                                                                    <div>
                                                                                        <span className="text-gray-500">시술명:</span>
                                                                                        <span className="ml-2 text-gray-900">{element.element_detail.name || '데이터 없음'}</span>
                                                                                    </div>
                                                                                    <div>
                                                                                        <span className="text-gray-500">설명:</span>
                                                                                        <span className="ml-2 text-gray-900">{element.element_detail.description || '데이터 없음'}</span>
                                                                                    </div>
                                                                                    <div>
                                                                                        <span className="text-gray-500">대분류:</span>
                                                                                        <span className="ml-2 text-gray-900">{element.element_detail.class_major || '데이터 없음'}</span>
                                                                                    </div>
                                                                                    <div>
                                                                                        <span className="text-gray-500">중분류:</span>
                                                                                        <span className="ml-2 text-gray-900">{element.element_detail.class_sub || '데이터 없음'}</span>
                                                                                    </div>
                                                                                    <div>
                                                                                        <span className="text-gray-500">상세분류:</span>
                                                                                        <span className="ml-2 text-gray-900">{element.element_detail.class_detail || '데이터 없음'}</span>
                                                                                    </div>
                                                                                    <div>
                                                                                        <span className="text-gray-500">타입:</span>
                                                                                        <span className="ml-2 text-gray-900">{element.element_detail.class_type || '데이터 없음'}</span>
                                                                                    </div>
                                                                                    <div>
                                                                                        <span className="text-gray-500">담당자:</span>
                                                                                        <span className={`ml-2 rounded-full px-1 py-0.5 text-xs ${
                                                                                            element.element_detail.position_type === '의사' 
                                                                                                ? 'text-sky-300 border border-sky-300' 
                                                                                                : 'text-pink-300 border border-pink-300'
                                                                                        }`}>
                                                                                            {element.element_detail.position_type || '데이터 없음'}
                                                                                        </span>
                                                                                    </div>
                                                                                    <div>
                                                                                        <span className="text-gray-500">난이도:</span>
                                                                                        <span className="ml-2 text-gray-900">{element.element_detail.procedure_level || '데이터 없음'}</span>
                                                                                    </div>
                                                                                    <div>
                                                                                        <span className="text-gray-500">소요시간:</span>
                                                                                        <span className="ml-2 text-gray-900">{element.element_detail.cost_time ? `${element.element_detail.cost_time}분` : '데이터 없음'}</span>
                                                                                    </div>
                                                                                    <div>
                                                                                        <span className="text-gray-500">원가:</span>
                                                                                        <span className="ml-2 text-gray-900">{element.element_detail.procedure_cost?.toLocaleString() || '0'}원</span>
                                                                                    </div>
                                                                                    <div>
                                                                                        <span className="text-gray-500">가격:</span>
                                                                                        <span className="ml-2 text-gray-900">{element.element_detail.price?.toLocaleString() || '0'}원</span>
                                                                                    </div>
                                                                                    <div>
                                                                                        <span className="text-gray-500">릴리즈:</span>
                                                                                        <span className="ml-2 text-gray-900">
                                                                                            {element.element_detail.release === 1 ? 'O' : 'X'}
                                                                                        </span>
                                                                                    </div>
                                                                                </div>
                                                                                
                                                                                {/* Element 소모품 정보 */}
                                                                                {element.consumable_info && (
                                                                                    <div className="mt-3 pt-3 border-t border-gray-100">
                                                                                        <h6 className="font-medium text-gray-800 mb-2 text-xs">소모품 정보</h6>
                                                                                        <div className="grid grid-cols-2 gap-2 text-xs">
                                                                                            <div>
                                                                                                <span className="text-gray-500">소모품명:</span>
                                                                                                <span className="ml-2 text-gray-900">{element.consumable_info.name || '데이터 없음'}</span>
                                                                                            </div>
                                                                                            <div>
                                                                                                <span className="text-gray-500">단가:</span>
                                                                                                <span className="ml-2 text-gray-900">{element.consumable_info.unit_price?.toLocaleString() || '0'}원</span>
                                                                                            </div>
                                                                                            <div>
                                                                                                <span className="text-gray-500">단위:</span>
                                                                                                <span className="ml-2 text-gray-900">{element.consumable_info.unit_type || '데이터 없음'}</span>
                                                                                            </div>
                                                                                            <div>
                                                                                                <span className="text-gray-500">가격:</span>
                                                                                                <span className="ml-2 text-gray-900">{element.consumable_info.price?.toLocaleString() || '0'}원</span>
                                                                                            </div>
                                                                                            <div>
                                                                                                <span className="text-gray-500">설명:</span>
                                                                                                <span className="ml-2 text-gray-900">{element.consumable_info.description || '데이터 없음'}</span>
                                                                                            </div>
                                                                                            <div>
                                                                                                <span className="text-gray-500">VAT:</span>
                                                                                                <span className="ml-2 text-gray-900">{element.consumable_info.vat || '0'}%</span>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* 하단 버튼 */}
                <div className="p-4 border-t border-gray-200 flex-shrink-0">
                    <div className="flex space-x-3">
                        <Button
                            onClick={() => {
                                if (selectedPackageType) {
                                    setSelectedPackageType(null);
                                    setSearchQuery('');
                                    setSearchResults([]);
                                    setSelectedProcedure(null);
                                } else {
                                    handleClose();
                                }
                            }}
                            className="flex-1 bg-gray-500 py-3 font-semibold text-white"
                            variant="secondary"
                        >
                            {selectedPackageType ? '뒤로가기' : '취소'}
                        </Button>
                        <Button
                            onClick={handleConfirm}
                            className="flex-1 bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700"
                            disabled={!selectedProcedure}
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Step 추가
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
