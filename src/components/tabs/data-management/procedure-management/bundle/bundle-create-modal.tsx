'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Save, Search, Package, Plus, Trash2 } from 'lucide-react';
import { createBundle, BundleCreateRequest, BundleElementRequest } from '@/api/bundles-api';
import { getElementsList, Element, getElementDetail } from '@/api/element-api';
import { searchElementsByName } from '@/utils/element-utils';
import { getConsumableDetail, ConsumableResponse } from '@/api/consumables-api';

interface BundleCreateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    onRefresh?: (() => Promise<void>) | null;
}

export default function BundleCreateModal({ isOpen, onClose, onSuccess, onRefresh }: BundleCreateModalProps) {
    const [formData, setFormData] = useState<Partial<BundleCreateRequest>>({
        group_id: 0,
        name: '',
        description: '',
        release: 1,
        elements: []
    });
    
    const [elementSearch, setElementSearch] = useState('');
    const [allElements, setAllElements] = useState<Element[]>([]);
    const [filteredElements, setFilteredElements] = useState<Element[]>([]);
    const [saving, setSaving] = useState(false);
    const [showElementSearch, setShowElementSearch] = useState(false);
    const [elementDetails, setElementDetails] = useState<Map<number, Element>>(new Map());
    const [consumableDetails, setConsumableDetails] = useState<Map<number, ConsumableResponse>>(new Map());

    // 모든 Element 목록 로드
    useEffect(() => {
        if (isOpen) {
            loadAllElements();
        }
    }, [isOpen]);

    // Element 검색어 변경 시 검색 실행
    useEffect(() => {
        if (elementSearch.trim()) {
            const filtered = searchElementsByName(allElements, elementSearch);
            setFilteredElements(filtered.slice(0, 1000)); // 최대 10개만 표시
        } else {
            setFilteredElements([]);
        }
    }, [elementSearch, allElements]);

    // 모든 Element 목록 가져오기
    const loadAllElements = async () => {
        try {
            const elements = await getElementsList();
            setAllElements(elements);
        } catch (error) {
            console.error('Element 목록 로드 실패:', error);
        }
    };

    // Element 추가
    const addElement = async (element: Element) => {
        try {
            // Element 상세 정보 가져오기
            const elementDetail = await getElementDetail(element.id);
            
            // 상세 정보를 Map에 저장
            setElementDetails(prev => new Map(prev).set(element.id, elementDetail));
            
            // 소모품 정보가 있으면 가져오기
            if (elementDetail.consum_1_id) {
                try {
                    const consumableDetail = await getConsumableDetail(elementDetail.consum_1_id);
                    setConsumableDetails(prev => new Map(prev).set(elementDetail.consum_1_id!, consumableDetail));
                } catch (error) {
                    console.error('소모품 상세 정보 가져오기 실패:', error);
                }
            }
            
            const newElement: BundleElementRequest = {
                element_id: element.id,
                price_ratio: 1.0 // 기본 비율
            };
            
            setFormData(prev => ({
                ...prev,
                elements: [...(prev.elements || []), newElement]
            }));
            
            setElementSearch('');
            setShowElementSearch(false);
        } catch (error) {
            console.error('Element 상세 정보 가져오기 실패:', error);
            // 상세 정보 없이도 추가
            const newElement: BundleElementRequest = {
                element_id: element.id,
                price_ratio: 1.0
            };
            
            setFormData(prev => ({
                ...prev,
                elements: [...(prev.elements || []), newElement]
            }));
            
            setElementSearch('');
            setShowElementSearch(false);
        }
    };

    // Element 제거
    const removeElement = (index: number) => {
        setFormData(prev => ({
            ...prev,
            elements: prev.elements?.filter((_, i) => i !== index) || []
        }));
    };

    // Element 비율 변경
    const updateElementRatio = (index: number, ratio: number) => {
        setFormData(prev => ({
            ...prev,
            elements: prev.elements?.map((el, i) => 
                i === index ? { ...el, price_ratio: ratio } : el
            ) || []
        }));
    };

    // 폼 제출
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.name?.trim()) {
            alert('Bundle명을 입력해주세요.');
            return;
        }
        
        if (!formData.group_id || formData.group_id <= 0) {
            alert('Group ID를 입력해주세요.');
            return;
        }
        
        if (!formData.elements || formData.elements.length === 0) {
            alert('최소 하나의 Element를 추가해주세요.');
            return;
        }
        
        setSaving(true);
        try {
            // elements 데이터 검증
            if (!formData.elements || formData.elements.length === 0) {
                alert('최소 하나의 Element를 추가해주세요.');
                setSaving(false);
                return;
            }
            
            // elements 데이터 정리
            const validElements = formData.elements.map(element => ({
                element_id: element.element_id,
                price_ratio: element.price_ratio || 1.0
            }));
            
            const bundleData: BundleCreateRequest = {
                group_id: formData.group_id,
                name: formData.name.trim(),
                description: formData.description?.trim() || '',
                release: formData.release || 1,
                elements: validElements
            };
            
            
            await createBundle(bundleData);
            alert('Bundle이 성공적으로 생성되었습니다.');
            onSuccess();
            // bundle-tab 데이터 새로고침
            if (onRefresh) {
                await onRefresh();
            }
            handleClose();
        } catch (error: unknown) {
            console.error('Bundle 생성 실패:', error);
            alert(`Bundle 생성 중 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
        } finally {
            setSaving(false);
        }
    };

    // 모달 닫기
    const handleClose = () => {
        setFormData({
            group_id: 0,
            name: '',
            description: '',
            release: 1,
            elements: []
        });
        setElementSearch('');
        setFilteredElements([]);
        setShowElementSearch(false);
        setElementDetails(new Map());
        setConsumableDetails(new Map());
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center z-50 p-4 overflow-hidden">
            <div className="bg-white rounded-xl w-full max-w-md h-[85vh] flex flex-col shadow-2xl border border-gray-200">
                
                {/* 헤더 */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">새 패키지 생성</h2>
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
                    <div className="space-y-4">
                        
                        {/* Bundle명 */}
                        <div className="text-center pb-3 border-b border-gray-100">
                            <div className="space-y-3">
                                <Input
                                    value={formData.name || ''}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="패키지명을 입력하세요"
                                    className="text-center text-lg font-semibold text-gray-900 placeholder:text-gray-500 bg-white border-gray-300 focus:ring-0 focus:border-gray-300"
                                />
                                <div className="flex items-center justify-center space-x-2">
                                    <Package className="w-3 h-3 text-gray-400" />
                                    <span className="text-xs text-gray-500">
                                        패키지 구성 요소 관리
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* 기본 정보 */}
                        <div className="space-y-3">
                            <div>
                                <h3 className="text-sm font-medium text-gray-900 mb-2">기본 정보</h3>
                                <div className="bg-gray-50 rounded-lg p-3 space-y-3">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-xs text-gray-500 block mb-1">Group ID *</label>
                                            <Input
                                                type="number"
                                                value={formData.group_id || ''}
                                                onChange={(e) => setFormData({ ...formData, group_id: parseInt(e.target.value) || 0 })}
                                                placeholder="Group ID를 입력하세요"
                                                className="text-sm text-gray-900 placeholder:text-gray-500 bg-white border-gray-300 focus:ring-0 focus:border-gray-300"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-500 block mb-1">패키지명 *</label>
                                            <Input
                                                value={formData.name || ''}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                placeholder="패키지명을 입력하세요"
                                                className="text-sm text-gray-900 placeholder:text-gray-500 bg-white border-gray-300 focus:ring-0 focus:border-gray-300"
                                            />
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <label className="text-xs text-gray-500 block mb-1">패키지 설명</label>
                                        <Textarea
                                            value={formData.description || ''}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            placeholder="패키지에 대한 설명을 입력하세요"
                                            className="text-sm text-gray-900 placeholder:text-gray-500 bg-white border-gray-300 focus:ring-0 focus:border-gray-300 min-h-[6vh] resize-none"
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="text-xs text-gray-500 block mb-1">상태</label>
                                        <Select
                                            value={formData.release?.toString() || '1'}
                                            onValueChange={(value) => setFormData({ ...formData, release: parseInt(value) })}
                                        >
                                            <SelectTrigger className="text-sm w-full bg-white text-gray-600 border-gray-300">
                                                <SelectValue placeholder="상태 선택" className="text-gray-900" />
                                            </SelectTrigger>
                                            <SelectContent className="max-h-[30vh] bg-white border-gray-300 shadow-lg">
                                                <SelectItem value="1" className="text-gray-600">활성화</SelectItem>
                                                <SelectItem value="0" className="text-gray-600">비활성화</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Elements 관리 */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-sm font-medium text-gray-900">패키지 시술 구성</h3>
                                    <Button
                                        onClick={() => setShowElementSearch(!showElementSearch)}
                                        size="sm"
                                        variant="outline"
                                        className="h-7 px-2 text-xs bg-white hover:bg-gray-50 border-gray-300 text-gray-700 hover:text-gray-900 transition-colors"
                                    >
                                        <Plus className="w-3 h-3 mr-1" />
                                        단일시술 추가
                                    </Button>
                                </div>
                                
                                {/* Element 검색 */}
                                {showElementSearch && (
                                    <div className="mb-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                        <div className="relative">
                                            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <Input
                                                value={elementSearch}
                                                onChange={(e) => setElementSearch(e.target.value)}
                                                placeholder="포함할 단일시술 검색..."
                                                className="pl-8 text-sm text-gray-900 placeholder:text-gray-500 bg-white border-gray-300 focus:ring-0 focus:border-gray-300"
                                            />
                                        </div>
                                        
                                        {filteredElements.length > 0 && (
                                            <div className="mt-2 max-h-32 overflow-y-auto space-y-1">
                                                {filteredElements.map((element) => (
                                                    <div
                                                        key={element.id}
                                                        onClick={() => addElement(element)}
                                                        className="p-2 bg-white rounded border border-gray-200 cursor-pointer hover:bg-gray-50 text-xs"
                                                    >
                                                        <div className="font-medium text-gray-900">{element.name}</div>
                                                        <div className="text-gray-500">
                                                            {element.class_major} &gt; {element.class_sub} &gt; {element.class_detail}
                                                        </div>
                                                        <div className="text-gray-400">
                                                            {element.procedure_cost?.toLocaleString()}원
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        
                                        {elementSearch && filteredElements.length === 0 && (
                                            <div className="mt-2 text-xs text-gray-500 text-center">
                                                검색 결과가 없습니다.
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Elements 목록 */}
                                <div className="bg-gray-50 rounded-lg p-3">
                                    {formData.elements && formData.elements.length > 0 ? (
                                        <div className="space-y-2">
                                            {formData.elements.map((element, index) => {
                                                const elementData = allElements.find(el => el.id === element.element_id);
                                                const elementDetail = elementDetails.get(element.element_id);
                                                const displayElement = elementDetail || elementData;
                                                const consumableDetail = elementDetail?.consum_1_id ? consumableDetails.get(elementDetail.consum_1_id) : null;
                                                
                                                return (
                                                    <div key={index} className="bg-white rounded border border-gray-200 p-3">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <h4 className="text-sm font-medium text-gray-900">
                                                                {displayElement?.name || `Element ${element.element_id}`}
                                                            </h4>
                                                            <Button
                                                                onClick={() => removeElement(index)}
                                                                size="sm"
                                                                variant="ghost"
                                                                className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                                                            >
                                                                <Trash2 className="w-3 h-3" />
                                                            </Button>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <div>
                                                                <label className="text-xs text-gray-500 block mb-1">가격 비율</label>
                                                                <Input
                                                                    type="number"
                                                                    step="0.1"
                                                                    min="0"
                                                                    max="1"
                                                                    value={element.price_ratio}
                                                                    onChange={(e) => updateElementRatio(index, parseFloat(e.target.value) || 0)}
                                                                    className="text-sm text-gray-900 placeholder:text-gray-500 bg-white border-gray-300 focus:ring-0 focus:border-gray-300"
                                                                />
                                                            </div>
                                                            
                                                            {/* Element 상세 정보 */}
                                                            {elementDetail && (
                                                                <div className="space-y-1">
                                                                    <div className="text-xs text-gray-500">
                                                                        {elementDetail.class_major} &gt; {elementDetail.class_sub} &gt; {elementDetail.class_detail}
                                                                    </div>
                                                                    <div className="text-xs text-gray-400">
                                                                        시술 비용: {elementDetail.procedure_cost?.toLocaleString()}원
                                                                    </div>
                                                                    <div className="text-xs text-gray-400">
                                                                        판매가: {elementDetail.price?.toLocaleString()}원
                                                                    </div>
                                                                    <div className="text-xs text-gray-400">
                                                                        소요시간: {elementDetail.cost_time}분
                                                                    </div>
                                                                    <div className="text-xs text-gray-400">
                                                                        시술수준: {elementDetail.procedure_level}
                                                                    </div>
                                                                    <div className="text-xs text-gray-400">
                                                                        담당자: {elementDetail.position_type}
                                                                    </div>
                                                                    
                                                                    {/* 소모품 정보 */}
                                                                    {consumableDetail && (
                                                                        <div className="mt-2 p-2 bg-gray-50 rounded border-l-2 border-blue-200">
                                                                            <div className="text-xs font-medium text-gray-700 mb-1">소모품 정보</div>
                                                                            <div className="text-xs text-gray-600">
                                                                                {consumableDetail.name} ({elementDetail.consum_1_count}{consumableDetail.unit_type})
                                                                            </div>
                                                                            <div className="text-xs text-gray-500">
                                                                                단가: {consumableDetail.unit_price?.toLocaleString()}원
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="text-center py-4">
                                            <Package className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                            <p className="text-xs text-gray-500">추가된 단일시술이 없습니다</p>
                                            <p className="text-xs text-gray-400">단일시술 추가 버튼을 클릭하여 구성 요소를 추가하세요</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
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
                            onClick={handleSubmit}
                            className="flex-1 bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700"
                            disabled={saving}
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
                </div>
            </div>
        </div>
    );
}
