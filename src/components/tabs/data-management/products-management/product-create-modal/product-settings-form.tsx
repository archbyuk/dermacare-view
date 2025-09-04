'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Element } from '@/api/element-api';
import { BundleListResponse } from '@/api/bundles-api';
import { CustomListResponse } from '@/api/customs-api';
import { SequenceResponse } from '@/api/sequences-api';
import { PROCEDURE_GRADES, COVERED_TYPES, TAXABLE_TYPES } from '@/types/products';
import ProcedureDetailInfo from './procedure-detail-info';
import { getTotalProcedureCost } from './procedure-utils';

// 폼 데이터 타입 정의
export interface ProductFormData {
    // 시술 정보 (자동 설정)
    packageType: 'element' | 'bundle' | 'custom' | 'sequence';
    elementId: number | null;
    bundleId: number | null;
    customId: number | null;
    sequenceId: number | null;
    
    // 가격 정보
    sellPrice: string;
    originalPrice: string;
    discountRate: number;
    roundedPlace: string;
    actualDiscountRate: number;
    taxableType: string;
    vat: number;
    margin: number;
    marginRate: number;
    
    // 기간 설정
    startDate: string;
    endDate: string;
    validityPeriod: number;
    
    // 기타 설정
    coveredType: string;
    procedureGrade: string;
    
    // ID 정보 (수동 입력)
    infoId: string;
    productId: string;
    
    // 상품 정보
    productName: string;
    productDescription: string;
    precautions: string;
}

interface ProductSettingsFormProps {
    selectedProductType: 'standard' | 'event';
    selectedProcedureType: 'element' | 'bundle' | 'custom' | 'sequence';
    selectedProcedure: Element | BundleListResponse | CustomListResponse | SequenceResponse;
    onFormDataChange: (formData: ProductFormData) => void;
}

export default function ProductSettingsForm({ 
    selectedProductType, 
    selectedProcedureType, 
    selectedProcedure,
    onFormDataChange
}: ProductSettingsFormProps) {
    // 폼 상태 관리
    const [formData, setFormData] = useState<ProductFormData>({
        // 시술 정보 (자동 설정)
        packageType: selectedProcedureType, // 선택한 시술 타입
        elementId: null,
        bundleId: null,
        customId: null,
        sequenceId: null,
        
        // 가격 정보
        sellPrice: '',
        originalPrice: '',
        discountRate: 0.49, // 할인율 기본값 0.49 (49%)
        roundedPlace: '올림 - 천', // 정상가 올림단위 기본값
        actualDiscountRate: 0, // 실제 할인율
        taxableType: '과세', // 과세구분 기본값
        vat: 0,
        margin: 0,
        marginRate: 0,
        
        // 기간 설정
        startDate: '', // 시작일 (사용자 입력)
        endDate: '', // 종료일 (사용자 입력)
        validityPeriod: -1, // 유효기간 기본값: -1 (무제한)
        
        // 기타 설정
        coveredType: '비급여', // 급여구분 기본값
        procedureGrade: '원장지정', // 시술 담당자 기본값
        
        // ID 정보 (수동 입력)
        infoId: '', // Standard/Event 상품 정보 ID
        productId: '', // 상품 ID
        
        // 상품 정보
        productName: '', // 상품명/이벤트명
        productDescription: '', // 상품 설명/이벤트 설명
        precautions: '' // 주의사항
    });

    // 선택된 시술 정보 표시
    const getProcedureName = () => {
        if ('name' in selectedProcedure) return selectedProcedure.name;
        if ('sequence_name' in selectedProcedure) return selectedProcedure.sequence_name;
        if ('group_id' in selectedProcedure) return `ID: ${selectedProcedure.group_id}`;
        if ('id' in selectedProcedure) return `ID: ${selectedProcedure.id}`;
        return '알 수 없는 시술';
    };

    const getProcedureTypeName = () => {
        switch (selectedProcedureType) {
            case 'element': return '단일 시술';
            case 'bundle': return '패키지';
            case 'custom': return '커스텀';
            case 'sequence': return '코스 패키지';
            default: return '시술';
        }
    };

    // 자동 계산 함수들
    const calculateVAT = (sellPrice: number, taxableType: string) => {
        if (taxableType === '과세') {
            return Math.round(sellPrice * 0.1); // 10% 계산 후 반올림
        }
        return 0; // 비과세인 경우 0
    };

    const calculateMargin = (sellPrice: number) => {
        const procedureCost = getTotalProcedureCost(selectedProcedure);
        const margin = sellPrice - procedureCost;
        const marginRate = sellPrice > 0 ? (margin / sellPrice) * 100 : 0;
        return { margin, marginRate };
    };

    const calculateOriginalPrice = (sellPrice: number, discountRate: number) => {
        if (discountRate >= 1) return sellPrice; // 할인율이 100% 이상이면 정상가 = 판매가
        return Math.round(sellPrice / (1 - discountRate));
    };

    // 정상가 올림단위 적용 함수
    const applyRoundedPlace = (price: number, roundedPlace: string) => {
        switch (roundedPlace) {
            case '반올림 안함':
                return Math.round(price);
            case '내림 - 천':
                return Math.floor(price / 1000) * 1000;
            case '내림 - 만':
                return Math.floor(price / 10000) * 10000;
            case '내림 - 십만':
                return Math.floor(price / 100000) * 100000;
            case '올림 - 천':
                return Math.ceil(price / 1000) * 1000;
            case '올림 - 만':
                return Math.ceil(price / 10000) * 10000;
            case '올림 - 십만':
                return Math.ceil(price / 100000) * 100000;
            default:
                return Math.round(price);
        }
    };

    // 실제 할인율 계산 함수
    const calculateActualDiscountRate = (originalPrice: number, sellPrice: number) => {
        if (originalPrice <= 0) return 0;
        return ((originalPrice - sellPrice) / originalPrice) * 100; // 퍼센트로 반환
    };

    // 판매가 변경 시 자동 계산
    const handleSellPriceChange = (value: string) => {
        const sellPrice = parseFloat(value) || 0;
        const discountRate = formData.discountRate;
        const roundedPlace = formData.roundedPlace;
        
        // 기본 정상가 계산
        const baseOriginalPrice = calculateOriginalPrice(sellPrice, discountRate);
        // 올림단위 적용
        const adjustedOriginalPrice = applyRoundedPlace(baseOriginalPrice, roundedPlace);
        // 실제 할인율 계산
        const actualDiscountRate = calculateActualDiscountRate(adjustedOriginalPrice, sellPrice);
        
        const vat = calculateVAT(sellPrice, formData.taxableType);
        const { margin, marginRate } = calculateMargin(sellPrice);

        setFormData({
            ...formData,
            sellPrice: value,
            originalPrice: adjustedOriginalPrice.toString(),
            actualDiscountRate,
            vat,
            margin,
            marginRate
        });
    };

    // 할인율 변경 시 자동 계산
    const handleDiscountRateChange = (value: string) => {
        const discountRate = parseFloat(value) || 0;
        const sellPrice = parseFloat(formData.sellPrice) || 0;
        const roundedPlace = formData.roundedPlace;
        
        // 기본 정상가 계산
        const baseOriginalPrice = calculateOriginalPrice(sellPrice, discountRate);
        // 올림단위 적용
        const adjustedOriginalPrice = applyRoundedPlace(baseOriginalPrice, roundedPlace);
        // 실제 할인율 계산
        const actualDiscountRate = calculateActualDiscountRate(adjustedOriginalPrice, sellPrice);

        setFormData({
            ...formData,
            discountRate,
            originalPrice: adjustedOriginalPrice.toString(),
            actualDiscountRate
        });
    };

    // 과세구분 변경 시 VAT 재계산
    const handleTaxableTypeChange = (value: string) => {
        const taxableType = value;
        const sellPrice = parseFloat(formData.sellPrice) || 0;
        
        const vat = calculateVAT(sellPrice, taxableType);

        setFormData({
            ...formData,
            taxableType,
            vat
        });
    };

    // 정상가 올림단위 변경 시 재계산
    const handleRoundedPlaceChange = (value: string) => {
        const roundedPlace = value;
        const sellPrice = parseFloat(formData.sellPrice) || 0;
        const discountRate = formData.discountRate;
        
        // 기본 정상가 계산
        const baseOriginalPrice = calculateOriginalPrice(sellPrice, discountRate);
        // 새로운 올림단위 적용
        const adjustedOriginalPrice = applyRoundedPlace(baseOriginalPrice, roundedPlace);
        // 실제 할인율 재계산
        const actualDiscountRate = calculateActualDiscountRate(adjustedOriginalPrice, sellPrice);

        setFormData({
            ...formData,
            roundedPlace,
            originalPrice: adjustedOriginalPrice.toString(),
            actualDiscountRate
        });
    };





    // 타입 가드 함수들
    const isElement = (procedure: Element | BundleListResponse | CustomListResponse | SequenceResponse): procedure is Element => {
        return 'id' in procedure && 'name' in procedure && !('group_id' in procedure);
    };
    
    const isBundle = (procedure: Element | BundleListResponse | CustomListResponse | SequenceResponse): procedure is BundleListResponse => {
        return selectedProcedureType === 'bundle' && 'group_id' in procedure && 'elements' in procedure;
    };
    
    const isCustom = (procedure: Element | BundleListResponse | CustomListResponse | SequenceResponse): procedure is CustomListResponse => {
        return selectedProcedureType === 'custom' && 'group_id' in procedure && 'elements' in procedure;
    };
    
    const isSequence = (procedure: Element | BundleListResponse | CustomListResponse | SequenceResponse): procedure is SequenceResponse => {
        return selectedProcedureType === 'sequence' && 'group_id' in procedure && 'steps' in procedure;
    };


    // 선택된 시술 정보에 따라 ID 자동 설정
    useEffect(() => {
        console.log(selectedProcedure);
        
        // 선택된 시술의 ID를 자동으로 설정
        if (selectedProcedure) {
            let elementId = null;
            let bundleId = null;
            let customId = null;
            let sequenceId = null;
            
            if (isElement(selectedProcedure)) {
                elementId = selectedProcedure.id;
            } else if (isBundle(selectedProcedure)) {
                bundleId = selectedProcedure.group_id;
            } else if (isCustom(selectedProcedure)) {
                customId = selectedProcedure.group_id;
            } else if (isSequence(selectedProcedure)) {
                sequenceId = selectedProcedure.group_id;
            }
            
            setFormData(prev => ({
                ...prev,
                elementId,
                bundleId,
                customId,
                sequenceId
            }));
        }
    }, [selectedProcedure]);

    // 폼 데이터 변경 시 부모 컴포넌트에 전달
    useEffect(() => {
        onFormDataChange(formData);
    }, [formData, onFormDataChange]);

    return (
        <div className="w-full mx-auto">
            {/* 헤더 */}
            <div className="text-center mb-10">
                <p className="text-base text-gray-600">선택된 시술에 대한 상품 정보를 설정해주세요</p>
            </div>

            {/* 선택된 시술 정보 */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-400 rounded-r-lg p-4 mb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h4 className="text-blue-900 font-medium text-lg mb-1">{getProcedureName()}</h4>
                        <p className="text-blue-700 text-sm">{getProcedureTypeName()} • {selectedProductType === 'standard' ? '스탠다드 상품' : '이벤트 상품'}</p>
                    </div>
                    <div className="text-right">
                        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-3 py-1 rounded-full border border-blue-200">
                            {selectedProductType.toUpperCase()}
                        </span>
                    </div>
                </div>
                
                {/* 시술 상세 정보 컴포넌트 */}
                <ProcedureDetailInfo 
                    selectedProcedure={selectedProcedure}
                    selectedProcedureType={selectedProcedureType}
                />
            </div>

            {/* 상품 설정 폼 */}
            <div className="bg-white rounded-xl">
                <h4 className="text-xl font-medium text-gray-900 mb-8">상품 기본 정보</h4>
                
                {/* ID 정보 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    <div>
                        <Label htmlFor="infoId" className="text-sm font-medium text-gray-700 mb-2 block">
                            상품 정보 ID
                        </Label>
                        <Input
                            id="infoId"
                            placeholder="상품 정보 ID를 입력하세요"
                            value={formData.infoId}
                            onChange={(e) => setFormData({...formData, infoId: e.target.value})}
                            className="text-base border-gray-200 focus:border-blue-400 focus:ring-blue-400 text-gray-800"
                        />
                    </div>
                    
                    <div>
                        <Label htmlFor="productId" className="text-sm font-medium text-gray-700 mb-2 block">
                            상품 ID
                        </Label>
                        <Input
                            id="productId"
                            placeholder="상품 ID를 입력하세요"
                            value={formData.productId}
                            onChange={(e) => setFormData({...formData, productId: e.target.value})}
                            className="text-base border-gray-200 focus:border-blue-400 focus:ring-blue-400 text-gray-800"
                        />
                    </div>
                </div>
                
                {/* 상품명 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    <div>
                        <Label htmlFor="productName" className="text-sm font-medium text-gray-700 mb-2 block">
                            {selectedProductType === 'standard' ? '상품명' : '이벤트명'}
                        </Label>
                        <Input
                            id="productName"
                            placeholder={selectedProductType === 'standard' ? '상품명을 입력하세요' : '이벤트명을 입력하세요'}
                            value={formData.productName}
                            onChange={(e) => setFormData({...formData, productName: e.target.value})}
                            className="text-base border-gray-200 focus:border-blue-400 focus:ring-blue-400 text-gray-800"
                        />
                    </div>
                </div>

                {/* 상품 설명 */}
                <div className="mb-8">
                    <Label htmlFor="productDescription" className="text-sm font-medium text-gray-700 mb-2 block">
                        {selectedProductType === 'standard' ? '상품 설명' : '이벤트 설명'}
                    </Label>
                    <Textarea
                        id="productDescription"
                        placeholder={selectedProductType === 'standard' ? '상품에 대한 설명을 입력하세요' : '이벤트에 대한 설명을 입력하세요'}
                        value={formData.productDescription}
                        onChange={(e) => setFormData({...formData, productDescription: e.target.value})}
                        className="min-h-[100px] text-base border-gray-400 focus:border-blue-400 focus:ring-blue-400 resize-none text-gray-800"
                    />
                </div>

                {/* 주의사항 */}
                <div className="mb-8">
                    <Label htmlFor="precautions" className="text-sm font-medium text-gray-700 mb-2 block">
                        주의사항
                    </Label>
                    <Textarea
                        id="precautions"
                        placeholder="주의사항을 입력하세요"
                        value={formData.precautions}
                        onChange={(e) => setFormData({...formData, precautions: e.target.value})}
                        className="min-h-[100px] text-base border-gray-200 focus:border-blue-400 focus:ring-blue-400 resize-none text-gray-800"
                    />
                </div>

                {/* 구분선 */}
                <div className="border-t border-gray-100 my-10"></div>

                {/* 가격 정보 섹션 */}
                <h4 className="text-xl font-medium text-gray-900 mb-8">가격 정보</h4>
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-8">
                    <div>
                        <Label htmlFor="procedureCost" className="text-sm font-medium text-gray-700 mb-2 block">
                            원가 (자동 계산)
                        </Label>
                        <Input
                            id="procedureCost"
                            type="text"
                            value={`${getTotalProcedureCost(selectedProcedure).toLocaleString()}원`}
                            disabled
                            className="text-base border-gray-200 bg-gray-50 text-gray-600 cursor-not-allowed"
                        />
                        <p className="text-xs text-gray-500 mt-1">선택된 시술의 총 비용입니다</p>
                    </div>
                    
                    <div>
                        <Label htmlFor="sellPrice" className="text-sm font-medium text-gray-700 mb-2 block">
                            판매가
                        </Label>
                        <Input
                            id="sellPrice"
                            type="number"
                            placeholder="0"
                            value={formData.sellPrice}
                            onChange={(e) => handleSellPriceChange(e.target.value)}
                            className="text-base border-gray-200 focus:border-blue-400 focus:ring-blue-400 text-gray-800"
                        />
                    </div>
                    
                    <div>
                        <Label htmlFor="originalPrice" className="text-sm font-medium text-gray-700 mb-2 block">
                            정가
                        </Label>
                        <Input
                            id="originalPrice"
                            type="text"
                            placeholder="자동 계산됨"
                            value={formData.originalPrice ? `${parseFloat(formData.originalPrice).toLocaleString()}원` : ''}
                            disabled
                            className="text-base border-gray-200 bg-gray-50 text-gray-600 cursor-not-allowed"
                        />
                        <p className="text-xs text-gray-500 mt-1">할인율에 따라 자동 계산됩니다</p>
                    </div>

                    <div>
                        <Label htmlFor="discountRate" className="text-sm font-medium text-gray-700 mb-2 block">
                            할인율
                        </Label>
                        <Input
                            id="discountRate"
                            type="number"
                            step="0.01"
                            min="0"
                            max="1"
                            placeholder="0"
                            value={formData.discountRate}
                            onChange={(e) => handleDiscountRateChange(e.target.value)}
                            className="text-base border-gray-200 focus:border-blue-400 focus:ring-blue-400 text-gray-800"
                        />
                        <p className="text-xs text-gray-500 mt-1">0.00 ~ 1.00 (0% ~ 100%)</p>
                    </div>

                    <div>
                        <Label htmlFor="actualDiscountRate" className="text-sm font-medium text-gray-700 mb-2 block">
                            실제 할인율
                        </Label>
                        <Input
                            id="actualDiscountRate"
                            type="text"
                            placeholder="자동 계산됨"
                            value={`${formData.actualDiscountRate.toFixed(1)}%`}
                            disabled
                            className={`text-base border-gray-200 bg-gray-50 cursor-not-allowed ${
                                formData.actualDiscountRate >= 50 ? 'text-red-600 border-red-300' : 'text-gray-600'
                            }`}
                        />
                        <p className={`text-xs mt-1 ${
                            formData.actualDiscountRate >= 50 ? 'text-red-600 font-medium' : 'text-gray-500'
                        }`}>
                            {formData.actualDiscountRate >= 50 
                                ? '⚠️ 의료법 위반: 할인율이 50%를 초과합니다' 
                                : '정상가 대비 실제 할인율'
                            }
                        </p>
                    </div>

                    <div>
                        <Label htmlFor="roundedPlace" className="text-sm font-medium text-gray-700 mb-2 block">
                            정상가 올림단위
                        </Label>
                        <Select value={formData.roundedPlace} onValueChange={handleRoundedPlaceChange}>
                            <SelectTrigger className="h-12 text-base border-gray-200 focus:border-blue-400 focus:ring-blue-400">
                                <SelectValue placeholder="올림단위를 선택하세요" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="반올림 안함">반올림 안함</SelectItem>
                                <SelectItem value="내림 - 천">내림 - 천</SelectItem>
                                <SelectItem value="내림 - 만">내림 - 만</SelectItem>
                                <SelectItem value="내림 - 십만">내림 - 십만</SelectItem>
                                <SelectItem value="올림 - 천">올림 - 천</SelectItem>
                                <SelectItem value="올림 - 만">올림 - 만</SelectItem>
                                <SelectItem value="올림 - 십만">올림 - 십만</SelectItem>
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-gray-500 mt-1">정상가 계산 시 적용되는 올림단위</p>
                    </div>
                </div>

                {/* 자동 계산 결과 표시 */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-8 border border-blue-100">
                    <h5 className="text-base font-medium text-blue-900 mb-4">자동 계산 결과</h5>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white rounded-lg p-4 text-center border border-blue-200">
                            <div className="text-xs text-blue-600 mb-1">VAT</div>
                            <div className="text-lg font-semibold text-blue-900">
                                {formData.taxableType === '과세' ? `${formData.vat.toLocaleString()}원` : '0원'}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                                {formData.taxableType === '과세' ? '과세 상품' : '비과세 상품'}
                            </div>
                        </div>
                        <div className="bg-white rounded-lg p-4 text-center border border-blue-200">
                            <div className="text-xs text-blue-600 mb-1">마진</div>
                            <div className={`text-lg font-semibold ${formData.margin < 0 ? 'text-red-600' : 'text-blue-900'}`}>
                                {formData.margin.toLocaleString()}원
                            </div>
                        </div>
                        <div className="bg-white rounded-lg p-4 text-center border border-blue-200">
                            <div className="text-xs text-blue-600 mb-1">마진율</div>
                            <div className={`text-lg font-semibold ${formData.marginRate < 0 ? 'text-red-600' : 'text-blue-900'}`}>
                                {formData.marginRate.toFixed(1)}%
                            </div>
                        </div>
                    </div>
                </div>

                {/* 구분선 */}
                <div className="border-t border-gray-100 my-10"></div>

                {/* 기간 설정 섹션 */}
                <h4 className="text-xl font-medium text-gray-900 mb-8">기간 설정</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                    <div>
                        <Label htmlFor="startDate" className="text-sm font-medium text-gray-700 mb-2 block">
                            시작일
                        </Label>
                        <Input
                            id="startDate"
                            type="date"
                            value={formData.startDate}
                            onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                            className="text-base border-gray-200 focus:border-blue-400 focus:ring-blue-400 text-gray-800"
                        />
                    </div>
                    
                    <div>
                        <Label htmlFor="endDate" className="text-sm font-medium text-gray-700 mb-2 block">
                            종료일
                        </Label>
                        <Input
                            id="endDate"
                            type="date"
                            value={formData.endDate}
                            onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                            className="text-base border-gray-200 focus:border-blue-400 focus:ring-blue-400 text-gray-800"
                        />
                    </div>

                    <div>
                        <Label htmlFor="validityPeriod" className="text-sm font-medium text-gray-700 mb-2 block">
                            유효기간 (일)
                        </Label>
                        <Input
                            id="validityPeriod"
                            type="number"
                            min="-1"
                            placeholder="-1"
                            value={formData.validityPeriod}
                            onChange={(e) => {
                                const value = parseInt(e.target.value);
                                if (value >= -1) {
                                    setFormData({...formData, validityPeriod: value});
                                }
                            }}
                            className="text-base border-gray-200 focus:border-blue-400 focus:ring-blue-400 text-gray-800"
                        />
                        <p className="text-xs text-gray-500 mt-1">-1: 무제한, 0 이상: 지정된 일수</p>
                    </div>
                </div>

                {/* 기타 설정 섹션 */}
                <h4 className="text-xl font-medium text-gray-900 mb-8">기타 설정</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    <div>
                        <Label htmlFor="coveredType" className="text-sm font-medium text-gray-700 mb-2 block">
                            급여구분
                        </Label>
                        <Select value={formData.coveredType} onValueChange={(value) => setFormData({...formData, coveredType: value})}>
                            <SelectTrigger className="h-12 text-base border-gray-200 focus:border-blue-400 focus:ring-blue-400">
                                <SelectValue placeholder="급여구분을 선택하세요" />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.entries(COVERED_TYPES).map(([key, value]) => (
                                    <SelectItem key={key} value={value}>
                                        {value}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    
                    <div>
                        <Label htmlFor="taxableType" className="text-sm font-medium text-gray-700 mb-2 block">
                            과세구분
                        </Label>
                        <Select value={formData.taxableType} onValueChange={handleTaxableTypeChange}>
                            <SelectTrigger className="h-12 text-base border-gray-200 focus:border-blue-400 focus:ring-blue-400">
                                <SelectValue placeholder="과세구분을 선택하세요" />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.entries(TAXABLE_TYPES).map(([key, value]) => (
                                    <SelectItem key={key} value={value}>
                                        {value}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label htmlFor="procedureGrade" className="text-sm font-medium text-gray-700 mb-2 block">
                            시술 담당자
                        </Label>
                        <Select value={formData.procedureGrade} onValueChange={(value) => setFormData({...formData, procedureGrade: value})}>
                            <SelectTrigger className="h-12 text-base border-gray-200 focus:border-blue-400 focus:ring-blue-400">
                                <SelectValue placeholder="담당자를 선택하세요" />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.entries(PROCEDURE_GRADES).map(([key, value]) => (
                                    <SelectItem key={key} value={value}>
                                        {value}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* 하단 버튼 */}
                <div className="flex justify-end space-x-4 pt-8 border-t border-gray-100">
                    <Button 
                        variant="outline" 
                        className="px-8 py-3 h-12 text-base border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                    >
                        취소
                    </Button>
                </div>
            </div>
        </div>
    );
}
