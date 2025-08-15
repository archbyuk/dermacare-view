'use client';

import { useState, useEffect, useRef } from 'react';
import { uploadSingleExcel, uploadMultipleExcel, getSupportedFiles } from '@/api/admin-api';

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
    <div className="min-h-screen bg-white px-4 py-6">
      <div className="w-full max-w-sm mx-auto">
        


        {/* 메시지 표시 */}
        {message && (
          <div className={`mb-6 p-3 rounded-lg text-sm ${
            message.type === 'success' 
              ? 'bg-green-100 border border-green-400 text-green-700' 
              : 'bg-red-100 border border-red-400 text-red-700'
          }`}>
            {message.text}
          </div>
        )}

        {/* 메인 콘텐츠 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {/* 단일 파일 업로드 */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">단일 파일 업로드</h3>
            <button
              onClick={triggerSingleFileInput}
              disabled={isLoading}
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? '업로드 중...' : '파일 선택'}
            </button>
            <input
              ref={singleFileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleSingleFileUpload}
              className="hidden"
            />
          </div>

          {/* 다중 파일 업로드 */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">다중 파일 업로드</h3>
            <button
              onClick={triggerMultipleFileInput}
              disabled={isLoading}
              className="w-full bg-green-500 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-3"
            >
              {isLoading ? '업로드 중...' : '파일들 선택'}
            </button>
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={clearTables}
                onChange={(e) => setClearTables(e.target.checked)}
                className="rounded border-gray-300"
              />
              기존 데이터 삭제 후 업로드
            </label>
            <input
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
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                지원되는 파일 ({supportedFiles.total_count}개)
              </h3>
              <div className="bg-gray-50 rounded-lg p-3 max-h-32 overflow-y-auto">
                <div className="grid grid-cols-1 gap-1 text-xs">
                  {supportedFiles.supported_files.map((filename, index) => (
                    <div key={index} className="text-gray-600 font-mono">
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
