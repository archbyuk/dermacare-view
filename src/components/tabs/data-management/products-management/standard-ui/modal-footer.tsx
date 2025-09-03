'use client';

import { Button } from '@/components/ui/button';
import { Edit, Save } from 'lucide-react';

interface ModalFooterProps {
    isEditing: boolean;
    saving: boolean;
    onCancel: () => void;
    onSave: () => void;
    onEdit: () => void;
}

export default function ModalFooter({ 
    isEditing, 
    saving, 
    onCancel, 
    onSave, 
    onEdit 
}: ModalFooterProps) {
    return (
        <div className="p-4 border-t border-gray-200 flex-shrink-0">
            <div className="flex space-x-3">
                {isEditing ? (
                    <>
                        <Button
                            onClick={onCancel}
                            className="flex-1 bg-gray-500 py-3 font-semibold text-white"
                            variant="secondary"
                            disabled={saving}
                        >
                            취소
                        </Button>
                        <Button
                            onClick={onSave}
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
                            onClick={onCancel}
                            className="flex-1 bg-gray-500 py-3 font-semibold text-white"
                            variant="secondary"
                        >
                            닫기
                        </Button>
                        <Button
                            onClick={onEdit}
                            className="flex-1 bg-gray-900 py-3 font-semibold text-white hover:bg-gray-800"
                        >
                            <Edit className="w-4 h-4 mr-2" />
                            수정하기
                        </Button>
                    </>
                )}
            </div>
        </div>
    );
}
