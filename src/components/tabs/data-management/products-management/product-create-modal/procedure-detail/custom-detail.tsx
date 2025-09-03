import { CustomListResponse, getCustomDetail, CustomResponse } from '@/api/customs-api';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';

interface CustomDetailProps {
  custom: CustomListResponse;
  onSelect: (custom: CustomListResponse) => void;
}

export default function CustomDetail({ custom, onSelect }: CustomDetailProps) {
  const [customDetail, setCustomDetail] = useState<CustomResponse | null>(null);
  const [loading, setLoading] = useState(false);

  // Custom 상세 정보 가져오기
  useEffect(() => {
    const fetchCustomDetail = async () => {
      setLoading(true);
      try {
        const detail = await getCustomDetail(custom.group_id);
        setCustomDetail(detail);
      } catch (error) {
        console.error('Custom 상세 조회 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomDetail();
  }, [custom.group_id]);

  // 총 비용 계산
  const totalCost = custom.elements.reduce((sum, element) => 
    sum + (element.element_cost || 0), 0
  );

  return (
    <div className="space-y-5">
      {/* 기본 정보 */}
      <div>
        <h4 className="font-medium text-gray-800 mb-3 text-sm">기본 정보</h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between py-1">
            <span className="text-gray-700 text-xs">커스텀명</span>
            <span className="text-gray-900 text-sm">{custom.name || '이름 없음'}</span>
          </div>
          <div className="flex items-center justify-between py-1">
            <span className="text-gray-700 text-xs">그룹 ID</span>
            <span className="text-gray-900 text-sm">{custom.group_id}</span>
          </div>
          <div className="flex items-center justify-between py-1">
            <span className="text-gray-700 text-xs">설명</span>
            <span className="text-gray-900 text-sm max-w-xs text-right">{custom.description || '설명 없음'}</span>
          </div>
        </div>
      </div>

      {/* 커스텀 요약 */}
      <div>
        <h4 className="font-medium text-gray-800 mb-3 text-sm">커스텀 요약</h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between py-1">
            <span className="text-gray-700 text-xs">포함 시술</span>
            <span className="text-blue-600 text-sm font-medium">{custom.elements.length}개</span>
          </div>
          <div className="flex items-center justify-between py-1">
            <span className="text-gray-700 text-xs">총 비용</span>
            <span className="text-green-600 text-sm font-medium">
              {totalCost.toLocaleString()}원
            </span>
          </div>
          <div className="flex items-center justify-between py-1">
            <span className="text-gray-700 text-xs">상태</span>
            <span className={`text-sm font-medium ${custom.release === 1 ? 'text-green-600' : 'text-red-600'}`}>
              {custom.release === 1 ? '활성' : '비활성'}
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
        ) : customDetail ? (
          <div className="space-y-2">
            {customDetail.elements?.map((element, index: number) => (
              <div key={index} className="bg-gray-50 rounded-lg p-3">
                <div className="space-y-2">
                  {/* 기본 정보 */}
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700 text-xs">시술명</span>
                    <span className="text-gray-900 text-sm font-medium">
                      {element.element_detail?.name || `시술 ${element.element_id}`}
                    </span>
                  </div>
                  {element.element_detail?.description && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700 text-xs">설명</span>
                      <span className="text-gray-900 text-sm max-w-xs text-right">{element.element_detail.description}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700 text-xs">시술 ID</span>
                    <span className="text-gray-900 text-sm font-medium">
                      {element.element_id}
                    </span>
                  </div>
                  
                  {/* 커스텀 설정 */}
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700 text-xs">커스텀 횟수</span>
                    <span className="text-gray-900 text-sm">{element.custom_count}회</span>
                  </div>
                  {element.element_limit && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700 text-xs">제한 횟수</span>
                      <span className="text-gray-900 text-sm">{element.element_limit}회</span>
                    </div>
                  )}
                  
                  {/* 가격 정보 */}
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700 text-xs">가격 비율</span>
                    <span className="text-gray-900 text-sm">{(element.price_ratio * 100).toFixed(1)}%</span>
                  </div>
                  {element.element_cost && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700 text-xs">원가</span>
                      <span className="text-blue-700 text-sm">{element.element_cost.toLocaleString()}원</span>
                    </div>
                  )}
                  
                  {/* 시술 정보 */}
                  {element.element_detail?.cost_time && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700 text-xs">소요시간</span>
                      <span className="text-gray-900 text-sm">{element.element_detail.cost_time}분</span>
                    </div>
                  )}
                  {element.element_detail?.procedure_level && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700 text-xs">시술 레벨</span>
                      <span className="text-gray-900 text-sm">{element.element_detail.procedure_level}</span>
                    </div>
                  )}
                  {element.element_detail?.position_type && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700 text-xs">시술자</span>
                      <span className="text-gray-900 text-sm">{element.element_detail.position_type}</span>
                    </div>
                  )}
                  
                  {/* 분류 정보 */}
                  {element.element_detail?.class_major && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700 text-xs">분류</span>
                      <span className="text-gray-900 text-sm text-right">
                        {element.element_detail.class_major} &gt; {element.element_detail.class_sub} &gt; {element.element_detail.class_detail}
                      </span>
                    </div>
                  )}
                  
                  {/* 소모품 정보 */}
                  {element.element_detail?.consum_1_name && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700 text-xs">소모품</span>
                      <span className="text-gray-900 text-sm">
                        {element.element_detail.consum_1_name} {element.element_detail.consum_1_count}{element.element_detail.consum_1_unit}
                      </span>
                    </div>
                  )}
                  
                  {/* 플랜 정보 */}
                  {element.element_detail?.plan_count && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700 text-xs">플랜 횟수</span>
                      <span className="text-gray-900 text-sm">{element.element_detail.plan_count}회</span>
                    </div>
                  )}
                  
                  {/* 상태 */}
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

      {/* 커스텀 특징 */}
      <div>
        <h4 className="font-medium text-gray-800 mb-3 text-sm">커스텀 특징</h4>
        <div className="text-sm text-gray-600">
          <p>• 각 시술별로 개별적인 횟수 설정 가능</p>
          <p>• 가격 비율을 통한 유연한 가격 정책</p>
          <p>• 시술별 제한 횟수 설정으로 안전성 확보</p>
        </div>
      </div>

      {/* 선택 버튼 */}
      <Button 
        onClick={() => onSelect(custom)}
        className="w-full bg-gray-900 hover:bg-gray-800 text-white py-4 text-base font-semibold rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
      >
        이 커스텀 선택하기
      </Button>
    </div>
  );
}
