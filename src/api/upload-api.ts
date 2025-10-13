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
        // 각 파일을 병렬로 Vercel Blob에 업로드
        const uploadPromises = files.map(async (file) => {
            try {
                const blob = await put(file.name, file, {
                    access: 'public',
                    allowOverwrite: true,
                });

                return {
                    url: blob.url,
                    name: file.name,
                    size: file.size
                };
            } catch (error) {
                throw new Error(`파일 ${file.name} 업로드 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
            }
        });

        const fileUrls = await Promise.all(uploadPromises);

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
        const errorMessage = error instanceof Error ? error.message : '.xlsx 파일 업로드에 실패했습니다.';
        throw new Error(errorMessage);
    }
}