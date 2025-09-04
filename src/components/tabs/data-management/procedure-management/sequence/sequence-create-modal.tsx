'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Save, Plus, Trash2, Check } from 'lucide-react';
import { SequenceCreateRequest, SequenceStepRequest, createSequence } from '@/api/sequences-api';
import { Element, getElementsList } from '@/api/element-api';
import { searchElementsByName } from '@/utils/element-utils';
import { BundleListResponse, getBundleDetail, getBundlesList, BundleElementResponse } from '@/api/bundles-api';
import { CustomListResponse, getCustomDetail, getCustomsList, CustomElementResponse } from '@/api/customs-api';
import { getConsumableDetail, ConsumableResponse } from '@/api/consumables-api';

// ============================================================================
// 공통 타입 정의
// ============================================================================

type ProcedureType = 'element' | 'bundle' | 'custom';

// Element 타입 확장
interface ExtendedElement extends Element {
    consumable_info?: ConsumableResponse;
}

// BundleElementResponse 타입 확장
interface ExtendedBundleElementResponse extends BundleElementResponse {
    consumable_info?: ConsumableResponse;
}

// CustomElementResponse 타입 확장
interface ExtendedCustomElementResponse extends CustomElementResponse {
    element_detail?: Element;
    consumable_info?: ConsumableResponse;
}

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
        element_detail?: ExtendedElement;
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
        element_detail?: ExtendedElement;
        consumable_info?: ConsumableResponse;
    }>;
    // 소모품 정보 필드
    consumable_info?: ConsumableResponse;
}

interface SequenceCreateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    onRefresh?: (() => Promise<void>) | null;
}

export default function SequenceCreateModal({ isOpen, onClose, onSuccess, onRefresh }: SequenceCreateModalProps) {
    const [formData, setFormData] = useState<SequenceCreateRequest>({
        group_id: 0,
        name: '',
        release: 1,
        steps: []
    });
    
    const [saving, setSaving] = useState(false);
    
    // 검색 관련 상태들 - 타입 개선
    const [searchQueries, setSearchQueries] = useState<Record<number, string>>({});
    const [searchResults, setSearchResults] = useState<Record<number, ProcedureItem[]>>({});
    const [selectedItems, setSelectedItems] = useState<Record<number, ProcedureItem>>({});
    const [selectedTypes, setSelectedTypes] = useState<Record<number, ProcedureType>>({});
    const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});
    
    // 모든 데이터 목록
    const [allElements, setAllElements] = useState<Element[]>([]);
    const [allBundles, setAllBundles] = useState<BundleListResponse[]>([]);
    const [allCustoms, setAllCustoms] = useState<CustomListResponse[]>([]);

    // 스크롤을 위한 ref
    const lastStepRef = useRef<HTMLDivElement>(null);

    // 검색 함수들 - 타입 개선
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

    // 모든 데이터 로드
    useEffect(() => {
        if (isOpen) {
            loadAllData();
        }
    }, [isOpen]);

    const loadAllData = async () => {
        try {
            const [elements, bundles, customs] = await Promise.all([
                getElementsList(),
                getBundlesList(),
                getCustomsList()
            ]);
            
            setAllElements(elements);
            setAllBundles(bundles);
            setAllCustoms(customs);
        } catch (error) {
            console.error('데이터 로드 실패:', error);
        }
    };

    // 검색 결과 업데이트
    useEffect(() => {
        // 각 Step의 검색어가 변경될 때마다 해당 Step의 검색 실행
        Object.keys(searchQueries).forEach(stepIndexStr => {
            const stepIndex = parseInt(stepIndexStr);
            const query = searchQueries[stepIndex];
            
            if (query && query.trim()) {
                handleSearch(stepIndex, query);
            } else {
                setSearchResults(prev => ({ ...prev, [stepIndex]: [] }));
            }
        });
    }, [searchQueries, selectedTypes, allElements, allBundles, allCustoms]);

    const handleSearch = async (stepIndex: number, query: string) => {
        if (!query.trim()) return;
        
        try {
            let results: ProcedureItem[] = [];
            const selectedType = selectedTypes[stepIndex];
            
            if (!selectedType) return;
            
            switch (selectedType) {
                case 'element':
                    const filtered = searchElementsByName(allElements, query);
                    results = filtered.slice(0, 10).map(element => ({
                        id: element.id,
                        group_id: undefined, // Element는 group_id가 없음
                        name: element.name,
                        description: element.description,
                        procedure_cost: element.procedure_cost,
                        position_type: element.position_type,
                        class_major: element.class_major,
                        class_sub: element.class_sub,
                        class_detail: element.class_detail,
                        class_type: element.class_type,
                        cost_time: element.cost_time,
                        procedure_level: element.procedure_level,
                        price: element.price,
                        release: element.release,
                        consum_1_id: element.consum_1_id,
                        consum_1_name: element.consum_1_name,
                        consum_1_unit: element.consum_1_unit,
                        consum_1_count: element.consum_1_count
                    }));
                    break;
                case 'bundle':
                    const bundleFiltered = searchBundlesByName(allBundles, query);
                    results = bundleFiltered.slice(0, 10);
                    break;
                case 'custom':
                    const customFiltered = searchCustomsByName(allCustoms, query);
                    results = customFiltered.slice(0, 10);
                    break;
            }
            setSearchResults(prev => ({ ...prev, [stepIndex]: results }));
        } catch (error) {
            console.error('검색 실패:', error);
            setSearchResults(prev => ({ ...prev, [stepIndex]: [] }));
        }
    };

    // Step 추가
    const addStep = () => {
        const newStep: SequenceStepRequest = {
            step_num: formData.steps.length + 1,
            element_id: undefined,
            bundle_id: undefined,
            custom_id: undefined,
            sequence_interval: 0,
            price_ratio: 0
        };
        
        setFormData({
            ...formData,
            steps: [...formData.steps, newStep]
        });
        
        // 새 Step이 추가된 후 자동 스크롤
        setTimeout(() => {
            if (lastStepRef.current) {
                lastStepRef.current.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'start' 
                });
            }
        }, 100);
    };

    // Step 제거
    const removeStep = (index: number) => {
        const newSteps = formData.steps.filter((_, i) => i !== index);
        // Step 번호 재정렬
        const reorderedSteps = newSteps.map((step, i) => ({
            ...step,
            step_num: i + 1
        }));
        
        setFormData({
            ...formData,
            steps: reorderedSteps
        });
        
        // 상태 정리
        setSelectedTypes(prev => {
            const newTypes = { ...prev };
            delete newTypes[index];
            // 인덱스 재정렬
            const reorderedTypes: Record<number, ProcedureType> = {};
            Object.keys(newTypes).forEach(key => {
                const oldIndex = parseInt(key);
                if (oldIndex > index) {
                    reorderedTypes[oldIndex - 1] = newTypes[oldIndex];
                } else {
                    reorderedTypes[oldIndex] = newTypes[oldIndex];
                }
            });
            return reorderedTypes;
        });
        
        setSelectedItems(prev => {
            const newItems = { ...prev };
            delete newItems[index];
            // 인덱스 재정렬
            const reorderedItems: Record<number, ProcedureItem> = {};
            Object.keys(newItems).forEach(key => {
                const oldIndex = parseInt(key);
                if (oldIndex > index) {
                    reorderedItems[oldIndex - 1] = newItems[oldIndex];
                } else {
                    reorderedItems[oldIndex] = newItems[oldIndex];
                }
            });
            return reorderedItems;
        });
        
        // 완료 상태도 제거 및 재정렬
        setCompletedSteps(prev => {
            const newCompleted = { ...prev };
            delete newCompleted[index];
            // 인덱스 재정렬
            const reorderedCompleted: Record<number, boolean> = {};
            Object.keys(newCompleted).forEach(key => {
                const oldIndex = parseInt(key);
                if (oldIndex > index) {
                    reorderedCompleted[oldIndex - 1] = newCompleted[oldIndex];
                } else {
                    reorderedCompleted[oldIndex] = newCompleted[oldIndex];
                }
            });
            return reorderedCompleted;
        });
        
        // 검색 상태도 제거 및 재정렬
        setSearchQueries(prev => {
            const newQueries = { ...prev };
            delete newQueries[index];
            // 인덱스 재정렬
            const reorderedQueries: Record<number, string> = {};
            Object.keys(newQueries).forEach(key => {
                const oldIndex = parseInt(key);
                if (oldIndex > index) {
                    reorderedQueries[oldIndex - 1] = newQueries[oldIndex];
                } else {
                    reorderedQueries[oldIndex] = newQueries[oldIndex];
                }
            });
            return reorderedQueries;
        });
        
        setSearchResults(prev => {
            const newResults = { ...prev };
            delete newResults[index];
            // 인덱스 재정렬
            const reorderedResults: Record<number, ProcedureItem[]> = {};
            Object.keys(newResults).forEach(key => {
                const oldIndex = parseInt(key);
                if (oldIndex > index) {
                    reorderedResults[oldIndex - 1] = newResults[oldIndex];
                } else {
                    reorderedResults[oldIndex] = newResults[oldIndex];
                }
            });
            return reorderedResults;
        });
    };

    // Step 데이터 업데이트
    const updateStep = (index: number, field: keyof SequenceStepRequest, value: string | number) => {
        const newSteps = [...formData.steps];
        newSteps[index] = {
            ...newSteps[index],
            [field]: value
        };
        
        setFormData({
            ...formData,
            steps: newSteps
        });
    };

    // 타입 선택
    const selectType = (stepIndex: number, type: ProcedureType) => {
        setSelectedTypes(prev => ({ ...prev, [stepIndex]: type }));
        setSearchQueries(prev => ({ ...prev, [stepIndex]: '' }));
        setSearchResults(prev => ({ ...prev, [stepIndex]: [] }));
        
        // 기존 선택 초기화 - 한 번에 모든 필드 업데이트
        const newSteps = [...formData.steps];
        newSteps[stepIndex] = {
            ...newSteps[stepIndex],
            element_id: undefined,
            bundle_id: undefined,
            custom_id: undefined
        };
        setFormData({
            ...formData,
            steps: newSteps
        });
        
        setSelectedItems(prev => {
            const newItems = { ...prev };
            delete newItems[stepIndex];
            return newItems;
        });
    };

    // 항목 선택
    const selectItem = async (stepIndex: number, item: ProcedureItem) => {
        const selectedType = selectedTypes[stepIndex];
        

        
        // 상세 정보 가져오기
        let detailedItem = { ...item };
        
        if (selectedType === 'element') {

            // 한 번에 모든 필드 업데이트
            const newSteps = [...formData.steps];
            newSteps[stepIndex] = {
                ...newSteps[stepIndex],
                element_id: item.id,
                bundle_id: undefined,
                custom_id: undefined
            };
            setFormData({
                ...formData,
                steps: newSteps
            });
            
            // Element의 소모품 정보 가져오기
            if (detailedItem.consum_1_id && detailedItem.consum_1_id > 0) {
                try {
                    const consumableDetail = await getConsumableDetail(detailedItem.consum_1_id!);
                    detailedItem.consumable_info = consumableDetail;
                } catch (error) {
                    console.error('Element 소모품 상세 정보 로드 실패:', error);
                }
            }
        } else if (selectedType === 'bundle') {

            // 한 번에 모든 필드 업데이트
            const newSteps = [...formData.steps];
            newSteps[stepIndex] = {
                ...newSteps[stepIndex],
                bundle_id: item.group_id,
                element_id: undefined,
                custom_id: undefined
            };
            setFormData({
                ...formData,
                steps: newSteps
            });
            
            // Bundle 상세 정보 가져오기
            try {
                const bundleDetail = await getBundleDetail(item.group_id!);
                detailedItem = {
                    ...detailedItem,
                    ...bundleDetail,
                    elements: bundleDetail.elements
                };
                
                // Bundle의 element들에서 소모품 정보 가져오기
                if (detailedItem.elements) {
                    for (const element of detailedItem.elements) {
                        if (element.element_detail?.consum_1_id && element.element_detail.consum_1_id > 0) {
                            try {
                                const consumableDetail = await getConsumableDetail(element.element_detail.consum_1_id!);
                                (element as ExtendedBundleElementResponse).consumable_info = consumableDetail;
                            } catch (error) {
                                console.error('Bundle Element 소모품 상세 정보 로드 실패:', error);
                            }
                        }
                    }
                }
            } catch (error) {
                console.error('Bundle 상세 정보 로드 실패:', error);
            }
        } else if (selectedType === 'custom') {

            // 한 번에 모든 필드 업데이트
            const newSteps = [...formData.steps];
            newSteps[stepIndex] = {
                ...newSteps[stepIndex],
                custom_id: item.group_id,
                element_id: undefined,
                bundle_id: undefined
            };
            setFormData({
                ...formData,
                steps: newSteps
            });
            
            // Custom 상세 정보 가져오기
            try {
                const customDetail = await getCustomDetail(item.group_id!);
                detailedItem = {
                    ...detailedItem,
                    ...customDetail,
                    custom_elements: customDetail.elements
                };
                
                // Custom의 element들에서 소모품 정보 가져오기
                if (detailedItem.custom_elements) {
                    for (const element of detailedItem.custom_elements) {
                        if (element.element_detail?.consum_1_id && element.element_detail.consum_1_id > 0) {
                            try {
                                const consumableDetail = await getConsumableDetail(element.element_detail.consum_1_id!);
                                (element as ExtendedCustomElementResponse).consumable_info = consumableDetail;
                            } catch (error) {
                                console.error('Custom Element 소모품 상세 정보 로드 실패:', error);
                            }
                        }
                    }
                }
            } catch (error) {
                console.error('Custom 상세 정보 로드 실패:', error);
            }
        }
        
        setSelectedItems(prev => ({ ...prev, [stepIndex]: detailedItem }));
        setSearchQueries(prev => ({ ...prev, [stepIndex]: '' }));
        setSearchResults(prev => ({ ...prev, [stepIndex]: [] }));
    };

    // 선택된 항목 정보 가져오기
    const getSelectedItemInfo = (stepIndex: number) => {
        return selectedItems[stepIndex] || null;
    };

    // Step 완료
    const completeStep = (stepIndex: number) => {
        const step = formData.steps[stepIndex];
        const selectedItem = selectedItems[stepIndex];
        const selectedType = selectedTypes[stepIndex];
        
        // 필수 정보 확인
        if (!selectedItem || !step.sequence_interval || !step.price_ratio) {
            alert('모든 정보를 입력해주세요.');
            return;
        }
        
        // Step 데이터에 선택된 아이템의 ID 저장
        const newSteps = [...formData.steps];
        if (selectedType === 'element') {
            newSteps[stepIndex] = {
                ...newSteps[stepIndex],
                element_id: selectedItem.id,
                bundle_id: undefined,
                custom_id: undefined
            };
        } else if (selectedType === 'bundle') {
            newSteps[stepIndex] = {
                ...newSteps[stepIndex],
                bundle_id: selectedItem.group_id,
                element_id: undefined,
                custom_id: undefined
            };
        } else if (selectedType === 'custom') {
            newSteps[stepIndex] = {
                ...newSteps[stepIndex],
                custom_id: selectedItem.group_id,
                element_id: undefined,
                bundle_id: undefined
            };
        }
        
        setFormData({
            ...formData,
            steps: newSteps
        });
        
        setCompletedSteps(prev => ({ ...prev, [stepIndex]: true }));
    };

    // Step 수정 모드로 전환
    const editStep = (stepIndex: number) => {
        setCompletedSteps(prev => ({ ...prev, [stepIndex]: false }));
    };

    // 시퀀스 생성
    const handleCreate = async () => {
        if (!formData.name.trim()) {
            alert('시퀀스 이름을 입력해주세요.');
            return;
        }
        
        if (!formData.group_id || formData.group_id <= 0) {
            alert('Group ID를 입력해주세요.');
            return;
        }
        
        if (formData.steps.length === 0) {
            alert('최소 하나의 Step을 추가해주세요.');
            return;
        }
        
        // 각 Step에서 참조 타입 검증
        for (const step of formData.steps) {
            const elementSelected = step.element_id !== undefined && step.element_id !== null && step.element_id !== 0;
            const bundleSelected = step.bundle_id !== undefined && step.bundle_id !== null && step.bundle_id !== 0;
            const customSelected = step.custom_id !== undefined && step.custom_id !== null && step.custom_id !== 0;
            
            const referenceCount = [elementSelected, bundleSelected, customSelected].filter(Boolean).length;
            
            if (referenceCount !== 1) {
                alert(`Step ${step.step_num}: Element, Bundle, Custom 중 정확히 하나만 선택해야 합니다.`);
                return;
            }
        }
        
        setSaving(true);
        
        try {
            const response = await createSequence(formData);
            console.log('시퀀스 생성 성공:', response);
            
            alert('시퀀스가 성공적으로 생성되었습니다.');
            
            // 부모 컴포넌트에 성공 알림
            onSuccess();
            
            // 데이터 새로고침
            if (onRefresh) {
                await onRefresh();
            }
            
            // 모달 닫기
            onClose();
            
            // 폼 초기화
            setFormData({
                group_id: 0,
                name: '',
                release: 1,
                steps: []
            });
            
        } catch (error: unknown) {
            console.error('시퀀스 생성 실패:', error);
            alert(`시퀀스 생성 중 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center z-50 p-4 overflow-hidden">
            <div className="bg-white rounded-xl w-full max-w-2xl h-[85vh] flex flex-col shadow-2xl border border-gray-200">
                
                {/* 헤더 */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">새 시퀀스 생성</h2>
                    <Button
                        onClick={onClose}
                        variant="ghost"
                        size="sm"
                        className="!text-gray-500 hover:text-gray-600 p-0 h-auto"
                    >
                        <X className="!w-5 !h-5" />
                    </Button>
                </div>

                {/* 내용 */}
                <div className="p-4 flex-1 overflow-y-auto">
                    <div className="space-y-4">
                        {/* 기본 정보 */}
                        <div className="space-y-3">
                            <div>
                                <h3 className="text-sm font-medium text-gray-900 mb-2">기본 정보</h3>
                                <div className="bg-gray-50 rounded-lg p-3 space-y-3">
                                    <div>
                                        <label className="text-xs text-gray-500 block mb-1">코스 패키지 이름 *</label>
                                                                                    <Input
                                                value={formData.name}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, name: e.target.value })}
                                                placeholder="코스 패키지 이름을 입력하세요"
                                                className="text-sm text-gray-600 placeholder:text-gray-500 bg-white border-gray-300 focus:ring-0 focus:border-gray-500"
                                            />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-xs text-gray-500 block mb-1">코스 패키지 ID *</label>
                                            <Input
                                                value={formData.group_id || ''}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, group_id: Number(e.target.value) || 0 })}
                                                placeholder="ID를 입력하세요"
                                                className="text-sm text-gray-600 placeholder:text-gray-500 bg-white border-gray-300 focus:ring-0 focus:border-gray-300"
                                                type="number"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-500 block mb-1">릴리즈 *</label>
                                            <Select
                                                value={formData.release.toString()}
                                                onValueChange={(value) => setFormData({ ...formData, release: Number(value) })}
                                            >
                                                <SelectTrigger className="text-sm w-full text-gray-600 bg-white border-gray-300 focus:ring-0 focus:border-gray-300">
                                                    <SelectValue placeholder="릴리즈 여부를 선택하세요" />
                                                </SelectTrigger>
                                                <SelectContent className="w-full bg-white border-gray-300 shadow-lg">
                                                    <SelectItem value="1">O</SelectItem>
                                                    <SelectItem value="0">X</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Steps */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-medium text-gray-900">새로운 Steps</h3>
                                <Button
                                    onClick={addStep}
                                    size="sm"
                                    className="h-7 px-2 text-xs"
                                >
                                    <Plus className="w-3 h-3 mr-1" />
                                    Step 추가
                                </Button>
                            </div>

                            {formData.steps.length === 0 ? (
                                <div className="text-center py-8 bg-gray-50 rounded-lg">
                                    <p className="text-sm text-gray-500">Step을 추가해주세요.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {formData.steps.map((step, index) => {
                                        const selectedItem = getSelectedItemInfo(index);
                                        const selectedType = selectedTypes[index];
                                        const isCompleted = completedSteps[index];
                                        
                                        return (
                                            <div 
                                                key={index} 
                                                className="border border-gray-200 rounded-lg p-3"
                                                ref={index === formData.steps.length - 1 ? lastStepRef : null}
                                            >
                                                <div className="flex items-center justify-between mb-3">
                                                    <div 
                                                        className={`flex items-center space-x-2 ${isCompleted ? 'cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors duration-200' : ''}`}
                                                        onClick={isCompleted ? () => editStep(index) : undefined}
                                                    >
                                                        <h4 className="text-sm font-medium text-gray-900">새 Step {step.step_num}</h4>
                                                        {/* 완료된 Step 표시 */}
                                                        {isCompleted && (
                                                            <span className="text-[10px] bg-white border border-purple-400 text-purple-700 px-1.5 mt-0.5 rounded-full">
                                                                완료
                                                            </span>
                                                        )}
                                                    </div>
                                                    
                                                    <div className="flex items-center space-x-2">
                                                        <Button
                                                            onClick={() => removeStep(index)}
                                                            size="sm"
                                                            variant="ghost"
                                                            className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                                                        >
                                                            <Trash2 className="w-3 h-3" />
                                                        </Button>
                                                    </div>
                                                </div>

                                                {!isCompleted && (
                                                    <div className="space-y-3">
                                                        {/* 1단계: 타입 선택 */}
                                                        {!selectedType && (
                                                            <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                                                                <label className="text-xs text-gray-500 block">패키지 타입을 선택해주세요</label>
                                                                <div className="grid grid-cols-3 gap-2">
                                                                    <Button
                                                                        onClick={() => selectType(index, 'element')}
                                                                        size="sm"
                                                                        variant="outline"
                                                                        className="text-xs hover:bg-gray-50 border-gray-300 transition-colors duration-200"
                                                                    >
                                                                        단일시술
                                                                    </Button>
                                                                    <Button
                                                                        onClick={() => selectType(index, 'bundle')}
                                                                        size="sm"
                                                                        variant="outline"
                                                                        className="text-xs hover:bg-gray-50 border-gray-300 transition-colors duration-200"
                                                                    >
                                                                        패키지
                                                                    </Button>
                                                                    <Button
                                                                        onClick={() => selectType(index, 'custom')}
                                                                        size="sm"
                                                                        variant="outline"
                                                                        className="text-xs hover:bg-gray-50 border-gray-300 transition-colors duration-200"
                                                                    >
                                                                        커스텀
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* 2단계: 검색 및 선택 */}
                                                        {selectedType && !selectedItem && (
                                                            <div className="space-y-2 animate-in slide-in-from-top-1 fade-in duration-300">
                                                                <div className="flex items-center justify-between">
                                                                    <label className="text-xs text-gray-500 block">
                                                                        <span className={`inline-block px-1.5 py-0.5 rounded-full text-xs font-medium ${
                                                                            selectedType === 'element' 
                                                                                ? 'bg-white border border-gray-400 text-gray-400' 
                                                                                : selectedType === 'bundle' 
                                                                                ? 'bg-white border border-orange-400 text-orange-400' 
                                                                                : 'bg-white border border-red-400 text-red-400'
                                                                        }`}>
                                                                            {selectedType === 'element' ? '단일시술' : selectedType === 'bundle' ? '패키지' : '커스텀'}
                                                                        </span>
                                                                    </label>
                                                                    <Button
                                                                        onClick={() => {
                                                                            setSelectedTypes(prev => {
                                                                                const newTypes = { ...prev };
                                                                                delete newTypes[index];
                                                                                return newTypes;
                                                                            });
                                                                            setSelectedItems(prev => {
                                                                                const newItems = { ...prev };
                                                                                delete newItems[index];
                                                                                return newItems;
                                                                            });
                                                                            setSearchQueries(prev => ({ ...prev, [index]: '' }));
                                                                            setSearchResults(prev => ({ ...prev, [index]: [] }));
                                                                            
                                                                            // 기존 선택 초기화 - 한 번에 모든 필드 업데이트
                                                                            const newSteps = [...formData.steps];
                                                                            newSteps[index] = {
                                                                                ...newSteps[index],
                                                                                element_id: undefined,
                                                                                bundle_id: undefined,
                                                                                custom_id: undefined
                                                                            };
                                                                            setFormData({
                                                                                ...formData,
                                                                                steps: newSteps
                                                                            });
                                                                        }}
                                                                        size="sm"
                                                                        variant="ghost"
                                                                        className="text-xs text-gray-500"
                                                                    >
                                                                        타입 변경
                                                                    </Button>
                                                                </div>
                                                                <Input
                                                                    value={searchQueries[index] || ''}
                                                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQueries(prev => ({ ...prev, [index]: e.target.value }))}
                                                                    placeholder={`${selectedType === 'element' ? '단일시술' : selectedType === 'bundle' ? '패키지' : '커스텀'} 검색...`}
                                                                    className="text-sm border-gray-300 focus:border-gray-300"
                                                                />
                                                                {(searchResults[index] || []).length > 0 && (
                                                                    <div className="max-h-32 overflow-y-auto space-y-1">
                                                                        {(searchResults[index] || []).map((item) => (
                                                                            <div
                                                                                key={item.id || item.group_id}
                                                                                onClick={() => selectItem(index, item)}
                                                                                className="p-2 bg-white rounded border border-gray-200 cursor-pointer hover:bg-gray-50 text-xs"
                                                                            >
                                                                                <div className="font-medium text-gray-900">{item.name}</div>
                                                                                <div className="text-gray-500">
                                                                                    {selectedType === 'element' 
                                                                                        ? `${item.class_major} > ${item.class_sub} > ${item.class_detail}`
                                                                                        : `ID: ${item.group_id}`
                                                                                    }
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}

                                                        {/* 3단계: 상세 정보 및 설정 */}
                                                        {selectedItem && (
                                                            <div className="animate-in slide-in-from-top-2 duration-300 fade-in">
                                                                {/* 상세 정보 */}
                                                                <div className="space-y-2">
                                                                    <label className="text-xs text-gray-500 block">선택된 시술 정보</label>
                                                                    <div className="bg-gray-50 rounded-lg p-3 space-y-3">
                                                                        <div className="flex items-center justify-between">
                                                                            <h5 className="text-sm font-medium text-gray-900">{selectedItem.name}</h5>
                                                                            <span className="text-xs text-gray-500">
                                                                                {selectedType === 'element' ? '단일시술' : selectedType === 'bundle' ? '패키지' : '커스텀'}
                                                                            </span>
                                                                        </div>
                                                                        
                                                                        {selectedItem.description && (
                                                                            <p className="text-xs text-gray-600">{selectedItem.description}</p>
                                                                        )}
                                                                        
                                                                        {/* Element 상세 정보 */}
                                                                        {selectedType === 'element' && (
                                                                            <div className="space-y-2">
                                                                                <div className="grid grid-cols-2 gap-2 text-xs">
                                                                                    {selectedItem.procedure_cost && (
                                                                                        <div>
                                                                                            <span className="text-gray-500">원가:</span>
                                                                                            <span className="ml-1 font-medium">{selectedItem.procedure_cost.toLocaleString()}원</span>
                                                                                        </div>
                                                                                    )}
                                                                                    {selectedItem.price && (
                                                                                        <div>
                                                                                            <span className="text-gray-500">가격:</span>
                                                                                            <span className="ml-1 font-medium">{selectedItem.price.toLocaleString()}원</span>
                                                                                        </div>
                                                                                    )}
                                                                                    {selectedItem.position_type && (
                                                                                        <div>
                                                                                            <span className="text-gray-500">담당자:</span>
                                                                                            <span className={`ml-1 rounded-full px-1 py-0.5 text-xs ${
                                                                                                selectedItem.position_type === '의사' 
                                                                                                    ? 'text-sky-300 border border-sky-300' 
                                                                                                    : 'text-pink-300 border border-pink-300'
                                                                                            }`}>
                                                                                                {selectedItem.position_type}
                                                                                            </span>
                                                                                        </div>
                                                                                    )}
                                                                                    {selectedItem.cost_time && (
                                                                                        <div>
                                                                                            <span className="text-gray-500">소요시간:</span>
                                                                                            <span className="ml-1 font-medium">{selectedItem.cost_time}분</span>
                                                                                        </div>
                                                                                    )}
                                                                                    {selectedItem.procedure_level && (
                                                                                        <div>
                                                                                            <span className="text-gray-500">난이도:</span>
                                                                                            <span className="ml-1 font-medium">{selectedItem.procedure_level}</span>
                                                                                        </div>
                                                                                    )}
                                                                                    {selectedItem.release !== undefined && (
                                                                                        <div>
                                                                                            <span className="text-gray-500">릴리즈:</span>
                                                                                            <span className="ml-1 font-medium">{selectedItem.release === 1 ? 'O' : 'X'}</span>
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                                
                                                                                {/* 분류 정보 */}
                                                                                {(selectedItem.class_major || selectedItem.class_sub || selectedItem.class_detail) && (
                                                                                    <div className="border-t border-gray-200 pt-2">
                                                                                        <h6 className="text-xs font-medium text-gray-700 mb-1">분류 정보</h6>
                                                                                        <div className="grid grid-cols-2 gap-2 text-xs">
                                                                                            {selectedItem.class_major && (
                                                                                                <div>
                                                                                                    <span className="text-gray-500">대분류:</span>
                                                                                                    <span className="ml-1 font-medium">{selectedItem.class_major}</span>
                                                                                                </div>
                                                                                            )}
                                                                                            {selectedItem.class_sub && (
                                                                                                <div>
                                                                                                    <span className="text-gray-500">중분류:</span>
                                                                                                    <span className="ml-1 font-medium">{selectedItem.class_sub}</span>
                                                                                                </div>
                                                                                            )}
                                                                                            {selectedItem.class_detail && (
                                                                                                <div>
                                                                                                    <span className="text-gray-500">상세분류:</span>
                                                                                                    <span className="ml-1 font-medium">{selectedItem.class_detail}</span>
                                                                                                </div>
                                                                                            )}
                                                                                            {selectedItem.class_type && (
                                                                                                <div>
                                                                                                    <span className="text-gray-500">타입:</span>
                                                                                                    <span className="ml-1 font-medium">{selectedItem.class_type}</span>
                                                                                                </div>
                                                                                            )}
                                                                                        </div>
                                                                                    </div>
                                                                                )}
                                                                                
                                                                                {/* 소모품 정보 */}
                                                                                {(selectedItem.consum_1_name || selectedItem.consumable_info) && (
                                                                                    <div className="border-t border-gray-200 pt-2">
                                                                                        <h6 className="text-xs font-medium text-gray-700 mb-1">소모품 정보</h6>
                                                                                        <div className="grid grid-cols-2 gap-2 text-xs">
                                                                                            {selectedItem.consum_1_name && (
                                                                                                <div>
                                                                                                    <span className="text-gray-500">소모품명:</span>
                                                                                                    <span className="ml-1 font-medium">{selectedItem.consum_1_name}</span>
                                                                                                </div>
                                                                                            )}
                                                                                            {selectedItem.consum_1_count && (
                                                                                                <div>
                                                                                                    <span className="text-gray-500">개수:</span>
                                                                                                    <span className="ml-1 font-medium">{selectedItem.consum_1_count}</span>
                                                                                                </div>
                                                                                            )}
                                                                                            {selectedItem.consum_1_unit && (
                                                                                                <div>
                                                                                                    <span className="text-gray-500">단위:</span>
                                                                                                    <span className="ml-1 font-medium">{selectedItem.consum_1_unit}</span>
                                                                                                </div>
                                                                                            )}
                                                                                            {selectedItem.consumable_info?.unit_price && (
                                                                                                <div>
                                                                                                    <span className="text-gray-500">단가:</span>
                                                                                                    <span className="ml-1 font-medium">{selectedItem.consumable_info.unit_price.toLocaleString()}원</span>
                                                                                                </div>
                                                                                            )}
                                                                                        </div>
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        )}
                                                                        
                                                                        {/* Bundle 상세 정보 */}
                                                                        {selectedType === 'bundle' && selectedItem.elements && (
                                                                            <div className="space-y-2">
                                                                                <div className="grid grid-cols-2 gap-2 text-xs">
                                                                                    {selectedItem.release !== undefined && (
                                                                                        <div>
                                                                                            <span className="text-gray-500">릴리즈:</span>
                                                                                            <span className="ml-1 font-medium">{selectedItem.release === 1 ? 'O' : 'X'}</span>
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                                
                                                                                {/* 포함된 시술 정보 */}
                                                                                <div className="border-t border-gray-200 pt-2">
                                                                                    <h6 className="text-xs font-medium text-gray-700 mb-1">포함된 시술 ({selectedItem.elements.length}개)</h6>
                                                                                    <div className="space-y-2">
                                                                                        {selectedItem.elements.map((element: ExtendedBundleElementResponse, idx: number) => (
                                                                                            <div key={idx} className="bg-white rounded-lg p-3 border border-gray-200">
                                                                                                {/* Element 기본 정보 */}
                                                                                                <div className="flex justify-between items-start mb-2">
                                                                                                    <div className="flex-1">
                                                                                                        <div className="font-medium text-gray-900 text-xs">
                                                                                                            {element.element_detail?.name || `시술 ${element.element_id}`}
                                                                                                        </div>
                                                                                                        {element.element_detail?.description && (
                                                                                                            <div className="text-gray-500 text-xs mt-1">
                                                                                                                {element.element_detail.description}
                                                                                                            </div>
                                                                                                        )}
                                                                                                    </div>
                                                                                                    <div className="text-right ml-2">
                                                                                                        <div className="text-xs text-gray-500">
                                                                                                            {element.element_cost?.toLocaleString() || 0}원
                                                                                                        </div>
                                                                                                        <div className="text-xs text-gray-500">
                                                                                                            {(element.price_ratio * 100).toFixed(1)}%
                                                                                                        </div>
                                                                                                    </div>
                                                                                                </div>
                                                                                                
                                                                                                {/* Element 상세 정보 */}
                                                                                                {element.element_detail && (
                                                                                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                                                                                        {element.element_detail.position_type && (
                                                                                                            <div>
                                                                                                                <span className="text-gray-500">담당자:</span>
                                                                                                                <span className={`ml-1 rounded-full px-1 py-0.5 text-xs ${
                                                                                                                    element.element_detail.position_type === '의사' 
                                                                                                                        ? 'text-sky-300 border border-sky-300' 
                                                                                                                        : 'text-pink-300 border border-pink-300'
                                                                                                                }`}>
                                                                                                                    {element.element_detail.position_type}
                                                                                                                </span>
                                                                                                            </div>
                                                                                                        )}
                                                                                                        {element.element_detail.procedure_level && (
                                                                                                            <div>
                                                                                                                <span className="text-gray-500">난이도:</span>
                                                                                                                <span className="ml-1 font-medium">{element.element_detail.procedure_level}</span>
                                                                                                            </div>
                                                                                                        )}
                                                                                                        {element.element_detail.cost_time && (
                                                                                                            <div>
                                                                                                                <span className="text-gray-500">소요시간:</span>
                                                                                                                <span className="ml-1 font-medium">{element.element_detail.cost_time}분</span>
                                                                                                            </div>
                                                                                                        )}
                                                                                                        {element.element_detail.procedure_cost && (
                                                                                                            <div>
                                                                                                                <span className="text-gray-500">원가:</span>
                                                                                                                <span className="ml-1 font-medium">{element.element_detail.procedure_cost.toLocaleString()}원</span>
                                                                                                            </div>
                                                                                                        )}
                                                                                                        {element.element_detail.price && (
                                                                                                            <div>
                                                                                                                <span className="text-gray-500">가격:</span>
                                                                                                                <span className="ml-1 font-medium">{element.element_detail.price.toLocaleString()}원</span>
                                                                                                            </div>
                                                                                                        )}
                                                                                                        {element.element_detail.release !== undefined && (
                                                                                                            <div>
                                                                                                                <span className="text-gray-500">릴리즈:</span>
                                                                                                                <span className="ml-1 font-medium">{element.element_detail.release === 1 ? 'O' : 'X'}</span>
                                                                                                            </div>
                                                                                                        )}
                                                                                                    </div>
                                                                                                )}
                                                                                                
                                                                                                {/* Element 소모품 정보 */}
                                                                                                {element.consumable_info && (
                                                                                                    <div className="mt-2 pt-2 border-t border-gray-100">
                                                                                                        <h6 className="text-xs font-medium text-gray-700 mb-1">소모품 정보</h6>
                                                                                                        <div className="grid grid-cols-2 gap-2 text-xs">
                                                                                                            <div>
                                                                                                                <span className="text-gray-500">소모품명:</span>
                                                                                                                <span className="ml-1 font-medium">{element.consumable_info.name}</span>
                                                                                                            </div>
                                                                                                            <div>
                                                                                                                <span className="text-gray-500">단가:</span>
                                                                                                                <span className="ml-1 font-medium">{element.consumable_info.unit_price?.toLocaleString() || 0}원</span>
                                                                                                            </div>
                                                                                                            <div>
                                                                                                                <span className="text-gray-500">단위:</span>
                                                                                                                <span className="ml-1 font-medium">{element.consumable_info.unit_type}</span>
                                                                                                            </div>
                                                                                                            <div>
                                                                                                                <span className="text-gray-500">가격:</span>
                                                                                                                <span className="ml-1 font-medium">{element.consumable_info.price?.toLocaleString() || 0}원</span>
                                                                                                            </div>
                                                                                                            <div>
                                                                                                                <span className="text-gray-500">설명:</span>
                                                                                                                <span className="ml-1 font-medium">{element.consumable_info.description || '설명 없음'}</span>
                                                                                                            </div>
                                                                                                            <div>
                                                                                                                <span className="text-gray-500">VAT:</span>
                                                                                                                <span className="ml-1 font-medium">{element.consumable_info.vat || 0}%</span>
                                                                                                            </div>
                                                                                                        </div>
                                                                                                    </div>
                                                                                                )}
                                                                                            </div>
                                                                                        ))}
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                        
                                                                        {/* Custom 상세 정보 */}
                                                                        {selectedType === 'custom' && selectedItem.custom_elements && (
                                                                            <div className="space-y-2">
                                                                                <div className="grid grid-cols-2 gap-2 text-xs">
                                                                                    {selectedItem.release !== undefined && (
                                                                                        <div>
                                                                                            <span className="text-gray-500">릴리즈:</span>
                                                                                            <span className="ml-1 font-medium">{selectedItem.release === 1 ? 'O' : 'X'}</span>
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                                
                                                                                {/* 포함된 시술 정보 */}
                                                                                <div className="border-t border-gray-200 pt-2">
                                                                                    <h6 className="text-xs font-medium text-gray-700 mb-1">포함된 시술 ({selectedItem.custom_elements.length}개)</h6>
                                                                                    <div className="space-y-2">
                                                                                        {selectedItem.custom_elements.map((element: ExtendedCustomElementResponse, idx: number) => (
                                                                                            <div key={idx} className="bg-white rounded-lg p-3 border border-gray-200">
                                                                                                {/* Element 기본 정보 */}
                                                                                                <div className="flex justify-between items-start mb-2">
                                                                                                    <div className="flex-1">
                                                                                                        <div className="font-medium text-gray-900 text-xs">
                                                                                                            {element.element_detail?.name || `시술 ${element.element_id}`}
                                                                                                        </div>
                                                                                                        {element.element_detail?.description && (
                                                                                                            <div className="text-gray-500 text-xs mt-1">
                                                                                                                {element.element_detail.description}
                                                                                                            </div>
                                                                                                        )}
                                                                                                    </div>
                                                                                                    <div className="text-right ml-2">
                                                                                                        <div className="text-xs text-gray-500">
                                                                                                            {element.custom_count}회
                                                                                                        </div>
                                                                                                        <div className="text-xs text-gray-500">
                                                                                                            {(element.price_ratio * 100).toFixed(1)}%
                                                                                                        </div>
                                                                                                    </div>
                                                                                                </div>
                                                                                                
                                                                                                {/* Element 상세 정보 */}
                                                                                                {element.element_detail && (
                                                                                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                                                                                        {element.element_detail.position_type && (
                                                                                                            <div>
                                                                                                                <span className="text-gray-500">담당자:</span>
                                                                                                                <span className={`ml-1 rounded-full px-1 py-0.5 text-xs ${
                                                                                                                    element.element_detail.position_type === '의사' 
                                                                                                                        ? 'text-sky-300 border border-sky-300' 
                                                                                                                        : 'text-pink-300 border border-pink-300'
                                                                                                                }`}>
                                                                                                                    {element.element_detail.position_type}
                                                                                                                </span>
                                                                                                            </div>
                                                                                                        )}
                                                                                                        {element.element_detail.procedure_level && (
                                                                                                            <div>
                                                                                                                <span className="text-gray-500">난이도:</span>
                                                                                                                <span className="ml-1 font-medium">{element.element_detail.procedure_level}</span>
                                                                                                            </div>
                                                                                                        )}
                                                                                                        {element.element_detail.cost_time && (
                                                                                                            <div>
                                                                                                                <span className="text-gray-500">소요시간:</span>
                                                                                                                <span className="ml-1 font-medium">{element.element_detail.cost_time}분</span>
                                                                                                            </div>
                                                                                                        )}
                                                                                                        {element.element_detail.procedure_cost && (
                                                                                                            <div>
                                                                                                                <span className="text-gray-500">원가:</span>
                                                                                                                <span className="ml-1 font-medium">{element.element_detail.procedure_cost.toLocaleString()}원</span>
                                                                                                            </div>
                                                                                                        )}
                                                                                                        {element.element_detail.price && (
                                                                                                            <div>
                                                                                                                <span className="text-gray-500">가격:</span>
                                                                                                                <span className="ml-1 font-medium">{element.element_detail.price.toLocaleString()}원</span>
                                                                                                            </div>
                                                                                                        )}
                                                                                                        {element.element_detail.release !== undefined && (
                                                                                                            <div>
                                                                                                                <span className="text-gray-500">릴리즈:</span>
                                                                                                                <span className="ml-1 font-medium">{element.element_detail.release === 1 ? 'O' : 'X'}</span>
                                                                                                            </div>
                                                                                                        )}
                                                                                                        {element.element_limit && (
                                                                                                            <div>
                                                                                                                <span className="text-gray-500">시술 제한:</span>
                                                                                                                <span className="ml-1 font-medium">{element.element_limit}</span>
                                                                                                            </div>
                                                                                                        )}
                                                                                                        {element.element_cost && (
                                                                                                            <div>
                                                                                                                <span className="text-gray-500">시술 비용:</span>
                                                                                                                <span className="ml-1 font-medium">{element.element_cost.toLocaleString()}원</span>
                                                                                                            </div>
                                                                                                        )}
                                                                                                    </div>
                                                                                                )}
                                                                                                
                                                                                                {/* Element 소모품 정보 */}
                                                                                                {element.consumable_info && (
                                                                                                    <div className="mt-2 pt-2 border-t border-gray-100">
                                                                                                        <h6 className="text-xs font-medium text-gray-700 mb-1">소모품 정보</h6>
                                                                                                        <div className="grid grid-cols-2 gap-2 text-xs">
                                                                                                            <div>
                                                                                                                <span className="text-gray-500">소모품명:</span>
                                                                                                                <span className="ml-1 font-medium">{element.consumable_info.name}</span>
                                                                                                            </div>
                                                                                                            <div>
                                                                                                                <span className="text-gray-500">단가:</span>
                                                                                                                <span className="ml-1 font-medium">{element.consumable_info.unit_price?.toLocaleString() || 0}원</span>
                                                                                                            </div>
                                                                                                            <div>
                                                                                                                <span className="text-gray-500">단위:</span>
                                                                                                                <span className="ml-1 font-medium">{element.consumable_info.unit_type}</span>
                                                                                                            </div>
                                                                                                            <div>
                                                                                                                <span className="text-gray-500">가격:</span>
                                                                                                                <span className="ml-1 font-medium">{element.consumable_info.price?.toLocaleString() || 0}원</span>
                                                                                                            </div>
                                                                                                            <div>
                                                                                                                <span className="text-gray-500">설명:</span>
                                                                                                                <span className="ml-1 font-medium">{element.consumable_info.description || '설명 없음'}</span>
                                                                                                            </div>
                                                                                                            <div>
                                                                                                                <span className="text-gray-500">VAT:</span>
                                                                                                                <span className="ml-1 font-medium">{element.consumable_info.vat || 0}%</span>
                                                                                                            </div>
                                                                                                        </div>
                                                                                                    </div>
                                                                                                )}
                                                                                            </div>
                                                                                        ))}
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                {/* 4단계: 설정 */}
                                                                <div className="space-y-2 mt-6">
                                                                    <label className="text-xs text-gray-500 block">주기 및 가격 비율 설정</label>
                                                                    <div className="grid grid-cols-2 gap-3">
                                                                        <div>
                                                                            <Input
                                                                                value={step.sequence_interval || ''}
                                                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateStep(index, 'sequence_interval', Number(e.target.value) || 0)}
                                                                                placeholder="재방문 주기"
                                                                                className="text-sm border-gray-300 focus:border-gray-300"
                                                                                type="number"
                                                                            />
                                                                        </div>
                                                                        <div>
                                                                            <Input
                                                                                value={step.price_ratio === 0 ? '' : step.price_ratio || ''}
                                                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                                                    const value = parseFloat(e.target.value);
                                                                                    if (e.target.value === '' || (value >= 0 && value <= 1)) {
                                                                                        updateStep(index, 'price_ratio', e.target.value === '' ? 0 : value);
                                                                                    }
                                                                                }}
                                                                                placeholder="가격 비율 ex).25"
                                                                                className="text-sm border-gray-300 focus:border-gray-300"
                                                                                type="number"
                                                                                step="0.01"
                                                                                min="0"
                                                                                max="1"
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {/* 5단계: 완료 버튼 */}
                                                                <div className="space-y-2 mt-6">
                                                                    <Button
                                                                        onClick={() => completeStep(index)}
                                                                        size="sm"
                                                                        className="w-full bg-gradient-to-r from-slate-600 to-slate-700 text-white hover:from-slate-700 hover:to-slate-800 shadow-sm border-0 font-semibold"
                                                                    >
                                                                        <Check className="w-4 h-4 mr-1" />
                                                                        Step {step.step_num} 저장
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {/* 완료된 Step 표시 */}
                                                {isCompleted && (
                                                    <div className="bg-gray-50 rounded-lg p-3 space-y-2 border border-gray-200">
                                                        <div className="flex items-center justify-between">
                                                            <h5 className="text-sm font-medium text-gray-900">{selectedItem?.name}</h5>
                                                            <span className="text-xs text-gray-600 font-medium">완료됨</span>
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-2 text-xs">
                                                            <div>
                                                                <span className="text-gray-500">간격:</span>
                                                                <span className="ml-1 font-medium">{step.sequence_interval}일</span>
                                                            </div>
                                                            <div>
                                                                <span className="text-gray-500">가격 비율:</span>
                                                                <span className="ml-1 font-medium">{step.price_ratio}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* 하단 버튼 */}
                <div className="p-4 border-t border-gray-200 flex-shrink-0">
                    <div className="flex space-x-3">
                        <Button
                            onClick={onClose}
                            className="flex-1 bg-gray-500 py-3 font-semibold text-white"
                            variant="secondary"
                            disabled={saving}
                        >
                            취소
                        </Button>
                        <Button
                            onClick={handleCreate}
                            className="flex-1 bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700"
                            disabled={saving || formData.steps.length === 0 || Object.keys(completedSteps).length !== formData.steps.length}
                        >
                            {saving ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    생성 중...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4 mr-2" />
                                    생성하기
                                </>
                            )}
                        </Button>
                    </div>
                    {formData.steps.length > 0 && Object.keys(completedSteps).length !== formData.steps.length && (
                        <p className="text-xs text-orange-600 text-center mt-2">
                            모든 Step 저장을 완료해주세요 ({Object.keys(completedSteps).length}/{formData.steps.length})
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
