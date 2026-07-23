// 자격판정 엔진 (기능② 타겟 A) + 추천 필터 (기능① 타겟 B-2).
//
// 원칙(design 기획안):
//  · 결정성 — 나열이 아니라 된다/안된다/조건부로 판정
//  · 추적가능 — 판정마다 어느 자격 축에서 왜 그렇게 됐는지 근거를 남긴다
//
// "조건부"의 의미: 구조화 필드로 자동 판정이 안 되는 조건(특화분야·자유텍스트 추가조건)이 있어
// 자동으로 확정할 수 없는 상태. B-2 노이즈("경계선 지능" 등)가 여기로 떨어지며,
// 근거(reason)에 원문 조건을 그대로 노출해 유저가 즉시 판별하게 한다.

import type {
  EligibilityCriteria,
  PolicyVerdict,
  VerdictKind,
  VerdictReason,
  YouthPolicy,
} from "@/lib/youth-policy/types";
import type { UserProfile } from "@/lib/youth-policy/profile";

function ageRangeText(e: EligibilityCriteria): string {
  const min = e.ageMin !== null ? `만 ${e.ageMin}세` : "";
  const max = e.ageMax !== null ? `만 ${e.ageMax}세` : "";
  if (min && max) return `${min}~${max}`;
  if (min) return `${min} 이상`;
  if (max) return `${max} 이하`;
  return "연령 무관";
}

function myRegionText(profile: UserProfile): string {
  return profile.regionSigungu
    ? `${profile.regionSido} ${profile.regionSigungu}`
    : profile.regionSido;
}

export function judgePolicy(policy: YouthPolicy, profile: UserProfile): PolicyVerdict {
  const reasons: VerdictReason[] = [];
  const e = policy.eligibility;

  // 연령
  if (e.ageLimited && (e.ageMin !== null || e.ageMax !== null)) {
    const okMin = e.ageMin === null || profile.age >= e.ageMin;
    const okMax = e.ageMax === null || profile.age <= e.ageMax;
    reasons.push(
      okMin && okMax
        ? { axis: "연령", result: "해당", detail: `대상 ${ageRangeText(e)} · 내 나이 만 ${profile.age}세` }
        : { axis: "연령", result: "비해당", detail: `대상 ${ageRangeText(e)}인데 내 나이 만 ${profile.age}세` },
    );
  }

  // 지역 — 정책 지역이 내 시/도(또는 시/도 시/군/구)와 일치하는지.
  if (e.regions.length > 0) {
    const full = `${profile.regionSido} ${profile.regionSigungu}`.trim();
    const match = e.regions.some(
      (r) => r === profile.regionSido || r === full,
    );
    reasons.push(
      match
        ? { axis: "지역", result: "해당", detail: `${e.regions.join(", ")} 거주자 대상` }
        : { axis: "지역", result: "비해당", detail: `${e.regions.join(", ")} 거주자만 대상 · 내 지역 ${myRegionText(profile)}` },
    );
  }

  // 취업상태
  if (!e.employment.includes("제한없음")) {
    reasons.push(
      e.employment.includes(profile.employment)
        ? { axis: "취업상태", result: "해당", detail: `${e.employment.join(", ")} 대상` }
        : { axis: "취업상태", result: "비해당", detail: `${e.employment.join(", ")} 대상 · 내 상태 ${profile.employment}` },
    );
  }

  // 소득 — 기준을 명확히: 사용자 입력은 "세전 연소득(만원)".
  //   세전연소득상한: 자동 판정(해당/비해당). 기타(가구 중위소득 등): 자동 확정 불가 → 조건부.
  if (e.income.kind === "세전연소득상한") {
    const my = profile.annualIncomeManwon.toLocaleString();
    const cap = e.income.maxManwon.toLocaleString();
    reasons.push(
      profile.annualIncomeManwon <= e.income.maxManwon
        ? { axis: "소득", result: "해당", detail: `세전 연소득 ${cap}만원 이하 대상 · 내 세전 연소득 ${my}만원` }
        : { axis: "소득", result: "비해당", detail: `세전 연소득 ${cap}만원 이하 대상 · 내 세전 연소득 ${my}만원` },
    );
  } else if (e.income.kind === "기타") {
    reasons.push({
      axis: "소득",
      result: "조건부",
      detail: `${e.income.note} — 세전 연소득이 아니라 가구 기준 중위소득 등으로 판정하므로 직접 확인 필요`,
    });
  }

  // 학력
  if (e.education.length > 0) {
    reasons.push(
      e.education.includes(profile.education)
        ? { axis: "학력", result: "해당", detail: `${e.education.join(", ")} 대상` }
        : { axis: "학력", result: "비해당", detail: `${e.education.join(", ")} 대상 · 내 학력 ${profile.education}` },
    );
  }

  // 특화분야 — 기본 프로필로 확인 불가 → 조건부
  if (e.specialFields.length > 0) {
    reasons.push({ axis: "특화분야", result: "조건부", detail: `${e.specialFields.join(", ")} 대상 여부를 추가로 확인해야 함` });
  }

  // 추가 자유텍스트 조건 → 조건부 (B-2 노이즈 판별의 핵심)
  if (e.extraConditionsText) {
    reasons.push({ axis: "추가조건", result: "조건부", detail: e.extraConditionsText });
  }

  const verdict: VerdictKind = reasons.some((r) => r.result === "비해당")
    ? "비해당"
    : reasons.some((r) => r.result === "조건부")
      ? "조건부"
      : "해당";

  return { policyId: policy.id, verdict, reasons };
}

export interface RankedPolicy {
  policy: YouthPolicy;
  verdict: PolicyVerdict;
}

export interface Recommendation {
  matched: RankedPolicy[];
  conditional: RankedPolicy[];
  excluded: RankedPolicy[];
}

/**
 * 전체 공고를 판정해 3분기.
 * - matched(해당): 자신 있게 추천
 * - conditional(조건부): 노이즈 판별 대상 — 근거를 보여주고 유저가 스스로 거른다
 * - excluded(비해당): 기본 숨김 (원하면 펼쳐 봄)
 *
 * 카테고리(관심 테마) 필터는 자격과 무관한 표시 필터라 여기서 하지 않는다 — 결과 화면에서 적용.
 */
export function recommendPolicies(
  policies: readonly YouthPolicy[],
  profile: UserProfile,
): Recommendation {
  const ranked: RankedPolicy[] = policies.map((policy) => ({
    policy,
    verdict: judgePolicy(policy, profile),
  }));

  return {
    matched: ranked.filter((r) => r.verdict.verdict === "해당"),
    conditional: ranked.filter((r) => r.verdict.verdict === "조건부"),
    excluded: ranked.filter((r) => r.verdict.verdict === "비해당"),
  };
}
