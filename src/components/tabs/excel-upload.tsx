'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import { Upload } from 'lucide-react';
import { uploadFiles } from '@/api/upload-api';

// 지원되는 Excel 파일 목록 (정적 데이터)
const SUPPORTED_FILES = [
    "Consumables.xlsx",
    "Enum.xlsx", 
    "Global.xlsx",
    "Info_Event.xlsx",
    "Info_Membership.xlsx",
    "Info_Standard.xlsx",
    "Membership.xlsx",
    "Procedure_Bundle.xlsx",
    "Procedure_Class.xlsx",
    "Procedure_Custom.xlsx",
    "Procedure_Element.xlsx",
    "Procedure_Sequence.xlsx",
    "Product_Event.xlsx",
    "Product_Standard.xlsx"
];

export function ExcelUpload() {
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    
    const multipleFileInputRef = useRef<HTMLInputElement>(null);



    const handleUploadFiles = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files || []);
        if (files.length === 0) return;

        setIsLoading(true);
        setMessage(null);

        try {
            const result = await uploadFiles(files);
            
            // 성공/실패 파일 수와 에러 정보를 포함한 메시지 구성
            let messageText = result.message;
            
            if (result.errors && result.errors.length > 0) {
                const errorDetails = result.errors.map(error => `${error.filename}: ${error.error}`).join('\n');
                messageText += `\n\n에러 상세:\n${errorDetails}`;
            }
            
            const messageType = result.errors && result.errors.length > 0 ? 'error' : 'success';
            setMessage({ type: messageType, text: messageText });
            
            // 파일 입력 초기화
            if (multipleFileInputRef.current) {
                multipleFileInputRef.current.value = '';
            }
        } catch (error: unknown) {
            console.error('파일 업로드 에러:', error);
            const errorMessage = error instanceof Error ? error.message : '파일 업로드에 실패했습니다.';
            setMessage({ type: 'error', text: errorMessage });
        } finally {
            setIsLoading(false);
        }
    };

    const triggerMultipleFileInput = () => {
        multipleFileInputRef.current?.click();
    };

    return (
        <div className="px-7 mt-6">
            <div className="w-full max-w-md mx-auto relative">
                {/* 메시지 표시 - 오버레이 형태 */}
                {message && (
                    <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg text-sm shadow-lg max-w-sm ${
                        message.type === 'success' 
                            ? 'bg-green-50 border border-green-200 text-green-700' 
                            : 'bg-red-50 border border-red-200 text-red-700'
                    }`}>
                        <div className="flex items-center justify-between">
                            <span>{message.text}</span>
                            <button 
                                onClick={() => setMessage(null)}
                                className="ml-3 text-xl text-gray-400 hover:text-gray-600"
                            >
                                ×
                            </button>
                        </div>
                    </div>
                )}

                {/* 메인 콘텐츠 */}
                <div className="bg-white rounded-lg shadow-none">
                    
                    {/* 파일 업로드 영역 */}
                    <div className="mb-8">
                        
                        {/* 드래그 앤 드롭 영역 */}
                        <div className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                            isLoading 
                                ? 'border-gray-200 bg-gray-50 cursor-not-allowed' 
                                : 'border-gray-300 hover:border-gray-400'
                        }`}>
                            <div className="flex flex-col items-center gap-4">
                                {/* 업로드 아이콘 */}
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                                    isLoading ? 'bg-gray-200' : 'bg-gray-100'
                                }`}>
                                    <Upload className={`w-6 h-6 ${isLoading ? 'text-gray-400' : 'text-gray-600'}`} />
                                </div>
                                
                                {/* 업로드 텍스트 */}
                                <div>
                                    <p className={`text-sm font-medium mb-1 ${
                                        isLoading ? 'text-gray-500' : 'text-gray-900'
                                    }`}>
                                        {isLoading ? '업로드 중입니다...' : '파일을 업로드하세요'}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        .xlsx, .xls 파일만 지원됩니다
                                    </p>
                                </div>
                                
                                {/* 업로드 버튼 */}
                                <div className="flex gap-3">
                                    <Button
                                        onClick={triggerMultipleFileInput}
                                        disabled={isLoading}
                                        className="px-6 py-3 text-sm font-medium bg-gray-600 text-white hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                                    >
                                        {isLoading ? '업로드 중...' : '파일 선택'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                        
                        
                        {/* 숨겨진 파일 입력 */}
                        <Input
                            ref={multipleFileInputRef}
                            type="file"
                            accept=".xlsx,.xls"
                            multiple
                            onChange={handleUploadFiles}
                            className="hidden"
                        />
                    </div>

                    {/* 지원 파일 목록 */}
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            지원되는 파일 목록 ({SUPPORTED_FILES.length}개)
                        </h3>
                        
                        <div className="rounded-lg overflow-y-auto overscroll-contain" style={{ maxHeight: 'calc(100vh - 480px)' }}>
                            <div className="space-y-3">
                                {SUPPORTED_FILES.map((filename, index) => (
                                    <div key={index} className="bg-white rounded-lg p-3 border border-gray-200 hover:shadow-sm transition-shadow">
                                        <div className="flex items-center gap-3">
                                            {/* Excel 아이콘 */}
                                            <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                                <Image 
                                                    src="/xlsx-file.png" 
                                                    alt="Excel 파일" 
                                                    width={20} 
                                                    height={20}
                                                    className="w-5 h-5"
                                                />
                                            </div>
                                            
                                            {/* 파일 정보 */}
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-sm font-semibold text-gray-900 truncate">
                                                    {filename}
                                                </h4>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <p className="text-sm text-gray-500 mt-3">
                            supported .xlsx version: 2025.09.03
                        </p>
                    </div>
                
                </div>
            </div>
        </div>
    );
}
