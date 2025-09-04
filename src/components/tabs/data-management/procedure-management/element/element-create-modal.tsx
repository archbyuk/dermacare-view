'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { debounce } from 'lodash';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Save, Search, Tag } from 'lucide-react';
import { createElement, ElementCreateRequest } from '@/api/element-api';
import { searchConsumables, Consumable } from '@/api/consumables-api';
import {
  CLASS_MAJOR_OPTIONS,
  CLASS_SUB_OPTIONS,
  CLASS_DETAIL_OPTIONS,
  CLASS_TYPE_OPTIONS,
  POSITION_TYPE_OPTIONS,
  PROCEDURE_LEVEL_OPTIONS,
  UNIT_TYPE_OPTIONS,
} from '@/lib/constants';

interface ElementCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onRefresh?: (() => Promise<void>) | null;
}

export default function ElementCreateModal({ isOpen, onClose, onSuccess, onRefresh }: ElementCreateModalProps) {
  const [formData, setFormData] = useState<ElementCreateRequest>({
    id: 0,
    name: '',
    class_major: '',
    class_sub: '',
    class_detail: '',
    class_type: '',
    description: '',
    position_type: '',
    cost_time: 0,
    plan_state: 1,
    plan_count: 1,
    plan_interval: 0,
    consum_1_id: undefined,
    consum_1_name: '',
    consum_1_count: undefined,
    consum_1_unit: '',
    procedure_level: '',
    price: 0,
    release: 1,
  });
  
  const [consumableSearch, setConsumableSearch] = useState('');
  const [consumables, setConsumables] = useState<Consumable[]>([]);
  const [isSearchingConsumables, setIsSearchingConsumables] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showConsumableDropdown, setShowConsumableDropdown] = useState(false);

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

  // 소모품 검색어 변경 시 디바운스된 검색 실행
  useEffect(() => {
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
  }, [consumableSearch, debouncedSearch]);

  // 소모품 검색
  const handleConsumableSearch = async (searchTerm: string) => {
    setIsSearchingConsumables(true);
    
    try {
      const results = await searchConsumables(searchTerm);
      setConsumables(results);
    } 
    
    catch (error) {
      console.error('소모품 검색 실패:', error);
      setConsumables([]);
    } 
    
    finally {
      setIsSearchingConsumables(false);
    }
  };

  // 소모품 선택
  const handleConsumableSelect = (consumable: Consumable) => {
    setFormData({
      ...formData,
      consum_1_id: consumable.id,
      consum_1_name: consumable.name
    });
    setConsumableSearch(''); // 검색란 초기화
    setConsumables([]);
    setShowConsumableDropdown(false);
  };

  // 폼 데이터 변경 핸들러
  const handleInputChange = (field: keyof ElementCreateRequest, value: string | number | undefined) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };

  // Element 생성
  const handleCreate = async () => {
    if (!formData.name || !formData.class_major || !formData.position_type) {
      alert('필수 항목을 모두 입력해주세요.');
      return;
    }
    
    setSaving(true);
    try {
      const response = await createElement(formData);
      
      // 성공 메시지 표시
      alert('시술이 성공적으로 생성되었습니다.');
      
      // 부모 컴포넌트에 성공 알림
      onSuccess();
      
      // element-tab 데이터 새로고침
      if (onRefresh) {
        await onRefresh();
      }
      
      // 모달 닫기
      onClose();
      
      // 폼 초기화
      setFormData({
        id: 0,
        name: '',
        class_major: '',
        class_sub: '',
        class_detail: '',
        class_type: '',
        description: '',
        position_type: '',
        cost_time: 0,
        plan_state: 1,
        plan_count: 1,
        plan_interval: 30,
        consum_1_id: undefined,
        consum_1_name: '',
        consum_1_count: undefined,
        consum_1_unit: '',
        procedure_level: '',
        price: 0,
        release: 1,
      });
      setConsumableSearch('');
      setConsumables([]);
      isFirstMount.current = true;
    } catch (error: unknown) {
      console.error('생성 실패:', error);
      alert(`생성 중 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
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
          <h2 className="text-lg font-semibold text-gray-900">새 시술 생성</h2>
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
        <div 
          className="p-4 flex-1 overflow-y-auto"
          onClick={() => setShowConsumableDropdown(false)}
        >
          <div className="space-y-4">
            {/* 시술명 */}
            <div className="text-center pb-3 border-b border-gray-100">
              <div className="space-y-3">
                <Input
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="시술명을 입력하세요"
                  className="text-center text-lg font-semibold text-gray-600 placeholder:text-gray-500 bg-white border-gray-300 focus:ring-0 focus:border-gray-300"
                />
                <div className="flex items-center justify-center space-x-2">
                  <Tag className="w-3 h-3 text-gray-400" />
                  <span className="text-xs text-gray-500">
                    {formData.class_major} &gt; {formData.class_sub} &gt; {formData.class_detail}
                  </span>
                </div>
              </div>
            </div>

            {/* 기본 정보 */}
            <div className="space-y-3">
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">분류 정보</h3>
                <div className="bg-gray-50 rounded-lg p-3 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">대분류 *</label>
                      <Select
                        value={formData.class_major}
                        onValueChange={(value) => handleInputChange('class_major', value)}
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
                        value={formData.class_sub}
                        onValueChange={(value) => handleInputChange('class_sub', value)}
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
                        value={formData.class_detail}
                        onValueChange={(value) => handleInputChange('class_detail', value)}
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
                        value={formData.class_type}
                        onValueChange={(value) => handleInputChange('class_type', value)}
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
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">시술 설명</h3>
                <div className="bg-gray-50 rounded-lg p-3">
                  <Textarea
                    value={formData.description}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('description', e.target.value)}
                    placeholder="시술 설명을 입력하세요"
                    className="bg-white text-sm min-h-[10vh] w-full resize-none text-gray-600 placeholder:text-gray-500 border-gray-300 focus:ring-0 focus:border-gray-300"
                  />
                </div>
              </div>
              
              {/* 시술 정보 */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">시술 정보</h3>
                <div className="bg-gray-50 rounded-lg p-3 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">시술 ID *</label>
                      <Input
                        value={formData.id || ''}
                        onChange={(e) => handleInputChange('id', Number(e.target.value))}
                        placeholder="시술 ID"
                        className="text-sm text-gray-600 placeholder:text-gray-500 bg-white border-gray-300 focus:ring-0 focus:border-gray-300"
                        type="number"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">소요시간 (분)</label>
                      <Input
                        value={formData.cost_time || ''}
                        onChange={(e) => handleInputChange('cost_time', Number(e.target.value))}
                        placeholder="소요시간"
                        className="text-sm text-gray-600 placeholder:text-gray-500 bg-white border-gray-300 focus:ring-0 focus:border-gray-300"
                        type="number"
                      />
                    </div>
                  </div>
                    
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">시술 가격 (원) *</label>
                      <Input
                        value={formData.price || ''}
                        onChange={(e) => handleInputChange('price', Number(e.target.value))}
                        placeholder="시술 가격"
                        className="text-sm text-gray-600 placeholder:text-gray-500 bg-white border-gray-300 focus:ring-0 focus:border-gray-300"
                        type="number"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">담당자 *</label>
                      <Select
                        value={formData.position_type}
                        onValueChange={(value) => handleInputChange('position_type', value)}
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
                  </div>

                  <div>
                    <label className="text-xs text-gray-500 block mb-1">시술 난이도</label>
                    <Select
                      value={formData.procedure_level}
                      onValueChange={(value) => handleInputChange('procedure_level', value)}
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
              
              {/* 계획 정보 */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">플랜 정보</h3>
                <div className="bg-gray-50 rounded-lg p-3 space-y-3">
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">플랜 상태</label>
                      <Select
                        value={formData.plan_state?.toString() ?? '1'}
                        onValueChange={(value) => handleInputChange('plan_state', Number(value))}
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
                        value={formData.plan_count || ''}
                        onChange={(e) => handleInputChange('plan_count', Number(e.target.value))}
                        placeholder="횟수"
                        className={`text-sm placeholder:text-gray-500 border-gray-300 focus:ring-0 focus:border-gray-300 ${
                          formData.plan_state === 0 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-600'
                        }`}
                        type="number"
                        disabled={formData.plan_state === 0}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">플랜 간격 (일)</label>
                      <Input
                        value={formData.plan_interval || ''}
                        onChange={(e) => handleInputChange('plan_interval', Number(e.target.value))}
                        placeholder="간격"
                        className={`text-sm placeholder:text-gray-500 border-gray-300 focus:ring-0 focus:border-gray-300 ${
                          formData.plan_state === 0 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-600'
                        }`}
                        type="number"
                        disabled={formData.plan_state === 0}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 소모품 정보 */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">소모품 정보</h3>
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
                        value={formData.consum_1_id || ''}
                        placeholder="검색으로 선택하세요"
                        className="text-sm text-gray-600 placeholder:text-gray-500 bg-gray-50 border-gray-300 focus:ring-0 focus:border-gray-300"
                        type="number"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">소모품명</label>
                      <Input
                        value={formData.consum_1_name || ''}
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
                        value={formData.consum_1_count || ''}
                        onChange={(e) => handleInputChange('consum_1_count', Number(e.target.value))}
                        placeholder="소모량"
                        className="bg-white text-sm text-gray-600 placeholder:text-gray-500 border-gray-300 focus:ring-0 focus:border-gray-300"
                        type="number"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">단위</label>
                      <Select
                        value={formData.consum_1_unit || ''}
                        onValueChange={(value) => handleInputChange('consum_1_unit', value)}
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
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">활성화 여부</h3>
                <div className="bg-gray-50 rounded-lg p-3 space-y-3">
                    <label className="text-xs text-gray-500 block mb-1">활성화 여부</label>
                    <Select
                      value={formData.release?.toString() ?? '1'}
                      onValueChange={(value) => handleInputChange('release', Number(value))}
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
