import { BundleListResponse, getBundleDetail, BundleElementResponse, BundleResponse } from '@/api/bundles-api';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';

interface BundleDetailProps {
  bundle: BundleListResponse;
  onSelect: (bundle: BundleListResponse) => void;
}

export default function BundleDetail({ bundle, onSelect }: BundleDetailProps) {
  const [bundleDetail, setBundleDetail] = useState<BundleResponse | null>(null);
  const [loading, setLoading] = useState(false);

  // Bundle 상세 정보 가져오기
  useEffect(() => {
    const fetchBundleDetail = async () => {
      setLoading(true);
      try {
        const detail = await getBundleDetail(bundle.group_id);
        setBundleDetail(detail);
      } catch (error) {
        console.error('Bundle 상세 조회 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBundleDetail();
  }, [bundle.group_id]);

  // 총 비용 계산
  const totalCost = bundle.elements.reduce((sum, element) => 
    sum + (element.element_cost || 0), 0
  );

  return (
    <div className="space-y-5">
      {/* 기본 정보 */}
      <div>
        <h4 className="font-medium text-gray-800 mb-3 text-sm">기본 정보</h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between py-1">
            <span className="text-gray-700 text-xs">패키지명</span>
            <span className="text-gray-900 text-sm">{bundle.name || '이름 없음'}</span>
          </div>
          <div className="flex items-center justify-between py-1">
            <span className="text-gray-700 text-xs">그룹 ID</span>
            <span className="text-gray-900 text-sm">{bundle.group_id}</span>
          </div>
          <div className="flex items-center justify-between py-1">
            <span className="text-gray-700 text-xs">설명</span>
            <span className="text-gray-900 text-sm max-w-xs text-right">{bundle.description || '설명 없음'}</span>
          </div>
        </div>
      </div>

      {/* 패키지 요약 */}
      <div>
        <h4 className="font-medium text-gray-800 mb-3 text-sm">패키지 요약</h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between py-1">
            <span className="text-gray-700 text-xs">포함 시술</span>
            <span className="text-blue-600 text-sm font-medium">{bundle.elements.length}개</span>
          </div>
          <div className="flex items-center justify-between py-1">
            <span className="text-gray-700 text-xs">총 비용</span>
            <span className="text-green-600 text-sm font-medium">
              {totalCost.toLocaleString()}원
            </span>
          </div>
          <div className="flex items-center justify-between py-1">
            <span className="text-gray-700 text-xs">상태</span>
            <span className={`text-sm font-medium ${bundle.release === 1 ? 'text-green-600' : 'text-red-600'}`}>
              {bundle.release === 1 ? '활성' : '비활성'}
            </span>
          </div>
        </div>
      </div>

      {/* 포함된 시술 목록 */}
      <div>
        <h4 className="font-medium text-gray-800 mb-3 text-sm">포함된 시술 목록</h4>
        {loading ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-xs text-gray-600 mt-2">상세 정보를 불러오는 중...</p>
          </div>
        ) : bundleDetail ? (
          <div className="space-y-2">
            {bundleDetail.elements?.map((element: BundleElementResponse, index: number) => (
              <div key={index} className="bg-gray-50 rounded-lg p-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700 text-xs">시술명</span>
                    <span className="text-gray-900 text-sm font-medium">
                      {element.element_detail?.name || `시술 ${element.element_id}`}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700 text-xs">가격 비율</span>
                    <span className="text-gray-900 text-sm">{(element.price_ratio * 100).toFixed(1)}%</span>
                  </div>
                  {element.element_cost && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700 text-xs">비용</span>
                      <span className="text-gray-900 text-sm">{element.element_cost.toLocaleString()}원</span>
                    </div>
                  )}
                  {element.element_detail?.cost_time && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700 text-xs">소요시간</span>
                      <span className="text-gray-900 text-sm">{element.element_detail.cost_time}분</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700 text-xs">상태</span>
                    <span className={`text-xs ${element.release === 1 ? 'text-green-600' : 'text-red-600'}`}>
                      {element.release === 1 ? '활성' : '비활성'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500 text-sm">
            상세 정보를 불러올 수 없습니다.
          </div>
        )}
      </div>

      {/* 선택 버튼 */}
      <Button 
        onClick={() => onSelect(bundle)}
        className="w-full bg-gray-900 hover:bg-gray-800 text-white py-4 text-base font-semibold rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
      >
        이 패키지 선택하기
      </Button>
    </div>
  );
}
