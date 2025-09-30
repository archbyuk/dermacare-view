'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import { Upload } from 'lucide-react';
import { uploadFiles } from '@/api/upload-api';
import toast from 'react-hot-toast';

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
    
    const multipleFileInputRef = useRef<HTMLInputElement>(null);



    const handleUploadFiles = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files || []);
        if (files.length === 0) return;

        setIsLoading(true);

        try {
            const result = await uploadFiles(files);
            
            // results 배열에서 실패한 파일들 찾기
            const failedFiles = result.results.filter(file => !file.success);
            const successfulFiles = result.results.filter(file => file.success);
            
            if (failedFiles.length > 0) {
                // 에러가 있는 경우
                let errorText = `[ 업로드 실패 ]: ${failedFiles.length}개 파일에서 오류 발생`;
                
                failedFiles.forEach((file, _index) => {
                    if (file.errors && Array.isArray(file.errors) && file.errors.length > 0) {
                        file.errors.forEach((error: string) => {
                            errorText += `\n\n    ${error}`;
                        });
                    }
                });
                
                if (successfulFiles.length > 0) {
                    errorText += `\n\n성공: ${successfulFiles.length}개 파일 업로드 완료`;
                }
                
                toast.error(errorText);
            } else {
                // 모든 파일이 성공한 경우
                toast.success(`모든 파일 업로드가 성공적으로 처리되었습니다.\n\n총 ${result.total_files}개 파일 업로드 완료`);
            }
            
            // 파일 입력 초기화
            if (multipleFileInputRef.current) {
                multipleFileInputRef.current.value = '';
            }
        } catch (error: unknown) {
            console.error('파일 업로드 에러:', error);
            const errorMessage = error instanceof Error ? error.message : '파일 업로드에 실패했습니다.';
            toast.error(errorMessage);
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
