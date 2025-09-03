import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// 클라이언트에서 쿠키 접근 확인 함수
export function checkCookies() {
  if (typeof window === 'undefined') {
    return;
  }
  
  // httponly 쿠키는 접근 불가능하므로 확인
  const hasAccessToken = document.cookie.includes('access_token');
  const hasRefreshToken = document.cookie.includes('refresh_token');
  
  
  // httponly 쿠키는 document.cookie에서 보이지 않음
  if (!hasAccessToken && !hasRefreshToken) {
    console.log('✅ httponly 쿠키가 제대로 설정됨 (클라이언트에서 접근 불가)');
  } else {
    console.log('⚠️ httponly가 아닌 쿠키가 설정됨');
  }
  
  return {
    hasAccessToken,
    hasRefreshToken,
    isHttpOnly: !hasAccessToken && !hasRefreshToken
  };
}

// Global 설정 타입
export interface GlobalSettings {
  Doc_Price_Minute: number;
  Aesthetician_Price_Minute: number;
}

// 소모품 타입
export interface ConsumableForCalculation {
  id: number;
  unit_price: number;
}

/**
 * Element 원가 계산 함수
 * 백엔드의 calculate_element_procedure_cost와 동일한 로직
 */
export function calculateElementProcedureCost(
  position_type: string,
  cost_time: number,
  consum_1_id: number | undefined,
  consum_1_count: number | undefined,
  plan_state: number | undefined,
  plan_count: number | undefined,
  global_settings: GlobalSettings,
  consumable: ConsumableForCalculation | null
): number {
  // 1단계: 인건비 계산
  let labor_cost: number;
  if (position_type !== "의사") {
    labor_cost = global_settings.Aesthetician_Price_Minute * cost_time; // 관리사
  } else {
    labor_cost = global_settings.Doc_Price_Minute * cost_time; // 의사
  }

  // 2단계: 소모품비용 계산
  let consumable_cost = 0;
  if (consum_1_id && consum_1_id !== -1 && consumable) {
    const unit_price = consumable.unit_price || 0;
    const count = consum_1_count && consum_1_count !== -1 ? consum_1_count : 1;
    consumable_cost = unit_price * count;
  }

  // 3단계: 총 원가 계산
  let total_cost = labor_cost + consumable_cost;

  // 4단계: 플랜 배수 적용
  if (plan_state && plan_state !== 0) {
    total_cost *= (plan_count || 1);
  }

  return Math.round(total_cost);
}
