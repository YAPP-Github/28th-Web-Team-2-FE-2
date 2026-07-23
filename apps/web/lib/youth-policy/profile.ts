// UT 프로토타입에서 수집하는 사용자 프로필 + 설문 선택지.
// 기획 원칙 1(정보 최소수집): 대부분 공고가 공유하는 공통 축만 수집.
// 소득은 기준을 명확히 — "세전 연소득(만원, 본인 기준)"으로 통일.

import type { PolicyTheme } from "@/lib/youth-policy/types";
import { getDistricts } from "@/lib/youth-policy/regions";

export type EmploymentChoice =
  | "재직자"
  | "미취업자"
  | "자영업자"
  | "프리랜서"
  | "(예비)창업자"
  | "영농종사자";
export type EducationChoice = "고졸 이하" | "대학 재학" | "대학 졸업";

export interface UserProfile {
  nickname: string;
  age: number;
  regionSido: string;
  /** 시/군/구. 세종 등 하위 행정구역이 없는 시/도는 "". */
  regionSigungu: string;
  employment: EmploymentChoice;
  /** 세전 연소득(만원, 본인 기준). */
  annualIncomeManwon: number;
  education: EducationChoice;
}

export const EMPLOYMENT_OPTIONS: readonly EmploymentChoice[] = [
  "재직자",
  "미취업자",
  "자영업자",
  "프리랜서",
  "(예비)창업자",
  "영농종사자",
];

export const EDUCATION_OPTIONS: readonly EducationChoice[] = [
  "고졸 이하",
  "대학 재학",
  "대학 졸업",
];

export const THEME_OPTIONS: readonly PolicyTheme[] = [
  "일자리",
  "주거",
  "교육",
  "복지문화",
  "참여권리",
];

/** 세션 데이터가 판정 가능한 완전한 프로필인지 좁힌다. */
export function isCompleteProfile(
  data: Partial<UserProfile> | null,
): data is UserProfile {
  if (!data) return false;
  const sigunguOk =
    !!data.regionSido &&
    (getDistricts(data.regionSido).length === 0 || !!data.regionSigungu);
  return (
    typeof data.nickname === "string" &&
    data.nickname.length > 0 &&
    typeof data.age === "number" &&
    Number.isFinite(data.age) &&
    !!data.regionSido &&
    sigunguOk &&
    !!data.employment &&
    typeof data.annualIncomeManwon === "number" &&
    Number.isFinite(data.annualIncomeManwon) &&
    data.annualIncomeManwon >= 0 &&
    !!data.education
  );
}
