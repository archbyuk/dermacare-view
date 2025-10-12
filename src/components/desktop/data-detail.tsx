'use client';

import { Search } from 'lucide-react';

interface DataItem {
    id: string;
    name: string;
    type: string;
    status: 'active' | 'inactive';
    lastModified: string;
}

interface DataDetailProps {
    selectedItem: DataItem | null;
}

export default function DataDetail({ selectedItem }: DataDetailProps) {
    return (
        <div className="w-1/2 flex flex-col">
            {selectedItem ? (
                <div className="flex-1 p-4">
                    <div className="text-center text-gray-500 py-8">
                        상세 정보를 불러오는 중...
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">항목을 선택하세요</h3>
                        <p className="text-gray-500">왼쪽 목록에서 항목을 클릭하면 상세 정보가 표시됩니다.</p>
                    </div>
                </div>
            )}
        </div>
    );
}
