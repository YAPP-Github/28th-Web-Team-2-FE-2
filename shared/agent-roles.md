# Agent 역할 정의 (단일 진실 소스 · 도구 무관)

> 여기가 **agent 역할의 진실 소스**다. Claude `.claude/agents/*.md` 와 Codex `.codex/agents/*.toml` 는
> **이 문서에서 생성**한다. 역할을 바꾸면 여기부터 고치고 양쪽을 다시 생성한다.
> **agent 커스텀은 디자이너 포함 전원 개방** — 추가·수정 시 이 문서를 같이 갱신할 것.

## 판단 밀도 → 도구별 매핑 (Claude 5 시대 티어)

| 판단 밀도 | Claude `model` | Codex `model_reasoning_effort` | 쓰기 권한 |
|---|---|---|---|
| 높음 (설계·리뷰·버그조사) | **fable** | high | (대부분 읽기) |
| 중간 (패턴 따라 구현) | **sonnet** | medium | workspace-write |
| 낮음 (탐색·정리) | **haiku** | low | read-only |

- 티어 명은 alias — Fable 5 / Sonnet 5(현행 4.x면 그것) / Haiku 4.5 로 해석된다. 세션 모델을 따라가게 하려면 `inherit`.
- 읽기 전용 → Claude `tools`에서 Edit/Write 제외 / Codex `sandbox_mode = "read-only"`
- 쓰기 → Claude 전체 도구 / Codex `sandbox_mode = "workspace-write"`

## 로스터 (16)

| agent | 역할 | 읽기/쓰기 | 티어 | 든 스킬 | 핵심 경계·금지 |
|---|---|---|---|---|---|
| explorer | 빠른 코드 탐색 | 읽기 | 낮음 | domain | 수정 금지. 전수 검색은 auditor |
| auditor | 누락 없는 전수 검색 | 읽기 | 중간 | domain | 수정 금지. 목록만 |
| planner | 기획·기술 결정·계획 | 읽기 | 높음 | domain | 코드 작성 금지 |
| flow-reviewer | 유저 플로우 검수 (CRUD·사용자 관점 누락) | 읽기 | 높음 | domain, flow-review | 코드 X 제품 플로우. 수정 금지, 갭 목록만 |
| bug-investigator | 버그 근본원인 추적 | 읽기 | 높음 | domain, api-patterns | 수정 금지. 원인·위치만 |
| api-developer | **BFF Route Handler + 외부 Spring 연동 + 캐싱 전략** | 쓰기 | 중간 | domain, api-patterns, backend-api-reference, data-fetching | **백엔드 상상 금지**. 스펙 없으면 멈춤. 시크릿은 서버까지만 |
| frontend-dev | 페이지·화면 구현 (**RSC 기본, `"use client"` 는 leaf만**) | 쓰기 | 중간 | domain, api-patterns, frontend-design, form-patterns, nextjs-app-router, data-fetching | BFF·API는 api-developer. 경계 전환은 리뷰 대상 |
| **design-system-builder** 🆕 | **디자이너 바이브코딩** — `packages/design-system` 토큰·공통 컴포넌트 (Radix/shadcn 기반) | 쓰기 | 중간 | domain, frontend-design, tailwind-v4, accessibility, figma-bridge | Radix 기반 우선(a11y 내장). 컴포넌트마다 `/playground` 스토리 필수. 앱 로직(`apps/web` 데이터·BFF)은 frontend-dev/api-developer 우선 |
| wireframe-builder | 디자인 전 와이어프레임 초안 (더미 데이터·배포) | 쓰기 | 중간 | domain, wireframe-drafting, form-patterns | **디자인 가이드 없이**. 토큰 규칙 면제(초안 한정) |
| figma-implementer | Figma→코드 변환 + **토큰 sync**(Variables→`@theme`) | 쓰기 | 중간 | domain, figma-bridge, frontend-design, tailwind-v4 | **토큰 화이트리스트만**. 못 가져온 값 추측 금지→게이트 |
| test-writer | AI-native 테스트 (Vitest + Playwright + **스크린샷 회귀 + axe**) | 쓰기 | 중간 | domain, test-strategy | 구현 베끼는 동어반복 테스트 금지 |
| code-reviewer | 코드 리뷰 (게이트키퍼 — **푸시 전 1회**) | 읽기 | 높음 | domain, api-patterns, frontend-design, typescript-strict, accessibility, web-performance | 자동수정+flag. 차단은 Critical만. **RSC/Client 경계·캐싱 의도 누락·시크릿 클라 노출 필수 체크** |
| design-reviewer | Figma 정합·토큰 위반·**a11y** 검토 | 읽기 | 높음 | domain, figma-bridge, frontend-design, accessibility | raw 값/arbitrary value 검출. 와이어프레임엔 미적용 |
| diff-organizer | 커밋 정리·푸시 (git-flow) | 쓰기(git) | 낮음 | git-flow | **main 직접 푸시 기본.** pull --rebase 충돌 시 사용자에게. main force 금지 |
| design-handoff-advisor | 디자이너→프론트 핸드오프 자문 | 읽기 | 높음 | design-handoff, figma-bridge, tailwind-v4, frontend-design | 선택적 Q&A. 코드 수정 X |
| design-context-advisor | 디자이너 제품/플로우 맥락 자문 | 읽기 | 높음 | frontend-design, flow-review | 선택적 Q&A. domain·product-spec 근거. 코드 수정 X |

> **와이어프레임 초안 예외**: wireframe-builder 산출물은 디자인 토큰 검사 면제(코드 규칙은 적용). design-reviewer 미적용. → `wireframe-drafting` 스킬.

> **라이브러리 best-practice 스킬**: tailwind-v4·typescript-strict·nextjs-app-router(**RSC+BFF 기준으로 재작성됨**)·playwright-e2e·vitest·web-performance·accessibility·vercel-react-best-practices — 해당 구현/리뷰 agent에 연결.

## 전역 규칙 (모든 agent)

- **막히거나 모호하면 추측하지 말고 멈춰서 사용자에게 묻는다.** (상상코딩·agent 폭주 차단)
- **미정(TODO) 영역을 건드리는 작업이면 진행 전 묻고, 답을 도메인 문서에 기록한다.**
- 위험 경로 변경·배포 직전엔 사용자 확인. 커밋·푸시는 `git-flow.md`(main 직접 허용, 푸시 전 리뷰 1회).
- 자세한 컨벤션은 `conventions.md`, 리뷰는 `review-standard.md`.
