'use client';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ProductDetailResponse } from '@/api/products-api';
import { ProcedureInfo } from '../../standard-detail-types';
import ElementProcedure from '../procedure-types/element-procedure';
import BundleProcedure from '../procedure-types/bundle-procedure';
import CustomProcedure from '../procedure-types/custom-procedure';
import SequenceProcedure from '../procedure-types/sequence-procedure';
import { useEffect } from 'react';

interface ProcedureTypeRenderersProps {
    displayProduct: ProductDetailResponse;
    isEditing: boolean;
    editData: Partial<ProductDetailResponse>;
    existingBundleInfo?: ProcedureInfo;
    existingCustomInfo?: ProcedureInfo;
    existingSequenceInfo?: ProcedureInfo;
    packageType: string;
}

export default function ProcedureTypeRenderers({
    displayProduct,
    isEditing,
    editData,
    existingBundleInfo,
    existingCustomInfo,
    existingSequenceInfo,
    packageType
}: ProcedureTypeRenderersProps) {

    
    // 패키지 타입에 따른 컴포넌트 렌더링 (기존 시술 정보 표시용)
    const renderProcedureByType = () => {
        switch (packageType) {
            case '단일시술':
                return (
                    <ElementProcedure 
                        displayProduct={displayProduct}
                        isEditing={isEditing}
                        editData={editData}
                    />
                );
            case '번들':
                return (
                    <BundleProcedure 
                        displayProduct={displayProduct}
                        isEditing={isEditing}
                        editData={editData}
                        existingBundleInfo={existingBundleInfo}
                    />
                );
            case '커스텀':
                return (
                    <CustomProcedure 
                        displayProduct={displayProduct}
                        isEditing={isEditing}
                        editData={editData}
                        existingCustomInfo={existingCustomInfo}
                    />
                );
            case '시퀀스':
                return (
                    <SequenceProcedure 
                        displayProduct={displayProduct}
                        isEditing={isEditing}
                        editData={editData}
                        existingSequenceInfo={existingSequenceInfo}
                    />
                );
            default:
                return (
                    <ElementProcedure 
                        displayProduct={displayProduct}
                        isEditing={isEditing}
                        editData={editData}
                    />
                );
        }
    };

    return (
        <Accordion type="single" collapsible className="bg-gray-50 rounded-lg border border-gray-200">
            <AccordionItem value="current-procedure" className="border-none">
                <AccordionTrigger className="px-4 py-4 hover:bg-gray-100 transition-colors [&[data-state=open]]:bg-gray-100">
                    <div className="flex items-center space-x-3">
                        <h4 className="text-sm font-medium text-gray-900">기존 포함 시술</h4>
                        <span className="text-xs text-gray-600 bg-gray-200 px-2 py-1 rounded">
                            {packageType}
                        </span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-900">
                            {displayProduct.procedure_info ? 
                                (() => {
                                    if ('name' in displayProduct.procedure_info) {
                                        return displayProduct.procedure_info.name;
                                    }

                                    return '시술 정보 없음';
                                })() : '시술 정보 없음'
                            }
                        </span>
                    </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 border-t border-gray-200 bg-white">
                    {renderProcedureByType()}
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    );
}
