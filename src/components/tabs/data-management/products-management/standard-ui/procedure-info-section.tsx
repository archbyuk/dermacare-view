'use client';

import { Tag } from 'lucide-react';
import { ProductDetailResponse } from '@/api/products-api';
import { ProcedureInfo, getProcedureName, getProcedureDescription } from './standard-detail-types';
import ProcedureSearchSelector from '../procedure-search-selector';
import ProcedureTypeRenderers from './info/procedure-type-renderers';
import ProcedurePreview from './info/procedure-preview';
import { useEffect } from 'react';

interface ProcedureInfoSectionProps {
    displayProduct: ProductDetailResponse;
    isEditing: boolean;
    editData: Partial<ProductDetailResponse>;
    newSelectedProcedure: ProcedureInfo | null;
    existingBundleInfo?: ProcedureInfo | null;
    existingCustomInfo?: ProcedureInfo | null;
    existingSequenceInfo?: ProcedureInfo | null;
    connectedProcedureName: string;
    onProcedureSelect: (type: 'element' | 'bundle' | 'custom' | 'sequence', id: number, name: string) => void;
    onProcedureInfoFetch: (type: 'element' | 'bundle' | 'custom' | 'sequence', id: number) => Promise<void>;
    onClearSelection: () => void;
}

export default function ProcedureInfoSection({
    displayProduct,
    isEditing,
    editData,
    newSelectedProcedure,
    existingBundleInfo,
    existingCustomInfo,
    existingSequenceInfo,
    connectedProcedureName,
    onProcedureSelect,
    onProcedureInfoFetch,
    onClearSelection
}: ProcedureInfoSectionProps) {
    // 기존 시술 정보용 패키지 타입 (변경되지 않아야 함)
    const originalPackageType = displayProduct.package_type;
    
    // 새로 선택된 시술 정보용 패키지 타입 (변경될 수 있음)
    const newPackageType = editData.package_type || displayProduct.package_type;
    
    return (
        <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-900 flex items-center">
                <Tag className="w-4 h-4 mr-2" />
                포함된 시술 정보
            </h3>
                
            {/* 현재 시술 정보 (수정 모드에서 아코디언으로 표시) */}
            {isEditing && (
                <ProcedureTypeRenderers
                    displayProduct={displayProduct}
                    isEditing={isEditing}
                    editData={editData}
                    existingBundleInfo={existingBundleInfo}
                    existingCustomInfo={existingCustomInfo}
                    existingSequenceInfo={existingSequenceInfo}
                    packageType={originalPackageType}
                />
            )}
                
            {/* 시술 교체 UI (수정 모드일 때만) */}
            {isEditing && (
                <ProcedureSearchSelector
                    packageType={editData.package_type || displayProduct.package_type || ''}
                    onProcedureSelect={onProcedureSelect}
                    onProcedureInfoFetch={onProcedureInfoFetch}
                    onClearSelection={onClearSelection}
                    selectedProcedureName={connectedProcedureName}
                />
            )}
            
            {/* 시술 정보 표시 - 교체 시 새 시술 정보 표시 */}
            {newSelectedProcedure ? (
                <ProcedurePreview
                    newSelectedProcedure={newSelectedProcedure}
                    newPackageType={newPackageType}
                />
            ) : !isEditing && (
                // 기존 시술 정보 표시 (읽기 모드일 때만)
                <ProcedureTypeRenderers
                    displayProduct={displayProduct}
                    isEditing={isEditing}
                    editData={editData}
                    existingBundleInfo={existingBundleInfo}
                    existingCustomInfo={existingCustomInfo}
                    existingSequenceInfo={existingSequenceInfo}
                    packageType={originalPackageType}
                />
            )}
            
        </div>
    );
}
