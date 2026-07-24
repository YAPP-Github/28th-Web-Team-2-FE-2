// 야채 시세 UT 프로토타입 — 도메인 타입 (격리 라우트 전용, design-guide §1-2).

export type VegetableCategory = "식량작물" | "채소류" | "과일";

export interface Vegetable {
  /** slug (URL·키). 예: "potato" */
  id: string;
  /** 표시명. 예: "감자" */
  name: string;
  /** Figma에서 추출한 야채 일러스트 경로 (public). 예: "/veg/potato.svg" */
  image: string;
  /** 이미지 로드 전/대체용 이모지 */
  emoji: string;
  category: VegetableCategory;
  /** 가격 기준 단위. 예: "1kg" */
  unit: string;
  /** KAMIS 실연결 대비 매핑값 — 부류코드(100 식량작물 / 200 채소류 / 400 과일) */
  itemCategoryCode: string;
  /** KAMIS 품목코드 (실 스펙 수령 전까지 placeholder) */
  itemCode: string;
}

export type PricePeriod = "week" | "month" | "year";

export interface PricePoint {
  /** "YYYY-MM-DD" */
  date: string;
  /** 원 */
  price: number;
}

/** 공공 시세(기준선) — KAMIS 또는 더미. 지역 해상도는 광역(서울)이 한계. */
export interface BaselinePrice {
  vegetableId: string;
  /** 광역 단위. 예: "서울" (공공 API가 자치구 미제공 — API 조사 결론) */
  region: string;
  unit: string;
  /** 현재 시세(원) */
  current: number;
  /** 평균가(원) */
  average: number;
  series: Record<PricePeriod, PricePoint[]>;
  source: "kamis" | "dummy";
  /** 조사 기준일 "YYYY-MM-DD" */
  asOf: string;
}

/** 온라인 마트(컬리) 판매가 — 프로토 더미(크롤링 대용 근사값). 특정 SKU 1건 기준. */
export interface MartPrice {
  vegetableId: string;
  /** 판매몰. 프로토는 컬리 고정. */
  mall: "컬리";
  /** 비교 대상 상품명 — 어떤 SKU를 비교하는지 명시(단위·등급 왜곡 방지). */
  productName: string;
  unit: string;
  /** 판매가(원) */
  price: number;
  /** 데이터 출처 — 프로토 더미(실 크롤링 대용) */
  source: "dummy-kurly";
  /** 기준일 "YYYY-MM-DD" */
  asOf: string;
}

/** 사용자 제보 실제가 — 동네(자치구) 정밀도를 메우는 크라우드소싱 데이터. */
export interface Report {
  id: string;
  vegetableId: string;
  /** 동네(자치구). 예: "광진구" */
  district: string;
  /** 구매 무게(kg) */
  weightKg: number;
  /** 지불 가격(원) */
  price: number;
  /** 1kg 환산가(원) */
  pricePerKg: number;
  /** ISO 8601 */
  createdAt: string;
  /** 입력 경로 */
  method: "photo" | "manual";
}
