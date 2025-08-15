'use server'

import { instance } from './axios-instance';

export async function uploadSingleExcel(file: File): Promise<{
  status: string;
  message: string;
  file_info?: {
    filename: string;
    size_bytes: number;
  };
  processing_result?: unknown;
}> {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await instance.post('/excel/upload-single', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error: unknown) {
    console.error('단일 엑셀 업로드 에러:', error);
    const errorMessage = error instanceof Error ? error.message : '엑셀 파일 업로드에 실패했습니다.';
    throw new Error(errorMessage);
  }
}

export async function uploadMultipleExcel(
  files: File[], 
  clearTables: boolean = false
): Promise<{
  status: string;
  message: string;
  summary: {
    total_files: number;
    success_count: number;
    failed_count: number;
  };
  results: Array<{
    filename: string;
    status: string;
    result?: unknown;
    error?: string;
  }>;
  cleared_tables?: Record<string, number>;
}> {
  try {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });
    formData.append('clear_tables', clearTables.toString());

    const response = await instance.post('/excel/upload-multiple', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error: unknown) {
    console.error('다중 엑셀 업로드 에러:', error);
    const errorMessage = error instanceof Error ? error.message : '엑셀 파일 업로드에 실패했습니다.';
    throw new Error(errorMessage);
  }
}

export async function getSupportedFiles(): Promise<{
  status: string;
  supported_files: string[];
  total_count: number;
  message: string;
}> {
  try {
    const response = await instance.get('/excel/supported-files');
    return response.data;
  } catch (error: unknown) {
    console.error('지원 파일 목록 조회 에러:', error);
    const errorMessage = error instanceof Error ? error.message : '지원 파일 목록 조회에 실패했습니다.';
    throw new Error(errorMessage);
  }
}

// 관리자 권한 확인
export async function checkAdminRole(): Promise<{ isAdmin: boolean; message?: string }> {
  try {
    const response = await instance.get('/admin/check-role');
    
    return {
      isAdmin: response.data.is_admin || false,
      message: response.data.message
    };
  } catch (error: unknown) {
    console.error('관리자 권한 확인 에러:', error);
    
    // 403 에러는 권한 없음을 의미
    if (error && typeof error === 'object' && 'response' in error && 
        error.response && typeof error.response === 'object' && 'status' in error.response &&
        error.response.status === 403) {
      return {
        isAdmin: false,
        message: '관리자 권한이 필요합니다.'
      };
    }
    
    const errorMessage = error instanceof Error ? error.message : '권한 확인에 실패했습니다.';
    throw new Error(errorMessage);
  }
}
