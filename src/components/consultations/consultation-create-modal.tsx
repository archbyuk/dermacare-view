'use client'

import { useState, useMemo, useEffect, useRef } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, User, CreditCard, MessageSquare, ShoppingBag, Star, Search, X, AlertTriangle } from 'lucide-react';
import { useTreatmentsStore } from '@/store/treatments-store';
import { Product } from '@/types/treatments';
import { useSearch, TreatmentData, SearchResult } from '@/hooks/useSearch';
import { getMembershipList, MembershipResponse } from '@/api/membership-api';
import { createConsultation } from '@/api/consultations-api';
import { ConsultationCreateRequest } from '@/types/consultations';

interface ConsultationCreateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: ConsultationFormData) => void;
}

export interface ConsultationFormData {
    // 필수 필드
    consultation_date: string;
    start_time: string;
    end_time: string;
    customer_name: string;
    chart_number: number;
    inflow_path: string;
    consultation_type: string;
    goal_treatment: boolean;
    concern_type: string;
    is_upselling: boolean;
    consultation_content: string;
    
    // 선택 필드
    purchased_items?: string[];
    has_membership?: string[];
    payment_type?: string;
    discount_rate?: number;
    total_payment?: number;
}

export default function ConsultationCreateModal({ 
    isOpen, 
    onClose, 
    onSubmit 
}: ConsultationCreateModalProps) {
    // 오늘 날짜와 현재 시간을 자동으로 설정
    const getTodayDate = () => {
        const today = new Date();
        return today.toISOString().split('T')[0]; // YYYY-MM-DD 형식
    };

    const getCurrentTime = () => {
        const now = new Date();
        return now.toTimeString().slice(0, 5); // HH:MM 형식
    };

    const [formData, setFormData] = useState<ConsultationFormData>({
        consultation_date: getTodayDate(),
        start_time: getCurrentTime(),
        end_time: '',
        customer_name: '',
        chart_number: 0,
        inflow_path: '',
        consultation_type: '',
        goal_treatment: false,
        concern_type: '',
        is_upselling: false,
        consultation_content: '',
        purchased_items: [],
        has_membership: [],
        payment_type: '',
        discount_rate: 0,
        total_payment: 0,
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    
    // 상품 검색 관련 상태
    const [productSearchQuery, setProductSearchQuery] = useState('');
    const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
    const [showProductSearch, setShowProductSearch] = useState(false);
    
    // 멤버십 검색 관련 상태
    const [membershipSearchQuery, setMembershipSearchQuery] = useState('');
    const [selectedMemberships, setSelectedMemberships] = useState<MembershipResponse[]>([]);
    const [showMembershipSearch, setShowMembershipSearch] = useState(false);
    const [memberships, setMemberships] = useState<MembershipResponse[]>([]);
    
    // 모달 닫기 확인 상태
    const [showCloseConfirm, setShowCloseConfirm] = useState(false);
    
    // 검색 결과 외부 클릭 감지를 위한 ref
    const productSearchRef = useRef<HTMLDivElement>(null);
    const membershipSearchRef = useRef<HTMLDivElement>(null);
    
    // zustand store에서 상품 데이터 가져오기
    const { treatments, fetchTreatments } = useTreatmentsStore();

    // useSearch 훅 사용
    const {
        searchQuery,
        searchResults,
        setSearchQuery,
        hasSearched,
        isEmpty
    } = useSearch(treatments as TreatmentData[], {
        minQueryLength: 1,
        debounceDelay: 300,
        enableChosungSearch: true
    });

    // 상품 검색 함수
    const handleProductSearch = (query: string) => {
        setProductSearchQuery(query);
        setSearchQuery(query);
    };

    // 상품 선택 함수
    const handleProductSelect = (product: SearchResult) => {
        // useSearch 결과를 Product 타입으로 변환
        const selectedProductData: Product = {
            ID: product.ID,
            Product_Type: product.Product_Type,
            Package_Type: product.Package_Type,
            Sell_Price: product.Sell_Price,
            Original_Price: product.Original_Price,
            Product_Name: product.Product_Name,
            Validity_Period: 0,
            class_types: product.class_types || [],
            procedure_names: product.elements || [],
            procedure_count: product.class_type_count || 0,
            class_type_count: product.class_type_count || 0,
            Product_Description: product.Precautions
        } as Product;
        
        // 이미 선택된 상품인지 확인
        const isAlreadySelected = selectedProducts.some(p => p.ID === product.ID);
        if (isAlreadySelected) {
            alert('이미 선택된 상품입니다.');
            return;
        }
        
        // 상품을 배열에 추가하고 formData 업데이트
        setSelectedProducts(prev => {
            const updatedProducts = [...prev, selectedProductData];
            console.log('상품 선택 - 업데이트된 상품들:', updatedProducts);
            
            // formData에 상품 정보 반영 (할인율 적용)
            setFormData(prevForm => {
                const currentDiscountRate = prevForm.discount_rate || 0;
                const totalOriginalAmount = updatedProducts.reduce((sum, p) => sum + (p.Sell_Price || 0), 0);
                const discountedTotal = calculateDiscountedTotal(totalOriginalAmount, currentDiscountRate);
                
                console.log('상품 선택 - 할인율 계산:', {
                    currentDiscountRate,
                    totalOriginalAmount,
                    discountedTotal
                });
                
                return {
                    ...prevForm,
                    purchased_items: [...(prevForm.purchased_items || []), product.Product_Name || `상품 ${product.ID}`],
                    total_payment: discountedTotal
                };
            });
            
            return updatedProducts;
        });
        
        setProductSearchQuery('');
        setShowProductSearch(false);
    };

    // 상품 선택 해제 함수
    const handleProductRemove = (productId: number) => {
        console.log('상품 제거 - 제거할 상품 ID:', productId);
        
        setSelectedProducts(prev => {
            const updatedProducts = prev.filter(p => p.ID !== productId);
            console.log('상품 제거 - 업데이트된 상품들:', updatedProducts);
            
            setFormData(prevForm => {
                const currentDiscountRate = prevForm.discount_rate || 0;
                const totalOriginalAmount = updatedProducts.reduce((sum, p) => sum + (p.Sell_Price || 0), 0);
                const discountedTotal = calculateDiscountedTotal(totalOriginalAmount, currentDiscountRate);
                
                console.log('상품 제거 - 할인율 계산:', {
                    currentDiscountRate,
                    totalOriginalAmount,
                    discountedTotal
                });
                
                return {
                    ...prevForm,
                    purchased_items: updatedProducts.map(p => p.Product_Name || `상품 ${p.ID}`),
                    total_payment: discountedTotal
                };
            });
            
            return updatedProducts;
        });
    };

    // 멤버십 검색 함수
    const handleMembershipSearch = (query: string) => {
        setMembershipSearchQuery(query);
    };

    // 멤버십 선택 함수
    const handleMembershipSelect = (membership: MembershipResponse) => {
        // 이미 선택된 멤버십인지 확인
        const isAlreadySelected = selectedMemberships.some(m => m.id === membership.id);
        if (isAlreadySelected) {
            alert('이미 선택된 멤버십입니다.');
            return;
        }
        
        // 멤버십을 배열에 추가
        setSelectedMemberships(prev => {
            const updatedMemberships = [...prev, membership];
            
            setFormData(prevForm => ({
                ...prevForm,
                has_membership: updatedMemberships.map(m => m.info?.membership_name || `멤버십 ${m.id}`)
            }));
            
            return updatedMemberships;
        });
        
        setMembershipSearchQuery('');
        setShowMembershipSearch(false);
    };

    // 멤버십 선택 해제 함수
    const handleMembershipRemove = (membershipId: number) => {
        setSelectedMemberships(prev => {
            const updatedMemberships = prev.filter(m => m.id !== membershipId);
            setFormData(prevForm => ({
                ...prevForm,
                has_membership: updatedMemberships.map(m => m.info?.membership_name || `멤버십 ${m.id}`)
            }));
            return updatedMemberships;
        });
    };

    // 멤버십 데이터 로드 함수
    const loadMemberships = async () => {
        try {
            const membershipData = await getMembershipList();
            setMemberships(membershipData);
        } catch (error) {
            console.error('멤버십 데이터 로드 실패:', error);
        }
    };

    // 외부 클릭 감지로 검색 결과 닫기
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            // 상품 검색 결과 닫기
            if (productSearchRef.current && !productSearchRef.current.contains(event.target as Node)) {
                setShowProductSearch(false);
            }
            
            // 멤버십 검색 결과 닫기
            if (membershipSearchRef.current && !membershipSearchRef.current.contains(event.target as Node)) {
                setShowMembershipSearch(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // 멤버십 검색 결과 필터링
    const filteredMemberships = memberships.filter(membership => {
        if (!membershipSearchQuery.trim()) return false;
        const query = membershipSearchQuery.toLowerCase();
        return (
            membership.info?.membership_name?.toLowerCase().includes(query) ||
            membership.info?.membership_description?.toLowerCase().includes(query) ||
            membership.package_type.toLowerCase().includes(query)
        );
    });

    // 할인율 적용된 총 결제액 계산
    const calculateDiscountedTotal = (originalAmount: number, discountRate: number) => {
        if (!discountRate || discountRate <= 0) return originalAmount;
        const discountAmount = originalAmount * (discountRate / 100);
        return Math.max(0, originalAmount - discountAmount);
    };

    // 할인율 변경 시 총 결제액 자동 업데이트
    const handleDiscountRateChange = (value: number) => {
        console.log('할인율 변경 - 입력값:', value);
        console.log('할인율 변경 - 현재 선택된 상품들:', selectedProducts);
        
        setFormData(prev => {
            const newDiscountRate = Math.max(0, Math.min(10, value)); // 0~10% 제한
            const totalOriginalAmount = selectedProducts.reduce((sum, product) => sum + (product.Sell_Price || 0), 0);
            const discountedTotal = calculateDiscountedTotal(totalOriginalAmount, newDiscountRate);
            
            console.log('할인율 변경 - 계산 결과:', {
                newDiscountRate,
                totalOriginalAmount,
                discountedTotal
            });
            
            return {
                ...prev,
                discount_rate: newDiscountRate,
                total_payment: discountedTotal
            };
        });
    };

    // 상품 검색 토글
    const toggleProductSearch = () => {
        setShowProductSearch(!showProductSearch);
        if (!showProductSearch) {
            fetchTreatments(); // 상품 데이터 로드
        }
    };

    const handleInputChange = (field: keyof ConsultationFormData, value: string | number | boolean) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        
        // 에러 메시지 제거
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: ''
            }));
        }
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        // 필수 필드 검증
        if (!formData.consultation_date) newErrors.consultation_date = '상담 일자를 입력해주세요';
        if (!formData.start_time) newErrors.start_time = '시작 시간을 입력해주세요';
        if (!formData.customer_name.trim()) newErrors.customer_name = '고객명을 입력해주세요';
        if (!formData.chart_number || formData.chart_number <= 0) newErrors.chart_number = '차트번호를 입력해주세요';
        if (!formData.inflow_path.trim()) newErrors.inflow_path = '유입경로를 입력해주세요';
        if (!formData.consultation_type.trim()) newErrors.consultation_type = '상담유형을 입력해주세요';
        if (!formData.concern_type.trim()) newErrors.concern_type = '고민유형을 입력해주세요';
        if (!formData.consultation_content.trim()) newErrors.consultation_content = '상담내용을 입력해주세요';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (validateForm()) {
            try {
                // 등록 시점에 종료 시간을 현재 시간으로 설정
                const endTime = getCurrentTime();
                const finalFormData = {
                    ...formData,
                    end_time: endTime
                };
                
                // API 호출을 위한 데이터 변환
                const consultationData: ConsultationCreateRequest = {
                    consultation_date: finalFormData.consultation_date, // YYYY-MM-DD 형식
                    start_time: finalFormData.start_time, // HH:MM 형식
                    end_time: finalFormData.end_time, // HH:MM 형식
                    customer_name: finalFormData.customer_name,
                    chart_number: finalFormData.chart_number,
                    inflow_path: finalFormData.inflow_path,
                    consultation_type: finalFormData.consultation_type,
                    goal_treatment: finalFormData.goal_treatment,
                    concern_type: finalFormData.concern_type,
                    purchased_items: finalFormData.purchased_items && finalFormData.purchased_items.length > 0 ? finalFormData.purchased_items.join(', ') : undefined,
                    is_upselling: finalFormData.is_upselling,
                    has_membership: finalFormData.has_membership && finalFormData.has_membership.length > 0 ? finalFormData.has_membership.join(', ') : undefined,
                    payment_type: finalFormData.payment_type || undefined,
                    consultation_content: finalFormData.consultation_content,
                    discount_rate: finalFormData.discount_rate || undefined,
                    total_payment: finalFormData.total_payment || undefined
                };
                
                console.log('상담 등록 데이터:', consultationData);
                console.log('상담 등록 데이터 타입 확인:', {
                    consultation_date: typeof consultationData.consultation_date,
                    start_time: typeof consultationData.start_time,
                    end_time: typeof consultationData.end_time,
                    chart_number: typeof consultationData.chart_number,
                    goal_treatment: typeof consultationData.goal_treatment,
                    is_upselling: typeof consultationData.is_upselling,
                    purchased_items: consultationData.purchased_items,
                    has_membership: consultationData.has_membership
                });
                
                // API 호출
                const response = await createConsultation(consultationData);
                
                if (response.success) {
                    alert(response.message);
                    onSubmit(finalFormData);
                    handleClose();
                } else {
                    alert('상담 등록에 실패했습니다.');
                }
            } catch (error: unknown) {
                console.error('상담 등록 에러:', error);
                
                // 422 에러의 경우 상세 정보 표시
                if (error && typeof error === 'object' && 'response' in error) {
                    const axiosError = error as { response?: { status?: number; data?: unknown } };
                    if (axiosError.response?.status === 422) {
                        console.error('422 에러 상세:', axiosError.response.data);
                        alert(`데이터 유효성 검사 실패: ${JSON.stringify(axiosError.response.data)}`);
                        return;
                    }
                }
                
                const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
                alert(`상담 등록 중 오류가 발생했습니다: ${errorMessage}`);
            }
        }
    };

    const handleReset = () => {
        setFormData({
            consultation_date: getTodayDate(),
            start_time: getCurrentTime(),
            end_time: '',
            customer_name: '',
            chart_number: 0,
            inflow_path: '',
            consultation_type: '',
            goal_treatment: false,
            concern_type: '',
            is_upselling: false,
            consultation_content: '',
            purchased_items: [],
            has_membership: [],
            payment_type: '',
            discount_rate: 0,
            total_payment: 0,
        });
        setErrors({});
        
        // 상품 검색 상태 초기화
        setSelectedProducts([]);
        setProductSearchQuery('');
        setShowProductSearch(false);
        
        // 멤버십 검색 상태 초기화
        setSelectedMemberships([]);
        setMembershipSearchQuery('');
        setShowMembershipSearch(false);
    };

    // 모달 닫기 확인
    const handleCloseConfirm = () => {
        setShowCloseConfirm(true);
    };
    
    // 실제 닫기 실행
    const handleClose = () => {
        handleReset();
        setShowCloseConfirm(false);
        onClose();
    };
    
    // 닫기 취소
    const handleCloseCancel = () => {
        setShowCloseConfirm(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={() => {
            // 배경 클릭이나 ESC 키로 닫는 것을 차단
            // 아무것도 하지 않음
        }}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white" showCloseButton={false}>
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <DialogTitle className="text-xl font-semibold flex items-center gap-2">
                            <User className="w-5 h-5" />
                            새 상담 등록
                        </DialogTitle>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleCloseConfirm}
                            className="h-8 w-8 text-gray-500 hover:text-gray-700"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                    <DialogDescription>
                        상담 정보를 입력하여 새로운 상담을 등록합니다
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* 기본 정보 */}
                    <div className="border rounded-lg p-4">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Calendar className="w-5 h-5" />
                            기본 정보
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="consultation_date" className="text-sm font-medium">
                                    상담 일자 <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="consultation_date"
                                    type="date"
                                    value={formData.consultation_date}
                                    onChange={(e) => handleInputChange('consultation_date', e.target.value)}
                                    className={`${errors.consultation_date ? 'border-red-500' : ''} bg-gray-100 cursor-not-allowed`}
                                    readOnly
                                />
                                {errors.consultation_date && (
                                    <p className="text-red-500 text-xs mt-1">{errors.consultation_date}</p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="customer_name" className="text-sm font-medium">
                                    고객명 <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="customer_name"
                                    value={formData.customer_name}
                                    onChange={(e) => handleInputChange('customer_name', e.target.value)}
                                    placeholder="고객명을 입력하세요"
                                    maxLength={50}
                                    className={errors.customer_name ? 'border-red-500' : ''}
                                />
                                {errors.customer_name && (
                                    <p className="text-red-500 text-xs mt-1">{errors.customer_name}</p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="chart_number" className="text-sm font-medium">
                                    차트번호 <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="chart_number"
                                    type="number"
                                    value={formData.chart_number || ''}
                                    onChange={(e) => handleInputChange('chart_number', parseInt(e.target.value) || 0)}
                                    placeholder="차트번호를 입력하세요"
                                    className={errors.chart_number ? 'border-red-500' : ''}
                                />
                                {errors.chart_number && (
                                    <p className="text-red-500 text-xs mt-1">{errors.chart_number}</p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="start_time" className="text-sm font-medium">
                                    시작 시간 <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="start_time"
                                    type="time"
                                    value={formData.start_time}
                                    onChange={(e) => handleInputChange('start_time', e.target.value)}
                                    className={`${errors.start_time ? 'border-red-500' : ''} bg-gray-100 cursor-not-allowed`}
                                    readOnly
                                />
                                {errors.start_time && (
                                    <p className="text-red-500 text-xs mt-1">{errors.start_time}</p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="end_time" className="text-sm font-medium">
                                    종료 시간 <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="end_time"
                                    type="time"
                                    value={formData.end_time}
                                    readOnly
                                    className="bg-gray-100 cursor-not-allowed"
                                    placeholder="등록 시 자동으로 설정됩니다"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    등록하기 버튼을 클릭하는 순간 자동으로 설정됩니다
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* 상담 정보 */}
                    <div className="border rounded-lg p-4">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <MessageSquare className="w-5 h-5" />
                            상담 정보
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="inflow_path" className="text-sm font-medium">
                                    유입경로 <span className="text-red-500">*</span>
                                </Label>
                                <Select value={formData.inflow_path} onValueChange={(value) => handleInputChange('inflow_path', value)}>
                                    <SelectTrigger className={errors.inflow_path ? 'border-red-500' : ''}>
                                        <SelectValue placeholder="유입경로를 선택하세요" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="판촉물">판촉물</SelectItem>
                                        <SelectItem value="워크인">워크인</SelectItem>
                                        <SelectItem value="지인 소개">지인 소개</SelectItem>
                                        <SelectItem value="DB 마케팅">DB 마케팅</SelectItem>
                                        <SelectItem value="구글 검색">구글 검색</SelectItem>
                                        <SelectItem value="로컬 마케팅">로컬 마케팅</SelectItem>
                                        <SelectItem value="네이버 검색">네이버 검색</SelectItem>
                                        <SelectItem value="네이버 카페">네이버 카페</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.inflow_path && (
                                    <p className="text-red-500 text-xs mt-1">{errors.inflow_path}</p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="consultation_type" className="text-sm font-medium">
                                    상담유형 <span className="text-red-500">*</span>
                                </Label>
                                <Select value={formData.consultation_type} onValueChange={(value) => handleInputChange('consultation_type', value)}>
                                    <SelectTrigger className={errors.consultation_type ? 'border-red-500' : ''}>
                                        <SelectValue placeholder="상담유형을 선택하세요" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="신환상담">신환상담</SelectItem>
                                        <SelectItem value="경과상담">경과상담</SelectItem>
                                        <SelectItem value="종료 상담">종료 상담</SelectItem>
                                        <SelectItem value="재방상담">재방상담</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.consultation_type && (
                                    <p className="text-red-500 text-xs mt-1">{errors.consultation_type}</p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="concern_type" className="text-sm font-medium">
                                    고민유형 <span className="text-red-500">*</span>
                                </Label>
                                <Select value={formData.concern_type} onValueChange={(value) => handleInputChange('concern_type', value)}>
                                    <SelectTrigger className={errors.concern_type ? 'border-red-500' : ''}>
                                        <SelectValue placeholder="고민유형을 선택하세요" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="필러">필러</SelectItem>
                                        <SelectItem value="제모">제모</SelectItem>
                                        <SelectItem value="결혼">결혼</SelectItem>
                                        <SelectItem value="리프팅">리프팅</SelectItem>
                                        <SelectItem value="점제거">점제거</SelectItem>
                                        <SelectItem value="보톡스">보톡스</SelectItem>
                                        <SelectItem value="색소치료">색소치료</SelectItem>
                                        <SelectItem value="피부관리">피부관리</SelectItem>
                                        <SelectItem value="실리프팅">실리프팅</SelectItem>
                                        <SelectItem value="기본상담">기본상담</SelectItem>
                                        <SelectItem value="스킨부스트">스킨부스트</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.concern_type && (
                                    <p className="text-red-500 text-xs mt-1">{errors.concern_type}</p>
                                )}
                            </div>

                            <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="goal_treatment"
                                        checked={formData.goal_treatment}
                                        onCheckedChange={(checked) => handleInputChange('goal_treatment', checked as boolean)}
                                    />
                                    <Label htmlFor="goal_treatment" className="text-sm font-medium">
                                        목표시술 여부
                                    </Label>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="is_upselling"
                                        checked={formData.is_upselling}
                                        onCheckedChange={(checked) => handleInputChange('is_upselling', checked as boolean)}
                                    />
                                    <Label htmlFor="is_upselling" className="text-sm font-medium">
                                        업셀링 여부
                                    </Label>
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="consultation_content" className="text-sm font-medium">
                                    상담내용 <span className="text-red-500">*</span>
                                </Label>
                                <Textarea
                                    id="consultation_content"
                                    value={formData.consultation_content}
                                    onChange={(e) => handleInputChange('consultation_content', e.target.value)}
                                    placeholder="상담 내용을 상세히 입력하세요"
                                    rows={4}
                                    className={errors.consultation_content ? 'border-red-500' : ''}
                                />
                                {errors.consultation_content && (
                                    <p className="text-red-500 text-xs mt-1">{errors.consultation_content}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* 결제 정보 */}
                    <div className="border rounded-lg p-4">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <CreditCard className="w-5 h-5" />
                            결제 정보 (선택사항)
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label className="text-sm font-medium">
                                    구매상품
                                </Label>
                                <div className="space-y-2">
                                    {/* 상품 검색 입력 */}
                                    <div className="relative">
                                        <Input
                                            value={productSearchQuery}
                                            onChange={(e) => handleProductSearch(e.target.value)}
                                            onFocus={() => {
                                                setShowProductSearch(true);
                                                fetchTreatments(); // 데이터 미리 로드
                                            }}
                                            placeholder="상품명을 검색하세요"
                                            className="pr-10"
                                        />
                                        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    </div>
                                    
                                    {/* 선택된 상품 정보 */}
                                    {selectedProducts.length > 0 && (
                                        <div className="space-y-2">
                                            {selectedProducts.map((product) => (
                                                <div key={product.ID} className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                                                    <div className="flex justify-between items-start">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <h4 className="font-medium text-blue-900">
                                                                    {product.Product_Name || `상품 ${product.ID}`}
                                                                </h4>
                                                                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                                    product.Product_Type === 'event' 
                                                                        ? 'bg-red-100 text-red-700' 
                                                                        : 'bg-blue-100 text-blue-700'
                                                                }`}>
                                                                    {product.Product_Type === 'event' ? '이벤트' : '스탠다드'}
                                                                </div>
                                                            </div>
                                                            <div className="text-sm text-blue-700 mt-1">
                                                                <div>타입: {product.Package_Type}</div>
                                                                <div>가격: {product.Sell_Price?.toLocaleString()}원</div>
                                                                {product.class_types && product.class_types.length > 0 && (
                                                                    <div>시술: {product.class_types.slice(0, 3).join(', ')}</div>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() => handleProductRemove(product.ID)}
                                                            className="text-blue-500 hover:text-blue-700"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    
                                    {/* 검색 결과 드롭다운 */}
                                    {showProductSearch && (
                                        <div ref={productSearchRef} className="absolute z-50 w-80 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                                            {searchResults.length > 0 ? (
                                                searchResults.map((product) => (
                                                    <div
                                                        key={product.ID}
                                                        onClick={() => handleProductSelect(product)}
                                                        className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <div className="font-medium">
                                                                {product.Product_Name || `상품 ${product.ID}`}
                                                            </div>
                                                            <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                                product.Product_Type === 'event' 
                                                                    ? 'bg-red-100 text-red-700' 
                                                                    : 'bg-blue-100 text-blue-700'
                                                            }`}>
                                                                {product.Product_Type === 'event' ? '이벤트' : '스탠다드'}
                                                            </div>
                                                        </div>
                                                        <div className="text-sm text-gray-600">
                                                            {product.Package_Type} • {product.Sell_Price?.toLocaleString()}원
                                                        </div>
                                                        {product.class_types && product.class_types.length > 0 && (
                                                            <div className="text-xs text-gray-500 mt-1">
                                                                {product.class_types.slice(0, 2).join(', ')}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))
                                            ) : hasSearched && isEmpty ? (
                                                <div className="p-3 text-center text-gray-500">
                                                    검색 결과가 없습니다
                                                </div>
                                            ) : (
                                                <div className="p-3 text-center text-gray-500">
                                                    상품명을 입력하세요
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="has_membership" className="text-sm font-medium">
                                    보유 맴버십
                                </Label>
                                <div className="space-y-2">
                                    {/* 멤버십 검색 입력 */}
                                    <div className="relative">
                                        <Input
                                            value={membershipSearchQuery}
                                            onChange={(e) => handleMembershipSearch(e.target.value)}
                                            onFocus={() => {
                                                setShowMembershipSearch(true);
                                                loadMemberships(); // 데이터 미리 로드
                                            }}
                                            placeholder="멤버십을 검색하세요"
                                            className="pr-10"
                                        />
                                        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    </div>
                                    
                                    {/* 선택된 멤버십 정보 */}
                                    {selectedMemberships.length > 0 && (
                                        <div className="space-y-2">
                                            {selectedMemberships.map((membership) => (
                                                <div key={membership.id} className="p-3 bg-green-50 border border-green-200 rounded-md">
                                                    <div className="flex justify-between items-start">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <h4 className="font-medium text-green-900">
                                                                    {membership.info?.membership_name || `멤버십 ${membership.id}`}
                                                                </h4>
                                                                <div className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                                                    {membership.package_type}
                                                                </div>
                                                            </div>
                                                            <div className="text-sm text-green-700 mt-1">
                                                                <div>결제금액: {membership.payment_amount?.toLocaleString()}원</div>
                                                                <div>유효기간: {membership.validity_period}일</div>
                                                                {membership.info?.membership_description && (
                                                                    <div>설명: {membership.info.membership_description}</div>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() => handleMembershipRemove(membership.id)}
                                                            className="text-green-500 hover:text-green-700"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    
                                    {/* 검색 결과 드롭다운 */}
                                    {showMembershipSearch && (
                                        <div ref={membershipSearchRef} className="absolute z-50 w-80 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                                            {filteredMemberships.length > 0 ? (
                                                filteredMemberships.map((membership) => (
                                                    <div
                                                        key={membership.id}
                                                        onClick={() => handleMembershipSelect(membership)}
                                                        className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <div className="font-medium">
                                                                {membership.info?.membership_name || `멤버십 ${membership.id}`}
                                                            </div>
                                                            <div className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                                                {membership.package_type}
                                                            </div>
                                                        </div>
                                                        <div className="text-sm text-gray-600">
                                                            {membership.payment_amount?.toLocaleString()}원 • {membership.validity_period}일
                                                        </div>
                                                        {membership.info?.membership_description && (
                                                            <div className="text-xs text-gray-500 mt-1">
                                                                {membership.info.membership_description}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))
                                            ) : membershipSearchQuery.trim() ? (
                                                <div className="p-3 text-center text-gray-500">
                                                    검색 결과가 없습니다
                                                </div>
                                            ) : (
                                                <div className="p-3 text-center text-gray-500">
                                                    멤버십명을 입력하세요
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="payment_type" className="text-sm font-medium">
                                    결제타입
                                </Label>
                                <Select value={formData.payment_type || ''} onValueChange={(value) => handleInputChange('payment_type', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="결제타입을 선택하세요" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="현금">현금</SelectItem>
                                        <SelectItem value="카드">카드</SelectItem>
                                        <SelectItem value="계좌이체">계좌이체</SelectItem>
                                        <SelectItem value="회원권">회원권</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="discount_rate" className="text-sm font-medium">
                                    추가할인율 (%)
                                </Label>
                                <Input
                                    id="discount_rate"
                                    type="number"
                                    min="0"
                                    max="10"
                                    step="0.1"
                                    value={formData.discount_rate || ''}
                                    onChange={(e) => handleDiscountRateChange(parseFloat(e.target.value) || 0)}
                                    placeholder="0~10%"
                                />
                            </div>

                            <div>
                                <Label htmlFor="total_payment" className="text-sm font-medium">
                                    결제액 (원)
                                </Label>
                                <div className="space-y-2">
                                    <Input
                                        id="total_payment"
                                        type="number"
                                        min="0"
                                        value={formData.total_payment || ''}
                                        onChange={(e) => handleInputChange('total_payment', parseInt(e.target.value) || 0)}
                                        placeholder="결제액을 입력하세요"
                                        readOnly={selectedProducts.length > 0 && formData.discount_rate ? true : false}
                                        className={selectedProducts.length > 0 && formData.discount_rate ? 'bg-gray-50' : ''}
                                    />
                                    {selectedProducts.length > 0 && formData.discount_rate && formData.discount_rate > 0 && (
                                        <div className="text-sm text-gray-600 bg-blue-50 p-2 rounded-md">
                                            <div className="flex justify-between">
                                                <span>총 원가:</span>
                                                <span>{selectedProducts.reduce((sum, product) => sum + (product.Sell_Price || 0), 0).toLocaleString()}원</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>할인율:</span>
                                                <span className="text-red-600">-{formData.discount_rate}%</span>
                                            </div>
                                            <div className="flex justify-between font-medium border-t pt-1 mt-1">
                                                <span>최종 결제액:</span>
                                                <span className="text-blue-600">{formData.total_payment?.toLocaleString()}원</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter className="bg-gray-50 -mx-6 -mb-6 px-6 py-4">
                    <Button onClick={handleSubmit}>
                        등록하기
                    </Button>
                </DialogFooter>
            </DialogContent>
            
            {/* 닫기 확인 모달 */}
            <Dialog open={showCloseConfirm} onOpenChange={setShowCloseConfirm}>
                <DialogContent 
                    className="max-w-md bg-white border-2 border-red-200 shadow-2xl z-[60]" 
                    showCloseButton={false}
                >
                    <DialogHeader className="space-y-3">
                        <DialogTitle className="text-xl font-bold flex items-center gap-3 text-red-700">
                            <AlertTriangle className="w-6 h-6 text-red-500" />
                            정말 닫으시겠습니까?
                        </DialogTitle>
                        <DialogDescription className="text-base text-gray-700 leading-relaxed">
                            입력한 상담 정보가 모두 삭제됩니다.<br />
                            계속하시겠습니까?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-3 mt-6">
                        <Button 
                            variant="outline" 
                            onClick={handleCloseCancel}
                            className="flex-1 h-11 text-base font-medium bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-300 hover:border-gray-400"
                        >
                            취소
                        </Button>
                        <Button 
                            variant="destructive" 
                            onClick={handleClose}
                            className="flex-1 h-11 text-base font-medium bg-red-600 hover:bg-red-700 text-white border-2 border-red-600 hover:border-red-700"
                        >
                            닫기
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Dialog>
    );
}
