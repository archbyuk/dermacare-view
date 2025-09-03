'use client';

import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Package } from 'lucide-react';
import { ProductDetailResponse } from '@/api/products-api';

interface ProductInfoSectionProps {
    displayProduct: ProductDetailResponse;
    isEditing: boolean;
    editData: Partial<ProductDetailResponse>;
    setEditData: (data: Partial<ProductDetailResponse>) => void;
    infoType?: 'standard' | 'event';
    title?: string;
}

export default function ProductInfoSection({
    displayProduct,
    isEditing,
    editData,
    setEditData,
    infoType = 'standard',
    title
}: ProductInfoSectionProps) {
    // infoType에 따른 설정
    const infoKey = infoType === 'event' ? 'info_event' : 'info_standard';
    const defaultTitle = infoType === 'event' ? '이벤트 상품 정보' : '상품 정보';
    const displayTitle = title || defaultTitle;
    
    // info 객체 가져오기
    const getInfo = () => editData[infoKey] || displayProduct[infoKey];
    
    // info 객체 업데이트
    const updateInfo = (updates: Partial<{ type: string; id: number; name?: string; description?: string; precautions?: string }>) => {
        const currentInfo = getInfo() || {};
        setEditData({
            ...editData,
            [infoKey]: {
                type: (currentInfo as { type?: string; id?: number })?.type || infoType,
                id: (currentInfo as { type?: string; id?: number })?.id || 0,
                ...currentInfo,
                ...updates
            }
        });
    };
    
    return (
        <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-900 flex items-center">
                <Package className="w-4 h-4 mr-2" />
                {displayTitle}
            </h3>
            
            <div className="space-y-3">
                <div>
                    <label className="text-xs text-gray-500">상품명</label>
                    {isEditing ? (
                        <Input
                            value={getInfo()?.name ?? ''}
                            onChange={(e) => updateInfo({ name: e.target.value })}
                            className="text-sm"
                            placeholder="상품명을 입력하세요"
                        />
                    ) : (
                        <p className="text-sm font-medium text-gray-900">{getInfo()?.name || '이름 없음'}</p>
                    )}
                </div>
                <div>
                    <label className="text-xs text-gray-500">상품 설명</label>
                    {isEditing ? (
                        <Textarea
                            value={getInfo()?.description ?? ''}
                            onChange={(e) => updateInfo({ description: e.target.value })}
                            className="text-sm min-h-[80px]"
                            placeholder="상품 설명을 입력하세요"
                        />
                    ) : (
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{getInfo()?.description || '설명 없음'}</p>
                    )}
                </div>
                <div>
                    <label className="text-xs text-gray-500">주의사항</label>
                    {isEditing ? (
                        <Textarea
                            value={getInfo()?.precautions ?? ''}
                            onChange={(e) => updateInfo({ precautions: e.target.value })}
                            className="text-sm min-h-[80px]"
                            placeholder="주의사항을 입력하세요"
                        />
                    ) : (
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{getInfo()?.precautions || '주의사항 없음'}</p>
                    )}
                </div>
            </div>
        </div>
    );
}