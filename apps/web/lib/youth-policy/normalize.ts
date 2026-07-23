// raw(온통청년) → 정규화(YouthPolicy) 변환.
// 실제 API로 바꿔도 이 파일은 그대로 재사용된다. enum 코드값은 코드정의서 확정 시 아래 맵만 보정.

import type {
  EmploymentStatus,
  IncomeCondition,
  PolicyTheme,
  YouthPolicy,
  YouthPolicyRaw,
} from "@/lib/youth-policy/types";

// 온통청년 코드 → 라벨. (더미 기준값. 실제 코드정의서로 확정 필요.)
const JOB_CODE: Record<string, EmploymentStatus> = {
  "0013001": "재직자",
  "0013002": "자영업자",
  "0013003": "미취업자",
  "0013004": "프리랜서",
  "0013006": "(예비)창업자",
  "0013008": "영농종사자",
  "0013010": "제한없음",
};

const SCHOOL_CODE: Record<string, string> = {
  "0049001": "고졸 미만",
  "0049003": "고교 졸업",
  "0049004": "대학 재학",
  "0049005": "대학 졸업",
  "0049010": "제한없음",
};

const SBIZ_CODE: Record<string, string> = {
  "0014001": "중소기업",
  "0014002": "여성",
  "0014003": "농업인",
  "0014004": "장애인",
  "0014005": "저소득층",
  "0014006": "군인",
  "0014010": "제한없음",
};

const THEMES: readonly PolicyTheme[] = [
  "일자리",
  "주거",
  "교육",
  "복지문화",
  "참여권리",
];

function splitCodes(raw: string): string[] {
  return raw
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean);
}

function mapCodes<T>(raw: string, table: Record<string, T>): T[] {
  const mapped = splitCodes(raw)
    .map((c) => table[c])
    .filter((v): v is T => v !== undefined);
  return [...new Set(mapped)];
}

function toTheme(lclsfNm: string): PolicyTheme {
  const found = THEMES.find((t) => lclsfNm.includes(t));
  return found ?? "복지문화";
}

function toIncome(raw: YouthPolicyRaw): IncomeCondition {
  switch (raw.earnCndSeCd) {
    case "0043002": {
      // 연소득 상한(원) → 세전 연소득 상한(만원)으로 자동 판정.
      const maxWon = raw.earnMaxAmt ? Number(raw.earnMaxAmt) : null;
      if (maxWon && Number.isFinite(maxWon)) {
        return { kind: "세전연소득상한", maxManwon: Math.round(maxWon / 10000) };
      }
      return { kind: "기타", note: raw.earnEtcCn || "연소득 기준 있음" };
    }
    case "0043003":
      // 가구 중위소득 % 등 — 온통청년에서 자유텍스트로 오는 조건(자동 확정 불가).
      return { kind: "기타", note: raw.earnEtcCn || "별도 소득기준 있음" };
    default:
      return { kind: "무관" };
  }
}

function toAge(value: string): number | null {
  const n = Number(value);
  return value !== "" && Number.isFinite(n) ? n : null;
}

export function normalizePolicy(raw: YouthPolicyRaw): YouthPolicy {
  const extra = raw.addAplyQlfcCndCn.trim();
  const employment = mapCodes(raw.jobCd, JOB_CODE);

  return {
    id: raw.plcyNo,
    name: raw.plcyNm,
    keywords: raw.plcyKywdNm
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean),
    summary: raw.plcyExplnCn,
    theme: toTheme(raw.lclsfNm),
    subCategory: raw.mclsfNm,
    support: raw.plcySprtCn,
    supportScale: raw.sprtSclCnt || null,
    applyPeriod: raw.aplyYmd,
    applyMethod: raw.plcyAplyMthdCn,
    screeningMethod: raw.srngMthdCn,
    documents: raw.sbmsnDcmntCn
      ? raw.sbmsnDcmntCn.split(",").map((d) => d.trim()).filter(Boolean)
      : [],
    applyUrl: raw.aplyUrlAddr || null,
    refUrl: raw.refUrlAddr1 || null,
    sourceInstitution: raw.sprvsnInstCdNm,
    eligibility: {
      ageMin: toAge(raw.sprtTrgtMinAge),
      ageMax: toAge(raw.sprtTrgtMaxAge),
      ageLimited: raw.sprtTrgtAgeLmtYn === "Y",
      income: toIncome(raw),
      regions: raw.zipCd
        ? raw.zipCd.split(",").map((r) => r.trim()).filter(Boolean)
        : [],
      employment: employment.length > 0 ? employment : ["제한없음"],
      // "제한없음"(0049010)은 요건이 아니므로 제거 — 빈 배열 = 제한없음 계약(types.ts EligibilityCriteria).
      // 남겨두면 judge가 사용자 학력과 "제한없음"을 매칭 시도해 전원 비해당이 된다.
      education: mapCodes(raw.schoolCd, SCHOOL_CODE).filter(
        (s) => s !== "제한없음",
      ),
      specialFields: mapCodes(raw.sBizCd, SBIZ_CODE).filter(
        (s) => s !== "제한없음",
      ),
      extraConditionsText: extra.length > 0 ? extra : null,
    },
  };
}

export function normalizePolicies(list: readonly YouthPolicyRaw[]): YouthPolicy[] {
  return list.map(normalizePolicy);
}
