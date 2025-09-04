'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Save, Search, Package, Plus, Trash2 } from 'lucide-react';
import { createCustom, CustomCreateRequest, CustomElementRequest } from '@/api/customs-api';
import { Element, getElementsList } from '@/api/element-api';
import { searchElementsByName } from '@/utils/element-utils';

interface CustomCreateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    onRefresh?: (() => Promise<void>) | null;
}

export default function CustomCreateModal({ isOpen, onClose, onSuccess, onRefresh }: CustomCreateModalProps) {
    const [formData, setFormData] = useState<Partial<CustomCreateRequest>>({
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
            // const elementDetail = await getElementDetail(element.id);
            
            const newElement: CustomElementRequest = {
                element_id: element.id,
                custom_count: undefined, // 빈칸으로 시작
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
            const newElement: CustomElementRequest = {
                element_id: element.id,
                custom_count: undefined,
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

    // Element 횟수 변경
    const updateElementCount = (index: number, count: number | undefined) => {
        setFormData(prev => ({
            ...prev,
            elements: prev.elements?.map((el, i) => 
                i === index ? { ...el, custom_count: count } : el
            ) || []
        }));
    };

    // Element 가격 비율 변경
    const updateElementPriceRatio = (index: number, ratio: number | undefined) => {
        setFormData(prev => ({
            ...prev,
            elements: prev.elements?.map((el, i) => 
                i === index ? { ...el, price_ratio: ratio} : el
            ) || []
        }));
    };

    // 폼 제출
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.name?.trim()) {
            alert('Custom명을 입력해주세요.');
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
                custom_count: element.custom_count || 1, // 저장 시 기본값 1
                price_ratio: element.price_ratio || 1.0
            }));
            
            const customData: CustomCreateRequest = {
                group_id: formData.group_id,
                name: formData.name.trim(),
                description: formData.description?.trim() || '',
                release: formData.release || 1,
                elements: validElements
            };
            
            
            await createCustom(customData);
            alert('Custom이 성공적으로 생성되었습니다.');
            onSuccess();
            // custom-tab 데이터 새로고침
            if (onRefresh) {
                await onRefresh();
            }
            handleClose();
        } catch (error: unknown) {
            console.error('Custom 생성 실패:', error);
            alert(`Custom 생성 중 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
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
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center z-50 p-4 overflow-hidden">
            <div className="bg-white rounded-xl w-full max-w-md h-[85vh] flex flex-col shadow-2xl border border-gray-200">
                
                {/* 헤더 */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">새 커스텀 생성</h2>
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
                        
                        {/* Custom명 */}
                        <div className="text-center pb-3 border-b border-gray-100">
                            <div className="space-y-3">
                                <Input
                                    value={formData.name || ''}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="커스텀명을 입력하세요"
                                    className="text-center text-lg font-semibold text-gray-900 placeholder:text-gray-500 bg-white border-gray-300 focus:ring-0 focus:border-gray-300"
                                />
                                <div className="flex items-center justify-center space-x-2">
                                    <Package className="w-3 h-3 text-gray-400" />
                                    <span className="text-xs text-gray-500">
                                        커스텀 구성 요소 관리
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
                                            <label className="text-xs text-gray-500 block mb-1">커스텀명 *</label>
                                            <Input
                                                value={formData.name || ''}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                placeholder="커스텀명을 입력하세요"
                                                className="text-sm text-gray-900 placeholder:text-gray-500 bg-white border-gray-300 focus:ring-0 focus:border-gray-300"
                                            />
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <label className="text-xs text-gray-500 block mb-1">커스텀 설명</label>
                                        <Textarea
                                            value={formData.description || ''}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            placeholder="커스텀에 대한 설명을 입력하세요"
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
                                    <h3 className="text-sm font-medium text-gray-900">커스텀 시술 구성</h3>
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
                                                return (
                                                    <div key={index} className="bg-white rounded border border-gray-200 p-3">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <h4 className="text-sm font-medium text-gray-900">
                                                                {elementData?.name || `Element ${element.element_id}`}
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
                                                            <div className="grid grid-cols-2 gap-2">
                                                                <div>
                                                                    <label className="text-xs text-gray-500 block mb-1">시술 횟수</label>
                                                                    <Input
                                                                        type="number"
                                                                        value={element.custom_count ?? ''}
                                                                        onChange={(e) => updateElementCount(index, e.target.value === '' ? undefined : parseInt(e.target.value) || 0)}
                                                                        className="text-sm text-gray-900 placeholder:text-gray-500 bg-white border-gray-300 focus:ring-0 focus:border-gray-300"
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <label className="text-xs text-gray-500 block mb-1">가격 비율</label>
                                                                    <Input
                                                                        type="number"
                                                                        step="0.1"
                                                                        value={element.price_ratio ?? ''}
                                                                        onChange={(e) => updateElementPriceRatio(index, e.target.value === '' ? undefined : parseFloat(e.target.value) || 0)}
                                                                        className="text-sm text-gray-900 placeholder:text-gray-500 bg-white border-gray-300 focus:ring-0 focus:border-gray-300"
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="text-xs text-gray-500">
                                                                {elementData?.class_major} &gt; {elementData?.class_sub} &gt; {elementData?.class_detail}
                                                            </div>
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
