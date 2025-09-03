'use client';

import { useState, useEffect, useCallback } from 'react';
import { debounce } from 'lodash';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Edit, Save, Calendar, CreditCard, Package, Clock, ExternalLink } from 'lucide-react';
import { MembershipResponse, updateMembership } from '@/api/membership-api';
import { useModalStore } from '@/store/modal-store';
import { getElementDetail, Element, getElementsList, searchElementsByName } from '@/api/element-api';
import { getBundleDetail, BundleListResponse, getBundlesList } from '@/api/bundles-api';
import { getCustomDetail, CustomListResponse, getCustomsList } from '@/api/customs-api';
import { getSequenceDetail, SequenceListResponse, getSequencesList, searchSequencesByName } from '@/api/sequences-api';

interface MembershipDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    membership: MembershipResponse | null;
    onRefresh?: (() => Promise<void>) | null;
}

export default function MembershipDetailModal({ isOpen, onClose, onSuccess, membership, onRefresh }: MembershipDetailModalProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    
    
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

    // 연결된 시술 이름 정보
    const [connectedElementName, setConnectedElementName] = useState<string>('');
    const [connectedBundleName, setConnectedBundleName] = useState<string>('');
    const [connectedCustomName, setConnectedCustomName] = useState<string>('');
    const [connectedSequenceName, setConnectedSequenceName] = useState<string>('');

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
    
    const { openElementDetail, openBundleDetail, openCustomDetail, openSequenceDetail } = useModalStore();
    
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
    
    const [formData, setFormData] = useState<Partial<MembershipResponse>>({
        payment_amount: undefined,
        bonus_point: undefined,
        credit: undefined,
        discount_rate: undefined,
        package_type: undefined,
        validity_period: undefined,
        release_start_date: undefined,
        release_end_date: undefined,
        release: undefined,
        info: {
            id: 0,
            membership_name: '',
            membership_description: '',
            precautions: '',
            release: 1
        }
    });

    // 멤버십 데이터가 변경될 때 폼 데이터 업데이트 및 연결된 시술 이름 로드
    useEffect(() => {
        if (membership) {
            setFormData({
                id: membership.id,
                payment_amount: membership.payment_amount,
                bonus_point: membership.bonus_point,
                credit: membership.credit,
                discount_rate: membership.discount_rate,
                package_type: membership.package_type,
                validity_period: membership.validity_period,
                release_start_date: membership.release_start_date,
                release_end_date: membership.release_end_date,
                release: membership.release,
                info: membership.info || {
                    id: membership.id, // 멤버십 ID와 동일하게 설정
                    membership_name: '',
                    membership_description: '',
                    precautions: '',
                    release: 1
                }
            });

            // 연결된 시술들의 이름 로드
            loadConnectedProcedureNames();
        }
    }, [membership]);

    // 연결된 시술들의 이름을 로드하는 함수
    const loadConnectedProcedureNames = async () => {
        if (!membership) return;

        try {
            // Element 이름 로드
            if (membership.element_id) {
                try {
                    const elementData = await getElementDetail(membership.element_id);
                    setConnectedElementName(elementData.name ?? '');
                } catch (error) {
                    console.error('Element 이름 로드 실패:', error);
                    setConnectedElementName('');
                }
            } else {
                setConnectedElementName('');
            }

            // Bundle 이름 로드
            if (membership.bundle_id) {
                try {
                    const bundleData = await getBundleDetail(membership.bundle_id);
                    setConnectedBundleName(bundleData.name ?? '');
                } catch (error) {
                    console.error('Bundle 이름 로드 실패:', error);
                    setConnectedBundleName('');
                }
            } else {
                setConnectedBundleName('');
            }

            // Custom 이름 로드
            if (membership.custom_id) {
                try {
                    const customData = await getCustomDetail(membership.custom_id);
                    setConnectedCustomName(customData.name ?? '');
                } catch (error) {
                    console.error('Custom 이름 로드 실패:', error);
                    setConnectedCustomName('');
                }
            } else {
                setConnectedCustomName('');
            }

            // Sequence 이름 로드
            if (membership.sequence_id) {
                try {
                    const sequenceData = await getSequenceDetail(membership.sequence_id);
                    // Sequence의 경우 steps의 첫 번째 name을 사용
                    const sequenceName = sequenceData.steps && sequenceData.steps.length > 0 ? sequenceData.steps[0].name ?? '이름 없음' : '이름 없음';
                    setConnectedSequenceName(sequenceName);
                } catch (error) {
                    console.error('Sequence 이름 로드 실패:', error);
                    setConnectedSequenceName('');
                }
            } else {
                setConnectedSequenceName('');
            }
        } catch (error) {
            console.error('연결된 시술 이름 로드 실패:', error);
        }
    };

    // 패키지 타입 표시 텍스트
    const getDisplayText = (packageType: string) => {
        switch (packageType) {
            case '번들':
                return '패키지';
            case '시퀀스':
                return '코스 패키지';
            case '커스텀':
                return '커스텀';
            default:
                return packageType;
        }
    };

    // 수정 모드 토글
    const handleEditToggle = () => {
        if (!isEditing) {
            // 수정 모드로 전환 시 현재 값들을 검색 쿼리에 설정
            setElementSearchQuery(membership?.element_id?.toString() || '');
            setBundleSearchQuery(membership?.bundle_id?.toString() || '');
            setCustomSearchQuery(membership?.custom_id?.toString() || '');
        } else {
            // 수정 모드 종료 시 모든 변경 내용 초기화
            if (membership) {
                setFormData({
                    id: membership.id,
                    payment_amount: membership.payment_amount,
                    bonus_point: membership.bonus_point,
                    credit: membership.credit,
                    discount_rate: membership.discount_rate,
                    package_type: membership.package_type,
                    validity_period: membership.validity_period,
                    release_start_date: membership.release_start_date,
                    release_end_date: membership.release_end_date,
                    release: membership.release,
                    info: membership.info || {
                        id: membership.id, // 멤버십 ID와 동일하게 설정
                        membership_name: '',
                        membership_description: '',
                        precautions: '',
                        release: 1
                    }
                });
            }
            
            // 검색 관련 상태들 초기화
            setElementSearchQuery('');
            setBundleSearchQuery('');
            setCustomSearchQuery('');
            setElementSearchResults([]);
            setBundleSearchResults([]);
            setCustomSearchResults([]);
            setShowElementSearch(false);
            setShowBundleSearch(false);
            setShowCustomSearch(false);
        }
        setIsEditing(!isEditing);
    };

    // 저장
    const handleSave = async () => {
        if (!membership) return;
        
        setSaving(true);
        try {
            // API 호출을 위한 데이터 준비 (변경된 필드만 포함)
            const updateData: Record<string, unknown> = {};
            
            // 멤버십 ID 업데이트 (항상 포함)
            if (formData.id !== undefined) {
                updateData.id = formData.id;
            }
            
            // 기본 정보 업데이트
            if (formData.payment_amount !== undefined) updateData.payment_amount = formData.payment_amount;
            if (formData.bonus_point !== undefined) updateData.bonus_point = formData.bonus_point;
            if (formData.credit !== undefined) updateData.credit = formData.credit;
            if (formData.discount_rate !== undefined) updateData.discount_rate = formData.discount_rate;
            if (formData.package_type !== undefined) updateData.package_type = formData.package_type as '단일시술' | '번들' | '커스텀' | '시퀀스';
            if (formData.validity_period !== undefined) updateData.validity_period = formData.validity_period;
            if (formData.release_start_date !== undefined) updateData.release_start_date = formData.release_start_date;
            if (formData.release_end_date !== undefined) updateData.release_end_date = formData.release_end_date;
            if (formData.release !== undefined) updateData.release = formData.release;
            
            // 패키지 타입별로 해당하는 시술 ID만 업데이트하고 나머지는 null 처리
            const currentPackageType = formData.package_type || membership.package_type;
            const packageTypeChanged = formData.package_type !== undefined && formData.package_type !== membership.package_type;
            
            if (currentPackageType === '단일시술') {
                // 단일시술인 경우 Element ID만 포함하고 나머지는 null
                if (formData.element_id !== undefined) {
                    updateData.element_id = formData.element_id;
                } else if (membership.element_id && !packageTypeChanged) {
                    updateData.element_id = membership.element_id;
                }
                // 다른 시술 ID들은 null로 처리
                updateData.bundle_id = null;
                updateData.custom_id = null;
                updateData.sequence_id = null;
            } else if (currentPackageType === '번들') {
                // 번들인 경우 Bundle ID만 포함하고 나머지는 null
                if (formData.bundle_id !== undefined) {
                    updateData.bundle_id = formData.bundle_id;
                } else if (membership.bundle_id && !packageTypeChanged) {
                    updateData.bundle_id = membership.bundle_id;
                }
                // 다른 시술 ID들은 null로 처리
                updateData.element_id = null;
                updateData.custom_id = null;
                updateData.sequence_id = null;
            } else if (currentPackageType === '커스텀') {
                // 커스텀인 경우 Custom ID만 포함하고 나머지는 null
                if (formData.custom_id !== undefined) {
                    updateData.custom_id = formData.custom_id;
                } else if (membership.custom_id && !packageTypeChanged) {
                    updateData.custom_id = membership.custom_id;
                }
                // 다른 시술 ID들은 null로 처리
                updateData.element_id = null;
                updateData.bundle_id = null;
                updateData.sequence_id = null;
            } else if (currentPackageType === '시퀀스') {
                // 시퀀스인 경우 Sequence ID만 포함하고 나머지는 null
                if (formData.sequence_id !== undefined) {
                    updateData.sequence_id = formData.sequence_id;
                } else if (membership.sequence_id && !packageTypeChanged) {
                    updateData.sequence_id = membership.sequence_id;
                }
                // 다른 시술 ID들은 null로 처리
                updateData.element_id = null;
                updateData.bundle_id = null;
                updateData.custom_id = null;
            }
            
            // 멤버십 정보 업데이트 (항상 포함)
            const infoUpdates: Record<string, unknown> = {};
            let hasInfoUpdates = false;
            
            // 멤버십 정보 ID는 변경하지 않음 (기존 값 유지)
            if (membership.info?.id) {
                infoUpdates.id = membership.info.id;
                hasInfoUpdates = true;
            }
            
            if (formData.info?.membership_name !== undefined) {
                infoUpdates.membership_name = formData.info.membership_name;
                hasInfoUpdates = true;
            }
            if (formData.info?.membership_description !== undefined) {
                infoUpdates.membership_description = formData.info.membership_description;
                hasInfoUpdates = true;
            }
            if (formData.info?.precautions !== undefined) {
                infoUpdates.precautions = formData.info.precautions;
                hasInfoUpdates = true;
            }
            if (formData.info?.release !== undefined) {
                infoUpdates.release = formData.info.release;
                hasInfoUpdates = true;
            }
            
            if (hasInfoUpdates) {
                updateData.info = infoUpdates;
            }
            
            
            // null 값들이 명시적으로 포함되어 있는지 확인하고 정리
            const finalUpdateData = { ...updateData };
            
            // 패키지 타입별로 명시적으로 null 값 설정
            if (currentPackageType === '단일시술') {
                finalUpdateData.bundle_id = null;
                finalUpdateData.custom_id = null;
                finalUpdateData.sequence_id = null;
            } else if (currentPackageType === '번들') {
                finalUpdateData.element_id = null;
                finalUpdateData.custom_id = null;
                finalUpdateData.sequence_id = null;
            } else if (currentPackageType === '커스텀') {
                finalUpdateData.element_id = null;
                finalUpdateData.bundle_id = null;
                finalUpdateData.sequence_id = null;
            } else if (currentPackageType === '시퀀스') {
                finalUpdateData.element_id = null;
                finalUpdateData.bundle_id = null;
                finalUpdateData.custom_id = null;
            }
            
            
            // 패키지 타입별 필수 시술 ID 검증 (기존 값이 있으면 허용)
            const hasElementId = updateData.element_id || membership.element_id;
            const hasBundleId = updateData.bundle_id || membership.bundle_id;
            const hasCustomId = updateData.custom_id || membership.custom_id;
            const hasSequenceId = updateData.sequence_id || membership.sequence_id;
            
            if (currentPackageType === '단일시술' && !hasElementId) {
                throw new Error('단일시술 패키지의 경우 Element ID가 필요합니다.');
            }
            if (currentPackageType === '번들' && !hasBundleId) {
                throw new Error('번들 패키지의 경우 Bundle ID가 필요합니다.');
            }
            if (currentPackageType === '커스텀' && !hasCustomId) {
                throw new Error('커스텀 패키지의 경우 Custom ID가 필요합니다.');
            }
            if (currentPackageType === '시퀀스' && !hasSequenceId) {
                throw new Error('시퀀스 패키지의 경우 Sequence ID가 필요합니다.');
            }
            
            // updateMembership API 호출
            await updateMembership(membership.id, finalUpdateData);
            
            alert('멤버십이 성공적으로 수정되었습니다.');
            setIsEditing(false);
            onSuccess();
            if (onRefresh) {
                await onRefresh();
            }
        } catch (error: unknown) {
            console.error('멤버십 수정 실패:', error);
            alert(`멤버십 수정 중 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
        } finally {
            setSaving(false);
        }
    };

    // 삭제: 구현 예정
    const handleDelete = async () => {
        if (!membership) return;
        
        if (!confirm('정말로 이 멤버십을 삭제하시겠습니까?')) {
            return;
        }
        
        setDeleting(true);
        try {
            // TODO: deleteMembership API 호출
            console.log('삭제할 멤버십 ID:', membership.id);
            alert('멤버십이 성공적으로 삭제되었습니다.');
            onSuccess();
            if (onRefresh) {
                await onRefresh();
            }
            onClose();
        } 
        
        catch (error: unknown) {
            console.error('멤버십 삭제 실패:', error);
            alert(`멤버십 삭제 중 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
        } 
        
        finally {
            setDeleting(false);
        }
    };

    // 연결된 시술 상세보기
    const handleElementClick = async () => {
        if (membership?.element_id) {
            try {
                const elementData = await getElementDetail(membership.element_id);
                openElementDetail(elementData, onRefresh || undefined, membership);

            } 
            
            catch (error) {
                console.error('Element 상세 조회 실패:', error);
                alert('Element 상세 정보를 가져오는데 실패했습니다.');
            }
        }
    };

    const handleBundleClick = async () => {
        if (membership?.bundle_id) {
            try {
                const bundleData = await getBundleDetail(membership.bundle_id);
                openBundleDetail(bundleData, onRefresh || undefined, membership);
                
            } 
            
            catch (error) {
                console.error('Bundle 상세 조회 실패:', error);
                alert('Bundle 상세 정보를 가져오는데 실패했습니다.');
            }
        }
    };

    const handleCustomClick = async () => {
        if (membership?.custom_id) {
            try {
                const customData = await getCustomDetail(membership.custom_id);
                openCustomDetail(customData, onRefresh || undefined, membership);
            } catch (error) {
                console.error('Custom 상세 조회 실패:', error);
                alert('Custom 상세 정보를 가져오는데 실패했습니다.');
            }
        }
    };

    const handleSequenceClick = async () => {
        if (membership?.sequence_id) {
            try {
                const sequenceData = await getSequenceDetail(membership.sequence_id);
                openSequenceDetail(sequenceData, onRefresh || undefined, membership);
            } catch (error) {
                console.error('Sequence 상세 조회 실패:', error);
                alert('Sequence 상세 정보를 가져오는데 실패했습니다.');
            }
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
        setIsEditing(false);
        
        // 수정 모드에서 변경된 내용 초기화
        if (membership) {
            setFormData({
                id: membership.id,
                payment_amount: membership.payment_amount,
                bonus_point: membership.bonus_point,
                credit: membership.credit,
                discount_rate: membership.discount_rate,
                package_type: membership.package_type,
                validity_period: membership.validity_period,
                release_start_date: membership.release_start_date,
                release_end_date: membership.release_end_date,
                release: membership.release,
                info: membership.info || {
                    id: 0,
                    membership_name: '',
                    membership_description: '',
                    precautions: '',
                    release: 1
                }
            });
        }
        
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

    if (!isOpen || !membership) return null;
    
    const displayText = getDisplayText(membership.package_type);

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center z-50 p-4 overflow-hidden" onClick={handleClickOutside}>
            <div className="bg-white rounded-xl w-full max-w-2xl h-[85vh] flex flex-col shadow-2xl border border-gray-200" onClick={(e) => e.stopPropagation()}>
                
                {/* 헤더 */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <div className="flex items-center space-x-3">
                        <h2 className="text-lg font-semibold text-gray-900">멤버십 상세 정보</h2>
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
                                        <label className="text-xs text-gray-500 block mb-1">멤버십 ID</label>
                                        {isEditing ? (
                                            <Input
                                                type="number"
                                                value={formData.id || ''}
                                                onChange={(e) => setFormData(prev => ({
                                                    ...prev,
                                                    id: parseInt(e.target.value) || 0
                                                }))}
                                                className="text-sm text-gray-900 placeholder:text-gray-500 bg-white border-gray-300 focus:ring-0 focus:border-gray-300"
                                            />
                                        ) : (
                                            <p className="text-sm text-gray-900 font-medium">
                                                {membership.id}
                                            </p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 block mb-1">멤버십 정보 ID</label>
                                        <p className="text-sm text-gray-900 font-medium">
                                            {formData.info?.id || membership.info?.id || '정보 없음'} (수정 불가)
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs text-gray-500 block mb-1">멤버십명</label>
                                        {isEditing ? (
                                            <Input
                                                value={formData.info?.membership_name || ''}
                                                onChange={(e) => setFormData(prev => ({
                                                    ...prev,
                                                    info: { ...prev.info!, membership_name: e.target.value }
                                                }))}
                                                className="text-sm text-gray-900 placeholder:text-gray-500 bg-white border-gray-300 focus:ring-0 focus:border-gray-300"
                                            />
                                        ) : (
                                            <p className="text-sm text-gray-900 font-medium">
                                                {membership.info?.membership_name || '이름 없음'}
                                            </p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 block mb-1">패키지 타입</label>
                                        {isEditing ? (
                                            <Select
                                                value={formData.package_type || undefined}
                                                onValueChange={(value) => {
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        package_type: value
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
                                        ) : (
                                            <p className="text-sm text-gray-900 font-medium">
                                                {displayText}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="text-xs text-gray-500 block mb-1">멤버십 설명</label>
                                    {isEditing ? (
                                        <Textarea
                                            value={formData.info?.membership_description || ''}
                                            onChange={(e) => setFormData(prev => ({
                                                ...prev,
                                                info: { ...prev.info!, membership_description: e.target.value }
                                            }))}
                                            className="text-sm text-gray-900 placeholder:text-gray-500 bg-white border-gray-300 focus:ring-0 focus:border-gray-300 min-h-[80px] resize-none"
                                        />
                                    ) : (
                                        <p className="text-sm text-gray-900">
                                            {membership.info?.membership_description || '설명 없음'}
                                        </p>
                                    )}
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
                                        {isEditing ? (
                                            <Input
                                                type="number"
                                                value={formData.payment_amount || ''}
                                                onChange={(e) => setFormData(prev => ({
                                                    ...prev,
                                                    payment_amount: parseInt(e.target.value) || 0
                                                }))}
                                                className="text-sm text-gray-900 placeholder:text-gray-500 bg-white border-gray-300 focus:ring-0 focus:border-gray-300"
                                            />
                                        ) : (
                                            <p className="text-sm text-gray-900 font-medium">
                                                {membership.payment_amount?.toLocaleString()} 원
                                            </p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 block mb-1">보너스 포인트</label>
                                        {isEditing ? (
                                            <Input
                                                type="number"
                                                value={formData.bonus_point || ''}
                                                onChange={(e) => setFormData(prev => ({
                                                    ...prev,
                                                    bonus_point: parseInt(e.target.value) || 0
                                                }))}
                                                className="text-sm text-gray-900 placeholder:text-gray-500 bg-white border-gray-300 focus:ring-0 focus:border-gray-300"
                                            />
                                        ) : (
                                            <p className="text-sm text-gray-900 font-medium">
                                                {membership.bonus_point?.toLocaleString()} 원
                                            </p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 block mb-1">크레딧</label>
                                        {isEditing ? (
                                            <Input
                                                type="number"
                                                value={formData.credit || ''}
                                                onChange={(e) => setFormData(prev => ({
                                                    ...prev,
                                                    credit: parseInt(e.target.value) || 0
                                                }))}
                                                className="text-sm text-gray-900 placeholder:text-gray-500 bg-white border-gray-300 focus:ring-0 focus:border-gray-300"
                                            />
                                        ) : (
                                            <p className="text-sm text-gray-900 font-medium">
                                                {membership.credit?.toLocaleString()} 원
                                            </p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 block mb-1">할인율</label>
                                        {isEditing ? (
                                            <Input
                                                type="number"
                                                step="0.01"
                                                value={formData.discount_rate !== undefined ? formData.discount_rate : '0.'}
                                                onChange={(e) => setFormData(prev => ({
                                                    ...prev,
                                                    discount_rate: parseFloat(e.target.value) || 0
                                                }))}
                                                className="text-sm text-gray-900 placeholder:text-gray-500 bg-white border-gray-300 focus:ring-0 focus:border-gray-300"
                                            />
                                        ) : (
                                            <p className="text-sm text-gray-900 font-medium flex items-center">
                                                {(membership.discount_rate * 100).toFixed(1)}%
                                            </p>
                                        )}
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
                                        <label className="text-xs text-gray-500 block mb-1">유효 기간</label>
                                        {isEditing ? (
                                            <Input
                                                type="number"
                                                value={formData.validity_period || ''}
                                                onChange={(e) => setFormData(prev => ({
                                                    ...prev,
                                                    validity_period: parseInt(e.target.value) || 0
                                                }))}
                                                className="text-sm text-gray-900 placeholder:text-gray-500 bg-white border-gray-300 focus:ring-0 focus:border-gray-300"
                                            />
                                        ) : (
                                            <p className="text-sm text-gray-900 font-medium flex items-center">
                                                <Clock className="w-3 h-3 mr-1" />
                                                {membership.validity_period}일
                                            </p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 block mb-1">상태</label>
                                        {isEditing ? (
                                            <Select
                                                value={formData.release?.toString() || undefined}
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
                                        ) : (
                                            <p className="text-sm text-gray-900 font-medium">
                                                {membership.release === 1 ? '활성화' : '비활성화'}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="mt-4">
                                    <label className="text-xs text-gray-500 block mb-1">릴리즈 기간</label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs text-gray-400 block mb-1">시작일</label>
                                            {isEditing ? (
                                                <Input
                                                    type="date"
                                                    value={formData.release_start_date?.split(' ')[0] || ''}
                                                    onChange={(e) => setFormData(prev => ({
                                                        ...prev,
                                                        release_start_date: e.target.value + ' 00:00:00'
                                                    }))}
                                                    className="text-sm text-gray-900 placeholder:text-gray-500 bg-white border-gray-300 focus:ring-0 focus:border-gray-300"
                                                />
                                            ) : (
                                                <p className="text-sm text-gray-900">
                                                    {membership.release_start_date?.split(' ')[0] || '미정'}
                                                </p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-400 block mb-1">종료일</label>
                                            {isEditing ? (
                                                <Input
                                                    type="date"
                                                    value={formData.release_end_date?.split(' ')[0] || ''}
                                                    onChange={(e) => setFormData(prev => ({
                                                        ...prev,
                                                        release_end_date: e.target.value + ' 00:00:00'
                                                    }))}
                                                    className="text-sm text-gray-900 placeholder:text-gray-500 bg-white border-gray-300 focus:ring-0 focus:border-gray-300"
                                                />
                                            ) : (
                                                <p className="text-sm text-gray-900">
                                                    {membership.release_end_date?.split(' ')[0] || '미정'}
                                                </p>
                                            )}
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
                                        <label className="text-xs text-gray-500 block mb-1">단일시술</label>
                                        {isEditing ? (
                                            <div className="relative">
                                                <Input
                                                    value={elementSearchQuery}
                                                    onChange={(e) => {
                                                        setElementSearchQuery(e.target.value);
                                                        debouncedElementSearch(e.target.value);
                                                    }}
                                                    onFocus={() => setShowElementSearch(true)}
                                                    placeholder="단일시술 검색..."
                                                    disabled={formData.package_type !== '단일시술'}
                                                    className={`text-sm placeholder:text-gray-500 border-gray-300 focus:ring-0 focus:border-gray-300 ${
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
                                        ) : (
                                            membership.element_id ? (
                                                <div 
                                                    className="flex items-center justify-between p-2 bg-white rounded cursor-pointer hover:bg-gray-50 transition-colors"
                                                    onClick={handleElementClick}
                                                >
                                                    <div className="flex flex-col">
                                                        <span className="text-sm text-gray-900 font-medium">
                                                            {connectedElementName || `ID: ${membership.element_id}`}
                                                        </span>
                                                        {!connectedElementName && (
                                                            <span className="text-xs text-gray-500">
                                                                ID: {membership.element_id}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <ExternalLink className="w-4 h-4 text-blue-500" />
                                                </div>
                                            ) : (
                                                <p className="text-sm text-gray-400">-</p>
                                            )
                                        )}
                                    </div>
                                    {/* Bundle ID */}
                                    <div>
                                        <label className="text-xs text-gray-500 block mb-1">패키지</label>
                                        {isEditing ? (
                                            <div className="relative">
                                                <Input
                                                    value={bundleSearchQuery}
                                                    onChange={(e) => {
                                                        setBundleSearchQuery(e.target.value);
                                                        debouncedBundleSearch(e.target.value);
                                                    }}
                                                    onFocus={() => setShowBundleSearch(true)}
                                                    placeholder="패키지 검색..."
                                                    disabled={formData.package_type !== '번들'}
                                                    className={`text-sm placeholder:text-gray-500 border-gray-300 focus:ring-0 focus:border-gray-300 ${
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
                                        ) : (
                                            membership.bundle_id ? (
                                                <div 
                                                    className="flex items-center justify-between p-2 bg-white rounded border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors"
                                                    onClick={handleBundleClick}
                                                >
                                                    <div className="flex flex-col">
                                                        <span className="text-sm text-gray-900 font-medium">
                                                            {connectedBundleName || `ID: ${membership.bundle_id}`}
                                                        </span>
                                                        {!connectedBundleName && (
                                                            <span className="text-xs text-gray-500">
                                                                ID: {membership.bundle_id}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <ExternalLink className="w-4 h-4 text-blue-500" />
                                                </div>
                                            ) : (
                                                <p className="text-sm text-gray-400">-</p>
                                            )
                                        )}
                                    </div>
                                    {/* Custom ID */}
                                    <div>
                                        <label className="text-xs text-gray-500 block mb-1">커스텀</label>
                                        {isEditing ? (
                                            <div className="relative">
                                                <Input
                                                    value={customSearchQuery}
                                                    onChange={(e) => {
                                                        setCustomSearchQuery(e.target.value);
                                                        debouncedCustomSearch(e.target.value);
                                                    }}
                                                    onFocus={() => setShowCustomSearch(true)}
                                                    placeholder="커스텀 검색"
                                                    disabled={formData.package_type !== '커스텀'}
                                                    className={`text-sm placeholder:text-gray-500 border-gray-300 focus:ring-0 ${
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
                                        ) : (
                                            membership.custom_id ? (
                                                <div 
                                                    className="flex items-center justify-between p-2 bg-white rounded border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors"
                                                    onClick={handleCustomClick}
                                                >
                                                    <div className="flex flex-col">
                                                        <span className="text-sm text-gray-900 font-medium">
                                                            {connectedCustomName || `ID: ${membership.custom_id}`}
                                                        </span>
                                                        {!connectedCustomName && (
                                                            <span className="text-xs text-gray-500">
                                                                ID: {membership.custom_id}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <ExternalLink className="w-4 h-4 text-blue-500" />
                                                </div>
                                            ) : (
                                                <p className="text-sm text-gray-400">-</p>
                                            )
                                        )}
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 block mb-1">코스 패키지</label>
                                        {isEditing ? (
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
                                                    className={`text-sm placeholder:text-gray-500 border-gray-300 focus:ring-0 focus:border-gray-300 ${
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
                                        ) : (
                                            membership.sequence_id ? (
                                                <div 
                                                    className="flex items-center justify-between p-2 bg-white rounded border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors"
                                                    onClick={handleSequenceClick}
                                                >
                                                    <div className="flex flex-col">
                                                        <span className="text-sm text-gray-900 font-medium">
                                                            {connectedSequenceName || `ID: ${membership.sequence_id}`}
                                                        </span>
                                                        {!connectedSequenceName && (
                                                            <span className="text-xs text-gray-500">
                                                                ID: {membership.sequence_id}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <ExternalLink className="w-4 h-4 text-blue-500" />
                                                </div>
                                            ) : (
                                                <p className="text-sm text-gray-400">-</p>
                                            )
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 주의사항 */}
                        <div>
                            <h3 className="text-sm font-medium text-gray-900 mb-3">주의사항</h3>
                            <div className="bg-gray-50 rounded-lg p-4">
                                {isEditing ? (
                                    <Textarea
                                        value={formData.info?.precautions || ''}
                                        onChange={(e) => setFormData(prev => ({
                                            ...prev,
                                            info: { ...prev.info!, precautions: e.target.value }
                                        }))}
                                        className="text-sm text-gray-900 placeholder:text-gray-500 bg-white border-gray-300 focus:ring-0 focus:border-gray-300 min-h-[100px] resize-none"
                                        placeholder="주의사항을 입력하세요"
                                    />
                                ) : (
                                    <p className="text-sm text-gray-900 whitespace-pre-wrap">
                                        {membership.info?.precautions || '주의사항 없음'}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 하단 버튼 */}
                <div className="p-4 border-t border-gray-200 flex-shrink-0">
                    <div className="flex space-x-3">
                        {!isEditing ? (
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
                                    className="flex-1 bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700"
                                >
                                    <Edit className="w-4 h-4 mr-2" />
                                    수정
                                </Button>
                            </>
                        ) : (
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
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
