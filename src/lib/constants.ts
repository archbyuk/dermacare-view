// ======================== 시술 관련 옵션 ======================== //

// 시술 대분류 옵션
export const CLASS_MAJOR_OPTIONS = [
  { value: 'none', label: 'None' },
  { value: '레이저', label: '레이저' },
  { value: '초음파', label: '초음파' },
  { value: '고주파', label: '고주파' },
  { value: '실리프팅', label: '실리프팅' },
  { value: '주사', label: '주사' },
  { value: '필러', label: '필러' },
  { value: '처방', label: '처방' },
  { value: '마취', label: '마취' },
] as const;

// 시술 중분류 옵션
export const CLASS_SUB_OPTIONS = [
  { value: 'none', label: 'None' },
  { value: '리팟', label: '리팟' },
  { value: '젠틀맥스', label: '젠틀맥스' },
  { value: '아포지', label: '아포지' },
  { value: '피코슈어', label: '피코슈어' },
  { value: '헐리우드', label: '헐리우드' },
  { value: '엑셀', label: '엑셀' },
  { value: '네오빔', label: '네오빔' },
  { value: '시크릿', label: '시크릿' },
  { value: 'CO2', label: 'CO2' },
  { value: '울쎄라', label: '울쎄라' },
  { value: '슈링크', label: '슈링크' },
  { value: '덴서티', label: '덴서티' },
  { value: '리니어지', label: '리니어지' },
  { value: '볼뉴머', label: '볼뉴머' },
  { value: '튠페이스', label: '튠페이스' },
  { value: '튠바디', label: '튠바디' },
  { value: '인모드', label: '인모드' },
  { value: '바디 인모드', label: '바디 인모드' },
  { value: '브이로', label: '브이로' },
  { value: '민트실', label: '민트실' },
  { value: '슈퍼하이코', label: '슈퍼하이코' },
  { value: '잼버실', label: '잼버실' },
  { value: '리즈네', label: '리즈네' },
  { value: '울트라콜 100', label: '울트라콜 100' },
  { value: '울트라콜 200', label: '울트라콜 200' },
  { value: '리쥬란힐러', label: '리쥬란힐러' },
  { value: '리쥬란HB+', label: '리쥬란HB+' },
  { value: '리쥬란아이', label: '리쥬란아이' },
  { value: '리쥬란스카', label: '리쥬란스카' },
  { value: '쥬베룩 200mg', label: '쥬베룩 200mg' },
  { value: '쥬베룩 50mg', label: '쥬베룩 50mg' },
  { value: 'GPC', label: 'GPC' },
  { value: 'DCA', label: 'DCA' },
  { value: '보톡스', label: '보톡스' },
  { value: '바디보톡스', label: '바디보톡스' },
  { value: '레티젠', label: '레티젠' },
  { value: '래디어스', label: '래디어스' },
  { value: '아띠에르', label: '아띠에르' },
  { value: '레스틸렌', label: '레스틸렌' },
  { value: '벨로테로', label: '벨로테로' },
  { value: '히알라제', label: '히알라제' },
  { value: '레가또', label: '레가또' },
  { value: '디오레 듀얼', label: '디오레 듀얼' },
  { value: '포텐자', label: '포텐자' },
  { value: '헐리우드 프락셀', label: '헐리우드 프락셀' },
  { value: 'CO2 프락셀', label: 'CO2 프락셀' },
  { value: '스컬트라', label: '스컬트라' },
  { value: '에스테필', label: '에스테필' },
  { value: '미쿨', label: '미쿨' },
  { value: '진료', label: '진료' },
  { value: '마취크림', label: '마취크림' },
  { value: '수면마취', label: '수면마취' },
] as const;

// 시술 상세 옵션
export const CLASS_DETAIL_OPTIONS = [
  { value: 'none', label: 'None' },
  { value: '안면 제모', label: '안면 제모' },
  { value: '바디 제모', label: '바디 제모' },
  { value: '브라질리언', label: '브라질리언' },
  { value: '흑자 제거', label: '흑자 제거' },
  { value: '안면 색소', label: '안면 색소' },
  { value: '바디 색소', label: '바디 색소' },
  { value: '문신 제거', label: '문신 제거' },
  { value: '안면 홍조', label: '안면 홍조' },
  { value: '피지', label: '피지' },
  { value: '피부 재생', label: '피부 재생' },
  { value: '잡티', label: '잡티' },
  { value: '페이스 라인', label: '페이스 라인' },
  { value: '바디 라인', label: '바디 라인' },
  { value: '콜라겐 재생', label: '콜라겐 재생' },
  { value: '스킨 부스터', label: '스킨 부스터' },
  { value: '볼륨', label: '볼륨' },
  { value: '윤곽', label: '윤곽' },
  { value: '필러 용해', label: '필러 용해' },
] as const;

// 시술 타입 옵션
export const CLASS_TYPE_OPTIONS = [
  { value: 'none', label: 'None' },
  { value: '제모', label: '제모' },
  { value: '쁘띠', label: '쁘띠' },
  { value: '제거', label: '제거' },
  { value: '색소', label: '색소' },
  { value: '리프팅', label: '리프팅' },
  { value: '재생', label: '재생' },
  { value: '비만', label: '비만' },
  { value: '백신', label: '백신' },
  { value: '진료', label: '진료' },
  { value: '부분마취', label: '부분마취' },
  { value: '수면마취', label: '수면마취' },
] as const;

// 시술 행위자 옵션
export const POSITION_TYPE_OPTIONS = [
  { value: 'none', label: 'None' },
  { value: '의사', label: '의사' },
  { value: '관리사', label: '관리사' },
] as const;

// 시술 난이도 옵션
export const PROCEDURE_LEVEL_OPTIONS = [
  { value: 'none', label: 'None' },
  { value: '매우쉬움', label: '매우쉬움' },
  { value: '쉬움', label: '쉬움' },
  { value: '보통', label: '보통' },
  { value: '어려움', label: '어려움' },
  { value: '매우어려움', label: '매우어려움' },
] as const;

// 소모품 단위 옵션
export const UNIT_TYPE_OPTIONS = [
  { value: 'none', label: 'None' },
  { value: 'cc', label: 'cc' },
  { value: 'EA', label: 'EA' },
  { value: 'Shot', label: 'Shot' },
] as const;

// 패키지 타입 옵션
export const PACKAGE_TYPE_OPTIONS = [
  { value: 'none', label: 'None' },
  { value: '단일시술', label: '단일시술' },
  { value: '번들', label: '번들' },
  { value: '커스텀', label: '커스텀' },
  { value: '시퀀스', label: '시퀀스' },
] as const;

// 보험 적용 여부 옵션
export const COVERED_TYPE_OPTIONS = [
  { value: 'none', label: 'None' },
  { value: '급여', label: '급여' },
  { value: '비급여', label: '비급여' },
] as const;

// 과세 여부 옵션
export const TAXABLE_TYPE_OPTIONS = [
  { value: 'none', label: 'None' },
  { value: '과세', label: '과세' },
  { value: '비과세', label: '비과세' },
] as const;


// ======================== 탭 관련 옵션 ======================== //

// 탭 이름 정의 추가 예정