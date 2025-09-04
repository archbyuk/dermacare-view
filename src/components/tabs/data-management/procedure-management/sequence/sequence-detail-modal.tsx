'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Edit, Save, Plus, Tag, Trash2} from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { SequenceResponse, SequenceStepResponse, updateSequence, deleteSequence } from '@/api/sequences-api';
import { Element, getElementsList } from '@/api/element-api';
import { searchElementsByName } from '@/utils/element-utils';
import { BundleListResponse, getBundlesList } from '@/api/bundles-api';
import { CustomListResponse, getCustomsList } from '@/api/customs-api';
import { ConsumableResponse } from '@/api/consumables-api';
import { useModalStore } from '@/store/modal-store';
import SequnceStepModal from './sequnce-step-modal';

interface SequenceDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    sequence: SequenceResponse | null;
    onRefresh?: (() => Promise<void>) | null;
}

export default function SequenceDetailModal({ isOpen, onClose, onSuccess, sequence, onRefresh }: SequenceDetailModalProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    
    // Step 추가 모달 관련 상태
    const [showAddStepModal, setShowAddStepModal] = useState(false);
    
    // 검색 관련 상태들
    const [showElementSearch, setShowElementSearch] = useState<number | null>(null);
    const [showBundleSearch, setShowBundleSearch] = useState<number | null>(null);
    const [showCustomSearch, setShowCustomSearch] = useState<number | null>(null);
    const [elementSearchQuery, setElementSearchQuery] = useState('');
    const [bundleSearchQuery, setBundleSearchQuery] = useState('');
    const [customSearchQuery, setCustomSearchQuery] = useState('');
    const [elementSearchResults, setElementSearchResults] = useState<Element[]>([]);
    const [bundleSearchResults, setBundleSearchResults] = useState<BundleListResponse[]>([]);
    const [customSearchResults, setCustomSearchResults] = useState<CustomListResponse[]>([]);
    
    // 검색 함수들
    const searchBundlesByName = (bundles: BundleListResponse[], query: string) => {
        return bundles.filter(bundle => 
            bundle.name?.toLowerCase().includes(query.toLowerCase()) ||
            bundle.group_id.toString().includes(query)
        );
    };
    
    const searchCustomsByName = (customs: CustomListResponse[], query: string) => {
        return customs.filter(custom => 
            custom.name?.toLowerCase().includes(query.toLowerCase()) ||
            custom.group_id.toString().includes(query)
        );
    };
    
    const { returnToMembership, openMembershipDetail } = useModalStore();
    
    const [formData, setFormData] = useState<Partial<SequenceResponse>>({
        group_id: undefined,
        sequence_name: undefined,
        steps: []
    });

    // 시퀀스 데이터가 변경될 때 폼 데이터 업데이트
    useEffect(() => {
        if (sequence) {
            // 실제 API 응답에서 시퀀스 이름을 steps의 name에서 가져오기
            const sequenceName = sequence.steps && sequence.steps.length > 0 ? sequence.steps[0].name : '이름 없음';
            
            setFormData({
                group_id: sequence.group_id,
                sequence_name: sequenceName,
                steps: sequence.steps.map(step => ({ ...step }))
            });
        }
    }, [sequence]);

    // 수정 모드 토글
    const handleEditToggle = () => {
        if (!isEditing) {
            // 수정 모드로 전환 시 현재 값들을 검색 쿼리에 설정
            setElementSearchQuery('');
            setBundleSearchQuery('');
            setCustomSearchQuery('');
        } else {
            // 수정 모드 종료 시 모든 변경 내용 초기화
            if (sequence) {
                setFormData({
                    group_id: sequence.group_id,
                    sequence_name: sequence.sequence_name,
                    steps: sequence.steps.map(step => ({ ...step }))
                });
            }
            
            // 검색 관련 상태들 초기화
            setElementSearchQuery('');
            setBundleSearchQuery('');
            setCustomSearchQuery('');
            setElementSearchResults([]);
            setBundleSearchResults([]);
            setCustomSearchResults([]);
            setShowElementSearch(null);
            setShowBundleSearch(null);
            setShowCustomSearch(null);
        }
        setIsEditing(!isEditing);
    };

    // 멤버십으로 돌아가기
    const handleReturnToMembership = () => {
        if (returnToMembership) {
            openMembershipDetail(returnToMembership);
        }
    };

    // 저장
    const handleSave = async () => {
        if (!sequence) return;
        
        setSaving(true);
        try {
            // API 호출을 위한 데이터 준비
            const updateData = {
                steps: formData.steps?.map(step => ({
                    step_num: step.step_num,
                    name: formData.sequence_name || sequence.sequence_name,  // name 필드로 이동
                    element_id: step.element_id,
                    bundle_id: step.bundle_id,
                    custom_id: step.custom_id,
                    sequence_interval: step.sequence_interval,
                    price_ratio: step.price_ratio || 1.0  // 기본값을 1.0으로 수정
                })) || []
            };
            
            // 데이터 검증
            if (updateData.steps && updateData.steps.length === 0) {
                throw new Error('최소 하나의 Step이 필요합니다.');
            }
            
            // Step Number 중복 확인
            const stepNums = updateData.steps?.map(step => step.step_num) || [];
            if (stepNums.length !== new Set(stepNums).size) {
                throw new Error('Step Number가 중복되었습니다.');
            }
            
            // 각 Step에서 참조 타입 검증
            for (const step of updateData.steps || []) {
                const referenceCount = [
                    step.element_id !== undefined && step.element_id !== null,
                    step.bundle_id !== undefined && step.bundle_id !== null,
                    step.custom_id !== undefined && step.custom_id !== null
                ].filter(Boolean).length;
                
                if (referenceCount !== 1) {
                    throw new Error(`Step ${step.step_num}: Element, Bundle, Custom 중 정확히 하나만 선택해야 합니다.`);
                }
            }
            
            
            // updateSequence API 호출
            const response = await updateSequence(formData.group_id || sequence.group_id, updateData);
            
            
            alert('시퀀스가 성공적으로 수정되었습니다.');
            setIsEditing(false);
            onSuccess();
            if (onRefresh) {
                await onRefresh();
            }
        } catch (error: unknown) {
            console.error('=== 시퀀스 수정 실패 ===');
            console.error('에러:', error);
            alert(`시퀀스 수정 중 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
        } finally {
            setSaving(false);
        }
    };

    // 삭제
    const handleDelete = async () => {
        if (!sequence) return;
        
        if (!confirm('정말로 이 시퀀스를 삭제하시겠습니까?')) {
            return;
        }
        
        setDeleting(true);
        try {
            await deleteSequence(sequence.group_id);
            alert('시퀀스가 성공적으로 삭제되었습니다.');
            onSuccess();
            if (onRefresh) {
                await onRefresh();
            }
            onClose();
        } catch (error: unknown) {
            console.error('시퀀스 삭제 실패:', error);
            alert(`시퀀스 삭제 중 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
        } finally {
            setDeleting(false);
        }
    };

    // Step 추가 모달 열기
    const handleAddStep = () => {
        setShowAddStepModal(true);
    };

    // Step 추가 확인
    const handleAddStepConfirm = (procedure: { 
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
        // 소모품 정보
        consumable_info?: ConsumableResponse;
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
            element_cost?: number;
            price_ratio: number;
            release: number;
            element_detail?: Element;
            custom_count?: number;
            element_limit?: number;
            consumable_info?: ConsumableResponse;
        }>;
    }, packageType: 'element' | 'bundle' | 'custom') => {
        const newStep: SequenceStepResponse = {
            id: Date.now(), // 임시 ID
            group_id: sequence?.group_id || 0,
            step_num: (formData.steps?.length || 0) + 1,
            sequence_interval: 7,
            price_ratio: 0,
            release: 1,
            // 선택된 타입에 따라 ID 설정
            ...(packageType === 'element' && { element_id: procedure.id }),
            ...(packageType === 'bundle' && { bundle_id: procedure.group_id }),
            ...(packageType === 'custom' && { custom_id: procedure.group_id }),
            // element 상세 정보 추가
            ...(packageType === 'element' && {
                element_info: {
                    id: procedure.id || 0,
                    name: procedure.name || '',
                    description: procedure.description || '',
                    class_major: procedure.class_major || '',
                    class_sub: procedure.class_sub || '',
                    class_detail: procedure.class_detail || '',
                    class_type: procedure.class_type || '',
                    position_type: procedure.position_type || '',
                    cost_time: procedure.cost_time || 0,
                    plan_state: procedure.plan_state || 0,
                    plan_count: procedure.plan_count || 0,
                    plan_interval: procedure.plan_interval || 0,
                    consum_1_id: procedure.consum_1_id || 0,
                    consum_1_count: procedure.consum_1_count || 0,
                    procedure_level: procedure.procedure_level || '',
                    procedure_cost: procedure.procedure_cost || 0,
                    price: procedure.price || 0,
                    release: procedure.release || 0,
                    consumable_info: procedure.consumable_info ? {
                        id: procedure.consumable_info.id,
                        name: procedure.consumable_info.name,
                        description: procedure.consumable_info.description || '',
                        unit_type: procedure.consumable_info.unit_type,
                        unit_price: procedure.consumable_info.unit_price,
                        price: procedure.consumable_info.price,
                        vat: procedure.consumable_info.vat,
                        taxable_type: procedure.consumable_info.taxable_type,
                        covered_type: procedure.consumable_info.covered_type,
                        release: procedure.consumable_info.release,
                        i_value: procedure.consumable_info.i_value || null,
                        f_value: procedure.consumable_info.f_value || null
                    } : null
                }
            }),
            // bundle 상세 정보 추가
            ...(packageType === 'bundle' && {
                bundle_info: {
                    group_id: procedure.group_id || 0,
                    name: procedure.name || '',
                    description: procedure.description || '',
                    element_cost: procedure.elements?.reduce((sum, element) => sum + (element.element_cost || 0), 0) || 0,
                    price_ratio: 0,
                    elements: procedure.elements?.map(element => ({
                        id: element.id,
                        name: element.element_detail?.name || '',
                        description: element.element_detail?.description || '',
                        class_major: element.element_detail?.class_major || '',
                        class_sub: element.element_detail?.class_sub || '',
                        class_detail: element.element_detail?.class_detail || '',
                        class_type: element.element_detail?.class_type || '',
                        procedure_cost: element.element_detail?.procedure_cost || 0,
                        price: element.element_detail?.price || 0,
                        position_type: element.element_detail?.position_type || '',
                        cost_time: element.element_detail?.cost_time || 0,
                        plan_state: element.element_detail?.plan_state || 0,
                        plan_count: element.element_detail?.plan_count || 0,
                        plan_interval: element.element_detail?.plan_interval || 0,
                        consum_1_id: element.element_detail?.consum_1_id || 0,
                        consum_1_count: element.element_detail?.consum_1_count || 0,
                        procedure_level: element.element_detail?.procedure_level || '',
                        release: element.element_detail?.release || 0,
                        consumable_info: element.consumable_info ? {
                            id: element.consumable_info.id,
                            name: element.consumable_info.name,
                            description: element.consumable_info.description || '',
                            unit_type: element.consumable_info.unit_type,
                            unit_price: element.consumable_info.unit_price,
                            price: element.consumable_info.price,
                            vat: element.consumable_info.vat,
                            taxable_type: element.consumable_info.taxable_type,
                            covered_type: element.consumable_info.covered_type,
                            release: element.consumable_info.release,
                            i_value: element.consumable_info.i_value || null,
                            f_value: element.consumable_info.f_value || null
                        } : null
                    })) || []
                }
            }),
            // custom 상세 정보 추가
            ...(packageType === 'custom' && {
                custom_info: {
                    group_id: procedure.group_id || 0,
                    name: procedure.name || '',
                    description: procedure.description || '',
                    element_cost: procedure.custom_elements?.reduce((sum, element) => sum + (element.element_cost || 0), 0) || 0,
                    price_ratio: 0,
                    elements: procedure.custom_elements?.map(element => ({
                        id: element.id,
                        name: element.element_detail?.name || '',
                        description: element.element_detail?.description || '',
                        class_major: element.element_detail?.class_major || '',
                        class_sub: element.element_detail?.class_sub || '',
                        class_detail: element.element_detail?.class_detail || '',
                        class_type: element.element_detail?.class_type || '',
                        procedure_cost: element.element_detail?.procedure_cost || 0,
                        price: element.element_detail?.price || 0,
                        position_type: element.element_detail?.position_type || '',
                        cost_time: element.element_detail?.cost_time || 0,
                        plan_state: element.element_detail?.plan_state || 0,
                        plan_count: element.element_detail?.plan_count || 0,
                        plan_interval: element.element_detail?.plan_interval || 0,
                        consum_1_id: element.element_detail?.consum_1_id || 0,
                        consum_1_count: element.element_detail?.consum_1_count || 0,
                        procedure_level: element.element_detail?.procedure_level || '',
                        release: element.element_detail?.release || 0,
                        custom_count: element.custom_count || 0,
                        element_limit: element.element_limit || 0,
                        consumable_info: element.consumable_info ? {
                            id: element.consumable_info.id,
                            name: element.consumable_info.name,
                            description: element.consumable_info.description || '',
                            unit_type: element.consumable_info.unit_type,
                            unit_price: element.consumable_info.unit_price,
                            price: element.consumable_info.price,
                            vat: element.consumable_info.vat,
                            taxable_type: element.consumable_info.taxable_type,
                            covered_type: element.consumable_info.covered_type,
                            release: element.consumable_info.release,
                            i_value: element.consumable_info.i_value || null,
                            f_value: element.consumable_info.f_value || null
                        } : null
                    })) || []
                }
            })
        };
        
        setFormData(prev => ({
            ...prev,
            steps: [...(prev.steps || []), newStep]
        }));
    };

    // Step 삭제
    const handleRemoveStep = (stepIndex: number) => {
        setFormData(prev => ({
            ...prev,
            steps: prev.steps?.filter((_, index) => index !== stepIndex).map((step, index) => ({
                ...step,
                step_num: index + 1
            })) || []
        }));
    };

    // Element 검색
    const handleElementSearch = async (query: string, stepIndex: number) => {
        if (!query.trim()) {
            setElementSearchResults([]);
            return;
        }
        try {
            const elements = await getElementsList();
            const filtered = searchElementsByName(elements, query);
            setElementSearchResults(filtered.slice(0, 5));
            setShowElementSearch(stepIndex);
        } catch (error) {
            console.error('Element 검색 실패:', error);
            setElementSearchResults([]);
        }
    };

    // Bundle 검색
    const handleBundleSearch = async (query: string, stepIndex: number) => {
        if (!query.trim()) {
            setBundleSearchResults([]);
            return;
        }
        try {
            const bundles = await getBundlesList();
            const filtered = searchBundlesByName(bundles, query);
            setBundleSearchResults(filtered.slice(0, 5));
            setShowBundleSearch(stepIndex);
        } catch (error) {
            console.error('Bundle 검색 실패:', error);
            setBundleSearchResults([]);
        }
    };

    // Custom 검색
    const handleCustomSearch = async (query: string, stepIndex: number) => {
        if (!query.trim()) {
            setCustomSearchResults([]);
            return;
        }
        try {
            const customs = await getCustomsList();
            const filtered = searchCustomsByName(customs, query);
            setCustomSearchResults(filtered.slice(0, 5));
            setShowCustomSearch(stepIndex);
        } catch (error) {
            console.error('Custom 검색 실패:', error);
            setCustomSearchResults([]);
        }
    };

    // Element 선택
    const handleElementSelect = (element: Element, stepIndex: number) => {
        setFormData(prev => ({
            ...prev,
            steps: prev.steps?.map((step, index) => 
                index === stepIndex 
                    ? { ...step, element_id: element.id, bundle_id: undefined, custom_id: undefined }
                    : step
            ) || []
        }));
        setShowElementSearch(null);
        setElementSearchResults([]);
    };

    // Bundle 선택
    const handleBundleSelect = (bundle: BundleListResponse, stepIndex: number) => {
        setFormData(prev => ({
            ...prev,
            steps: prev.steps?.map((step, index) => 
                index === stepIndex 
                    ? { ...step, bundle_id: bundle.group_id, element_id: undefined, custom_id: undefined }
                    : step
            ) || []
        }));
        setShowBundleSearch(null);
        setBundleSearchResults([]);
    };

    // Custom 선택
    const handleCustomSelect = (custom: CustomListResponse, stepIndex: number) => {
        setFormData(prev => ({
            ...prev,
            steps: prev.steps?.map((step, index) => 
                index === stepIndex 
                    ? { ...step, custom_id: custom.group_id, element_id: undefined, bundle_id: undefined }
                    : step
            ) || []
        }));
        setShowCustomSearch(null);
        setCustomSearchResults([]);
    };

    // 검색 드롭다운 외부 클릭 시 닫기
    const handleClickOutside = () => {
        setShowElementSearch(null);
        setShowBundleSearch(null);
        setShowCustomSearch(null);
        setElementSearchResults([]);
        setBundleSearchResults([]);
        setCustomSearchResults([]);
    };

    // 모달 닫기
    const handleClose = () => {
        setIsEditing(false);
        
        // 수정 모드에서 변경된 내용 초기화
        if (sequence) {
            setFormData({
                group_id: sequence.group_id,
                sequence_name: sequence.sequence_name,
                steps: sequence.steps.map(step => ({ ...step }))
            });
        }
        
        // 검색 관련 상태들 초기화
        setElementSearchQuery('');
        setBundleSearchQuery('');
        setCustomSearchQuery('');
        setElementSearchResults([]);
        setBundleSearchResults([]);
        setCustomSearchResults([]);
        setShowElementSearch(null);
        setShowBundleSearch(null);
        setShowCustomSearch(null);
        
        // Step 추가 모달 상태 초기화
        setShowAddStepModal(false);
        
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center z-50 p-4 overflow-hidden"
            onClick={handleClickOutside}
        >
            <div 
                className="bg-white rounded-xl w-full max-w-md h-[85vh] flex flex-col shadow-2xl border border-gray-200"
                onClick={(e) => e.stopPropagation()}
            >
                
                {/* 헤더 */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <div className="flex items-center space-x-3">
                        <h2 className="text-lg font-semibold text-gray-900">
                            {isEditing ? '코스 패키지 정보 수정' : '코스 패키지 상세정보'}
                        </h2>
                        {returnToMembership && (
                            <Button
                                onClick={handleReturnToMembership}
                                variant="outline"
                                size="sm"
                                className="text-xs px-2 py-1 h-auto bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                            >
                                멤버십으로 돌아가기
                            </Button>
                        )}
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

                {/* 내용 */}
                <div className="p-4 flex-1 overflow-y-auto relative">
                    {sequence && (
                        <div className="space-y-4">
                            {/* 수정 모드에서 시퀀스 기본 정보 수정 */}
                            {isEditing && (
                                <>
                                    <h3 className="text-sm font-medium text-gray-900 mb-3">시퀀스 기본 정보</h3>
                                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                        <div className="space-y-3 grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-1">시퀀스명</label>
                                                <Input
                                                    value={formData.sequence_name || ''}
                                                    onChange={(e) => setFormData({ ...formData, sequence_name: e.target.value })}
                                                    placeholder="시퀀스명을 입력하세요"
                                                    className="text-sm bg-white border-gray-300 focus:ring-0 focus:border-gray-300"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-1">그룹 ID</label>
                                                <Input
                                                    type="number"
                                                    value={formData.group_id || ''}
                                                    onChange={(e) => setFormData({ ...formData, group_id: parseInt(e.target.value) || 0 })}
                                                    placeholder="그룹 ID를 입력하세요"
                                                    className="text-sm bg-white border-gray-300 focus:ring-0 focus:border-gray-300"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </>                                    
                            )}

                            {/* 시퀀스명 (수정 모드가 아닐 때만 표시) */}
                            {!isEditing && (
                                <div className="text-center pb-3 border-b border-gray-100">
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        {formData.sequence_name || '이름 없음'}
                                    </h3>
                                    <div className="flex items-center justify-center space-x-2 mt-2">
                                        <Tag className="w-3 h-3 text-gray-400" />
                                        <span className="text-xs text-gray-500">
                                            그룹 ID: {sequence.group_id}
                                        </span>
                                    </div>
                                </div>
                            )}

                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-sm font-medium text-gray-900 flex items-center">
                                        Steps 정보
                                    </h3>
                                    {isEditing && (
                                        <Button
                                            onClick={handleAddStep}
                                            size="sm"
                                            className="h-7 px-2 text-xs"
                                        >
                                            <Plus className="w-3 h-3 mr-1" />
                                            Step 추가
                                        </Button>
                                    )}
                                </div>
                            
                            <Accordion type="multiple" className="space-y-3 ">
                                    {(isEditing ? formData.steps : sequence?.steps)?.map((step, index) => (
                                        <AccordionItem key={step.id || index} value={`step-${step.step_num}`} className="bg-gray-50 rounded-lg border border-gray-200 last:border-b-1">
                                        {/* 아코디언 트리거 */}
                                        <AccordionTrigger className="px-4 hover:bg-gray-100 transition-colors">
                                            <div className="flex items-center justify-between w-full">
                                                <div className="flex items-center space-x-3">
                                                    <h4 className="text-sm font-medium text-gray-900">
                                                        Step {step.step_num}
                                                    </h4>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <span className="text-xs text-gray-500">
                                                        {step.id > 1000000000 ? '(신규)' : `${(step.procedure_cost || 0).toLocaleString()}원`}
                                                    </span>
                                                    {isEditing && (
                                                        <div
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleRemoveStep(index);
                                                            }}
                                                            className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 rounded flex items-center justify-center cursor-pointer transition-colors"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </AccordionTrigger>
                                        
                                        {/* 아코디언 컨텐츠 */}
                                        <AccordionContent className="px-4 pb-4 border-t border-gray-200 bg-white">
                                                {/* 수정 모드에서 Step 설정만 수정 가능 */}
                                                {isEditing && (
                                                    <div className="mb-4 pt-4">
                                                        <h5 className="text-sm font-medium text-gray-900 mb-3">Step 설정</h5>
                                                        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                                            <div className="grid grid-cols-2 gap-3">
                                                                <div>
                                                                    <label className="block text-xs font-medium text-gray-700 mb-1">코스 주기 (일)</label>
                                                                    <Input
                                                                        type="number"
                                                                        value={formData.steps?.[index]?.sequence_interval || step.sequence_interval || 0}
                                                                        onChange={(e) => {
                                                                            const newSteps = [...(formData.steps || [])];
                                                                            newSteps[index] = {
                                                                                ...newSteps[index],
                                                                                sequence_interval: parseInt(e.target.value) || 0
                                                                            };
                                                                            setFormData({ ...formData, steps: newSteps });
                                                                        }}
                                                                        className="text-sm bg-white border-gray-300 focus:ring-0 focus:border-gray-300"
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <label className="block text-xs font-medium text-gray-700 mb-1">가격 비율 (%)</label>
                                                                    <Input
                                                                        type="number"
                                                                        step="0.1"
                                                                        value={(((formData.steps?.[index]?.price_ratio || step.price_ratio || 0) * 100).toFixed(1))}
                                                                        onChange={(e) => {
                                                                            const newSteps = [...(formData.steps || [])];
                                                                            newSteps[index] = {
                                                                                ...newSteps[index],
                                                                                price_ratio: (parseFloat(e.target.value) || 0) / 100
                                                                            };
                                                                            setFormData({ ...formData, steps: newSteps });
                                                                        }}
                                                                        className="text-sm bg-white border-gray-300 focus:ring-0 focus:border-gray-300"
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                                
                                                {/* 기본 정보 */}
                                                {step.element_info ? (
                                                        <div className="mb-4 pt-4">
                                                            {/* 시술 정보 최상위 헤더 */}
                                                            <div className="flex items-start justify-between">
                                                                <h5 className="text-sm font-medium text-gray-900">단일 시술 정보</h5>
                                                                <span className="text-xs text-gray-400 rounded-full px-1.5 py-0.5 bg-white border border-gray-400 mb-1">
                                                                    <p className="text-center mt-0.5">
                                                                        단일시술
                                                                    </p>
                                                                </span>
                                                            </div>
                                                            {/* 정보 표기 영역 */}
                                                            <div className="rounded-lg pt-4 pl-4">
                                                                <div className="flex items-start justify-between mb-3">
                                                                    <div className="flex-1 mt-1">
                                                                        <h6 className="text-sm font-semibold text-gray-900">{step.element_info.name}</h6>
                                                                        <p className="text-xs text-gray-600 mt-1">{step.element_info.description}</p>
                                                                    </div>
                                                                    <div className="text-right">
                                                                        <p className="text-sm font-semibold text-gray-900">{step.element_info.procedure_cost.toLocaleString()}원</p>
                                                                    </div>
                                                                </div>
                                                                <div className="flex justify-between w-10/12">
                                                                    <p className="text-xs text-gray-500">코스 주기: {step.sequence_interval || 0}일</p>
                                                                    <p className="text-xs text-gray-500">가격 비율: {((step.price_ratio || 0) * 100).toFixed(1)}%</p>
                                                                    </div>
                                                            </div>
                                                        </div>
                                                    ) : step.bundle_info ? (
                                                        <div className="mb-4 pt-4">
                                                            {/* 시술 정보 최상위 헤더 */}
                                                            <div className="flex items-center justify-between">
                                                                <h5 className="text-sm font-medium text-gray-900">패키지 시술 정보</h5>
                                                                <span className="text-xs text-orange-400 rounded-full px-1.5 py-0.5 bg-white border border-orange-400 mb-1">
                                                                    <p className="text-center mt-0.5">
                                                                        패키지
                                                                    </p>
                                                                </span>
                                                            </div>
                                                            {/* 정보 표기 영역 */}
                                                            <div className="rounded-lg pt-4 pl-4">
                                                                <div className="flex items-start justify-between mb-3">
                                                                    <div>
                                                                        <p className="text-xs text-gray-500 mt-1">패키지 ID: {step.bundle_info.group_id}</p>
                                                                        <h6 className="text-sm font-semibold text-gray-900">{step.bundle_info.name}</h6>
                                                                        <p className="text-xs text-gray-600 mt-1">{step.bundle_info.description || '설명 없음'}</p>
                                                                    </div>
                                                                    <div className="text-right">
                                                                        <p className="text-sm font-semibold text-gray-900">{step.bundle_info.element_cost.toLocaleString()}원</p>
                                                                    </div>
                                                                </div>
                                                                <div className="flex justify-between w-10/12">
                                                                    <p className="text-xs text-gray-500">코스 주기: {step.sequence_interval || 0}일</p>
                                                                    <p className="text-xs text-gray-500">가격 비율: {((step.price_ratio || 0) * 100).toFixed(1)}%</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ) : step.custom_info ? (
                                                        <div className="mb-4 pt-4">
                                                            {/* 시술 정보 최상위 헤더 */}
                                                            <div className="flex items-start justify-between">
                                                                <h5 className="text-sm font-medium text-gray-900">커스텀 시술 정보</h5>
                                                                <span className="text-xs text-red-400 rounded-full px-1.5 py-0.5 bg-white border border-red-400 mb-1">
                                                                    <p className="text-center mt-0.5">
                                                                        커스텀
                                                                    </p>
                                                                </span>
                                                            </div>
                                                            {/* 정보 표기 영역 */}
                                                            <div className="rounded-lg pt-4 pl-4">
                                                                <div className="flex items-start justify-between mb-3">
                                                                    <div>
                                                                        <p className="text-xs text-gray-500 mt-1">커스텀 ID: {step.custom_info.group_id}</p>
                                                                        <h6 className="text-sm font-semibold text-gray-900">{step.custom_info.name}</h6>
                                                                        <p className="text-xs text-gray-600 mt-1">{step.custom_info.description || '설명 없음'}</p>
                                                                    </div>
                                                                    <div className="text-right">
                                                                        <p className="text-sm font-semibold text-gray-900">{step.custom_info.element_cost?.toLocaleString()}원</p>
                                                                    </div>
                                                                </div>
                                                                <div className="flex justify-between w-10/12">
                                                                    <p className="text-xs text-gray-500">코스 주기: {step.sequence_interval || 0}일</p>
                                                                    <p className="text-xs text-gray-500">가격 비율: {((step.price_ratio || 0) * 100).toFixed(1)}%</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="text-center text-gray-500 py-8">
                                                            시술 정보가 없습니다.
                                                        </div>
                                                    )}
                                                    
                                                    {/* 연결된 시술 정보 */}
                                                    <div className="space-y-4">

                                                        {/* Element 정보 */}
                                                        {step.element_info && (
                                                            <div className="space-y-2 pl-4">
                                                                <h6 className="text-sm font-medium text-gray-900">단일 시술 상세 정보</h6>
                                                                <div className="bg-white rounded p-3">
                                                                    {/* 헤더 */}
                                                                    <div className="flex items-start justify-between mb-2">
                                                                        <div className="flex-1">
                                                                            <div className="text-md font-medium text-gray-900">{step.element_info.name}</div>
                                                                            <p className="text-xs text-gray-600 mt-1">{step.element_info.description}</p>
                                                                            <div className="grid grid-cols-1 items-center mt-2">
                                                                                <p className="text-xs text-gray-500 font-medium">ID: 
                                                                                    <span className='text-gray-900'> {step.element_info.id}</span>
                                                                                </p>
                                                                                <p className="text-xs text-gray-500 mt-2">분류:
                                                                                    <span className='text-gray-900'> {step.element_info.class_major} &gt; {step.element_info.class_sub} &gt; {step.element_info.class_detail}</span>
                                                                                </p>
                                                                                <p className="text-xs text-gray-500 mt-2">타입:
                                                                                    <span className='text-gray-900'> {step.element_info.class_type}</span>
                                                                                </p>
                                                                            </div>
                                                                        </div>
                                                                        {/* 가격 표기 영역 */}
                                                                        <div className="text-right ml-3">
                                                                            <p className="text-sm font-semibold text-gray-900">{step.element_info.procedure_cost.toLocaleString()} 원</p>
                                                                        </div>
                                                                    </div>
                                                                    
                                                                    {/* 정보 표기 영역 */}
                                                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                                                    <div>
                                                                        <span className="text-gray-500">가격:</span>
                                                                        <span className="ml-1 text-gray-900">{step.element_info.price.toLocaleString()}원</span>
                                                                    </div>
                                                                    <div>
                                                                            <span className="text-gray-500">플랜 주기:</span>
                                                                            <span className="ml-1 text-gray-900">{step.element_info.plan_state === 1 ? (step.element_info.plan_interval || '-') : 'X'}</span>
                                                                        </div>
                                                                        <div>
                                                                            <span className="text-gray-500">시술 담당:</span>
                                                                        <span className="ml-1 text-gray-900">{step.element_info.position_type || '-'}</span>
                                                                    </div>
                                                                    <div>
                                                                            <span className="text-gray-500">소요 시간:</span>
                                                                        <span className="ml-1 text-gray-900">{step.element_info.cost_time || '-'}</span>
                                                                    </div>
                                                                    <div>
                                                                            <span className="text-gray-500">플랜 상태:</span>
                                                                            <span className="ml-1 text-gray-900">{step.element_info.plan_state === 1 ? 'O' : 'X'}</span>
                                                                    </div>
                                                                    <div>
                                                                            <span className="text-gray-500">플랜 개수:</span>
                                                                            <span className="ml-1 text-gray-900">{step.element_info.plan_state === 1 ? (step.element_info.plan_count || '-') : 'X'}</span>
                                                                    </div>
                                                                    <div>
                                                                            <span className="text-gray-500">시술 단계:</span>
                                                                            <span className="ml-1 text-gray-900">{step.element_info.procedure_level || '-'}</span>
                                                                    </div>
                                                                    <div>
                                                                            <span className="text-gray-500">활성화 상태:</span>
                                                                            <span className="ml-1 text-gray-900">{step.element_info.release === 1 ? 'O' : step.element_info.release === 0 ? 'X' : '-'}</span>
                                                                    </div>
                                                                    <div>
                                                                            <span className="text-gray-500">소모품 ID:</span>
                                                                            <span className="ml-1 text-gray-900">{step.element_info.consum_1_id || step.element_info.consumable_info?.id || '-'}</span>
                                                                        </div>
                                                                    </div>
                                                                    
                                                                    {/* 소모품 정보 */}
                                                                    {(step.element_info.consum_1_id || step.element_info.consumable_info) && (
                                                                        <div className='grid grid-cols-2 gap-2 text-xs mt-2 ml-4'>
                                                                            {step.element_info.consumable_info && (
                                                                                <>
                                                                                    <div>
                                                                                        <span className="text-gray-500">소모품명:</span>
                                                                                        <span className="ml-1 text-gray-900">{step.element_info.consumable_info.name}</span>
                                                                                    </div>
                                                                                    <div>
                                                                                        <span className="text-gray-500">소모품 개수:</span>
                                                                        <span className="ml-1 text-gray-900">{step.element_info.consum_1_count || '-'}</span>
                                                                    </div>
                                                                    <div>
                                                                                        <span className="text-gray-500">단위:</span>
                                                                                        <span className="ml-1 text-gray-900">{step.element_info.consumable_info.unit_type}</span>
                                                                    </div>
                                                                    <div>
                                                                                        <span className="text-gray-500">소모품 가격:</span>
                                                                                        <span className="ml-1 text-gray-900">{step.element_info.consumable_info.price?.toLocaleString()}원</span>
                                                                    </div>
                                                                                </>
                                                                            )}
                                                                </div>
                                                                    )}
                                                            </div>
                                                        </div>
                                                    )}
                                                    
                                                    {/* Bundle 정보 */}
                                                    {step.bundle_info && (
                                                        <>
                                                            {/* Bundle 내부 Elements */}
                                                            {step.bundle_info.elements && step.bundle_info.elements.length > 0 && (
                                                                <div className="space-y-2 pl-4">
                                                                    <h6 className="text-sm font-medium text-gray-900 mb-2">포함 단일시술 목록</h6>
                                                                    <div className="space-y-2">
                                                                        {/* 포함된 내부 element 시술 목록 */}
                                                                        {step.bundle_info.elements.map((element, elemIndex) => (
                                                                                <div key={elemIndex} className="bg-white last:border-b-0 border-b border-gray-200 pl-3">
                                                                                {/* 헤더 */}
                                                                                    <div className="flex items-start justify-between mb-2">
                                                                                    <div className="flex-1">
                                                                                            {/* 순서 표기 영역 */}
                                                                                        <div className="flex items-center mb-1">
                                                                                            <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded mr-2">
                                                                                                <p className="text-center text-semiboldmt-0.5">{elemIndex + 1}</p>
                                                                                            </span>
                                                                                            <div className="text-md font-medium text-gray-900 mt-0.5">{element.name}</div>
                                                                                        </div>
                                                                                            
                                                                                            <div className="ml-7">
                                                                                                <p className="text-xs text-gray-600 mt-2">{element.description}</p>
                                                                                                <div className="grid grid-cols-1 items-center">
                                                                                                    <p className="text-xs text-gray-500 mt-2 font-medium">ID: 
                                                                                                <span className='text-gray-900'> {element.id}</span>
                                                                                            </p>
                                                                                                    <p className="text-xs text-gray-500 mt-2">분류:
                                                                                                        <span className='text-gray-900'> {element.class_major} &gt; {element.class_sub} &gt; {element.class_detail}</span>
                                                                                                    </p>
                                                                                                    <p className="text-xs text-gray-500 mt-2">타입:
                                                                                                        <span className='text-gray-900'> {element.class_type}</span>
                                                                                                    </p>
                                                                                        </div>
                                                                                    </div>
                                                                                        </div>
                                                                                        {/* 가격 표기 영역 */}
                                                                                    <div className="text-right ml-3">
                                                                                        <p className="text-sm font-semibold text-gray-900">{element.procedure_cost.toLocaleString()} 원</p>
                                                                                    </div>
                                                                                </div>
                                                                                
                                                                                {/* 정보 표기 영역 */}
                                                                                    <div className="grid grid-cols-2 gap-2 text-xs mb-3 ml-7">
                                                                                    <div>
                                                                                        <span className="text-gray-500">가격:</span>
                                                                                        <span className="ml-1 text-gray-900">{element.price.toLocaleString()}원</span>
                                                                                    </div>
                                                                                    <div>
                                                                                            <span className="text-gray-500">플랜 주기:</span>
                                                                                            <span className="ml-1 text-gray-900">{element.plan_state === 1 ? (element.plan_interval || '-') : 'X'}</span>
                                                                                    </div>
                                                                                    <div>
                                                                                            <span className="text-gray-500">시술 담당:</span>
                                                                                        <span className="ml-1 text-gray-900">{element.position_type || '-'}</span>
                                                                                    </div>
                                                                                    <div>
                                                                                            <span className="text-gray-500">소요 시간:</span>
                                                                                        <span className="ml-1 text-gray-900">{element.cost_time || '-'}</span>
                                                                                    </div>
                                                                                    <div>
                                                                                            <span className="text-gray-500">플랜 상태:</span>
                                                                                            <span className="ml-1 text-gray-900">{element.plan_state === 1 ? 'O' : 'X'}</span>
                                                                                    </div>
                                                                                    <div>
                                                                                            <span className="text-gray-500">플랜 개수:</span>
                                                                                            <span className="ml-1 text-gray-900">{element.plan_state === 1 ? (element.plan_count || '-') : 'X'}</span>
                                                                                    </div>
                                                                                    <div>
                                                                                            <span className="text-gray-500">시술 단계:</span>
                                                                                            <span className="ml-1 text-gray-900">{element.procedure_level || '-'}</span>
                                                                                    </div>
                                                                                    <div>
                                                                                            <span className="text-gray-500">활성화 상태:</span>
                                                                                            <span className="ml-1 text-gray-900">{element.release === 1 ? 'O' : element.release === 0 ? 'X' : '-'}</span>
                                                                                        </div>
                                                                                        <div> 
                                                                                            <span className="text-gray-500">소모품 ID:</span>
                                                                                            <span className="ml-1 text-gray-900">{element.consum_1_id || element.consumable_info?.id || '-'}</span>
                                                                                        </div>
                                                                                    </div>
                                                                                    
                                                                                    
                                                                                    {(element.consum_1_id || element.consumable_info) && (
                                                                                            <div className='grid grid-cols-2 gap-2 text-xs mb-3 ml-11'>
                                                                                                
                                                                                                {element.consumable_info && (
                                                                                                    <>
                                                                                                        <div>
                                                                                                            <span className="text-gray-500">소모품명:</span>
                                                                                                            <span className="ml-1 text-gray-900">{element.consumable_info.name}</span>
                                                                                                        </div>
                                                                                                        <div>
                                                                                                            <span className="text-gray-500">소모품 개수:</span>
                                                                                        <span className="ml-1 text-gray-900">{element.consum_1_count || '-'}</span>
                                                                                    </div>
                                                                                    <div>
                                                                                                            <span className="text-gray-500">단위:</span>
                                                                                                            <span className="ml-1 text-gray-900">{element.consumable_info.unit_type}</span>
                                                                                    </div>
                                                                                    <div>
                                                                                                            <span className="text-gray-500">소모품 가격:</span>
                                                                                                            <span className="ml-1 text-gray-900">{element.consumable_info.price?.toLocaleString()}원</span>
                                                                                    </div>
                                                                                                    </>
                                                                                                    
                                                                                                )}
                                                                                </div>
                                                                                        )
                                                                                    }
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </>
                                                    )}
                                                    
                                                        {/* Custom에 포함된 Element 정보 */}
                                                        {step.custom_info?.elements && step.custom_info.elements.length > 0 && (
                                                            <div className="space-y-2 pl-4">
                                                                <h6 className="text-sm font-medium text-gray-900 mb-2">포함 단일시술 목록</h6>
                                                                <div className="space-y-2">
                                                                    {step.custom_info.elements.map((element, elemIndex) => (
                                                                        <div key={elemIndex} className="bg-white last:border-b-0 border-b border-gray-200 pl-3">
                                                                            {/* 헤더 */}
                                                                            <div className="flex items-start justify-between mb-2">
                                                                                <div className="flex-1">
                                                                                    {/* 순서 표기 영역 */}
                                                                                    <div className="flex items-center mb-1">
                                                                                        <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded mr-2">
                                                                                            <p className="text-center text-semiboldmt-0.5">{elemIndex + 1}</p>
                                                                </span>
                                                                                        <div className="text-md font-medium text-gray-900 mt-0.5">{element.name}</div>
                                                            </div>
                                                                                    
                                                                                    <div className="ml-7">
                                                                                        <p className="text-xs text-gray-600 mt-2">{element.description}</p>
                                                                                        <div className="grid grid-cols-1 items-center">
                                                                                            <p className="text-xs text-gray-500 mt-2 font-medium">ID: 
                                                                                                <span className='text-gray-900'> {element.id}</span>
                                                                                            </p>
                                                                                            <p className="text-xs text-gray-500 mt-2">분류:
                                                                                                <span className='text-gray-900'> {element.class_major} &gt; {element.class_sub} &gt; {element.class_detail}</span>
                                                                                            </p>
                                                                                            <p className="text-xs text-gray-500 mt-2">타입:
                                                                                                <span className='text-gray-900'> {element.class_type}</span>
                                                                                            </p>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                                {/* 가격 표기 영역 */}
                                                                                <div className="text-right ml-3">
                                                                                    <p className="text-sm font-semibold text-gray-900">{element.procedure_cost?.toLocaleString()} 원</p>
                                                                                </div>
                                                                            </div>
                                                                            
                                                                            {/* 정보 표기 영역 */}
                                                                            <div className="grid grid-cols-2 gap-2 text-xs mb-3 ml-7">
                                                                                <div>
                                                                                    <span className="text-gray-500">가격:</span>
                                                                                    <span className="ml-1 text-gray-900">{element.price?.toLocaleString()}원</span>
                                                                                </div>
                                                                                <div>
                                                                                    <span className="text-gray-500">플랜 주기:</span>
                                                                                    <span className="ml-1 text-gray-900">{element.plan_state === 1 ? (element.plan_interval || '-') : 'X'}</span>
                                                                                </div>
                                                                                <div>
                                                                                    <span className="text-gray-500">시술 담당:</span>
                                                                                    <span className="ml-1 text-gray-900">{element.position_type || '-'}</span>
                                                                                </div>
                                                                                <div>
                                                                                    <span className="text-gray-500">소요 시간:</span>
                                                                                    <span className="ml-1 text-gray-900">{element.cost_time || '-'}</span>
                                                                                </div>
                                                                                <div>
                                                                                    <span className="text-gray-500">플랜 상태:</span>
                                                                                    <span className="ml-1 text-gray-900">{element.plan_state === 1 ? 'O' : 'X'}</span>
                                                                                </div>
                                                                                <div>
                                                                                    <span className="text-gray-500">플랜 개수:</span>
                                                                                    <span className="ml-1 text-gray-900">{element.plan_state === 1 ? (element.plan_count || '-') : 'X'}</span>
                                                                                </div>
                                                                                <div>
                                                                                    <span className="text-gray-500">시술 단계:</span>
                                                                                    <span className="ml-1 text-gray-900">{element.procedure_level || '-'}</span>
                                                                                </div>
                                                                                <div>
                                                                                    <span className="text-gray-500">활성화 상태:</span>
                                                                                    <span className="ml-1 text-gray-900">{element.release === 1 ? 'O' : element.release === 0 ? 'X' : '-'}</span>
                                                                                </div>
                                                                                <div> 
                                                                                    <span className="text-gray-500">소모품 ID:</span>
                                                                                    <span className="ml-1 text-gray-900">{element.consum_1_id || element.consumable_info?.id || '-'}</span>
                                                                                </div>
                                                                            </div>
                                                                            
                                                                            {/* 소모품 정보 */}
                                                                            {(element.consum_1_id || element.consumable_info) && (
                                                                                <div className='grid grid-cols-2 gap-2 text-xs mb-3 ml-11'>
                                                                                    {element.consumable_info && (
                                                                                        <>
                                                                                            <div>
                                                                                                <span className="text-gray-500">소모품명:</span>
                                                                                                <span className="ml-1 text-gray-900">{element.consumable_info.name}</span>
                                                                                            </div>
                                                                                            <div>
                                                                                                <span className="text-gray-500">소모품 개수:</span>
                                                                                                <span className="ml-1 text-gray-900">{element.consum_1_count || '-'}</span>
                                                                                            </div>
                                                                                            <div>
                                                                                                <span className="text-gray-500">단위:</span>
                                                                                                <span className="ml-1 text-gray-900">{element.consumable_info.unit_type}</span>
                                                                                            </div>
                                                                                            <div>
                                                                                                <span className="text-gray-500">소모품 가격:</span>
                                                                                                <span className="ml-1 text-gray-900">{element.consumable_info.price?.toLocaleString()}원</span>
                                                                                            </div>
                                                                                        </>
                                                                                    )}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                    
                                                    {/* 연결된 시술이 없는 경우 */}
                                                    {!step.element_info && !step.bundle_info && !step.custom_info && (
                                                        <div className="text-center py-6">
                                                            <p className="text-sm text-gray-500">연결된 시술 정보가 없습니다.</p>
                                                        </div>
                                                    )}
                                                </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        </div>
                    </div>
                    )}
                </div>

                {/* 하단 버튼 */}
                <div className="p-4 border-t border-gray-200 flex-shrink-0">
                    <div className="flex space-x-3">
                        {isEditing ? (
                            <>
                                <Button
                                    onClick={handleEditToggle}
                                    className="flex-1 bg-gray-500 py-3 font-semibold text-white"
                                    variant="secondary"
                                    disabled={saving}
                                >
                                    취소
                                </Button>
                                <Button
                                    onClick={handleSave}
                                    className="flex-1 bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700"
                                    disabled={saving}
                                >
                                    {saving ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            저장 중...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4 mr-2" />
                                            저장하기
                                        </>
                                    )}
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button
                                    onClick={handleClose}
                                    className="flex-1 bg-gray-500 py-3 font-semibold text-white"
                                    variant="secondary"
                                >
                                    닫기
                                </Button>
                                <Button
                                    onClick={handleEditToggle}
                                    className="flex-1 bg-gray-900 py-3 font-semibold text-white hover:bg-gray-800"
                                >
                                    <Edit className="w-4 h-4 mr-2" />
                                    수정하기
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Step 추가 모달 */}
            <SequnceStepModal
                isOpen={showAddStepModal}
                onClose={() => setShowAddStepModal(false)}
                onConfirm={handleAddStepConfirm}
            />
    
        </div>
    );
}

