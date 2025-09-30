'use server'

import { instance } from './axios-instance';
import { put } from '@vercel/blob';

interface FileUrl {
    url: string;
    name: string;
    size: number;
}

interface UploadResult {
    filename: string;
    success: boolean;
    [key: string]: unknown;
}

interface UploadError {
    filename: string;
    error: string;
    [key: string]: unknown;
}

interface UploadFilesResponse {
    status: string;
    message: string;
    total_files: number;
    successful_files: number;
    failed_files: number;
    results: UploadResult[];
    errors: UploadError[];
}

export async function uploadFiles(files: File[]): Promise<UploadFilesResponse> {
  
    try {
        const fileUrls: FileUrl[] = [];

        // 각 파일을 Vercel Blob에 업로드
        for (const file of files) {
            try {
                const blob = await put(file.name, file, {
                    access: 'public',
                    allowOverwrite: true, // 기존 파일 덮어쓰기
                });

                fileUrls.push({
                    url: blob.url,
                    name: file.name,
                    size: file.size
                });

            } catch (error) {
                console.error(`파일 ${file.name} Blob 업로드 실패:`, error);
                throw new Error(`파일 ${file.name} 업로드 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
            }
        }

        // FormData로 파일 URL들 전송
        const formData = new FormData();
        formData.append('file_json', JSON.stringify(fileUrls));

        const response = await instance.post('/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        return response.data;
    } 
    
    catch (error: unknown) {
        console.error('.xlsx 파일 업로드 에러:', error);
        
        const errorMessage = error instanceof Error ? error.message : '.xlsx 파일 업로드에 실패했습니다.';
        
        throw new Error(errorMessage);
    }
}