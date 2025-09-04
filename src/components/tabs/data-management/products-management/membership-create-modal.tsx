'use client';

import { useState, useCallback } from 'react';
import { debounce } from 'lodash';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Save, Package, CreditCard, Calendar } from 'lucide-react';
import { createMembership, MembershipCreateRequest } from '@/api/membership-api';
import { Element, getElementsList } from '@/api/element-api';
import { searchElementsByName } from '@/utils/element-utils';
import { BundleListResponse, getBundlesList } from '@/api/bundles-api';
import { CustomListResponse, getCustomsList } from '@/api/customs-api';
import { SequenceListResponse, getSequencesList } from '@/api/sequences-api';
import { searchSequencesByName } from '@/utils/sequence-utils';

// 멤버십 생성 요청 타입 정의
interface MembershipCreateData {
    id: number;
    membership_info_id: number;
    payment_amount: number;
    bonus_point: number;
    credit: number;
    discount_rate: number;
    package_type: '단일시술' | '번들' | '커스텀' | '시퀀스';
    validity_period: number;
    release_start_date?: string;
    release_end_date?: string;
    release: number;
    element_id?: number;
    bundle_id?: number;
    custom_id?: number;
    sequence_id?: number;
    info: {
        id: number;
        membership_name: string;
        membership_description: string;
        precautions: string;
        release: number;
    };
}

interface MembershipCreateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    onRefresh?: (() => Promise<void>) | null;
}

export default function MembershipCreateModal({ isOpen, onClose, onSuccess, onRefresh }: MembershipCreateModalProps) {
    const [saving, setSaving] = useState(false);
    
    const [showElementSearch, setShowElementSearch] = useState(false);
    const [showBundleSearch, setShowBundleSearch] = useState(false);
    const [showCustomSearch, setShowCustomSearch] = useState(false);
    const [showSequenceSearch, setShowSequenceSearch] = useState(false);
    const [elementSearchQuery, setElementSearchQuery] = useState('');
    const [bundleSearchQuery, setBundleSearchQuery] = useState('');
    const [customSearchQuery, setCustomSearchQuery] = useState('');
    const [sequenceSearchQuery, setSequenceSearchQuery] = useState('');
    const [elementSearchResults, setElementSearchResults] = useState<Element[]>([]);
    const [bundleSearchResults, setBundleSearchResults] = useState<BundleListResponse[]>([]);
    const [customSearchResults, setCustomSearchResults] = useState<CustomListResponse[]>([]);
    const [sequenceSearchResults, setSequenceSearchResults] = useState<SequenceListResponse[]>([]);

    // 디바운스된 검색 함수들
    const debouncedElementSearch = useCallback(
        debounce((query: string) => {
            handleElementSearch(query);
        }, 200),
        []
    );

    const debouncedBundleSearch = useCallback(
        debounce((query: string) => {
            handleBundleSearch(query);
        }, 200),
        []
    );

    const debouncedCustomSearch = useCallback(
        debounce((query: string) => {
            handleCustomSearch(query);
        }, 200),
        []
    );

    const debouncedSequenceSearch = useCallback(
        debounce((query: string) => {
            handleSequenceSearch(query);
        }, 200),
        []
    );
    
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
    
    const [formData, setFormData] = useState({
        id: undefined as number | undefined,
        payment_amount: 0,
        bonus_point: 0,
        credit: 0,
        discount_rate: 0,
        package_type: '단일시술' as '단일시술' | '번들' | '커스텀' | '시퀀스',
        validity_period: 30,
        release_start_date: '',
        release_end_date: '',
        release: 1,
        element_id: undefined as number | undefined,
        bundle_id: undefined as number | undefined,
        custom_id: undefined as number | undefined,
        sequence_id: undefined as number | undefined,
        info: {
            id: undefined as number | undefined,
            membership_name: '',
            membership_description: '',
            precautions: '',
            release: 1
        }
    });

    // 멤버십 타입에 따른 아이콘과 배지 색상 반환
    const getMembershipBadge = (packageType: string) => {
        switch (packageType) {
            case '단일시술':
                return {
                    icon: <Package className="w-4 h-4" />,
                    borderColor: 'border-gray-500',
                    textColor: 'text-gray-500'
                };
            case '번들':
                return {
                    icon: <Package className="w-4 h-4" />,
                    borderColor: 'border-orange-500',
                    textColor: 'text-orange-500'
                };
            case '커스텀':
                return {
                    icon: <Package className="w-4 h-4" />,
                    borderColor: 'border-red-500',
                    textColor: 'text-red-500'
                };
            case '시퀀스':
                return {
                    icon: <Package className="w-4 h-4" />,
                    borderColor: 'border-purple-500',
                    textColor: 'text-purple-500'
                };
            default:
                return {
                    icon: <Package className="w-4 h-4" />,
                    borderColor: 'border-gray-500',
                    textColor: 'text-gray-500'
                };
        }
    };

    // 저장
    const handleSave = async () => {
        setSaving(true);
        try {
            // 필수 필드 검증
            if (!formData.id) {
                throw new Error('멤버십 ID를 입력해주세요.');
            }
            if (!formData.info.id) {
                throw new Error('멤버십 정보 ID를 입력해주세요.');
            }
            if (!formData.info.membership_name.trim()) {
                throw new Error('멤버십명을 입력해주세요.');
            }

            // 패키지 타입별 필수 시술 ID 검증
            if (formData.package_type === '단일시술' && !formData.element_id) {
                throw new Error('단일시술 패키지의 경우 Element ID가 필요합니다.');
            }
            if (formData.package_type === '번들' && !formData.bundle_id) {
                throw new Error('번들 패키지의 경우 Bundle ID가 필요합니다.');
            }
            if (formData.package_type === '커스텀' && !formData.custom_id) {
                throw new Error('커스텀 패키지의 경우 Custom ID가 필요합니다.');
            }
            if (formData.package_type === '시퀀스' && !formData.sequence_id) {
                throw new Error('시퀀스 패키지의 경우 Sequence ID가 필요합니다.');
            }

            // API 호출을 위한 데이터 준비
            const createData: MembershipCreateData = {
                id: formData.id!,
                membership_info_id: formData.info.id!,
                payment_amount: formData.payment_amount,
                bonus_point: formData.bonus_point,
                credit: formData.credit,
                discount_rate: formData.discount_rate,
                package_type: formData.package_type,
                validity_period: formData.validity_period,
                release_start_date: formData.release_start_date || undefined,
                release_end_date: formData.release_end_date || undefined,
                release: formData.release,
                info: {
                    id: formData.info.id!,
                    membership_name: formData.info.membership_name,
                    membership_description: formData.info.membership_description,
                    precautions: formData.info.precautions,
                    release: formData.info.release
                }
            };

            // 패키지 타입별로 해당하는 시술 ID만 포함
            if (formData.package_type === '단일시술') {
                createData.element_id = formData.element_id;
            } else if (formData.package_type === '번들') {
                createData.bundle_id = formData.bundle_id;
            } else if (formData.package_type === '커스텀') {
                createData.custom_id = formData.custom_id;
            } else if (formData.package_type === '시퀀스') {
                createData.sequence_id = formData.sequence_id;
            }

        

            // API 호출을 위한 데이터 변환
            const apiData: MembershipCreateRequest = {
                id: createData.id || undefined,  // ✅ id 필드 추가
                membership_info_id: createData.membership_info_id,
                payment_amount: createData.payment_amount,
                bonus_point: createData.bonus_point,
                credit: createData.credit,
                discount_rate: createData.discount_rate,
                package_type: createData.package_type,
                validity_period: createData.validity_period,
                release_start_date: createData.release_start_date,
                release_end_date: createData.release_end_date,
                release: createData.release,
                element_id: createData.element_id,
                bundle_id: createData.bundle_id,
                custom_id: createData.custom_id,
                sequence_id: createData.sequence_id
            };

            // createMembership API 호출
            await createMembership(apiData);
            
            alert('멤버십이 성공적으로 생성되었습니다.');
            onSuccess();
            if (onRefresh) {
                await onRefresh();
            }
            handleClose();
        } catch (error: unknown) {
            console.error('멤버십 생성 실패:', error);
            alert(`멤버십 생성 중 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
        } finally {
            setSaving(false);
        }
    };

    // Element 검색
    const handleElementSearch = async (query: string) => {
        if (!query.trim()) {
            setElementSearchResults([]);
            return;
        }
        try {
            const elements = await getElementsList();
            const filtered = searchElementsByName(elements, query);
            setElementSearchResults(filtered.slice(0, 5));
        } catch (error) {
            console.error('Element 검색 실패:', error);
            setElementSearchResults([]);
        }
    };

    // Bundle 검색
    const handleBundleSearch = async (query: string) => {
        if (!query.trim()) {
            setBundleSearchResults([]);
            return;
        }
        try {
            const bundles = await getBundlesList();
            const filtered = searchBundlesByName(bundles, query);
            setBundleSearchResults(filtered.slice(0, 5));
        } catch (error) {
            console.error('Bundle 검색 실패:', error);
            setBundleSearchResults([]);
        }
    };

    // Custom 검색
    const handleCustomSearch = async (query: string) => {
        if (!query.trim()) {
            setCustomSearchResults([]);
            return;
        }
        try {
            const customs = await getCustomsList();
            const filtered = searchCustomsByName(customs, query);
            setCustomSearchResults(filtered.slice(0, 5));
        } catch (error) {
            console.error('Custom 검색 실패:', error);
            setCustomSearchResults([]);
        }
    };

    // Sequence 검색
    const handleSequenceSearch = async (query: string) => {
        if (!query.trim()) {
            setSequenceSearchResults([]);
            return;
        }
        try {
            const sequences = await getSequencesList();
            const filtered = searchSequencesByName(sequences, query);
            setSequenceSearchResults(filtered.slice(0, 5));
        } catch (error) {
            console.error('Sequence 검색 실패:', error);
            setSequenceSearchResults([]);
        }
    };

    // Element 선택
    const handleElementSelect = (element: Element) => {
        setFormData(prev => ({ ...prev, element_id: element.id }));
        setElementSearchQuery(element.name || '');
        setShowElementSearch(false);
        setElementSearchResults([]);
    };

    // Bundle 선택
    const handleBundleSelect = (bundle: BundleListResponse) => {
        setFormData(prev => ({ ...prev, bundle_id: bundle.group_id }));
        setBundleSearchQuery(bundle.name || '');
        setShowBundleSearch(false);
        setBundleSearchResults([]);
    };

    // Custom 선택
    const handleCustomSelect = (custom: CustomListResponse) => {
        setFormData(prev => ({ ...prev, custom_id: custom.group_id }));
        setCustomSearchQuery(custom.name || '');
        setShowCustomSearch(false);
        setCustomSearchResults([]);
    };

    // Sequence 선택
    const handleSequenceSelect = (sequence: SequenceListResponse) => {
        setFormData(prev => ({ ...prev, sequence_id: sequence.group_id }));
        setSequenceSearchQuery(sequence.sequence_name || '');
        setShowSequenceSearch(false);
        setSequenceSearchResults([]);
    };

    // 검색 드롭다운 외부 클릭 시 닫기
    const handleClickOutside = () => {
        setShowElementSearch(false);
        setShowBundleSearch(false);
        setShowCustomSearch(false);
        setShowSequenceSearch(false);
        setElementSearchResults([]);
        setBundleSearchResults([]);
        setCustomSearchResults([]);
        setSequenceSearchResults([]);
    };

    // 모달 닫기
    const handleClose = () => {
        // 폼 데이터 초기화
        setFormData({
            id: undefined,
            payment_amount: 0,
            bonus_point: 0,
            credit: 0,
            discount_rate: 0,
            package_type: '단일시술',
            validity_period: 30,
            release_start_date: '',
            release_end_date: '',
            release: 1,
            element_id: undefined,
            bundle_id: undefined,
            custom_id: undefined,
            sequence_id: undefined,
            info: {
                id: undefined,
                membership_name: '',
                membership_description: '',
                precautions: '',
                release: 1
            }
        });
        
        // 검색 관련 상태들 초기화
        setElementSearchQuery('');
        setBundleSearchQuery('');
        setCustomSearchQuery('');
        setSequenceSearchQuery('');
        setElementSearchResults([]);
        setBundleSearchResults([]);
        setCustomSearchResults([]);
        setSequenceSearchResults([]);
        setShowElementSearch(false);
        setShowBundleSearch(false);
        setShowCustomSearch(false);
        setShowSequenceSearch(false);
        
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center z-50 p-4 overflow-hidden" onClick={handleClickOutside}>
            <div className="bg-white rounded-xl w-full max-w-2xl h-[85vh] flex flex-col shadow-2xl border border-gray-200" onClick={(e) => e.stopPropagation()}>
                
                {/* 헤더 */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <div className="flex items-center space-x-3">
                        <h2 className="text-lg font-semibold text-gray-900">새 멤버십 생성</h2>
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
                <div className="p-4 flex-1 overflow-y-auto">
                    <div className="space-y-6">
                        
                        {/* 기본 정보 */}
                        <div>
                            <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                                <Package className="w-4 h-4 mr-2" />
                                기본 정보
                            </h3>
                            <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs text-gray-500 block mb-1">멤버십 ID *</label>
                                        <Input
                                            type="number"
                                            value={formData.id || ''}
                                            onChange={(e) => setFormData(prev => ({
                                                ...prev,
                                                id: parseInt(e.target.value) || undefined
                                            }))}
                                            className="text-sm text-gray-900 placeholder:text-gray-500 bg-white border-gray-300 focus:ring-0 focus:border-gray-300"
                                            placeholder="멤버십 ID 입력"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 block mb-1">멤버십 정보 ID *</label>
                                        <Input
                                            type="number"
                                            value={formData.info.id || ''}
                                            onChange={(e) => setFormData(prev => ({
                                                ...prev,
                                                info: { ...prev.info, id: parseInt(e.target.value) || undefined }
                                            }))}
                                            className="text-sm text-gray-900 placeholder:text-gray-500 bg-white border-gray-300 focus:ring-0 focus:border-gray-300"
                                            placeholder="멤버십 정보 ID 입력"
                                        />
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs text-gray-500 block mb-1">패키지 타입</label>
                                        <Select
                                            value={formData.package_type}
                                            onValueChange={(value) => {
                                                setFormData(prev => ({
                                                    ...prev,
                                                    package_type: value as '단일시술' | '번들' | '커스텀' | '시퀀스'
                                                }));
                                                
                                                // 패키지 타입이 변경되면 해당하지 않는 시술 ID들 초기화
                                                if (value !== '단일시술') {
                                                    setElementSearchQuery('');
                                                    setElementSearchResults([]);
                                                    setFormData(prev => ({ ...prev, element_id: undefined }));
                                                }
                                                if (value !== '번들') {
                                                    setBundleSearchQuery('');
                                                    setBundleSearchResults([]);
                                                    setFormData(prev => ({ ...prev, bundle_id: undefined }));
                                                }
                                                if (value !== '커스텀') {
                                                    setCustomSearchQuery('');
                                                    setCustomSearchResults([]);
                                                    setFormData(prev => ({ ...prev, custom_id: undefined }));
                                                }
                                                if (value !== '시퀀스') {
                                                    setSequenceSearchQuery('');
                                                    setSequenceSearchResults([]);
                                                    setFormData(prev => ({ ...prev, sequence_id: undefined }));
                                                }
                                                
                                                // 검색 드롭다운들 닫기
                                                setShowElementSearch(false);
                                                setShowBundleSearch(false);
                                                setShowCustomSearch(false);
                                                setShowSequenceSearch(false);
                                            }}
                                        >
                                            <SelectTrigger className="text-sm text-gray-900 bg-white border-gray-300 focus:ring-0 focus:border-gray-300">
                                                <SelectValue placeholder="패키지 타입 선택" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-white border-none">
                                                <SelectItem value="단일시술" className="text-sm text-gray-900">단일시술</SelectItem>
                                                <SelectItem value="번들" className="text-sm text-gray-900">번들</SelectItem>
                                                <SelectItem value="커스텀" className="text-sm text-gray-900">커스텀</SelectItem>
                                                <SelectItem value="시퀀스" className="text-sm text-gray-900">시퀀스</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 block mb-1">상태</label>
                                        <Select
                                            value={formData.release.toString()}
                                            onValueChange={(value) => setFormData(prev => ({
                                                ...prev,
                                                release: parseInt(value)
                                            }))}
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
                                
                                <div>
                                    <label className="text-xs text-gray-500 block mb-1">멤버십명 *</label>
                                    <Input
                                        value={formData.info.membership_name}
                                        onChange={(e) => setFormData(prev => ({
                                            ...prev,
                                            info: { ...prev.info, membership_name: e.target.value }
                                        }))}
                                        className="text-sm text-gray-900 placeholder:text-gray-500 bg-white border-gray-300 focus:ring-0 focus:border-gray-300"
                                        placeholder="멤버십명을 입력하세요"
                                    />
                                </div>
                                
                                <div>
                                    <label className="text-xs text-gray-500 block mb-1">멤버십 설명</label>
                                    <Textarea
                                        value={formData.info.membership_description}
                                        onChange={(e) => setFormData(prev => ({
                                            ...prev,
                                            info: { ...prev.info, membership_description: e.target.value }
                                        }))}
                                        className="text-sm text-gray-900 placeholder:text-gray-500 bg-white border-gray-300 focus:ring-0 focus:border-gray-300 min-h-[80px] resize-none"
                                        placeholder="멤버십 설명을 입력하세요"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 가격 정보 */}
                        <div>
                            <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                                <CreditCard className="w-4 h-4 mr-2" />
                                가격 정보
                            </h3>
                            <div className="bg-gray-50 rounded-lg p-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs text-gray-500 block mb-1">결제 금액</label>
                                        <Input
                                            type="number"
                                            value={formData.payment_amount || ''}
                                            onChange={(e) => setFormData(prev => ({
                                                ...prev,
                                                payment_amount: parseInt(e.target.value) || 0
                                            }))}
                                            className="text-sm text-gray-900 placeholder:text-gray-500 bg-white border-gray-300 focus:ring-0 focus:border-gray-300"
                                            placeholder="0"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 block mb-1">보너스 포인트</label>
                                        <Input
                                            type="number"
                                            value={formData.bonus_point || ''}
                                            onChange={(e) => setFormData(prev => ({
                                                ...prev,
                                                bonus_point: parseInt(e.target.value) || 0
                                            }))}
                                            className="text-sm text-gray-900 placeholder:text-gray-500 bg-white border-gray-300 focus:ring-0 focus:border-gray-300"
                                            placeholder="0"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 block mb-1">크레딧</label>
                                        <Input
                                            type="number"
                                            value={formData.credit || ''}
                                            onChange={(e) => setFormData(prev => ({
                                                ...prev,
                                                credit: parseInt(e.target.value) || 0
                                            }))}
                                            className="text-sm text-gray-900 placeholder:text-gray-500 bg-white border-gray-300 focus:ring-0 focus:border-gray-300"
                                            placeholder="0"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 block mb-1">할인율</label>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            value={formData.discount_rate !== undefined ? formData.discount_rate : '0.'}
                                            onChange={(e) => setFormData(prev => ({
                                                ...prev,
                                                discount_rate: parseFloat(e.target.value) || 0
                                            }))}
                                            className="text-sm text-gray-900 placeholder:text-gray-500 bg-white border-gray-300 focus:ring-0 focus:border-gray-300"
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 기간 정보 */}
                        <div>
                            <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                                <Calendar className="w-4 h-4 mr-2" />
                                기간 정보
                            </h3>
                            <div className="bg-gray-50 rounded-lg p-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs text-gray-500 block mb-1">유효 기간 (일)</label>
                                        <Input
                                            type="number"
                                            value={formData.validity_period || ''}
                                            onChange={(e) => setFormData(prev => ({
                                                ...prev,
                                                validity_period: parseInt(e.target.value) || 0
                                            }))}
                                            className="text-sm text-gray-900 placeholder:text-gray-500 bg-white border-gray-300 focus:ring-0 focus:border-gray-300"
                                            placeholder="30"
                                        />
                                    </div>
                                </div>
                                
                                <div className="mt-4">
                                    <label className="text-xs text-gray-500 block mb-1">릴리즈 기간</label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs text-gray-400 block mb-1">시작일</label>
                                            <Input
                                                type="date"
                                                value={formData.release_start_date?.split(' ')[0] || ''}
                                                onChange={(e) => setFormData(prev => ({
                                                    ...prev,
                                                    release_start_date: e.target.value + ' 00:00:00'
                                                }))}
                                                className="text-sm text-gray-900 placeholder:text-gray-500 bg-white border-gray-300 focus:ring-0 focus:border-gray-300"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-400 block mb-1">종료일</label>
                                            <Input
                                                type="date"
                                                value={formData.release_end_date?.split(' ')[0] || ''}
                                                onChange={(e) => setFormData(prev => ({
                                                    ...prev,
                                                    release_end_date: e.target.value + ' 00:00:00'
                                                }))}
                                                className="text-sm text-gray-900 placeholder:text-gray-500 bg-white border-gray-300 focus:ring-0 focus:border-gray-300"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 연결된 시술 정보 */}
                        <div>
                            <h3 className="text-sm font-medium text-gray-900 mb-3">연결된 시술 정보</h3>
                            <div className="bg-gray-50 rounded-lg p-4">
                                <div className="grid grid-cols-2 gap-4">
                                    {/* Element ID */}
                                    <div>
                                        <label className="text-xs text-gray-500 block mb-1">Element ID</label>
                                        <div className="relative">
                                            <Input
                                                value={elementSearchQuery}
                                                onChange={(e) => {
                                                    setElementSearchQuery(e.target.value);
                                                    debouncedElementSearch(e.target.value);
                                                }}
                                                onFocus={() => setShowElementSearch(true)}
                                                placeholder="Element 검색..."
                                                disabled={formData.package_type !== '단일시술'}
                                                className={`text-sm placeholder:text-gray-500 focus:ring-0 border-gray-300 ${
                                                    formData.package_type !== '단일시술' 
                                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                                        : 'bg-white text-gray-900'
                                                }`}
                                            />
                                            {showElementSearch && formData.package_type === '단일시술' && (
                                                <div className="absolute top-full left-0 right-0 bg-white rounded-md z-10 max-h-40 overflow-y-auto">
                                                    {elementSearchResults.map((item: Element) => (
                                                        <div
                                                            key={`element-${item.id}`}
                                                            className="p-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                                                            onClick={() => handleElementSelect(item)}
                                                        >
                                                            <div className="text-sm font-medium text-gray-900">{item.name}</div>
                                                            <div className="text-xs text-gray-500">ID: {item.id}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    {/* Bundle ID */}
                                    <div>
                                        <label className="text-xs text-gray-500 block mb-1">Bundle ID</label>
                                        <div className="relative">
                                            <Input
                                                value={bundleSearchQuery}
                                                onChange={(e) => {
                                                    setBundleSearchQuery(e.target.value);
                                                    debouncedBundleSearch(e.target.value);
                                                }}
                                                onFocus={() => setShowBundleSearch(true)}
                                                placeholder="Bundle 검색..."
                                                disabled={formData.package_type !== '번들'}
                                                className={`text-sm placeholder:text-gray-500 focus:ring-0 border-gray-300 ${
                                                    formData.package_type !== '번들' 
                                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                                        : 'bg-white text-gray-900'
                                                }`}
                                            />
                                            {showBundleSearch && formData.package_type === '번들' && (
                                                <div className="absolute top-full left-0 right-0 bg-white rounded-md shadow-lg z-10 max-h-40 overflow-y-auto">
                                                    {bundleSearchResults.map((item: BundleListResponse) => (
                                                        <div
                                                            key={`bundle-${item.group_id}`}
                                                            className="p-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                                                            onClick={() => handleBundleSelect(item)}
                                                        >
                                                            <div className="text-sm font-medium text-gray-900">{item.name}</div>
                                                            <div className="text-xs text-gray-500">ID: {item.group_id}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    {/* Custom ID */}
                                    <div>
                                        <label className="text-xs text-gray-500 block mb-1">Custom ID</label>
                                        <div className="relative">
                                            <Input
                                                value={customSearchQuery}
                                                onChange={(e) => {
                                                    setCustomSearchQuery(e.target.value);
                                                    debouncedCustomSearch(e.target.value);
                                                }}
                                                onFocus={() => setShowCustomSearch(true)}
                                                placeholder="Custom 검색..."
                                                disabled={formData.package_type !== '커스텀'}
                                                className={`text-sm placeholder:text-gray-500 focus:ring-0 border-gray-300 ${
                                                    formData.package_type !== '커스텀' 
                                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                                        : 'bg-white text-gray-900'
                                                }`}
                                            />
                                            {showCustomSearch && formData.package_type === '커스텀' && (
                                                <div className="absolute top-full left-0 right-0 bg-white rounded-md shadow-lg z-10 max-h-40 overflow-y-auto">
                                                    {customSearchResults.map((item: CustomListResponse) => (
                                                        <div
                                                            key={`custom-${item.group_id}`}
                                                            className="p-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                                                            onClick={() => handleCustomSelect(item)}
                                                        >
                                                            <div className="text-sm font-medium text-gray-900">{item.name}</div>
                                                            <div className="text-xs text-gray-500">ID: {item.group_id}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 block mb-1">Sequence ID</label>
                                        <div className="relative">
                                            <Input
                                                value={sequenceSearchQuery}
                                                onChange={(e) => {
                                                    setSequenceSearchQuery(e.target.value);
                                                    debouncedSequenceSearch(e.target.value);
                                                }}
                                                onFocus={() => setShowSequenceSearch(true)}
                                                placeholder="시퀀스 검색..."
                                                disabled={formData.package_type !== '시퀀스'}
                                                className={`text-sm placeholder:text-gray-500 focus:ring-0 border-gray-300 ${
                                                    formData.package_type !== '시퀀스' 
                                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                                        : 'bg-white text-gray-900'
                                                }`}
                                            />
                                            {showSequenceSearch && formData.package_type === '시퀀스' && (
                                                <div className="absolute top-full left-0 right-0 bg-white rounded-md shadow-lg z-10 max-h-40 overflow-y-auto">
                                                    {sequenceSearchResults.map((item: SequenceListResponse) => (
                                                        <div
                                                            key={`sequence-${item.group_id}`}
                                                            className="p-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                                                            onClick={() => handleSequenceSelect(item)}
                                                        >
                                                            <div className="text-sm font-medium text-gray-900">{item.sequence_name}</div>
                                                            <div className="text-xs text-gray-500">ID: {item.group_id}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 주의사항 */}
                        <div>
                            <h3 className="text-sm font-medium text-gray-900 mb-3">주의사항</h3>
                            <div className="bg-gray-50 rounded-lg p-4">
                                <Textarea
                                    value={formData.info.precautions}
                                    onChange={(e) => setFormData(prev => ({
                                        ...prev,
                                        info: { ...prev.info, precautions: e.target.value }
                                    }))}
                                    className="text-sm text-gray-900 placeholder:text-gray-500 bg-white border-gray-300 focus:ring-0 focus:border-gray-300 min-h-[100px] resize-none"
                                    placeholder="주의사항을 입력하세요"
                                />
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
                            onClick={handleSave}
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
