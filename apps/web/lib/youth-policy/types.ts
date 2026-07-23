// 온통청년 청년정책 API (한국고용정보원, 공공데이터포털 15143273) 스키마
//
// 두 층으로 나눈다:
//  1) YouthPolicyRaw   — 온통청년 API 응답을 그대로 미러링 (필드명·코드값까지). BFF가 외부에서 받는 모양.
//  2) YouthPolicy      — 우리 앱(추천/판정 UI)이 소비하는 정규화 모양. normalize.ts가 1→2로 변환.
//
// ⚠️ 지금은 더미 단계. 실제 API로 바꿀 땐 dummy.ts의 배열을 BFF fetch로 교체하면 되고,
//    normalize/타입/UI는 건드릴 필요 없다. (enum 코드값은 실제 코드정의서 확정 시 codes 맵만 보정)

// ─────────────────────────────────────────────────────────────
// 1) RAW — 온통청년 API 응답 미러
// ─────────────────────────────────────────────────────────────

/**
 * 온통청년 getYouthPolicyList 항목. 실제 응답은 대부분 string이며,
 * 다중값은 콤마 구분 코드 문자열(예: jobCd = "0013001,0013003"), 없으면 "" 또는 null.
 */
export interface YouthPolicyRaw {
  plcyNo: string; // 정책번호
  plcyNm: string; // 정책명
  plcyKywdNm: string; // 정책키워드 (콤마 구분)
  plcyExplnCn: string; // 정책설명내용
  lclsfNm: string; // 정책대분류명 (일자리/주거/교육/복지문화/참여권리)
  mclsfNm: string; // 정책중분류명
  plcySprtCn: string; // 정책지원내용
  sprtSclCnt: string; // 지원규모수 ("" = 미정/제한없음)
  sprvsnInstCdNm: string; // 주관기관코드명
  operInstCdNm: string; // 운영기관코드명

  // 신청/절차
  aplyYmd: string; // 신청기간 (예: "20260101 ~ 20260228", "상시")
  plcyAplyMthdCn: string; // 정책신청방법내용
  srngMthdCn: string; // 심사방법내용
  sbmsnDcmntCn: string; // 제출서류내용
  aplyUrlAddr: string | null; // 신청 URL
  refUrlAddr1: string | null; // 참고 URL

  // ── 자격조건 (판정의 핵심) ──
  sprtTrgtMinAge: string; // 지원대상 최소연령 ("" = 무관)
  sprtTrgtMaxAge: string; // 지원대상 최대연령 ("" = 무관)
  sprtTrgtAgeLmtYn: string; // 연령제한여부 ("Y" | "N")
  earnCndSeCd: string; // 소득조건구분코드 (0043001 무관 / 0043002 연소득 / 0043003 기타)
  earnMinAmt: string; // 소득 최소금액 (원)
  earnMaxAmt: string; // 소득 최대금액 (원)
  earnEtcCn: string; // 소득기타내용 (자유텍스트)
  zipCd: string; // 거주지역 법정시군구코드 (콤마 구분, "" = 전국)
  jobCd: string; // 취업요건코드 (0013xxx, 콤마 구분)
  schoolCd: string; // 학력요건코드 (0049xxx, 콤마 구분)
  sBizCd: string; // 특화분야코드 (0014xxx, 콤마 구분 — 중소기업/여성/장애인 등)

  /**
   * 추가신청자격조건내용 — 자유텍스트.
   * ★ B-2 노이즈와 "조건부" 판정의 원천. 구조화 필드로 안 잡히는 조건이 전부 여기 뭉쳐 있다.
   * 예: "경계선 지능 청년 대상", "OO 교육 수료자에 한함"
   */
  addAplyQlfcCndCn: string;
}

// ─────────────────────────────────────────────────────────────
// 2) NORMALIZED — 우리 앱이 소비하는 모양
// ─────────────────────────────────────────────────────────────

export type PolicyTheme =
  | "일자리"
  | "주거"
  | "교육"
  | "복지문화"
  | "참여권리";

/**
 * 신청 상태 — aplyYmd(신청기간)를 프로토타입 기준일로 판정해 파생(normalize.ts).
 * 온통청년 실데이터가 수만 건인 건 마감 공고가 누적된 탓이라, 더미도 마감/예정을 섞어 현실 분포를 재현한다.
 */
export type ApplyStatus = "모집중" | "마감" | "상시" | "예정";

export type EmploymentStatus =
  | "재직자"
  | "미취업자"
  | "자영업자"
  | "프리랜서"
  | "(예비)창업자"
  | "영농종사자"
  | "제한없음";

export type IncomeCondition =
  | { kind: "무관" }
  // 세전 연소득 상한(만원)으로 자동 판정 가능한 조건.
  | { kind: "세전연소득상한"; maxManwon: number }
  // 가구 기준 중위소득 % 등 자유텍스트 조건 — 자동 확정 불가(조건부).
  | { kind: "기타"; note: string };

export interface EligibilityCriteria {
  ageMin: number | null;
  ageMax: number | null;
  ageLimited: boolean;
  income: IncomeCondition;
  /** 시군구명 배열. 빈 배열 = 전국. */
  regions: string[];
  employment: EmploymentStatus[];
  /** 학력요건 라벨. 빈 배열 = 제한없음. */
  education: string[];
  /** 특화분야 (중소기업/여성/장애인 등). 대상이 좁아지는 축. */
  specialFields: string[];
  /**
   * 구조화되지 않은 추가조건 원문. null이면 없음.
   * 이 값이 있으면 자동 판정만으로 확정 불가 → "조건부"로 떨어진다.
   */
  extraConditionsText: string | null;
}

export interface YouthPolicy {
  id: string;
  name: string;
  keywords: string[];
  summary: string;
  theme: PolicyTheme;
  subCategory: string;
  support: string;
  supportScale: string | null;
  applyPeriod: string;
  applyStatus: ApplyStatus;
  applyMethod: string;
  screeningMethod: string;
  documents: string[];
  applyUrl: string | null;
  refUrl: string | null;
  sourceInstitution: string;
  eligibility: EligibilityCriteria;
}

// ─────────────────────────────────────────────────────────────
// 판정 결과 (다음 단계 UI가 쓸 계약 — 원칙: 결정성 + 추적가능)
// ─────────────────────────────────────────────────────────────

export type VerdictKind = "해당" | "비해당" | "조건부";

/** 판정 근거 한 줄 — 어떤 자격 축이 왜 그렇게 판정됐는지 (추적가능 원칙). */
export interface VerdictReason {
  axis: "연령" | "소득" | "지역" | "취업상태" | "학력" | "특화분야" | "추가조건";
  result: VerdictKind;
  detail: string;
}

export interface PolicyVerdict {
  policyId: string;
  verdict: VerdictKind;
  reasons: VerdictReason[];
}
