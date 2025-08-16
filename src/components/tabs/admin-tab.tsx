'use client';

import { useState, useEffect, useRef } from 'react';
import { uploadSingleExcel, uploadMultipleExcel, getSupportedFiles } from '@/api/admin-api';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface SupportedFiles {
  supported_files: string[];
  total_count: number;
}

export function AdminTab() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [supportedFiles, setSupportedFiles] = useState<SupportedFiles | null>(null);
  const [clearTables, setClearTables] = useState(false);
  
  const singleFileInputRef = useRef<HTMLInputElement>(null);
  const multipleFileInputRef = useRef<HTMLInputElement>(null);

  // 지원 파일 목록 조회
  useEffect(() => {
    const fetchSupportedFiles = async () => {
      try {
        const result = await getSupportedFiles();
        setSupportedFiles(result);
      } catch (error: unknown) {
        console.error('지원 파일 목록 조회 에러:', error);
        const errorMessage = error instanceof Error ? error.message : '지원 파일 목록을 불러오는데 실패했습니다.';
        setMessage({ type: 'error', text: errorMessage });
      }
    };

    fetchSupportedFiles();
  }, []);

  const handleSingleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setMessage(null);

    try {
      const result = await uploadSingleExcel(file);
      setMessage({ type: 'success', text: result.message });
      
      // 파일 입력 초기화
      if (singleFileInputRef.current) {
        singleFileInputRef.current.value = '';
      }
    } catch (error: unknown) {
      console.error('단일 엑셀 업로드 에러:', error);
      const errorMessage = error instanceof Error ? error.message : '엑셀 파일 업로드에 실패했습니다.';
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMultipleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    setIsLoading(true);
    setMessage(null);

    try {
      const result = await uploadMultipleExcel(files, clearTables);
      setMessage({ type: 'success', text: result.message });
      
      // 파일 입력 초기화
      if (multipleFileInputRef.current) {
        multipleFileInputRef.current.value = '';
      }
    } catch (error: unknown) {
      console.error('다중 엑셀 업로드 에러:', error);
      const errorMessage = error instanceof Error ? error.message : '엑셀 파일 업로드에 실패했습니다.';
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const triggerSingleFileInput = () => {
    singleFileInputRef.current?.click();
  };

  const triggerMultipleFileInput = () => {
    multipleFileInputRef.current?.click();
  };

  return (
    <div className="px-7">
      <div className="w-full max-w-md mx-auto">
        {/* 메시지 표시 */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg text-sm ${
            message.type === 'success' 
              ? 'bg-gray-50 border border-gray-200 text-gray-700' 
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}>
            {message.text}
          </div>
        )}

        {/* 메인 콘텐츠 */}
        <div className="bg-white rounded-lg shadow-none">
          {/* 단일 파일 업로드 */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-2">단일 파일 업로드</h3>
            <Button
              onClick={triggerSingleFileInput}
              disabled={isLoading}
              className="w-full bg-gray-500 text-white py-5 px-4 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? '업로드 중...' : '파일 선택'}
            </Button>
            <Input
              ref={singleFileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleSingleFileUpload}
              className="hidden"
            />
          </div>

          {/* 다중 파일 업로드 */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-2">다중 파일 업로드</h3>
            <Button
              onClick={triggerMultipleFileInput}
              disabled={isLoading}
              className="w-full bg-gray-500 text-white py-5 px-4 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-4"
            >
              {isLoading ? '업로드 중...' : '파일들 선택'}
            </Button>
            <Label className="flex items-center gap-2 text-sm text-gray-600 pl-1">
              <Checkbox
                checked={clearTables}
                onCheckedChange={(checked) => setClearTables(checked as boolean)}
                className="h-4 w-4 pb-1 data-[state=checked]:bg-gray-600 data-[state=checked]:border-gray-600 data-[state=checked]:text-white"
              />
              <span className='pr-2 pt-0.5'>기존 데이터 삭제 후 업로드</span>
            </Label>
            <Input
              ref={multipleFileInputRef}
              type="file"
              accept=".xlsx,.xls"
              multiple
              onChange={handleMultipleFileUpload}
              className="hidden"
            />
          </div>

          {/* 지원 파일 목록 */}
          {supportedFiles && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                지원되는 파일 ({supportedFiles.total_count}개)
              </h3>
              <div className="bg-gray-50 rounded-lg p-4 max-h-[47vh] overflow-y-auto border border-gray-200">
                <div className="grid grid-cols-1 gap-2 text-sm">
                  {supportedFiles.supported_files.map((filename, index) => (
                    <div key={index} className="text-gray-600 font-mono bg-white px-3 py-2 rounded border border-gray-200">
                      {filename}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
