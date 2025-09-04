'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Settings, Save, Edit, Package, AlertTriangle, ChevronDown, ChevronRight, Plus, Search, Trash2 } from 'lucide-react';
import { CustomListResponse, getCustomDetail, updateCustom } from '@/api/customs-api';
import { Element, getElementsList } from '@/api/element-api';
import { searchElementsByName } from '@/utils/element-utils';
import { useModalStore } from '@/store/modal-store';

interface CustomDetailModalProps {
    custom: CustomListResponse | null;
    isOpen: boolean;
    onClose: () => void;
    onDataUpdate?: (() => Promise<void>) | null;
    onRefresh?: (() => Promise<void>) | null;
}

export default function CustomDetailModal({ 
    custom, 
    isOpen, 
    onClose, 
    onDataUpdate,
}: CustomDetailModalProps) {
    const [detailCustom, setDetailCustom] = useState<CustomListResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState<Partial<CustomListResponse>>({});
    const [saving, setSaving] = useState(false);
    const [expandedElements, setExpandedElements] = useState<Set<number>>(new Set());
    
    // Element 검색 관련 상태
    const [allElements, setAllElements] = useState<Element[]>([]);
    const [elementSearchQuery, setElementSearchQuery] = useState('');
    const [showElementSearch, setShowElementSearch] = useState(false);
    const [filteredElements, setFilteredElements] = useState<Element[]>([]);
    
    const { returnToMembership, openMembershipDetail } = useModalStore();

    // Element 토글 핸들러
    const toggleElement = (elementId: number) => {
        const newExpanded = new Set(expandedElements);
        if (newExpanded.has(elementId)) {
            newExpanded.delete(elementId);
        } else {
            newExpanded.add(elementId);
        }
        setExpandedElements(newExpanded);
    };

    // 모든 Element 목록 가져오기
    const loadAllElements = async () => {
        try {
            const elements = await getElementsList();
            setAllElements(elements);
        } catch (error) {
            console.error('Element 목록 로드 실패:', error);
        }
    };

    // Element 검색
    useEffect(() => {
        if (elementSearchQuery.trim()) {
            const filtered = searchElementsByName(allElements, elementSearchQuery);
            setFilteredElements(filtered.slice(0, 10));
        } else {
            setFilteredElements([]);
        }
    }, [elementSearchQuery, allElements]);

    // Custom 상세 정보 로드
    const loadCustomDetail = async () => {
        if (!custom) return;
        
        setLoading(true);
        setError(null);
        try {
            const detail = await getCustomDetail(custom.group_id);
            setDetailCustom(detail);
            setEditData(detail);
        } catch (error: unknown) {
            console.error('Custom 상세 정보 로드 실패:', error);
            setError(error instanceof Error ? error.message : 'Custom 상세 정보를 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    // Custom 상세 정보 로드
    useEffect(() => {
        if (isOpen && custom) {
            loadCustomDetail();
            loadAllElements();
        }
    }, [isOpen, custom]);

    // 멤버십으로 돌아가기
    const handleReturnToMembership = () => {
        if (returnToMembership) {
            openMembershipDetail(returnToMembership);
        }
    };

    // Element 추가
    const addElement = async (element: Element) => {
        if (!editData.elements) return;
        
        try {
            // const elementDetail = await getElementDetail(element.id);
            
            const newElement = {
                id: Date.now(),
                group_id: detailCustom?.group_id || 0,
                element_id: element.id,
                custom_count: 1,
                element_limit: undefined,
                element_cost: element.procedure_cost || 0,
                price_ratio: 1.0,
                release: 1
            };
            
            setEditData({
                ...editData,
                elements: [...editData.elements, newElement]
            });
            
            setElementSearchQuery('');
            setShowElementSearch(false);
        } catch (error) {
            console.error('Element 상세 정보 가져오기 실패:', error);
            const newElement = {
                id: Date.now(),
                group_id: detailCustom?.group_id || 0,
                element_id: element.id,
                custom_count: 1,
                element_limit: undefined,
                element_cost: element.procedure_cost || 0,
                price_ratio: 1.0,
                release: 1
            };
            
            setEditData({
                ...editData,
                elements: [...editData.elements, newElement]
            });
            
            setElementSearchQuery('');
            setShowElementSearch(false);
        }
    };

    // Element 제거
    const removeElement = (index: number) => {
        if (!editData.elements) return;
        
        setEditData({
            ...editData,
            elements: editData.elements.filter((_, i) => i !== index)
        });
    };

    // Element 커스텀 횟수 변경
    const updateElementCustomCount = (index: number, count: number) => {
        if (!editData.elements) return;
        
        setEditData({
            ...editData,
            elements: editData.elements.map((el, i) => 
                i === index ? { ...el, custom_count: count } : el
            )
        });
    };

    // // Element 제한 변경
    // const updateElementLimit = (index: number, limit: number | undefined) => {
    //     if (!editData.elements) return;
        
    //     setEditData({
    //         ...editData,
    //         elements: editData.elements.map((el, i) => 
    //             i === index ? { ...el, element_limit: limit } : el
    //         )
    //     });
    // };

    // // Element 비율 변경
    // const updateElementRatio = (index: number, ratio: number) => {
    //     if (!editData.elements) return;
        
    //     setEditData({
    //         ...editData,
    //         elements: editData.elements.map((el, i) => 
    //             i === index ? { ...el, price_ratio: ratio } : el
    //         )
    //     });
    // };

    // 저장
    const handleSave = async () => {
        if (!detailCustom?.group_id) return;
        
        setSaving(true);
        try {
            const response = await updateCustom(detailCustom.group_id, editData);
            
            if (response) {
                setDetailCustom(response);
            }
            setIsEditing(false);
            setEditData({});
            setElementSearchQuery('');
            setShowElementSearch(false);
            
            // 부모 컴포넌트에 데이터 업데이트 알림
            if (onDataUpdate) {
                onDataUpdate();
            }
            
            // 성공 메시지 표시
            alert('Custom 정보가 성공적으로 수정되었습니다.');
        } catch (error: unknown) {
            console.error('수정 실패:', error);
            alert(`수정 중 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
        } finally {
            setSaving(false);
        }
    };

    // 모달 닫기
    const handleClose = () => {
        setDetailCustom(null);
        setEditData({});
        setIsEditing(false);
        setExpandedElements(new Set());
        setElementSearchQuery('');
        setShowElementSearch(false);
        setError(null);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center z-50 p-4 overflow-hidden">
            <div className="bg-white rounded-xl w-full max-w-md h-[85vh] flex flex-col shadow-2xl border border-gray-200">
                
                {/* 헤더 */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <div className="flex items-center space-x-3">
                        <h2 className="text-lg font-semibold text-gray-900">
                            {isEditing ? '커스텀 정보 수정' : '커스텀 상세정보'}
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

                    {!loading && detailCustom && (
                        <div className="space-y-4">
                            {/* Custom명 */}
                            <div className="text-center pb-3 border-b border-gray-100">
                                {isEditing ? (
                                    <div className="space-y-3">
                                        <Input
                                            value={editData.name || ''}
                                            onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                                            placeholder="Custom명을 입력하세요"
                                            className="text-center text-lg font-semibold text-gray-600 placeholder:text-gray-500 bg-white border-gray-300 focus:ring-0 focus:border-gray-300"
                                        />
                                        <div className="flex items-center justify-center space-x-2">
                                            <Package className="w-3 h-3 text-gray-400" />
                                            <span className="text-xs text-gray-500">
                                                커스텀 ID: {detailCustom.group_id}
                                            </span>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <h2 className="text-lg font-semibold text-gray-900 mb-1">
                                            {detailCustom.name || `Custom ${detailCustom.group_id}`}
                                        </h2>
                                        <div className="flex items-center justify-center space-x-2">
                                            <Package className="w-3 h-3 text-gray-400" />
                                            <span className="text-xs text-gray-500">
                                                커스텀 ID: {detailCustom.group_id}
                                            </span>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* 기본 정보 */}
                            <div className="space-y-3">
                                <div>
                                    {isEditing && <h3 className="text-sm font-medium text-gray-900 mb-2">기본 정보</h3>}
                                    {isEditing ? (
                                        <div className="bg-gray-50 rounded-lg p-3 space-y-3">
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="text-xs text-gray-500 block mb-1">커스텀 ID</label>
                                                    <Input
                                                        value={editData.group_id || ''}
                                                        onChange={(e) => setEditData({ ...editData, group_id: e.target.value ? Number(e.target.value) : undefined })}
                                                        placeholder="커스텀 ID"
                                                        className="text-sm text-gray-600 placeholder:text-gray-500 bg-white border-gray-300 focus:ring-0 focus:border-gray-300"
                                                        type="number"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-xs text-gray-500 block mb-1">커스텀명</label>
                                                    <Input
                                                        value={editData.name || ''}
                                                        onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                                                        placeholder="Custom명"
                                                        className="text-sm text-gray-600 placeholder:text-gray-500 bg-white border-gray-300 focus:ring-0 focus:border-gray-300"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-xs text-gray-500 block mb-1">설명</label>
                                                <Textarea
                                                    value={editData.description || ''}
                                                    onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                                                    placeholder="Custom 설명을 입력하세요"
                                                    className="bg-white text-sm min-h-[10vh] w-full resize-none text-gray-600 placeholder:text-gray-500 border-gray-300 focus:ring-0 focus:border-gray-300"
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-900 mb-4">설명</label>
                                            {detailCustom.description && (
                                                <div className="bg-gray-50 rounded-lg p-3">
                                                    <p className="text-sm text-gray-600">{detailCustom.description}</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Elements 정보 */}
                                <div>
                                    <h3 className="text-sm font-medium text-gray-900 mb-2">포함 시술 정보</h3>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                                            <div className="flex items-center">
                                                <Package className="w-4 h-4 text-gray-500 mr-2" />
                                                <span className="text-sm text-gray-700">포함 시술 개수</span>
                                            </div>
                                            <span className="text-sm font-medium text-gray-900">
                                                {detailCustom.elements.length}개
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                                            <div className="flex items-center">
                                                <Package className="w-4 h-4 text-gray-500 mr-2" />
                                                <span className="text-sm text-gray-700">총 횟수</span>
                                            </div>
                                            <span className="text-sm font-medium text-gray-900">
                                                {detailCustom.elements.reduce((total, element) => total + element.custom_count, 0)}회
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                                            <div className="flex items-center">
                                                <Package className="w-4 h-4 text-gray-500 mr-2" />
                                                <span className="text-sm text-gray-700">총 비용</span>
                                            </div>
                                            <span className="text-sm font-medium text-gray-900">
                                                {detailCustom.elements.reduce((total, element) => total + (element.element_cost || 0), 0).toLocaleString()}원
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Elements 목록 */}
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="text-sm font-medium text-gray-900">포함 시술 목록</h3>
                                        {isEditing && (
                                            <Button
                                                onClick={() => setShowElementSearch(!showElementSearch)}
                                                size="sm"
                                                className="h-7 px-2 text-xs"
                                            >
                                                <Plus className="w-3 h-3 mr-1" />
                                                단일시술 추가
                                            </Button>
                                        )}
                                    </div>

                                    {/* Element 검색 */}
                                    {isEditing && showElementSearch && (
                                        <div className="mb-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                            <div className="relative">
                                                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <Input
                                                    value={elementSearchQuery}
                                                    onChange={(e) => setElementSearchQuery(e.target.value)}
                                                    placeholder="Element 검색..."
                                                    className="pl-8 text-sm bg-white border-gray-300 focus:ring-0 focus:border-gray-300"
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
                                            
                                            {elementSearchQuery && filteredElements.length === 0 && (
                                                <div className="mt-2 text-xs text-gray-500 text-center">
                                                    검색 결과가 없습니다.
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        {(editData.elements || detailCustom.elements)?.map((element, index) => {
                                            const elementData = allElements.find(el => el.id === element.element_id);
                                            const isExpanded = expandedElements.has(element.element_id);
                                            
                                            return (
                                                <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                                                    <div 
                                                        className="bg-gray-50 p-3 cursor-pointer hover:bg-gray-100 transition-colors"
                                                        onClick={() => toggleElement(element.element_id)}
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center space-x-3">
                                                                {isExpanded ? (
                                                                    <ChevronDown className="w-4 h-4 text-gray-500" />
                                                                ) : (
                                                                    <ChevronRight className="w-4 h-4 text-gray-500" />
                                                                )}
                                                                <div>
                                                                    <div className="flex items-center space-x-2">
                                                                        <span className="text-sm font-medium text-gray-900">
                                                                            ID: {element.element_id}
                                                                        </span>
                                                                    </div>
                                                                    {elementData && (
                                                                        <p className="text-xs text-gray-600 mt-1">
                                                                            {elementData.name}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center space-x-2">
                                                                {isEditing && (
                                                                    <Button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            removeElement(index);
                                                                        }}
                                                                        size="sm"
                                                                        variant="ghost"
                                                                        className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                                                                    >
                                                                        <Trash2 className="w-3 h-3" />
                                                                    </Button>
                                                                )}
                                                                <div className="text-right">
                                                                    <p className="text-sm font-medium text-gray-900">
                                                                        {element.element_cost?.toLocaleString()}원
                                                                    </p>
                                                                    <p className="text-xs text-gray-500">
                                                                        {element.custom_count}회
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Element 상세 정보 (아코디언) */}
                                                    {isExpanded && elementData && (
                                                        <div className="bg-white p-3 border-t border-gray-200">
                                                            <div className="space-y-3">
                                                                {/* 커스텀 횟수 수정 (수정 모드에서만) */}
                                                                {isEditing && (
                                                                    <div>
                                                                        <h4 className="text-xs font-medium text-gray-700 mb-2">커스텀 횟수</h4>
                                                                        <div className="flex items-center space-x-2">
                                                                            <Input
                                                                                type="number"
                                                                                min="1"
                                                                                value={element.custom_count}
                                                                                onChange={(e) => updateElementCustomCount(index, parseInt(e.target.value) || 1)}
                                                                                className="text-sm bg-white border-gray-300 focus:ring-0 focus:border-gray-300"
                                                                            />
                                                                            <span className="text-xs text-gray-500">회</span>
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                {/* 기본 정보 */}
                                                                <div>
                                                                    <h4 className="text-xs font-medium text-gray-700 mb-2">기본 정보</h4>
                                                                    <div className="space-y-2">
                                                                        <div className="flex items-center justify-between text-xs">
                                                                            <span className="text-gray-500">시술명:</span>
                                                                            <span className="text-gray-900">{elementData.name}</span>
                                                                        </div>
                                                                        <div className="flex items-center justify-between text-xs">
                                                                            <span className="text-gray-900">{elementData.description}</span>
                                                                        </div>
                                                                        <div className="flex items-center justify-between text-xs">
                                                                            <span className="text-gray-500">분류:</span>
                                                                            <span className="text-gray-900">
                                                                                {elementData.class_major} &gt; {elementData.class_sub} &gt; {elementData.class_detail}
                                                                            </span>
                                                                        </div>
                                                                        <div className="flex items-center justify-between text-xs">
                                                                            <span className="text-gray-500">유형:</span>
                                                                            <span className="text-gray-900">{elementData.class_type}</span>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {/* 시술 정보 */}
                                                                <div>
                                                                    <h4 className="text-xs font-medium text-gray-700 mb-2">시술 정보</h4>
                                                                    <div className="space-y-2">
                                                                        <div className="flex items-center justify-between text-xs">
                                                                            <span className="text-gray-500">담당자:</span>
                                                                            <span className="text-gray-900">{elementData.position_type}</span>
                                                                        </div>
                                                                        <div className="flex items-center justify-between text-xs">
                                                                            <span className="text-gray-500">소요시간:</span>
                                                                            <span className="text-gray-900">{elementData.cost_time}분</span>
                                                                        </div>
                                                                        <div className="flex items-center justify-between text-xs">
                                                                            <span className="text-gray-500">난이도:</span>
                                                                            <span className="text-gray-900">{elementData.procedure_level}</span>
                                                                        </div>
                                                                        <div className="flex items-center justify-between text-xs">
                                                                            <span className="text-gray-500">원가:</span>
                                                                            <span className="text-gray-900">{elementData.procedure_cost?.toLocaleString()}원</span>
                                                                        </div>
                                                                        <div className="flex items-center justify-between text-xs">
                                                                            <span className="text-gray-500">판매가:</span>
                                                                            <span className="text-gray-900">{elementData.price?.toLocaleString()}원</span>
                                                                        </div>
                                                                        <div className="flex items-center justify-between text-xs">
                                                                            <span className="text-gray-500">릴리즈:</span>
                                                                            <span className="text-gray-900">{elementData.release === 1 ? 'O' : 'X'}</span>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {/* 소모품 정보 */}
                                                                {elementData.consum_1_name && (
                                                                    <div>
                                                                        <h4 className="text-xs font-medium text-gray-700 mb-2">소모품 정보</h4>
                                                                        <div className="space-y-2">
                                                                            <div className="flex items-center justify-between text-xs">
                                                                                <span className="text-gray-500">소모품명:</span>
                                                                                <span className="text-gray-900">{elementData.consum_1_name}</span>
                                                                            </div>
                                                                            <div className="flex items-center justify-between text-xs">
                                                                                <span className="text-gray-500">개수:</span>
                                                                                <span className="text-gray-900">{elementData.consum_1_count}</span>
                                                                            </div>
                                                                            <div className="flex items-center justify-between text-xs">
                                                                                <span className="text-gray-500">단위:</span>
                                                                                <span className="text-gray-900">{elementData.consum_1_unit}</span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* 상태 정보 */}
                                <div>
                                    <h3 className="text-sm font-medium text-gray-900 mb-2">상태 정보</h3>
                                    {isEditing ? (
                                        <div className="bg-gray-50 rounded-lg p-3">
                                            <div>
                                                <label className="text-xs text-gray-500 block mb-1">상태</label>
                                                <Select
                                                    value={editData.release?.toString() || '1'}
                                                    onValueChange={(value) => setEditData({ ...editData, release: parseInt(value) })}
                                                >
                                                    <SelectTrigger className="text-sm bg-white text-gray-600 border-gray-300">
                                                        <SelectValue placeholder="상태 선택" className="text-gray-900" />
                                                    </SelectTrigger>
                                                    <SelectContent className="w-full bg-white border-gray-300 shadow-lg">
                                                        <SelectItem value="1" className="text-gray-600">활성화</SelectItem>
                                                        <SelectItem value="0" className="text-gray-600">비활성화</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                                                <div className="flex items-center">
                                                    <Settings className="w-4 h-4 text-gray-500 mr-2" />
                                                    <span className="text-sm text-gray-700">활성화 상태</span>
                                                </div>
                                                <span className={`text-xs px-2 py-1 rounded-full ${
                                                    detailCustom.release === 1 
                                                        ? 'bg-green-100 text-green-700' 
                                                        : 'bg-red-100 text-red-700'
                                                }`}>
                                                    {detailCustom.release === 1 ? '활성화' : '비활성화'}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
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
                                    onClick={() => setIsEditing(false)}
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
                                    onClick={() => setIsEditing(true)}
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
        </div>
    );
}
