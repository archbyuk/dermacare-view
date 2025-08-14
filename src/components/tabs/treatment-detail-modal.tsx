'use client';

import { useState, useEffect } from 'react';
import { getTreatmentDetail } from '@/api/treatments-api';
import { ProductDetail } from '@/types/treatments';

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
      
      setDetail(response.data);
    } catch (error: any) {
      setError(error.message || '상세 정보를 불러오는데 실패했습니다.');
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
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 내용 */}
        <div className="p-4 flex-1 overflow-y-auto">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-orange-100 text-orange-800'
                  }`}>
                    {detail.Product_Type === 'standard' ? '기본 시술' : '이벤트 시술'}
                  </span>
                  <span>•</span>
                  <span>{detail.Package_Type}</span>
                </div>
                {detail.Product_Description && (
                  <div className="bg-blue-50 rounded-lg p-3 mb-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-1">시술 설명</h4>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {detail.Product_Description}
                    </p>
                  </div>
                )}
              </div>

              {/* 가격 정보 */}
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">판매가</span>
                  <span className="text-lg font-semibold text-gray-900">
                    {detail.Sell_Price?.toLocaleString()}원
                  </span>
                </div>
                {detail.Original_Price && detail.Original_Price > detail.Sell_Price && (
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-sm text-gray-600">원가</span>
                    <span className="text-sm text-gray-400 line-through">
                      {detail.Original_Price.toLocaleString()}원
                    </span>
                  </div>
                )}
                {detail.Discount_Rate && detail.Discount_Rate > 0 && (
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-sm text-gray-600">할인율</span>
                    <span className="text-sm text-red-600 font-medium">
                      {detail.Discount_Rate}% 할인
                    </span>
                  </div>
                )}
              </div>

              {/* 시술 정보 */}
              {detail.bundle_name && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">시술 묶음</h4>
                  <p className="text-sm text-gray-600">{detail.bundle_name}</p>
                </div>
              )}

              {detail.custom_name && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">커스텀 시술</h4>
                  <p className="text-sm text-gray-600">{detail.custom_name}</p>
                </div>
              )}

              {/* 시술 상세 정보 */}
              {detail.bundle_details && detail.bundle_details.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">포함 시술</h4>
                  <div className="space-y-2">
                    {detail.bundle_details.map((bundle, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <span className="text-gray-700">{bundle.Element_Info?.Name}</span>
                        <span className="text-gray-500">{bundle.Element_Cost}회</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 커스텀 시술 상세 정보 */}
              {detail.custom_details && detail.custom_details.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">커스텀 시술 상세</h4>
                  <div className="space-y-2">
                    {detail.custom_details.map((custom, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <span className="text-gray-700">{custom.Element_Info?.Name}</span>
                        <span className="text-gray-500">{custom.Custom_Count}/{custom.Element_Limit}회</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 시퀀스 시술 상세 정보 */}
              {detail.sequence_details && detail.sequence_details.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">시퀀스 시술</h4>
                  <div className="space-y-3">
                    {detail.sequence_details.map((sequence, index) => (
                      <div key={index} className="border-l-2 border-blue-200 pl-3">
                        <h5 className="text-sm font-medium text-gray-800 mb-1">Step {sequence.Step_Num}</h5>
                        <div className="space-y-1">
                          {sequence.elements.map((element, elemIndex) => (
                            <div key={elemIndex} className="flex items-center justify-between text-xs">
                              <span className="text-gray-600">{element.Name}</span>
                              {element.Custom_Count && (
                                <span className="text-gray-500">{element.Custom_Count}/{element.Element_Limit}회</span>
                              )}
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
                      <span className="text-gray-900">{detail.element_details.Name}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">대분류</span>
                      <span className="text-gray-900">{detail.element_details.Class_Major}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">중분류</span>
                      <span className="text-gray-900">{detail.element_details.Class_Sub}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">소분류</span>
                      <span className="text-gray-900">{detail.element_details.Class_Detail}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">시술 타입</span>
                      <span className="text-gray-900">{detail.element_details.Class_Type}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">소요시간</span>
                      <span className="text-gray-900">{detail.element_details.Cost_Time}분</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">계획 상태</span>
                      <span className="text-gray-900">{detail.element_details.Plan_State}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">계획 횟수</span>
                      <span className="text-gray-900">{detail.element_details.Plan_Count}회</span>
                    </div>
                  </div>
                </div>
              )}

              {/* 기간 정보 */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">유효기간</h4>
                <p className="text-sm text-gray-600">{detail.Validity_Period}일</p>
              </div>

              {/* 시술 기간 */}
              {detail.Standard_Start_Date && detail.Standard_End_Date && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">시술 기간</h4>
                  <p className="text-sm text-gray-600">
                    {detail.Standard_Start_Date} ~ {detail.Standard_End_Date}
                  </p>
                </div>
              )}

              {/* 이벤트 기간 */}
              {detail.Event_Start_Date && detail.Event_End_Date && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">이벤트 기간</h4>
                  <p className="text-sm text-gray-600">
                    {detail.Event_Start_Date} ~ {detail.Event_End_Date}
                  </p>
                </div>
              )}

              {/* ID 정보 (제외) */}
              {/* ID는 제외하고 모든 정보를 표시했습니다 */}
            </div>
          )}
        </div>

        {/* 하단 버튼 */}
        <div className="p-4 border-t border-gray-200 flex-shrink-0">
          <button
            onClick={onClose}
            className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
