'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Settings, Save, Edit, Package, Tag, AlertTriangle, DollarSign, ChevronDown, ChevronRight, Plus, Search, Trash2 } from 'lucide-react';
import { BundleListResponse, getBundleDetail, updateBundle } from '@/api/bundles-api';
import { Element, getElementsList, searchElementsByName, getElementDetail } from '@/api/element-api';
import { useModalStore } from '@/store/modal-store';

interface BundleDetailModalProps {
    bundle: BundleListResponse | null;
    isOpen: boolean;
    onClose: () => void;
    onDataUpdate?: (() => Promise<void>) | null;
}

export default function BundleDetailModal({ 
    bundle, 
    isOpen, 
    onClose, 
    onDataUpdate 
}: BundleDetailModalProps) {
    const [detailBundle, setDetailBundle] = useState<BundleListResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState<Partial<BundleListResponse>>({});
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
            setFilteredElements(filtered.slice(0, 1000)); // 최대 10개만 표시
        } else {
            setFilteredElements([]);
        }
    }, [elementSearchQuery, allElements]);

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
            // Element 상세 정보 가져오기
            const elementDetail = await getElementDetail(element.id);
            
            const newElement = {
                id: Date.now(), // 임시 ID
                group_id: detailBundle?.group_id || 0,
                element_id: element.id,
                element_cost: element.procedure_cost || 0,
                price_ratio: 1.0, // 기본 비율
                release: 1,
                element_detail: elementDetail // 상세 정보 추가
            };
            
            setEditData({
                ...editData,
                elements: [...editData.elements, newElement]
            });
            
            setElementSearchQuery('');
            setShowElementSearch(false);
        } catch (error) {
            console.error('Element 상세 정보 가져오기 실패:', error);
            // 상세 정보 없이도 추가
            const newElement = {
                id: Date.now(),
                group_id: detailBundle?.group_id || 0,
                element_id: element.id,
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
    const removeElement = (elementId: number) => {
        if (!editData.elements) return;
        
        setEditData({
            ...editData,
            elements: editData.elements.filter(el => el.id !== elementId)
        });
    };

    // Element 비율 변경
    const updateElementRatio = (elementId: number, ratio: number) => {
        if (!editData.elements) return;
        
        setEditData({
            ...editData,
            elements: editData.elements.map(el => 
                el.id === elementId ? { ...el, price_ratio: ratio } : el
            )
        });
    };

    // 모달이 열릴 때 상세 정보 가져오기
    useEffect(() => {
        if (isOpen && bundle?.group_id) {
            setLoading(true);
            setError(null);
            
            // Element 목록도 함께 로드
            loadAllElements();
            
            getBundleDetail(bundle.group_id)
                .then((detailData) => {
                    setDetailBundle(detailData);
                    
                })
                .catch((err) => {
                    setError(err.message);
                    // 에러가 발생해도 기본 정보는 표시
                    setDetailBundle(bundle);
                })
                .finally(() => {
                    setLoading(false);
                });
        } else if (!isOpen) {
            // 모달이 닫힐 때 상태 초기화
            setDetailBundle(null);
            setError(null);
            setIsEditing(false);
            setEditData({});
            setExpandedElements(new Set());
            setElementSearchQuery('');
            setShowElementSearch(false);
        }
    }, [isOpen, bundle]);

    // 표시할 데이터 결정 (상세 정보가 있으면 상세 정보, 없으면 기본 정보)
    const displayBundle = detailBundle || bundle;

    // 수정 모드 시작
    const handleEdit = () => {
        if (displayBundle) {
            // 원래 값들을 그대로 복사하여 editData에 설정
            const originalData = {
                group_id: displayBundle.group_id,
                name: displayBundle.name || '',
                description: displayBundle.description || '',
                release: displayBundle.release || 1,
                elements: displayBundle.elements || []
            };
            
            
            setEditData(originalData);
            setIsEditing(true);
        }
    };

    // 수정 모드 취소
    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditData({});
        setElementSearchQuery('');
        setShowElementSearch(false);
    };

    // 수정 저장
    const handleSave = async () => {
        if (!displayBundle?.group_id) return;
        
        setSaving(true);
        try {
            const response = await updateBundle(displayBundle.group_id, editData);
            
            
            if (response) {
                setDetailBundle(response);
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
            alert('Bundle 정보가 성공적으로 수정되었습니다.');
        } catch (error: unknown) {
            console.error('수정 실패:', error);
            alert(`수정 중 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center z-50 p-4 overflow-hidden">
            <div className="bg-white rounded-xl w-full max-w-md h-[85vh] flex flex-col shadow-2xl border border-gray-200">
                
                {/* 헤더 */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <div className="flex items-center space-x-3">
                        <h2 className="text-lg font-semibold text-gray-900">
                            {isEditing ? '패키지 정보 수정' : '패키지 상세정보'}
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
                        onClick={() => {
                            setIsEditing(false);
                            setEditData({});
                            onClose();
                        }}
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

                    {!loading && displayBundle && (
                        <div className="space-y-4">
                            {/* Bundle명 */}
                            <div className="text-center pb-3 border-b border-gray-100">
                                {isEditing ? (
                                    <div className="space-y-3">
                                        <Input
                                            value={editData.name || ''}
                                            onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                                            placeholder="Bundle명을 입력하세요"
                                            className="text-center text-lg font-semibold text-gray-600 placeholder:text-gray-500 bg-white border-gray-300 focus:ring-0 focus:border-gray-300"
                                        />
                                        <div className="flex items-center justify-center space-x-2">
                                            <Tag className="w-3 h-3 text-gray-400" />
                                            <span className="text-xs text-gray-500">
                                                패키지 ID: {displayBundle.group_id}
                                            </span>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <h2 className="text-lg font-semibold text-gray-900 mb-1">
                                            {displayBundle.name || `Bundle ${displayBundle.group_id}`}
                                        </h2>
                                        <div className="flex items-center justify-center space-x-2">
                                            <Tag className="w-3 h-3 text-gray-400" />
                                            <span className="text-xs text-gray-500">
                                                패키지 ID: {displayBundle.group_id}
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
                                                    <label className="text-xs text-gray-500 block mb-1">패키지 ID</label>
                                                    <Input
                                                        value={editData.group_id || ''}
                                                        onChange={(e) => setEditData({ ...editData, group_id: e.target.value ? Number(e.target.value) : undefined })}
                                                        placeholder="패키지 ID"
                                                        className="text-sm text-gray-600 placeholder:text-gray-500 bg-white border-gray-300 focus:ring-0 focus:border-gray-300"
                                                        type="number"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-xs text-gray-500 block mb-1">패키지명</label>
                                                    <Input
                                                        value={editData.name || ''}
                                                        onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                                                        placeholder="Bundle명"
                                                        className="text-sm text-gray-600 placeholder:text-gray-500 bg-white border-gray-300 focus:ring-0 focus:border-gray-300"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            {/* 수정 모드가 아닐 때는 패키지 ID 숨김 */}
                                        </div>
                                    )}
                                </div>

                                {/* 시술 설명 */}
                                <div>
                                    <h3 className="text-sm font-medium text-gray-900 mb-2">시술 설명</h3>
                                    {isEditing ? (
                                        <div className="bg-gray-50 rounded-lg p-3">
                                            <div>
                                                <label className="text-xs text-gray-500 block mb-1">설명</label>
                                                <Textarea
                                                    value={editData.description || ''}
                                                    onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                                                    placeholder="Bundle 설명을 입력하세요"
                                                    className="bg-white text-sm min-h-[8vh] w-full resize-none text-gray-600 placeholder:text-gray-500 border-gray-300 focus:ring-0 focus:border-gray-300"
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            {displayBundle.description && (
                                                <div className="bg-gray-50 rounded-lg p-3">
                                                    <p className="text-sm text-gray-600">{displayBundle.description}</p>
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
                                                {displayBundle.elements.length}개
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                                            <div className="flex items-center">
                                                <DollarSign className="w-4 h-4 text-gray-500 mr-2" />
                                                <span className="text-sm text-gray-700">총 비용</span>
                                            </div>
                                            <span className="text-sm font-medium text-gray-900">
                                                {displayBundle.elements.reduce((total, element) => 
                                                    total + (element.element_cost || 0), 0
                                                ).toLocaleString()}원
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
                                        {(isEditing ? editData.elements : displayBundle.elements)?.map((element) => {
                                            const isExpanded = expandedElements.has(element.id);
                                            const elementDetail = element.element_detail;
                                            
                                            return (
                                                <div key={element.id} className="border border-gray-200 rounded-lg overflow-hidden">
                                                    {/* Element 헤더 */}
                                                    <div 
                                                        className="bg-gray-50 p-3 cursor-pointer hover:bg-gray-100 transition-colors"
                                                        onClick={() => toggleElement(element.id)}
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
                                                                    {elementDetail && (
                                                                        <p className="text-xs text-gray-600 mt-1">
                                                                            {elementDetail.name}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center space-x-2">
                                                                {isEditing && (
                                                                    <Button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            removeElement(element.id);
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
                                                                    {/* 가격 비율 : 포함된 모든 시술의 합이 100이어야 함. 소수점 포함해서 100이 되도록 조정해야 함.*/}
                                                                    <p className="text-xs text-gray-700">
                                                                        <span className='text-gray-500'>가격 비율: </span>{(element.price_ratio * 100).toFixed(1)}%
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Element 상세 정보 (아코디언) */}
                                                    {isExpanded && elementDetail && (
                                                        <div className="bg-white p-3 border-t border-gray-200">
                                                            <div className="space-y-3">
                                                                {/* 비율 수정 (수정 모드에서만) */}
                                                                {isEditing && (
                                                                    <div>
                                                                        <h4 className="text-xs font-medium text-gray-700 mb-2">가격 비율</h4>
                                                                        <div className="flex items-center space-x-2">
                                                                            <Input
                                                                                type="number"
                                                                                step="0.1"
                                                                                min="0"
                                                                                max="10"
                                                                                value={element.price_ratio}
                                                                                onChange={(e) => updateElementRatio(element.id, parseFloat(e.target.value) || 0)}
                                                                                className="text-sm bg-white border-gray-300 focus:ring-0 focus:border-gray-300"
                                                                            />
                                                                            <span className="text-xs text-gray-500">배율</span>
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                {/* 기본 정보 */}
                                                                <div>
                                                                    <h4 className="text-xs font-medium text-gray-700 mb-2">기본 정보</h4>
                                                                    <div className="space-y-2">
                                                                        <div className="flex items-center justify-between text-xs">
                                                                            <span className="text-gray-500">시술명:</span>
                                                                            <span className="text-gray-900">{elementDetail.name}</span>
                                                                        </div>
                                                                        <div className="flex items-center justify-between text-xs">
                                                                            <span className="text-gray-500">설명:</span>
                                                                            <span className="text-gray-900">{elementDetail.description}</span>
                                                                        </div>
                                                                        <div className="flex items-center justify-between text-xs">
                                                                            <span className="text-gray-500">분류:</span>
                                                                            <span className="text-gray-900">
                                                                                {elementDetail.class_major} &gt; {elementDetail.class_sub} &gt; {elementDetail.class_detail}
                                                                            </span>
                                                                        </div>
                                                                        <div className="flex items-center justify-between text-xs">
                                                                            <span className="text-gray-500">유형:</span>
                                                                            <span className="text-gray-900">{elementDetail.class_type}</span>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {/* 시술 정보 */}
                                                                <div>
                                                                    <h4 className="text-xs font-medium text-gray-700 mb-2">시술 정보</h4>
                                                                    <div className="space-y-2">
                                                                        <div className="flex items-center justify-between text-xs">
                                                                            <span className="text-gray-500">담당자:</span>
                                                                            <span className="text-gray-900">{elementDetail.position_type}</span>
                                                                        </div>
                                                                        <div className="flex items-center justify-between text-xs">
                                                                            <span className="text-gray-500">소요시간:</span>
                                                                            <span className="text-gray-900">{elementDetail.cost_time}분</span>
                                                                        </div>
                                                                        <div className="flex items-center justify-between text-xs">
                                                                            <span className="text-gray-500">난이도:</span>
                                                                            <span className="text-gray-900">{elementDetail.procedure_level}</span>
                                                                        </div>
                                                                        <div className="flex items-center justify-between text-xs">
                                                                            <span className="text-gray-500">원가:</span>
                                                                            <span className="text-gray-900">{elementDetail.procedure_cost?.toLocaleString()}원</span>
                                                                        </div>
                                                                        <div className="flex items-center justify-between text-xs">
                                                                            <span className="text-gray-500">판매가:</span>
                                                                            <span className="text-gray-900">{elementDetail.price?.toLocaleString()}원</span>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {/* 소모품 정보 */}
                                                                {elementDetail.consum_1_id && (
                                                                    <div>
                                                                        <h4 className="text-xs font-medium text-gray-700 mb-2">소모품 정보</h4>
                                                                        <div className="space-y-2">
                                                                            <div className="flex items-center justify-between text-xs">
                                                                                <span className="text-gray-500">소모품:</span>
                                                                                <span className="text-gray-900">{elementDetail.consum_1_name}</span>
                                                                            </div>
                                                                            <div className="flex items-center justify-between text-xs">
                                                                                <span className="text-gray-500">단위:</span>
                                                                                <span className="text-gray-900">{elementDetail.consum_1_unit}</span>
                                                                            </div>
                                                                            <div className="flex items-center justify-between text-xs">
                                                                                <span className="text-gray-500">수량:</span>
                                                                                <span className="text-gray-900">{elementDetail.consum_1_count}개</span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                {/* 플랜 정보 */}
                                                                {elementDetail.plan_state !== undefined && (
                                                                    <div>
                                                                        <h4 className="text-xs font-medium text-gray-700 mb-2">플랜 정보</h4>
                                                                        <div className="space-y-2">
                                                                            <div className="flex items-center justify-between text-xs">
                                                                                <span className="text-gray-500">플랜 상태:</span>
                                                                                <span className="text-gray-900">
                                                                                    {elementDetail.plan_state === 1 ? '활성' : '비활성'}
                                                                                </span>
                                                                            </div>
                                                                            {elementDetail.plan_state === 1 && (
                                                                                <>
                                                                                    <div className="flex items-center justify-between text-xs">
                                                                                        <span className="text-gray-500">플랜 횟수:</span>
                                                                                        <span className="text-gray-900">{elementDetail.plan_count}회</span>
                                                                                    </div>
                                                                                    {elementDetail.plan_interval && (
                                                                                        <div className="flex items-center justify-between text-xs">
                                                                                            <span className="text-gray-500">플랜 간격:</span>
                                                                                            <span className="text-gray-900">{elementDetail.plan_interval}일</span>
                                                                                        </div>
                                                                                    )}
                                                                                </>
                                                                            )}
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
                                                    displayBundle.release === 1 
                                                        ? 'bg-green-100 text-green-700' 
                                                        : 'bg-red-100 text-red-700'
                                                }`}>
                                                    {displayBundle.release === 1 ? '활성화' : '비활성화'}
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
                                    onClick={handleCancelEdit}
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
                                    onClick={() => {
                                        setIsEditing(false);
                                        setEditData({});
                                        onClose();
                                    }}
                                    className="flex-1 bg-gray-500 py-3 font-semibold text-white"
                                    variant="secondary"
                                >
                                    닫기
                                </Button>
                                <Button
                                    onClick={handleEdit}
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
