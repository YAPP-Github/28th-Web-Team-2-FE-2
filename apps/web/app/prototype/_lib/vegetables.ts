// 야채 catalog + 더미 시세/제보 데이터 (순수 데이터, 서버·클라 공용).
// 실 API 연결 전까지 화면을 채우는 저충실도 더미. KAMIS 매핑값은 실연결 대비 보관.

import type { BaselinePrice, MartPrice, PricePeriod, PricePoint, Report, Vegetable } from "./types";

export const DEFAULT_REGION = "서울";
/** GPS 미허용/키 미수령 시 폴백 자치구 (UT 테스트 장소 = 강남구 선릉). */
export const DEFAULT_DISTRICT = "강남구";

/** 더미 기준일 — Figma 와이어프레임(2026-07-24)과 정합. 실 API 연결 시 대체. */
export const ANCHOR_DATE = "2026-07-24";

/** Figma "인기 야채" 그리드 9종. */
export const VEGETABLES: Vegetable[] = [
  { id: "potato", name: "감자", image: "/veg/potato.svg", emoji: "🥔", category: "식량작물", unit: "1kg", itemCategoryCode: "100", itemCode: "152" },
  { id: "garlic", name: "마늘", image: "/veg/garlic.svg", emoji: "🧄", category: "채소류", unit: "1kg", itemCategoryCode: "200", itemCode: "258" },
  { id: "onion", name: "양파", image: "/veg/onion.svg", emoji: "🧅", category: "채소류", unit: "1kg", itemCategoryCode: "200", itemCode: "245" },
  { id: "sweet-potato", name: "고구마", image: "/veg/sweet-potato.svg", emoji: "🍠", category: "식량작물", unit: "1kg", itemCategoryCode: "100", itemCode: "151" },
  { id: "carrot", name: "당근", image: "/veg/carrot.svg", emoji: "🥕", category: "채소류", unit: "1kg", itemCategoryCode: "200", itemCode: "246" },
  { id: "tomato", name: "토마토", image: "/veg/tomato.svg", emoji: "🍅", category: "채소류", unit: "1kg", itemCategoryCode: "200", itemCode: "225" },
  { id: "corn", name: "옥수수", image: "/veg/corn.svg", emoji: "🌽", category: "식량작물", unit: "1kg", itemCategoryCode: "100", itemCode: "292" },
  { id: "bell-pepper", name: "피망", image: "/veg/bell-pepper.svg", emoji: "🫑", category: "채소류", unit: "1kg", itemCategoryCode: "200", itemCode: "256" },
  { id: "cucumber", name: "오이", image: "/veg/cucumber.svg", emoji: "🥒", category: "채소류", unit: "1kg", itemCategoryCode: "200", itemCode: "223" },
];

/** 품목별 현재 시세 기준값(원). potato는 Figma(2,490원)와 일치. */
const BASE_PRICE: Record<string, number> = {
  potato: 2490,
  garlic: 8900,
  onion: 1980,
  "sweet-potato": 3600,
  carrot: 2900,
  tomato: 5200,
  corn: 1500,
  "bell-pepper": 6900,
  cucumber: 4300,
};

/**
 * 컬리 온라인가 더미(원, 1kg 환산 · 크롤링 대용 근사값 — 2026-07 컬리 판매 수준에 맞춤).
 * 컬리는 프리미엄 온라인 그로서리라 시장/제보가보다 대체로 높게 잡힌다(의도된 포지셔닝 차이).
 * 실 연결 시 이 표를 크롤링·API 결과로 대체.
 */
const MART_PRICE: Record<string, { price: number; productName: string }> = {
  potato: { price: 2990, productName: "[KF365] 노지 감자 1kg" },
  garlic: { price: 13900, productName: "[Kurly] 깐마늘 1kg" },
  onion: { price: 2690, productName: "[KF365] 양파 1kg" },
  "sweet-potato": { price: 4990, productName: "[KF365] 밤고구마 1kg" },
  carrot: { price: 3490, productName: "[KF365] 흙당근 1kg" },
  tomato: { price: 6900, productName: "[Kurly] 완숙 토마토 1kg" },
  corn: { price: 3900, productName: "[Kurly] 초당옥수수 1kg" },
  "bell-pepper": { price: 7900, productName: "[Kurly] 피망 1kg" },
  cucumber: { price: 4900, productName: "[KF365] 오이 1kg" },
};

export function getVegetable(id: string): Vegetable | undefined {
  return VEGETABLES.find((v) => v.id === id);
}

/** 컬리 온라인가 더미(크롤링 대용). 실 연결 시 대체. 없으면 undefined. */
export function getMartPrice(vegetableId: string): MartPrice | undefined {
  const veg = getVegetable(vegetableId);
  const entry = MART_PRICE[vegetableId];
  if (!veg || !entry) return undefined;
  return {
    vegetableId: veg.id,
    mall: "컬리",
    productName: entry.productName,
    unit: veg.unit,
    price: entry.price,
    source: "dummy-kurly",
    asOf: ANCHOR_DATE,
  };
}

function round10(n: number): number {
  return Math.round(n / 10) * 10;
}

/** 문자열 → 안정적 seed (Math.random 없이 결정적 더미 생성). */
function hashSeed(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 997;
  return h;
}

function shiftDays(iso: string, days: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + days));
  const mm = String(dt.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(dt.getUTCDate()).padStart(2, "0");
  return `${dt.getUTCFullYear()}-${mm}-${dd}`;
}

function shiftMonths(iso: string, months: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1 + months, d));
  const mm = String(dt.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(dt.getUTCDate()).padStart(2, "0");
  return `${dt.getUTCFullYear()}-${mm}-${dd}`;
}

function buildSeries(base: number, seed: number): Record<PricePeriod, PricePoint[]> {
  const week: PricePoint[] = Array.from({ length: 7 }, (_, i) => ({
    date: shiftDays(ANCHOR_DATE, i - 6),
    price: round10(base * (1 + 0.08 * Math.sin((i + seed) * 0.8))),
  }));
  const month: PricePoint[] = Array.from({ length: 30 }, (_, i) => ({
    date: shiftDays(ANCHOR_DATE, i - 29),
    price: round10(base * (1 + 0.14 * Math.sin((i + seed) * 0.32))),
  }));
  const year: PricePoint[] = Array.from({ length: 12 }, (_, i) => ({
    date: shiftMonths(ANCHOR_DATE, i - 11),
    price: round10(base * (1 + 0.22 * Math.sin((i + seed) * 0.6))),
  }));
  // 현재가(오늘)는 기준값으로 고정 — 모든 기간의 그래프 끝점과 헤더 수치를 맞춘다.
  week[week.length - 1].price = base;
  month[month.length - 1].price = base;
  year[year.length - 1].price = base;
  return { week, month, year };
}

/** 키 미수령 시 화면을 채우는 더미 기준선. KAMIS 응답과 동일한 shape. */
export function getBaselineDummy(vegetableId: string, region: string = DEFAULT_REGION): BaselinePrice {
  const veg = getVegetable(vegetableId) ?? VEGETABLES[0];
  const base = BASE_PRICE[veg.id] ?? 3000;
  const seed = hashSeed(veg.id);
  const series = buildSeries(base, seed);
  const monthAvg = series.month.reduce((sum, p) => sum + p.price, 0) / series.month.length;
  return {
    vegetableId: veg.id,
    region,
    unit: veg.unit,
    current: base,
    average: round10(monthAvg),
    series,
    source: "dummy",
    asOf: ANCHOR_DATE,
  };
}

/**
 * 시드 제보 데이터 — 크라우드소싱 루프가 처음부터 비지 않게.
 * potato/광진구 3건은 Figma "사용자 제보 실제가"와 정합(2000·2380·2290원).
 */
export const SEED_REPORTS: Report[] = [
  { id: "seed-potato-1", vegetableId: "potato", district: "강남구", weightKg: 1, price: 2000, pricePerKg: 2000, createdAt: "2026-07-24T09:00:00+09:00", method: "photo" },
  { id: "seed-potato-2", vegetableId: "potato", district: "강남구", weightKg: 1, price: 2380, pricePerKg: 2380, createdAt: "2026-07-22T18:20:00+09:00", method: "manual" },
  { id: "seed-potato-3", vegetableId: "potato", district: "강남구", weightKg: 1, price: 2290, pricePerKg: 2290, createdAt: "2026-07-20T11:05:00+09:00", method: "photo" },
  { id: "seed-onion-1", vegetableId: "onion", district: "강남구", weightKg: 2, price: 3600, pricePerKg: 1800, createdAt: "2026-07-23T14:30:00+09:00", method: "manual" },
  { id: "seed-carrot-1", vegetableId: "carrot", district: "강남구", weightKg: 1, price: 2700, pricePerKg: 2700, createdAt: "2026-07-21T10:15:00+09:00", method: "photo" },
];
