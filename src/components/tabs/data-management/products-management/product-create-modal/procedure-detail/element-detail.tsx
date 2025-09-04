import { Element } from '@/api/element-api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface ElementDetailProps {
  element: Element;
  onSelect: (element: Element) => void;
}

export default function ElementDetail({ element, onSelect }: ElementDetailProps) {
  return (
    <div className="space-y-5">
      {/* 기본 정보 */}
      <div>
        <h4 className="font-medium text-gray-800 mb-3 text-sm">기본 정보</h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between py-1">
            <span className="text-gray-600 text-xs">시술명</span>
            <span className="text-gray-900 text-sm">{element.name || '이름 없음'}</span>
          </div>
          <div className="flex items-center justify-between py-1">
            <span className="text-gray-600 text-xs">ID</span>
            <span className="text-gray-900 text-sm">{element.id}</span>
          </div>
          <div className="flex items-center justify-between py-1">
            <span className="text-gray-600 text-xs">설명</span>
            <span className="text-gray-900 text-sm max-w-xs text-right">{element.description || '설명 없음'}</span>
          </div>
          <div className="flex items-center justify-between py-1">
            <span className="text-gray-600 text-xs">분류</span>
            <span className="text-gray-900 text-sm text-right">
              {element.class_major} &gt; {element.class_sub} &gt; {element.class_detail}
            </span>
          </div>
        </div>
      </div>

      {/* 가격 및 시간 정보 */}
      <div>
        <h4 className="font-medium text-gray-800 mb-3 text-sm">가격 및 시간</h4>
        <div className="space-y-2">
          {element.price && (
            <div className="flex items-center justify-between py-1">
              <span className="text-gray-600 text-xs">가격</span>
              <span className="text-blue-600 font-medium text-sm">
                {element.price.toLocaleString()}원
              </span>
            </div>
          )}
          {element.cost_time && (
            <div className="flex items-center justify-between py-1">
              <span className="text-gray-600 text-xs">소요시간</span>
              <span className="text-gray-900 text-sm">{element.cost_time}분</span>
            </div>
          )}
          {element.procedure_cost && (
            <div className="flex items-center justify-between py-1">
              <span className="text-gray-600 text-xs">시술 원가</span>
              <span className="text-gray-900 text-sm">{element.procedure_cost.toLocaleString()}원</span>
            </div>
          )}
          {element.procedure_level && (
            <div className="flex items-center justify-between py-1">
              <span className="text-gray-600 text-xs">시술 레벨</span>
              <span className="text-gray-900 text-sm">{element.procedure_level}</span>
            </div>
          )}
        </div>
      </div>

      {/* 플랜 정보 */}
      {(element.plan_state !== undefined || element.plan_count || element.plan_interval) && (
        <div>
          <h4 className="font-medium text-gray-800 mb-3 text-sm">플랜 정보</h4>
          <div className="space-y-2">
            {element.plan_state !== undefined && (
              <div className="flex items-center justify-between py-1">
                <span className="text-gray-600 text-xs">플랜 상태</span>
                <span className="text-gray-900 text-sm">{element.plan_state}</span>
              </div>
            )}
            {element.plan_count && (
              <div className="flex items-center justify-between py-1">
                <span className="text-gray-600 text-xs">플랜 횟수</span>
                <span className="text-gray-900 text-sm">{element.plan_count}회</span>
              </div>
            )}
            {element.plan_interval && (
              <div className="flex items-center justify-between py-1">
                <span className="text-gray-600 text-xs">플랜 주기</span>
                <span className="text-gray-900 text-sm">{element.plan_interval}일</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 소모품 정보 */}
      {(element.consum_1_id || element.consum_1_name || element.consum_1_count) && (
        <div>
          <h4 className="font-medium text-gray-800 mb-3 text-sm">소모품 정보</h4>
          <div className="space-y-2">
            {element.consum_1_id && (
              <div className="flex items-center justify-between py-1">
                <span className="text-gray-600 text-xs">소모품 ID</span>
                <span className="text-gray-900 text-sm">{element.consum_1_id}</span>
              </div>
            )}
            {element.consum_1_name && (
              <div className="flex items-center justify-between py-1">
                <span className="text-gray-600 text-xs">소모품명</span>
                <span className="text-gray-900 text-sm">{element.consum_1_name}</span>
              </div>
            )}
            {element.consum_1_count && (
              <div className="flex items-center justify-between py-1">
                <span className="text-gray-600 text-xs">소모품 당 횟수</span>
                <span className="text-gray-900 text-sm">
                  {element.consum_1_count} 회
                </span>
              </div>
            )}
            {element.consum_1_unit && (
              <div className="flex items-center justify-between py-1">
                <span className="text-gray-600 text-xs">단위</span>
                <span className="text-gray-900 text-sm">{element.consum_1_unit}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 선택 버튼 */}
      <Button 
        onClick={() => onSelect(element)}
        className="w-full bg-gray-900 hover:bg-gray-800 text-white py-4 text-base font-semibold rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
      >
        이 시술 선택하기
      </Button>
    </div>
  );
}
