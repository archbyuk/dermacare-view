'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { logoutAction } from '@/app/actions';

export default function TreatmentListPage() {
  const router = useRouter();

  // 로그아웃 처리
  const handleLogout = async () => {
    try {
      await logoutAction();
    } catch (error) {
      console.error('로그아웃 에러:', error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <div className="w-full">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">치료 목록</h1>
            <p className="text-sm text-gray-500">나의 치료 일정</p>
          </div>
          <button 
            onClick={handleLogout}
            className="p-2 rounded-lg hover:bg-gray-100"
            title="로그아웃"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>

        {/* 메인 콘텐츠 영역 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">치료 목록</h3>
            <p className="text-sm text-gray-500 mb-6">여기에 치료 목록이 표시됩니다</p>
            
            {/* 임시 버튼들 */}
            <div className="space-y-3">
              <button className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors">
                치료 예약하기
              </button>
              <button className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
                예약 내역 보기
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
