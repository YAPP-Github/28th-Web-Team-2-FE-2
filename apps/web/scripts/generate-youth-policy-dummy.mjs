// 청년정책 더미 데이터 생성기 (커밋되는 생성 스크립트).
//
// 목적: UT에서 "실제 규모(수천 건)"를 재현해 두 가지를 검증한다.
//   (1) 우리가 보여주려는 모든 UI 규격(분야·판정결과·상태·소득종류 등)이 실제로 화면에 등장하는가
//   (2) 그 많은 데이터 속에서 유저가 "보고 싶은 것만" 골라낼 수 있는가(필터·검색·정렬 필요성 드러내기)
//
// 랜덤이 아니라 "조합 커버리지" 방식이다. 모든 enum 축의 모든 값이 반드시 여러 번 등장하도록
// 인덱스 기반으로 결정적(deterministic)으로 순회한다 → 재실행해도 동일한 파일이 나온다(Math.random 미사용).
//
// 실행: node apps/web/scripts/generate-youth-policy-dummy.mjs
// 출력: apps/web/lib/youth-policy/dummy-generated.json  (source.ts가 손수 케이스 15개 뒤에 병합)
//
// 필드/코드값은 lib/youth-policy/types.ts · normalize.ts 의 온통청년 스키마를 그대로 따른다.

import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const COUNT = 3000;
const START_INDEX = 16; // 손수 케이스가 P0001~P0015라 생성분은 P0016부터.

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_PATH = join(__dirname, "..", "lib", "youth-policy", "dummy-generated.json");

// ── 축(axis) 정의 — normalize.ts의 코드맵과 일치 ──

// 분야: lclsfNm(대분류) + 중분류 후보들
const THEMES = [
  { lclsf: "일자리", mclsf: ["취업 지원", "창업 지원", "직업훈련", "근로 지원"] },
  { lclsf: "주거", mclsf: ["주거비 지원", "전월세 대출", "주거 안전"] },
  { lclsf: "교육", mclsf: ["학자금 지원", "역량 강화", "교육비 지원"] },
  { lclsf: "복지문화", mclsf: ["생활 지원", "건강 지원", "문화 지원", "자산 형성"] },
  { lclsf: "참여권리", mclsf: ["청년 참여", "권익 보호", "네트워크"] },
];

// 취업요건코드(jobCd) → normalize JOB_CODE
const JOB_CODES = [
  "0013001", // 재직자
  "0013002", // 자영업자
  "0013003", // 미취업자
  "0013004", // 프리랜서
  "0013006", // (예비)창업자
  "0013008", // 영농종사자
  "0013010", // 제한없음
];

// 학력요건코드(schoolCd). 대부분 제한없음으로 두고 일부만 특정(과도 배제 방지).
const SCHOOL_CODES = [
  "0049010", // 제한없음
  "0049010",
  "0049010",
  "0049004", // 대학 재학
  "0049005", // 대학 졸업
];

// 특화분야코드(sBizCd). 제한없음 비중을 높여 "해당" 케이스가 충분히 나오게.
const SBIZ_CODES = [
  "0014010", // 제한없음
  "0014010",
  "0014001", // 중소기업
  "0014002", // 여성
  "0014003", // 농업인
  "0014004", // 장애인
  "0014005", // 저소득층
  "0014006", // 군인
];

// 소득조건구분코드(earnCndSeCd): 무관 / 세전연소득상한 / 기타(중위소득 등 → 조건부)
const EARN_KINDS = [
  { code: "0043001", maxWon: "", etc: "" }, // 무관
  { code: "0043002", maxWon: "30000000", etc: "" }, // 연소득 3,000만원 이하
  { code: "0043002", maxWon: "40000000", etc: "" }, // 연소득 4,000만원 이하
  { code: "0043002", maxWon: "50000000", etc: "" }, // 연소득 5,000만원 이하
  { code: "0043003", maxWon: "", etc: "가구 기준 중위소득 150% 이하" }, // 기타 → 조건부
  { code: "0043003", maxWon: "", etc: "차상위계층 이하" }, // 기타 → 조건부
];

// 지역(zipCd): "" = 전국, 그 외 시/도명(normalize는 시/도명 그대로 매칭 — 손수 케이스 P0006과 동일 규약)
const REGIONS = [
  "", "", "", // 전국 비중을 높여 "해당"이 충분히 나오게
  "서울특별시", "부산광역시", "대구광역시", "인천광역시", "광주광역시",
  "대전광역시", "울산광역시", "세종특별자치시", "경기도", "강원특별자치도",
  "충청북도", "충청남도", "전북특별자치도", "전라남도", "경상북도",
  "경상남도", "제주특별자치도",
];

// 연령대(min,max, 제한여부)
const AGE_BANDS = [
  ["19", "34", "Y"],
  ["18", "34", "Y"],
  ["19", "39", "Y"],
  ["15", "39", "Y"],
  ["19", "29", "Y"],
  ["19", "24", "Y"],
  ["18", "45", "Y"],
  ["", "", "N"], // 연령 무관
];

// 신청기간(aplyYmd) — normalize.toApplyStatus가 기준일 2026-07-24로 판정.
//  모집중 / 마감(과거) / 예정(미래) / 상시 를 골고루.
const PERIODS = [
  "20260601 ~ 20260930", // 모집중
  "20260701 ~ 20261231", // 모집중
  "20260101 ~ 20260430", // 마감
  "20260201 ~ 20260531", // 마감
  "20251101 ~ 20260215", // 마감
  "상시", // 상시
  "20260901 ~ 20261130", // 예정
  "20261001 ~ 20261231", // 예정
];

// 추가 자유텍스트 조건(addAplyQlfcCndCn) — 있으면 "조건부"로 떨어진다. 절반 정도만 부여.
const EXTRA_CONDS = [
  "", "", "", "", // 없음 비중 ↑ → "해당" 케이스 확보
  "졸업 후 2년 이내 미취업자에 한함",
  "중소기업 재직 6개월 이상",
  "관내 거주 6개월 이상",
  "직전 분기 소득활동 증빙 필요",
];

const SUPPORT_KINDS = [
  { name: "지원사업", support: "월 최대 30만원 × 최대 12개월" },
  { name: "지원금", support: "1회 최대 200만원 지급" },
  { name: "바우처", support: "연 최대 50만원 이용권" },
  { name: "대출이자 지원", support: "대출이자 최대 2% 지원" },
  { name: "수당", support: "월 50만원 × 최대 6개월" },
  { name: "교육과정", support: "직무교육 + 수료 장려금" },
];

const INSTITUTIONS = [
  "고용노동부", "국토교통부", "보건복지부", "교육부", "중소벤처기업부",
  "문화체육관광부", "여성가족부", "행정안전부",
];

// 서로소에 가까운 stride로 각 축을 훑어 조합이 겹치지 않게 분산 + 모든 값이 반복 등장하도록.
function pick(arr, i, stride) {
  return arr[(i * stride) % arr.length];
}

const policies = [];
for (let i = 0; i < COUNT; i++) {
  const plcyNo = `P${String(START_INDEX + i).padStart(4, "0")}`;
  const theme = pick(THEMES, i, 1);
  // 중분류는 길이가 3·4로 섞여 있어 고정 stride로는 서로소를 못 맞춘다 → stride 1(순차)로 전 값 커버.
  const mclsf = pick(theme.mclsf, i, 1);
  const job = pick(JOB_CODES, i, 3);
  const school = pick(SCHOOL_CODES, i, 2);
  const sbiz = pick(SBIZ_CODES, i, 5);
  const earn = pick(EARN_KINDS, i, 7);
  const region = pick(REGIONS, i, 11);
  const [minAge, maxAge, ageLmt] = pick(AGE_BANDS, i, 13);
  const period = pick(PERIODS, i, 17);
  const extra = pick(EXTRA_CONDS, i, 19);
  const kind = pick(SUPPORT_KINDS, i, 23);
  const inst = pick(INSTITUTIONS, i, 29);

  const regionLabel = region || "전국";
  policies.push({
    plcyNo,
    plcyNm: `${regionLabel} 청년 ${theme.lclsf} ${kind.name} ${i + START_INDEX}호`,
    plcyKywdNm: `청년,${theme.lclsf},${mclsf}`,
    plcyExplnCn: `${regionLabel} 청년을 대상으로 하는 ${theme.lclsf} 분야 ${mclsf} 사업입니다. (UT용 더미)`,
    lclsfNm: theme.lclsf,
    mclsfNm: mclsf,
    plcySprtCn: kind.support,
    sprtSclCnt: i % 4 === 0 ? `${(i % 9) * 100 + 100}명` : "",
    sprvsnInstCdNm: inst,
    operInstCdNm: region ? `${regionLabel} 청년지원센터` : "운영기관",
    aplyYmd: period,
    plcyAplyMthdCn: "온라인 신청",
    srngMthdCn: "요건 심사",
    sbmsnDcmntCn: "신분증,소득 증빙",
    aplyUrlAddr: i % 3 === 0 ? "https://www.gov.kr" : null,
    refUrlAddr1: null,
    sprtTrgtMinAge: minAge,
    sprtTrgtMaxAge: maxAge,
    sprtTrgtAgeLmtYn: ageLmt,
    earnCndSeCd: earn.code,
    earnMinAmt: earn.code === "0043002" ? "0" : "",
    earnMaxAmt: earn.maxWon,
    earnEtcCn: earn.etc,
    zipCd: region,
    jobCd: job,
    schoolCd: school,
    sBizCd: sbiz,
    addAplyQlfcCndCn: extra,
  });
}

// 한 줄 = 정책 1개 (git diff 가독성). 배열은 minify하지 않되 요소별 개행.
const body = policies.map((p) => JSON.stringify(p)).join(",\n");
writeFileSync(OUT_PATH, `[\n${body}\n]\n`, "utf8");

// ── 커버리지 통계 (검증용 로그) ──
const tally = (fn) => {
  const m = {};
  for (const p of policies) {
    const k = fn(p);
    m[k] = (m[k] ?? 0) + 1;
  }
  return m;
};
// 신청 상태 분포 — normalize.ts REFERENCE_DATE(2026-07-24)와 동일 기준. 기준일이 바뀌면 이 분포가 무너지므로 여기서 확인.
const REF = new Date(2026, 6, 24);
const statusOf = (aplyYmd) => {
  if (aplyYmd.includes("상시")) return "상시";
  const ds = aplyYmd.match(/\d{8}/g);
  if (!ds) return "상시";
  const toDate = (s) => new Date(+s.slice(0, 4), +s.slice(4, 6) - 1, +s.slice(6, 8));
  const start = toDate(ds[0]);
  const end = ds[1] ? toDate(ds[1]) : start;
  if (REF < start) return "예정";
  if (REF > end) return "마감";
  return "모집중";
};

console.log(`생성 완료: ${policies.length}건 → ${OUT_PATH}`);
console.log("신청상태(기준일 2026-07-24):", tally((p) => statusOf(p.aplyYmd)));
console.log("분야:", tally((p) => p.lclsfNm));
console.log("중분류:", tally((p) => p.mclsfNm));
console.log("취업요건:", tally((p) => p.jobCd));
console.log("소득구분:", tally((p) => p.earnCndSeCd));
console.log("지역(전국=빈값):", tally((p) => p.zipCd || "전국"));
console.log("신청기간:", tally((p) => p.aplyYmd));
console.log("추가조건 유무:", tally((p) => (p.addAplyQlfcCndCn ? "있음(조건부 유발)" : "없음")));
