'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { debounce } from 'lodash';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, DollarSign, X, User, Tag, AlertTriangle, Calendar, Settings, Package, Hash, Search, TrendingDown, Save, Edit } from 'lucide-react';
import { Element, getElementDetail, updateElement } from '@/api/element-api';
import { searchConsumables, Consumable } from '@/api/consumables-api';
import { useModalStore } from '@/store/modal-store';
import {
  CLASS_MAJOR_OPTIONS,
  CLASS_SUB_OPTIONS,
  CLASS_DETAIL_OPTIONS,
  CLASS_TYPE_OPTIONS,
  POSITION_TYPE_OPTIONS,
  PROCEDURE_LEVEL_OPTIONS,
  UNIT_TYPE_OPTIONS,
} from '@/lib/constants';

interface ElementDetailModalProps {
  element: Element | null;
  isOpen: boolean;
  onClose: () => void;
  onDataUpdate?: (() => Promise<void>) | null;
}

export default function ElementDetailModal({ element, isOpen, onClose, onDataUpdate}: ElementDetailModalProps) {
  const [detailElement, setDetailElement] = useState<Element | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<Element>>({});
  const [saving, setSaving] = useState(false);
  const [consumableSearch, setConsumableSearch] = useState('');
  const [consumables, setConsumables] = useState<Consumable[]>([]);
  const [isSearchingConsumables, setIsSearchingConsumables] = useState(false);
  const [showConsumableDropdown, setShowConsumableDropdown] = useState(false);
  
  const { returnToMembership, openMembershipDetail } = useModalStore();

  // 첫 마운트 상태 초기화
  const isFirstMount = useRef(true);
  
  // 디바운스된 검색 함수
  const debouncedSearch = useCallback(
    debounce((searchTerm: string) => {
      if (searchTerm.trim()) {
        handleConsumableSearch(searchTerm);
      } else {
        handleConsumableSearch('');
      }
    }, 50),
    []
  );



  // 모달이 열릴 때 상세 정보 가져오기
  useEffect(() => {
    
    if (isOpen && element?.id) {
      setLoading(true);
      setError(null);
      
      getElementDetail(element.id)
        .then((detailData) => {
          setDetailElement(detailData);
        })
        .catch((err) => {
          setError(err.message);
          // 에러가 발생해도 기본 정보는 표시
          setDetailElement(element);
        })
        .finally(() => {
          setLoading(false);
        });
    } 
    
    else if (!isOpen) {
      // 모달이 닫힐 때 상태 초기화
      setDetailElement(null);
      setError(null);
      setIsEditing(false);
      setEditData({});
      setConsumableSearch('');
      setConsumables([]);
    }
  }, [isOpen, element?.id]);



  // 소모품 검색어 변경 시 디바운스된 검색 실행
  useEffect(() => {
    // 수정 모드가 아닐 때는 검색하지 않음
    if (!isEditing) {
      return;
    }
    
    // 첫 마운트 시에는 API 호출하지 않음
    if (isFirstMount.current) {
      return;
    }
    
    // 디바운스된 검색 실행
    debouncedSearch(consumableSearch);
    
    // 컴포넌트 언마운트 시 디바운스 취소
    return () => {
      debouncedSearch.cancel();
    };
  }, [consumableSearch, debouncedSearch, isEditing]);

  // 표시할 데이터 결정 (상세 정보만 사용)
  const displayElement = detailElement;



  // 수정 모드 시작
  const handleEdit = () => {
    if (displayElement) {
      // 원래 값들을 그대로 복사하여 editData에 설정 (빈 문자열 허용)
      const originalData = {
        id: displayElement.id ?? undefined,
        name: displayElement.name ?? '',
        class_major: displayElement.class_major ?? '',
        class_sub: displayElement.class_sub ?? '',
        class_detail: displayElement.class_detail ?? '',
        class_type: displayElement.class_type ?? '',
        description: displayElement.description ?? '',
        position_type: displayElement.position_type ?? '',
        cost_time: displayElement.cost_time ?? undefined,
        plan_state: displayElement.plan_state ?? undefined,
        plan_count: displayElement.plan_count ?? undefined,
        plan_interval: displayElement.plan_interval ?? undefined,
        consum_1_id: displayElement.consum_1_id ?? undefined,
        consum_1_name: displayElement.consum_1_name ?? '',
        consum_1_count: displayElement.consum_1_count ?? undefined,
        consum_1_unit: displayElement.consum_1_unit ?? '',
        procedure_level: displayElement.procedure_level ?? '',
        procedure_cost: displayElement.procedure_cost ?? undefined,
        price: displayElement.price ?? undefined,
        release: displayElement.release ?? undefined,
      };
       
      setEditData(originalData);
      setConsumableSearch(displayElement.consum_1_name ?? '');
      setConsumables([]);
      setShowConsumableDropdown(false);
      setIsEditing(true);
      // 수정 모드 시작 시 첫 마운트 상태로 리셋
      isFirstMount.current = true;
    }
  };

  // 멤버십으로 돌아가기
  const handleReturnToMembership = () => {
    if (returnToMembership) {
      openMembershipDetail(returnToMembership);
    }
  };

  // 수정 모드 취소
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditData({});
  };

  // 소모품 검색
  const handleConsumableSearch = async (searchTerm: string) => {
    setIsSearchingConsumables(true);
    try {
      const results = await searchConsumables(searchTerm);
      setConsumables(results);
    } catch (error) {
      console.error('소모품 검색 실패:', error);
      setConsumables([]);
    } finally {
      setIsSearchingConsumables(false);
    }
  };

  // 소모품 선택
  const handleConsumableSelect = (consumable: Consumable) => {
    setEditData({
      ...editData,
      consum_1_id: consumable.id,
      consum_1_name: consumable.name
    });
    setConsumableSearch(''); // 검색란 초기화
    setConsumables([]);
    setShowConsumableDropdown(false);
  };

  // 수정 저장
  const handleSave = async () => {
    if (!displayElement?.id) return;
    
    setSaving(true);
    try {
      const response = await updateElement(displayElement.id, editData);
      
      // 즉시 detailElement 업데이트
      if (response) {
        setDetailElement(response);
      }

      setIsEditing(false);
      setEditData({});
      setConsumableSearch('');
      setConsumables([]);
      
      // 성공 메시지 표시
      alert('시술 정보가 성공적으로 수정되었습니다.');
      
      // 부모 컴포넌트에 데이터 업데이트 알림 (비동기적으로 처리)
      if (onDataUpdate) {        
          onDataUpdate();
      }
      
      // 모달은 그대로 유지 (닫지 않음)
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
              {isEditing ? '시술 정보 수정' : '시술 상세정보'}
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
              setConsumableSearch('');
              setConsumables([]);
              isFirstMount.current = true;
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
        <div 
          className="p-4 flex-1 overflow-y-auto relative"
          onClick={() => setShowConsumableDropdown(false)}
        >
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

          {!loading && displayElement ? (
            <div className="space-y-4">
              {/* 시술명 */}
              <div className="text-center pb-3 border-b border-gray-100">
                {isEditing ? (
                  <div className="space-y-3">
                    <Input
                      value={editData.name ?? ''}
                      onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                      placeholder="시술명을 입력하세요"
                      className="text-center text-lg font-semibold text-gray-600 placeholder:text-gray-500 bg-white border-gray-300 focus:ring-0 focus:border-gray-300"
                    />
                    <div className="flex items-center justify-center space-x-2">
                      <Tag className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-500">
                        {editData.class_major || displayElement.class_major} &gt; {editData.class_sub || displayElement.class_sub} &gt; {editData.class_detail || displayElement.class_detail}
                      </span>
                    </div>
                  </div>
                ) : (
                  <>
                    <h2 className="text-lg font-semibold text-gray-900 mb-1">
                      {displayElement.name || `Element ${displayElement.id}`}
                    </h2>
                    <div className="flex items-center justify-center space-x-2">
                      <Tag className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-500">
                        {displayElement.class_major} &gt; {displayElement.class_sub} &gt; {displayElement.class_detail}
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* 기본 정보 */}
              <div className="space-y-3">
                <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-2">분류 정보</h3>
                    {isEditing ? (
                      <div className="bg-gray-50 rounded-lg p-3 space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs text-gray-500 block mb-1">대분류</label>
                            <Select
                              value={editData.class_major ?? ''}
                              onValueChange={(value) => setEditData({ ...editData, class_major: value })}
                            >
                              <SelectTrigger className="text-sm w-full bg-white text-gray-600 border-gray-300">
                                <SelectValue placeholder="대분류 선택" className="text-gray-900 placeholder:text-gray-500" />
                              </SelectTrigger>
                              <SelectContent className="max-h-[30vh] bg-white border-gray-300 shadow-lg">
                                {CLASS_MAJOR_OPTIONS.map((option) => (
                                  <SelectItem key={option.value} value={option.value} className="text-gray-600">
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <label className="text-xs text-gray-500 block mb-1">중분류</label>
                            <Select
                              value={editData.class_sub ?? ''}
                              onValueChange={(value) => setEditData({ ...editData, class_sub: value })}
                            >
                              <SelectTrigger className="text-sm w-full bg-white text-gray-600 border-gray-300">
                                <SelectValue placeholder="중분류 선택" className="text-gray-900" />
                              </SelectTrigger>
                              <SelectContent className="max-h-[30vh] bg-white border-gray-300 shadow-lg">
                                {CLASS_SUB_OPTIONS.map((option) => (
                                  <SelectItem key={option.value} value={option.value} className="text-gray-600">
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <label className="text-xs text-gray-500 block mb-1">소분류</label>
                            <Select
                              value={editData.class_detail ?? ''}
                              onValueChange={(value) => setEditData({ ...editData, class_detail: value })}
                            >
                              <SelectTrigger className="text-sm w-full bg-white text-gray-600 border-gray-300">
                                <SelectValue placeholder="소분류 선택" className="text-gray-900" />
                              </SelectTrigger>
                              <SelectContent className="max-h-[30vh] bg-white border-gray-300 shadow-lg">
                                {CLASS_DETAIL_OPTIONS.map((option) => (
                                  <SelectItem key={option.value} value={option.value} className="text-gray-600">
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <label className="text-xs text-gray-500 block mb-1">유형</label>
                            <Select
                              value={editData.class_type ?? ''}
                              onValueChange={(value) => setEditData({ ...editData, class_type: value })}
                            >
                              <SelectTrigger className="text-sm w-full bg-white text-gray-600 border-gray-300">
                                <SelectValue placeholder="유형 선택" className="text-gray-900" />
                              </SelectTrigger>
                              <SelectContent className="max-h-[30vh] bg-white border-gray-300 shadow-lg">
                                {CLASS_TYPE_OPTIONS.map((option) => (
                                  <SelectItem key={option.value} value={option.value} className="text-gray-600">
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="text-sm text-gray-700">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-gray-500">대분류:</span>
                            <span>{displayElement.class_major}</span>
                          </div>
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-gray-500">중분류:</span>
                            <span>{displayElement.class_sub}</span>
                          </div>
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-gray-500">소분류:</span>
                            <span>{displayElement.class_detail}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-gray-500 whitespace-pre">유   형:</span>
                            <span>{displayElement.class_type}</span>
                          </div>
                        </div>
                      </div>
                    )}
                </div>
                
                {/* 시술 설명 */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-2">시술 설명</h3>
                  {isEditing ? (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <Textarea
                        value={editData.description ?? ''}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEditData({ ...editData, description: e.target.value })}
                        placeholder="시술 설명을 입력하세요"
                        className="bg-white text-sm min-h-[10vh] w-full resize-none text-gray-600 placeholder:text-gray-500 border-gray-300 focus:ring-0 focus:border-gray-300"
                      />
                    </div>
                  ) : (
                    displayElement.description && (
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-sm text-gray-600">{displayElement.description}</p>
                      </div>
                    )
                  )}
                </div>
                
                {/* 시술 정보 */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-2">시술 정보</h3>
                  {isEditing ? (
                    <div className="bg-gray-50 rounded-lg p-3 space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs text-gray-500 block mb-1">시술 ID</label>
                          <Input
                            value={editData.id ?? ''}
                            onChange={(e) => setEditData({ ...editData, id: e.target.value ? Number(e.target.value) : undefined })}
                            placeholder="시술 ID"
                            className="text-sm text-gray-600 placeholder:text-gray-500 bg-white border-gray-300 focus:ring-0 focus:border-gray-300"
                            type="number"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500 block mb-1">소요시간 (분)</label>
                          <Input
                            value={editData.cost_time ?? ''}
                            onChange={(e) => setEditData({ ...editData, cost_time: e.target.value ? Number(e.target.value) : undefined })}
                            placeholder="소요시간"
                            className="text-sm text-gray-600 placeholder:text-gray-500 bg-white border-gray-300 focus:ring-0 focus:border-gray-300"
                            type="number"
                          />
                        </div>
                    </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs text-gray-500 block mb-1">원가 (원)</label>
                          <Input
                            value={editData.procedure_cost ?? ''}
                            placeholder="자동 계산됨"
                            className="text-sm text-gray-600 placeholder:text-gray-500 bg-gray-50 border-gray-300 focus:ring-0 focus:border-gray-300"
                            type="number"
                            readOnly
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500 block mb-1">시술 가격 (원)</label>
                          <Input
                            value={editData.price ?? ''}
                            onChange={(e) => setEditData({ ...editData, price: e.target.value ? Number(e.target.value) : undefined })}
                            placeholder="시술 가격"
                            className="text-sm text-gray-600 placeholder:text-gray-500 bg-white border-gray-300 focus:ring-0 focus:border-gray-300"
                            type="number"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs text-gray-500 block mb-1">담당자</label>
                          <Select
                            value={editData.position_type ?? ''}
                            onValueChange={(value) => setEditData({ ...editData, position_type: value })}
                          >
                            <SelectTrigger className="text-sm bg-white text-gray-600 border-gray-300">
                              <SelectValue placeholder="담당자 선택" className="text-gray-900" />
                            </SelectTrigger>
                            <SelectContent className="w-full bg-white border-gray-300 shadow-lg">
                              {POSITION_TYPE_OPTIONS.map((option) => (
                                <SelectItem key={option.value} value={option.value} className="text-gray-600">
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="text-xs text-gray-500 block mb-1">시술 난이도</label>
                          <Select
                            value={editData.procedure_level ?? ''}
                            onValueChange={(value) => setEditData({ ...editData, procedure_level: value })}
                          >
                            <SelectTrigger className="text-sm bg-white text-gray-600 border-gray-300">
                              <SelectValue placeholder="난이도 선택" className="text-gray-900" />
                            </SelectTrigger>
                            <SelectContent className="w-full bg-white border-gray-300 shadow-lg">
                              {PROCEDURE_LEVEL_OPTIONS.map((option) => (
                                <SelectItem key={option.value} value={option.value} className="text-gray-600">
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center">
                          <Hash className="w-4 h-4 text-gray-500 mr-2" />
                          <span className="text-sm text-gray-700">시술 ID</span>
                        </div>
                        <span className="text-sm font-medium text-gray-900">{displayElement.id}</span>
                      </div>

                      <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 text-gray-500 mr-2" />
                          <span className="text-sm text-gray-700">소요시간</span>
                        </div>
                        <span className="text-sm font-medium text-gray-900">{displayElement.cost_time}분</span>
                      </div>
                      
                      <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center">
                          <TrendingDown className="w-4 h-4 text-gray-500 mr-2" />
                          <span className="text-sm text-gray-700">원가</span>
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {displayElement.procedure_cost?.toLocaleString()}원
                        </span>
                      </div>

                      <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center">
                          <DollarSign className="w-4 h-4 text-gray-500 mr-2" />
                          <span className="text-sm text-gray-700">시술 가격 (원)</span>
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {displayElement.price?.toLocaleString()}원
                        </span>
                      </div>

                      <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center">
                          <User className="w-4 h-4 text-gray-500 mr-2" />
                          <span className="text-sm text-gray-700">담당자</span>
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {displayElement.position_type}
                        </span>
                      </div>

                      <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center">
                          <Settings className="w-4 h-4 text-gray-500 mr-2" />
                          <span className="text-sm text-gray-700">시술 난이도</span>
                        </div>
                        <span className="text-sm font-medium text-gray-900">{displayElement.procedure_level}</span>
                      </div>
                  </div>
                  )}
                </div>
                
                {/* 플랜 정보 */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-2">플랜 정보</h3>
                  {isEditing ? (
                    <div className="bg-gray-50 rounded-lg p-3 space-y-3">
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="text-xs text-gray-500 block mb-1">플랜 상태</label>
                          <Select
                            value={editData.plan_state?.toString() ?? ''}
                            onValueChange={(value) => setEditData({ ...editData, plan_state: Number(value) })}
                          >
                            <SelectTrigger className="text-sm bg-white text-gray-600 border-gray-300">
                              <SelectValue placeholder="상태 선택" className="!text-gray-900" />
                            </SelectTrigger>
                            <SelectContent className="w-full bg-white border-gray-300 shadow-lg">
                              <SelectItem value="1" className="text-gray-600">활성</SelectItem>
                              <SelectItem value="0" className="text-gray-600">비활성</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="text-xs text-gray-500 block mb-1">플랜 횟수</label>
                          <Input
                            value={editData.plan_count ?? ''}
                            onChange={(e) => setEditData({ ...editData, plan_count: e.target.value ? Number(e.target.value) : undefined })}
                            placeholder="횟수"
                            className={`text-sm placeholder:text-gray-500 border-gray-300 focus:ring-0 focus:border-gray-300 ${
                              editData.plan_state === 0 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-600'
                            }`}
                            type="number"
                            disabled={editData.plan_state === 0}
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500 block mb-1">플랜 간격 (일)</label>
                          <Input
                            value={editData.plan_interval ?? ''}
                            onChange={(e) => setEditData({ ...editData, plan_interval: e.target.value ? Number(e.target.value) : undefined })}
                            placeholder="간격"
                            className={`text-sm placeholder:text-gray-500 border-gray-300 focus:ring-0 focus:border-gray-300 ${
                              editData.plan_state === 0 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-600'
                            }`}
                            type="number"
                            disabled={editData.plan_state === 0}
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    (displayElement.plan_state !== -1 && displayElement.plan_count !== -1) && (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                                <div className="flex items-center">
                                    <Calendar className="w-4 h-4 text-gray-500 mr-2" />
                                    <span className="text-sm text-gray-700">플랜 상태</span>
                                </div>
                                <span className="text-sm font-medium text-gray-900">
                                    {displayElement.plan_state === 1 ? 'O' : 'X'}
                                </span>
                            </div>

                            <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                                <div className="flex items-center">
                                    <Package className="w-4 h-4 text-gray-500 mr-2" />
                                    <span className="text-sm text-gray-700">플랜 횟수</span>
                                </div>
                                <span className="text-sm font-medium text-gray-900">{displayElement.plan_count}회</span>
                            </div>

                            {displayElement.plan_interval && displayElement.plan_interval !== -1 && (
                                <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                                    <div className="flex items-center">
                                        <Calendar className="w-4 h-4 text-gray-500 mr-2" />
                                        <span className="text-sm text-gray-700">플랜 간격</span>
                                </div>
                            <span className="text-sm font-medium text-gray-900">{displayElement.plan_interval}일</span>
                          </div>
                        )}
                      </div>
                    )
                  )}
                </div>

                {/* 소모품 정보 */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-2">소모품 정보</h3>
                  {isEditing ? (
                    <div className="bg-gray-50 rounded-lg p-3 space-y-3">
                      {/* 소모품 검색 */}
                      <div>
                        <label className="text-xs text-gray-500 block mb-1">소모품 검색</label>
                        <div 
                          className="relative"
                          onClick={(e) => e.stopPropagation()}
                        >
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                                value={consumableSearch}
                                onChange={(e) => {
                                  setConsumableSearch(e.target.value);
                                  setShowConsumableDropdown(true);
                                }}
                                onFocus={() => {
                                  isFirstMount.current = false;
                                  handleConsumableSearch('');
                                  setShowConsumableDropdown(true);
                                }}
                                placeholder="소모품명을 검색하세요"
                                className="text-sm text-gray-600 placeholder:text-gray-500 bg-white border-gray-300 focus:ring-0 focus:border-gray-300 pl-10"
                            />
                            {isSearchingConsumables && (
                                <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                                </div>
                            )}
                            {showConsumableDropdown && consumables.length > 0 && (
                                <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-40 overflow-y-auto">
                                    {consumables.map((consumable) => (
                                        <div
                                            key={consumable.id}
                                            className="px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm border-b border-gray-100 last:border-b-0"
                                            onClick={() => handleConsumableSelect(consumable)}
                                        >
                                            <div className="font-medium text-gray-900">{consumable.name}</div>
                                            <div className="text-xs text-gray-500">ID: {consumable.id}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs text-gray-500 block mb-1">소모품 ID</label>
                          <Input
                            value={editData.consum_1_id ?? ''}
                            placeholder="검색으로 선택하세요"
                            className="text-sm text-gray-600 placeholder:text-gray-500 bg-gray-50 border-gray-300 focus:ring-0 focus:border-gray-300"
                            type="number"
                            readOnly
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500 block mb-1">소모품명</label>
                          <Input
                            value={editData.consum_1_name ?? ''}
                            placeholder="검색으로 선택하세요"
                            className="text-sm text-gray-600 placeholder:text-gray-500 bg-gray-50 border-gray-300 focus:ring-0 focus:border-gray-300"
                            readOnly
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs text-gray-500 block mb-1">소모량</label>
                          <Input
                            value={editData.consum_1_count ?? ''}
                            onChange={(e) => setEditData({ ...editData, consum_1_count: e.target.value ? Number(e.target.value) : undefined })}
                            placeholder="소모량"
                            className="bg-white text-sm text-gray-600 placeholder:text-gray-500 border-gray-300 focus:ring-0 focus:border-gray-300"
                            type="number"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500 block mb-1">단위</label>
                          <Select
                            value={editData.consum_1_unit ?? ''}
                            onValueChange={(value) => setEditData({ ...editData, consum_1_unit: value })}
                          >
                            <SelectTrigger className="text-sm bg-white text-gray-600 border-gray-300">
                              <SelectValue placeholder="단위 선택" className="!text-gray-900" />
                            </SelectTrigger>
                            <SelectContent className="w-full bg-white border-gray-300 shadow-lg">
                                {UNIT_TYPE_OPTIONS.map((option) => (
                                  <SelectItem key={option.value} value={option.value} className="text-gray-600">
                                    {option.label}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  ) : (
                    (displayElement.consum_1_id && displayElement.consum_1_id !== -1) && (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                                <div className="flex items-center">
                                    <Package className="w-4 h-4 text-gray-500 mr-2" />
                                    <span className="text-sm text-gray-700">소모품명</span>
                                </div>
                                <span className="text-sm font-medium text-gray-900">{displayElement.consum_1_name || '-'}</span>
                            </div>

                        <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                          <div className="flex items-center">
                            <Package className="w-4 h-4 text-gray-500 mr-2" />
                            <span className="text-sm text-gray-700">소모품 ID</span>
                          </div>
                          <span className="text-sm font-medium text-gray-900">{displayElement.consum_1_id}</span>
                        </div>

                        {displayElement.consum_1_count && displayElement.consum_1_count !== -1 && (
                            <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                                <div className="flex items-center">
                                    <Package className="w-4 h-4 text-gray-500 mr-2" />
                                    <span className="text-sm text-gray-700">소모량</span>
                                </div>
                                <span className="text-sm font-medium text-gray-900">{displayElement.consum_1_count} {displayElement.consum_1_unit}</span>
                            </div>
                        )}
                      </div>
                    )
                  )}
              </div>

                {/* 상태 정보 */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-2">상태 정보</h3>
                  {isEditing ? (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div>
                        <label className="text-xs text-gray-500 block mb-1">활성화 상태</label>
                        <Select
                          value={editData.release?.toString() ?? ''}
                          onValueChange={(value) => setEditData({ ...editData, release: Number(value) })}
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
                          displayElement.release === 1 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {displayElement.release === 1 ? '활성화' : '비활성화'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-sm text-gray-600">데이터를 불러올 수 없습니다.</p>
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
                    setConsumableSearch('');
                    setConsumables([]);
                    isFirstMount.current = true;
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
