// 더미 데이터 진입점. 실제 API 연동 시 이 함수 내부만 BFF fetch로 교체하면 된다.
//
// 데이터는 두 갈래를 병합한다:
//  1) dummyPoliciesRaw     — 손수 심은 판정 케이스 15개(연령/지역/소득/노이즈 커버). 정확도 검증용.
//  2) generatedPoliciesRaw — generate-youth-policy-dummy.mjs가 찍은 3000개. 실제 규모·상태 분포 재현용.
// 합계 3015건. 생성분은 커밋된 dummy-generated.json에서 읽는다(스크립트 재실행 시 갱신).

import { dummyPoliciesRaw } from "@/lib/youth-policy/dummy";
import generatedPoliciesRaw from "@/lib/youth-policy/dummy-generated.json";
import { normalizePolicies, normalizePolicy } from "@/lib/youth-policy/normalize";
import type { YouthPolicy, YouthPolicyRaw } from "@/lib/youth-policy/types";

const allRaw: readonly YouthPolicyRaw[] = [
  ...dummyPoliciesRaw,
  ...(generatedPoliciesRaw as YouthPolicyRaw[]),
];

export function getAllPolicies(): YouthPolicy[] {
  return normalizePolicies(allRaw);
}

export function getPolicyById(id: string): YouthPolicy | null {
  const raw = allRaw.find((p) => p.plcyNo === id);
  return raw ? normalizePolicy(raw) : null;
}
