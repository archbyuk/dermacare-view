'use client';

import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface ModalHeaderProps {
    isEditing: boolean;
    onClose: () => void;
}

export default function ModalHeader({ isEditing, onClose }: ModalHeaderProps) {
    return (
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
                <h2 className="text-lg font-semibold text-gray-900">
                    {isEditing ? '상품 정보 수정' : '상품 상세정보'}
                </h2>
            </div>
            <Button
                onClick={onClose}
                variant="ghost"
                size="sm"
                className="!text-gray-500 hover:text-gray-600 p-0 h-auto"
            >
                <X className="!w-5 !h-5" />
            </Button>
        </div>
    );
}
