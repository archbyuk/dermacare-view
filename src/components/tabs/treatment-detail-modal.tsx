'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { getTreatmentDetail } from '@/api/treatments-api';
import { ProductDetail } from '@/types/treatments';
import { Button } from '@/components/ui/button';

interface TreatmentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: number;
  productType: 'standard' | 'event';
}

export function TreatmentDetailModal({ 
  isOpen, 
  onClose, 
  productId, 
  productType 
}: TreatmentDetailModalProps) {
  const [detail, setDetail] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && productId) {
      fetchTreatmentDetail();
    }
  }, [isOpen, productId, productType]);

  const fetchTreatmentDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await getTreatmentDetail({
        product_id: productId,
        product_type: productType
      });
      
      // 받아온 상세 데이터 로깅 (개발용)
      // console.log('시술 상세 모달에서 받은 데이터:', response.data);
      
      setDetail(response.data);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '상세 정보를 불러오는데 실패했습니다.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-hidden">
      <div className="bg-white rounded-lg w-full max-w-md h-[80vh] flex flex-col shadow-xl">
        
        {/* 헤더 */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">시술 상세</h2>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-gray-600 p-0 h-auto"
          >
            {/* 여기 수정의 여지가 있음 */}
          </Button>
        </div>

        {/* 내용 */}
        <div className="p-4 flex-1 overflow-y-auto relative">
          {loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-start pt-20 bg-white bg-opacity-90">
              <div className="flex items-center mb-4">
                <Image src="/symbol_facefilter.svg" alt="로딩" width={32} height={32} className="animate-spin" />
              </div>
              <p className="text-gray-600 text-sm">로딩 중입니다</p>
            </div>
          )}

          {error && (
            <div className="text-center py-8">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {detail && !loading && (
            <div className="space-y-4">
              {/* 기본 정보 */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {detail.Product_Name || `시술 ${detail.ID}`}
                </h3>
                <div className="flex items-center space-x-2 text-sm text-gray-600 mb-3">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    detail.Product_Type === 'standard' 
                      ? 'bg-gray-100 text-gray-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {detail.Product_Type === 'standard' ? '기본 시술' : '이벤트 시술'}
                  </span>
                  <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
                    {detail.Package_Type === '단일시술' ? '단일시술' : 
                     detail.Package_Type === '번들' ? '패키지' :
                     detail.Package_Type === '시퀀스' ? '코스 패키지' :
                     detail.Package_Type === '커스텀' ? '커스텀' : detail.Package_Type}
                  </span>
                </div>
              </div>

              {/* 가격 정보 */}
              <div className="bg-gray-50 rounded-lg p-3">
              {detail.Original_Price && detail.Original_Price > detail.Sell_Price && (
                <div className="flex items-center justify-between mt-1">
                  <span className="text-sm text-gray-600">기존가</span>
                  <span className="text-sm text-gray-400 line-through">
                    {detail.Original_Price.toLocaleString()}원
                  </span>
                </div>
              )}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">판매가</span>
                  <span className="text-lg font-semibold text-gray-900">
                    {detail.Sell_Price?.toLocaleString()}원
                  </span>
                </div>
                {detail.Discount_Rate && detail.Discount_Rate > 0 && (
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-sm text-gray-600">할인율</span>
                    <span className="text-sm text-red-500 font-medium">
                      {Math.round(detail.Discount_Rate * 100)}%
                    </span>
                  </div>
                )}
              </div>

              {/* 시술 정보 */}
              {detail.bundle_name && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">패키지</h4>
                  <p className="text-sm text-gray-600 pl-3">{detail.bundle_name}</p>
                </div>
              )}

              {detail.custom_name && (
                                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">커스텀 시술</h4>
                    <div className="flex items-center justify-between text-sm pl-3">
                      <span className="text-gray-700">{detail.custom_name}</span>
                      <span className="text-gray-500">최대 {detail.custom_details?.[0]?.Custom_Count}회</span>
                    </div>
                  </div>
              )}

              {/* 번들 시술 상세 정보 */}
              {detail.bundle_details && detail.bundle_details.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">포함 시술</h4>
                  <div className="space-y-3">
                    {detail.bundle_details.map((bundle, index) => (
                      <div key={index} className="flex items-center justify-between text-xs pl-3">
                        <span className="text-gray-700">{bundle.Element_Info?.Name}</span>
                        <span className="text-gray-500">{bundle.Element_Cost?.toLocaleString()}원</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 커스텀 시술 상세 정보 */}
              {detail.custom_details && detail.custom_details.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">커스텀 시술 상세</h4>
                  <div className="space-y-3">
                    {detail.custom_details.map((custom, index) => (
                      <div key={index} className="flex items-center justify-between text-xs pl-3">
                        <span className="text-gray-700">{custom.Element_Info?.Name}</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-500">{custom.Element_Cost?.toLocaleString()}원</span>
                          <span className="text-xs text-gray-400">
                            {custom.Element_Limit ? `최대 ${custom.Element_Limit}회` : '제한없음'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 시퀀스 시술 상세 정보 */}
              {detail.sequence_details && detail.sequence_details.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">코스 패키지</h4>
                  <div className="space-y-3">
                    {detail.sequence_details.map((sequence, index) => (
                      <div key={index} className="border-l-2 border-gray-300 pl-3">
                        <h5 className="text-sm font-medium text-gray-800 mb-1">{sequence.Step_Num} 회차</h5>
                        <div className="space-y-1">
                          {sequence.elements.map((element, elemIndex) => (
                            <div key={elemIndex} className="flex items-center justify-between text-xs">
                              <span className="text-gray-600">{element.Name}</span>
                              <span className="text-gray-500">
                                {element.Element_Cost ? `${element.Element_Cost.toLocaleString()}원` : '가격 정보 없음'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 단일 시술 정보 */}
              {detail.element_details && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">시술 정보</h4>
                  <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">시술명</span>
                      <span className="text-gray-900">{detail.element_details.Name || '-'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">대분류</span>
                      <span className="text-gray-900">{detail.element_details.Class_Major || '-'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">중분류</span>
                      <span className="text-gray-900">{detail.element_details.Class_Sub || '-'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">소분류</span>
                      <span className="text-gray-900">{detail.element_details.Class_Detail || '-'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">시술 타입</span>
                      <span className="text-gray-900">{detail.element_details.Class_Type || '-'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">소요시간</span>
                      <span className="text-gray-900">{detail.element_details.Cost_Time ? `${detail.element_details.Cost_Time}분` : '-'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">티켓팅 여부</span>
                      <span className="text-gray-900">{detail.element_details.Plan_State ? (detail.element_details.Plan_State === '1' ? 'O' : 'X') : '-'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">티켓팅 횟수</span>
                      <span className="text-gray-900">{detail.element_details.Plan_Count ? `${detail.element_details.Plan_Count}회` : '-'}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* 기간 정보 */}
              {detail.Validity_Period && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">유효기간</h4>
                  <p className="text-sm text-gray-600">{detail.Validity_Period}일</p>
                </div>
              )}

              {/* 시술 기간 */}
              {detail.Standard_Start_Date && detail.Standard_End_Date && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">시술 기간</h4>
                  <p className="text-sm text-gray-600 pl-3">
                    {detail.Standard_Start_Date} ~ {detail.Standard_End_Date}
                  </p>
                </div>
              )}

              {/* 이벤트 기간 */}
              {detail.Event_Start_Date && detail.Event_End_Date && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">이벤트 기간</h4>
                  <p className="text-sm text-gray-600 pl-3">
                    {detail.Event_Start_Date} ~ {detail.Event_End_Date}
                  </p>
                </div>
              )}

              {/* 시술 설명 */}
              {detail.Product_Description && (
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-2">시술 설명</h4>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {detail.Product_Description}
                    </p>
                  </div>
                </div>
              )}

              {/* 주의사항 */}
              {detail.Precautions && (
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-2">주의사항</h4>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm text-red-700 leading-relaxed">
                      {detail.Precautions}
                    </p>
                  </div>
                </div>
              )}

            </div>
          )}
        </div>

        {/* 하단 버튼 */}
        <div className="p-4 border-gray-200 flex-shrink-0">
          <Button
            onClick={onClose}
            className="w-full bg-gray-500 py-2"
            variant="secondary"
          >
            닫기
          </Button>
        </div>
      </div>
    </div>
  );
}
