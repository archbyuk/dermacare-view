'use client';

export function AppointmentsTab() {
  return (
    <div>
      {/* 헤더 */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">예약</h1>
        <p className="text-sm text-gray-500">예약 관리 및 확인</p>
      </div>

      {/* 메인 콘텐츠 영역 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">예약 기능 준비 중</h3>
          <p className="text-sm text-gray-500">곧 예약 기능을 이용할 수 있습니다</p>
        </div>
      </div>
    </div>
  );
}
