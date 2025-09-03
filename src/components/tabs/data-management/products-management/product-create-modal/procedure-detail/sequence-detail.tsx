import { SequenceResponse, getSequenceDetail, SequenceStepResponse, BundleElementInfo } from '@/api/sequences-api';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';

interface SequenceDetailProps {
  sequence: SequenceResponse;
  onSelect: (sequence: SequenceResponse) => void;
}

export default function SequenceDetail({ sequence, onSelect }: SequenceDetailProps) {
  const [sequenceDetail, setSequenceDetail] = useState<SequenceResponse | null>(null);
  const [loading, setLoading] = useState(false);

  // Sequence 상세 정보 가져오기
  useEffect(() => {
    const fetchSequenceDetail = async () => {
      setLoading(true);
      try {
        const detail = await getSequenceDetail(sequence.group_id);
        setSequenceDetail(detail);
        console.log(detail);
      } catch (error) {
        console.error('Sequence 상세 조회 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSequenceDetail();
  }, [sequence.group_id]);

  // 총 비용 계산
  const totalCost = sequence.steps?.reduce((sum, step) => 
    sum + (step.procedure_cost || 0), 0
  ) || 0;

  // 총 기간 계산
  const totalDuration = sequence.steps?.reduce((sum, step) => 
    sum + (step.sequence_interval || 0), 0
  ) || 0;

  return (
    <div className="space-y-5">
      {/* 기본 정보 */}
      <div>
        <h4 className="font-medium text-gray-800 mb-3 text-sm">기본 정보</h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between py-1">
            <span className="text-gray-700 text-xs">시퀀스명</span>
            <span className="text-gray-900 text-sm">{sequence.sequence_name || '이름 없음'}</span>
          </div>
          <div className="flex items-center justify-between py-1">
            <span className="text-gray-700 text-xs">그룹 ID</span>
            <span className="text-gray-900 text-sm">{sequence.group_id}</span>
          </div>
        </div>
      </div>

      {/* 시퀀스 요약 */}
      <div>
        <h4 className="font-medium text-gray-800 mb-3 text-sm">시퀀스 요약</h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between py-1">
            <span className="text-gray-700 text-xs">총 단계</span>
            <span className="text-blue-600 text-sm font-medium">{sequence.steps?.length || 0}개</span>
          </div>
          <div className="flex items-center justify-between py-1">
            <span className="text-gray-700 text-xs">총 기간</span>
            <span className="text-green-600 text-sm font-medium">{totalDuration}일</span>
          </div>
          <div className="flex items-center justify-between py-1">
            <span className="text-gray-700 text-xs">총 비용</span>
            <span className="text-purple-600 text-sm font-medium">
              {totalCost.toLocaleString()}원
            </span>
          </div>
        </div>
      </div>

      {/* 단계별 시술 목록 */}
      <div>
        <h4 className="font-medium text-gray-800 mb-3 text-sm">단계별 시술 목록</h4>
        {loading ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-xs text-gray-600 mt-2">상세 정보를 불러오는 중...</p>
          </div>
        ) : sequenceDetail ? (
          <div className="space-y-3">
            {sequenceDetail.steps?.map((step: SequenceStepResponse, index: number) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4">
                {/* 단계 헤더 */}
                <div className="flex items-center justify-between mb-3">
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                    Step {step.step_num}
                  </span>
                  {step.name && (
                    <span className="text-gray-900 text-sm font-medium">{step.name}</span>
                  )}
                </div>

                {/* 기본 정보 */}
                <div className="space-y-2 mb-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700 text-xs">시술 타입</span>
                    <span className="text-gray-900 text-sm font-medium">
                      {step.element_id ? `시술 (${step.element_id})` : 
                       step.bundle_id ? `패키지 (${step.bundle_id})` : 
                       step.custom_id ? `커스텀 (${step.custom_id})` : '시술 정보 없음'}
                    </span>
                  </div>
                  {step.sequence_interval && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700 text-xs">간격</span>
                      <span className="text-gray-900 text-sm">{step.sequence_interval}일</span>
                    </div>
                  )}
                  {step.procedure_cost && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700 text-xs">비용</span>
                      <span className="text-blue-700 text-sm font-medium">{step.procedure_cost.toLocaleString()}원</span>
                    </div>
                  )}
                </div>

                {/* 번들 상세 정보 */}
                {step.bundle_info && (
                  <div className="border-t border-gray-200 pt-3">
                    <h5 className="text-gray-800 text-sm font-medium mb-2">번들 정보</h5>
                    <div className="space-y-2 mb-3">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-700 text-xs">번들명</span>
                        <span className="text-gray-900 text-sm">{step.bundle_info.name}</span>
                      </div>
                      {step.bundle_info.element_cost && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-700 text-xs">원가</span>
                          <span className="text-blue-700 text-sm">{step.bundle_info.element_cost.toLocaleString()}원</span>
                        </div>
                      )}
                      {step.bundle_info.price_ratio && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-700 text-xs">가격 비율</span>
                          <span className="text-gray-900 text-sm">{(step.bundle_info.price_ratio * 100).toFixed(1)}%</span>
                        </div>
                      )}
                    </div>

                    {/* 포함된 시술 목록 */}
                    {step.bundle_info.elements && step.bundle_info.elements.length > 0 && (
                      <div className="border-t border-gray-200 pt-3">
                        <h6 className="text-gray-700 text-xs font-medium mb-2">포함된 시술 목록</h6>
                        <div className="space-y-2">
                          {step.bundle_info.elements.map((element: BundleElementInfo, elementIndex: number) => (
                            <div key={elementIndex} className="bg-white rounded p-2 border border-gray-100">
                              <div className="space-y-1">
                                {/* 기본 정보 */}
                                <div className="flex items-center justify-between">
                                  <span className="text-gray-700 text-xs">시술명</span>
                                  <span className="text-gray-900 text-sm font-medium">{element.name}</span>
                                </div>
                                {element.description && (
                                  <div className="flex items-center justify-between">
                                    <span className="text-gray-700 text-xs">설명</span>
                                    <span className="text-gray-900 text-sm">{element.description}</span>
                                  </div>
                                )}
                                
                                {/* 시술 정보 */}
                                <div className="flex items-center justify-between">
                                  <span className="text-gray-700 text-xs">소요시간</span>
                                  <span className="text-gray-900 text-sm">{element.cost_time}분</span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-gray-700 text-xs">난이도</span>
                                  <span className="text-gray-900 text-sm">{element.procedure_level}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-gray-700 text-xs">담당자</span>
                                  <span className="text-gray-900 text-sm">{element.position_type}</span>
                                </div>

                                {/* 분류 정보 */}
                                <div className="flex items-center justify-between">
                                  <span className="text-gray-700 text-xs">대분류</span>
                                  <span className="text-gray-900 text-sm">{element.class_major}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-gray-700 text-xs">중분류</span>
                                  <span className="text-gray-900 text-sm">{element.class_sub}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-gray-700 text-xs">세분류</span>
                                  <span className="text-gray-900 text-sm">{element.class_detail}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-gray-700 text-xs">시술 유형</span>
                                  <span className="text-gray-900 text-sm">{element.class_type}</span>
                                </div>

                                {/* 가격 정보 */}
                                {element.price && (
                                  <div className="flex items-center justify-between">
                                    <span className="text-gray-700 text-xs">시술 가격</span>
                                    <span className="text-blue-600 text-sm font-medium">{element.price.toLocaleString()}원</span>
                                  </div>
                                )}
                                {element.procedure_cost && (
                                  <div className="flex items-center justify-between">
                                    <span className="text-gray-700 text-xs">원가</span>
                                    <span className="text-blue-700 text-sm">{element.procedure_cost.toLocaleString()}원</span>
                                  </div>
                                )}

                                {/* 소모품 정보 */}
                                {element.consumable_info && (
                                  <div className="border-t border-gray-100 pt-2 mt-2">
                                    <div className="flex items-center justify-between">
                                      <span className="text-gray-700 text-xs">소모품명</span>
                                      <span className="text-gray-900 text-sm font-medium">{element.consumable_info.name}</span>
                                    </div>
                                    {element.consumable_info.description && (
                                      <div className="flex items-center justify-between">
                                        <span className="text-gray-700 text-xs">설명</span>
                                        <span className="text-gray-900 text-sm">{element.consumable_info.description}</span>
                                      </div>
                                    )}
                                    <div className="flex items-center justify-between">
                                      <span className="text-gray-700 text-xs">단위</span>
                                      <span className="text-gray-900 text-sm">{element.consumable_info.unit_type}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <span className="text-gray-700 text-xs">수량</span>
                                      <span className="text-gray-900 text-sm">{element.consum_1_count}</span>
                                    </div>
                                    {element.consumable_info.price && (
                                      <div className="flex items-center justify-between">
                                        <span className="text-gray-700 text-xs">소모품 가격</span>
                                        <span className="text-gray-900 text-sm">{element.consumable_info.price.toLocaleString()}원</span>
                                      </div>
                                    )}
                                  </div>
                                )}

                                {/* 플랜 정보 */}
                                {element.plan_count && (
                                  <div className="flex items-center justify-between">
                                    <span className="text-gray-700 text-xs">플랜 횟수</span>
                                    <span className="text-gray-900 text-sm">{element.plan_count}회</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 커스텀 상세 정보 */}
                {step.custom_info && (
                  <div className="border-t border-gray-200 pt-3">
                    <h5 className="text-gray-800 text-sm font-medium mb-2">커스텀 정보</h5>
                    {/* 커스텀 정보 표시 로직 추가 예정 */}
                  </div>
                )}

                {/* 시술 상세 정보 */}
                {step.element_info && (
                  <div className="border-t border-gray-200 pt-3">
                    <h5 className="text-gray-800 text-sm font-medium mb-2">시술 정보</h5>
                    {/* 시술 정보 표시 로직 추가 예정 */}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500 text-sm">
            상세 정보를 불러올 수 없습니다.
          </div>
        )}
      </div>

      {/* 시퀀스 특징 */}
      <div>
        <h4 className="font-medium text-gray-800 mb-3 text-sm">시퀀스 특징</h4>
        <div className="text-sm text-gray-600">
          <p>• 단계별로 순차적인 시술 진행</p>
          <p>• 각 단계별 개별적인 간격 설정</p>
          <p>• 가격 비율을 통한 단계별 가격 정책</p>
          <p>• 체계적인 치료 과정 관리</p>
        </div>
      </div>

      {/* 선택 버튼 */}
      <Button 
        onClick={() => onSelect(sequence)}
        className="w-full bg-gray-900 hover:bg-gray-800 text-white py-4 text-base font-semibold rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
      >
        이 시퀀스 선택하기
      </Button>
    </div>
  );
}
