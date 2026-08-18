# Agent 역할 정의 (요약 카탈로그 · 도구 무관)

> **SSOT 관계 (정직하게)**: 역할의 **상세 정의는 `.claude/agents/*.md`가 진실 소스**(사람이 편집),
> `.codex/agents/*.toml`은 **`pnpm gen:codex`로 생성되는 어댑터**(직접 편집 금지),
> 이 문서는 **한눈 요약 카탈로그**다 — agent를 추가·수정하면 ① `.claude/agents` 편집 ② `pnpm gen:codex` ③ 이 표 갱신을 **한 커밋에** 담는다.
> **agent 커스텀은 디자이너 포함 전원 개방.**

## 도구 부여 규약 (2026-08-05 신설 — 여기서 사고가 났다)

`tools:`는 **allowlist**다. 명시하면 그 목록으로 제한되고, **생략하면 MCP 도구를 포함해 전부 상속**된다.

> 🔴 **실제 사고**: `figma-implementer`가 `tools: Read, Edit, Write, Grep, Glob, Bash`로 못박혀 있어 **Figma MCP 도구가 0개**였다. 메인 세션에서는 MCP가 잘 되므로 문제가 안 보였고, agent만 값을 못 읽어 **REST·public API로 우회**하는 결과가 됐다. 함께 있던 `mcpServers: [figma]`는 존재하지 않는 서버명이라 아무 일도 하지 않았다.

**규칙**:
- **MCP가 필요한 agent는 `tools:`를 생략한다** — 서버명이 사람마다 다를 수 있으므로(claude.ai 커넥터 / 로컬 `.mcp.json` / dev-mode 서버) 이름을 박지 않고 상속받는 게 안전하다
- 제한은 **`disallowedTools:`(denylist)로** 한다. 읽기 전용은 `Edit, Write, NotebookEdit`을 빼고, Figma 계열은 `WebFetch, WebSearch`를 빼서 **REST 우회 경로를 도구 차원에서 없앤다**
- 강제는 문서가 아니라 `.claude/settings.json`의 `permissions`가 한다: Figma MCP는 `allow`, `api.figma.com`·`curl`·`wget`은 `deny`. **서브에이전트는 권한 프롬프트를 띄울 수 없어 `deny`/`ask`는 곧 차단**이다
- `mcpServers:`는 **이미 설정된 서버명이나 인라인 정의**만 유효하다. 추측한 이름을 적으면 조용히 무효 — 쓰지 않는다

## 판단 밀도 → 도구별 매핑 (Opus 5 기준, 2026-08-05 갱신)

| 판단 밀도 | Claude `model` + `effort` | Codex `model_reasoning_effort` | 쓰기 권한 |
|---|---|---|---|
| 높음 (설계·리뷰·버그조사·토큰 sync) | **opus** + `effort: high` | high | (대부분 읽기) |
| 중간 (패턴 따라 구현) | **sonnet** | medium | workspace-write |
| 낮음 (정리·커밋) | **haiku** | low | read-only |

- `model`은 `opus`·`sonnet`·`haiku`·`fable`·풀 ID(`claude-opus-5`)·`inherit`을 받는다. **높음 티어는 `fable`에서 `opus`로 내렸다** — Fable 5는 기본 모델이 아니고 조직별 가용성에 따라 선택이 대체될 수 있어, 팀 공유 하네스가 의존하기엔 불안정하다. 대신 `effort: high`로 판단 밀도를 확보한다
- 구현 agent는 **sonnet 유지**가 맞다 — 잘 스코프된 실행에는 sonnet이 적합하고 병렬 실행 시 지연도 짧다. 예외는 `figma-implementer`(**opus**): 토큰 값 오독이 전 화면에 퍼지고 실제로 hex 8건 오독 이력이 있어 검증 밀도가 값보다 비싸다
- 읽기 전용 → `disallowedTools`로 Edit/Write 제외 / Codex `sandbox_mode = "read-only"`

## 로스터 (14)

> **2026-08-05 정리**: 16 → 13. `explorer` 삭제(빌트인 **Explore** agent가 같은 일을 한다), `design-reviewer` → **code-reviewer**로 흡수(라우팅상 이미 "요청 시만"이라 사문화 상태였다), `design-handoff-advisor`+`design-context-advisor` → **design-advisor** 통합(디자이너가 질문 종류를 먼저 분류해야 하는 부담 제거).
> **2026-08-10 추가**: `figma-handoff-auditor` 신설 — 디자이너가 핸드오프 전 Figma 파일 자체(레이어명·순서·토큰 바인딩)를 전수 점검하는 agent. 기존 `auditor`는 코드 저장소 전용이라 이 영역을 커버하지 못했다.

| agent | 역할 | 읽기/쓰기 | 티어 | 든 스킬 | 핵심 경계·금지 |
|---|---|---|---|---|---|
| auditor | 누락 없는 전수 검색 | 읽기 | sonnet·high | — | 수정 금지. 목록만. 빠른 탐색은 빌트인 Explore |
| planner | 기획·기술 결정·계획 | 읽기 | opus·high | — | 코드 작성 금지 |
| flow-reviewer | 유저 플로우 검수 (CRUD·사용자 관점 누락) | 읽기 | opus·high | flow-review | 코드 X 제품 플로우. 수정 금지, 갭 목록만 |
| bug-investigator | 버그 근본원인 추적 | 읽기 | opus·high | api-patterns | 수정 금지. 원인·위치만 |
| api-developer | **BFF Route Handler + 외부 Spring(marketgo) 연동 + 캐싱 전략** | 쓰기 (`Bash` 포함 — 스펙 조회) | sonnet | api-patterns, backend-api-reference, data-fetching, typescript-strict, git-commit | **작업 전 `/v3/api-docs` 실조회 필수**(기억으로 필드 채우기 금지). 스펙에 없으면 멈춤. 시크릿은 서버까지만. envelope 공통 unwrap 금지 |
| frontend-dev | 페이지·화면 구현 (**RSC 기본, `"use client"`는 leaf만**) | 쓰기 | sonnet | api-patterns, frontend-design, form-patterns, tailwind-v4, typescript-strict, nextjs-app-router, data-fetching, accessibility, web-performance | BFF·API는 api-developer. 경계 전환은 리뷰 대상 |
| design-system-builder | **디자이너 바이브코딩** — `app/globals.css` `@theme static` 토큰 + `app/_components/` 공통 컴포넌트(Radix/shadcn). **현재 Figma에 컴포넌트 규격이 없어 토큰 작업이 주 업무** | 쓰기 (MCP 상속, `WebFetch` 차단) | sonnet·high | figma-bridge, frontend-design, tailwind-v4, accessibility, typescript-strict | **Figma는 MCP로만**. Radix 우선. 컴포넌트마다 `/playground` 스토리 필수. **빌드 1회→리뷰 1회→푸시로 종료** — 테스트·플랜 문서는 범위 밖(conventions #12) |
| figma-implementer | Figma→코드 변환 + **토큰 sync**(Variables→`@theme static`) | 쓰기 (MCP 상속, `WebFetch` 차단) | **opus**·high | figma-bridge, frontend-design, tailwind-v4, accessibility | **토큰 화이트리스트만**. **REST·public API 금지**. **스크린샷 판독 금지**(2026-08-04 hex 8건 오독). sync 후 `/playground` 라벨 동반 갱신 |
| design-advisor 🆕 | 디자이너 자문 **통합** — 핸드오프(토큰 넘기는 법) + 제품 맥락 + 내 디자인 점검 | 읽기 (MCP 상속) | opus·high | design-handoff, figma-bridge, tailwind-v4, frontend-design, flow-review | 코드 수정 X. 토큰 값을 문서에 넣지 않음. 미정은 "미정"이라 답함 |
| figma-handoff-auditor 🆕 | **핸드오프 전 Figma 파일 자체 전수 점검** — 레이어·프레임명/순서는 직접 정리(리네임·재배치), 토큰·컴포넌트 미연결/4px·2px 그리드 이탈/raw값은 목록 보고 | 쓰기(Figma만, MCP 상속) | opus·high | figma-bridge, design-handoff, tailwind-v4 | **코드(레포) 수정 금지 — Figma 파일 전용**. 새 화면 코드 임의 생성 금지(`pages.md` 우선 확인). 애매한 리네임은 보류 |
| wireframe-builder | 디자인 전 와이어프레임 초안 (더미 데이터·배포) | 쓰기 | sonnet | wireframe-drafting, nextjs-app-router, form-patterns, typescript-strict, accessibility | **디자인 가이드 없이**. 토큰 규칙 면제(초안 한정) |
| test-writer | AI-native 테스트 (Vitest + Playwright + **스크린샷 회귀 + axe**) | 쓰기 | sonnet | test-strategy, playwright-e2e, vitest | 구현 베끼는 동어반복 테스트 금지 |
| code-reviewer | 코드 리뷰 (게이트키퍼 — **푸시 전 1회**) + **디자인 정합·토큰·a11y 겸함** | 읽기+자동수정 (MCP 상속) | opus·high | api-patterns, frontend-design, typescript-strict, accessibility, web-performance, nextjs-app-router, data-fetching | 자동수정+flag. 차단은 Critical만. **RSC/Client 경계·캐싱 의도·시크릿 클라 노출·Figma REST 우회 흔적 필수 체크** |
| diff-organizer | 커밋 정리·푸시 (git-flow) — **최대 분해 커밋** | 쓰기(git) | sonnet | git-commit | 최신 dev 기준 작업 브랜치 → dev PR. 기능 하나 = 5~15커밋. 충돌 시 사용자에게. main/dev force 금지 |

> **빌트인 agent 활용**: 빠른 코드 탐색은 **Explore**(read-only 광범위 검색), 계획 초안은 **Plan**을 쓴다 — 같은 일을 하는 커스텀 agent를 두지 않는다.

> **와이어프레임 초안 예외**: wireframe-builder 산출물은 디자인 토큰 검사 면제(코드 규칙은 적용). → `wireframe-drafting` 스킬.

> **2026-08-18 갱신**: BE(marketgo Swagger) 연동 준비 — `backend-api-reference` 스킬을 **라이브 조회 규약**으로 전면 개정(문서에 필드를 복제하지 않는다), `api-developer`에 `Bash` 부여(스펙 curl). `git-commit` 스킬 신설 + `diff-organizer` 티어를 haiku→**sonnet**으로 올렸다 — 함수·타입 단위 분해는 diff를 읽고 hunk를 고르는 판단이라 haiku로는 얕게 뭉친다.

> **라이브러리 best-practice 스킬**: tailwind-v4·typescript-strict·nextjs-app-router(**RSC+BFF 기준**)·playwright-e2e·vitest·web-performance·accessibility·vercel-react-best-practices — 해당 구현/리뷰 agent에 연결.

## 판단 렌즈 (agent가 아니라 관점)

렌즈 = 기존 단계에 얹는 점검 관점 (실행 주체 아님). product-challenger→planner / ux→flow-reviewer / qa→test-writer / security→code-reviewer. 상세 표는 `CLAUDE.md` 판단 렌즈 절. L급 작업은 product-challenger·security 렌즈 필수.

## 전역 규칙 (모든 agent)

- **막히거나 모호하면 추측하지 말고 멈춰서 사용자에게 묻는다.** (상상코딩·agent 폭주 차단)
- **미정(TODO) 영역을 건드리는 작업이면 진행 전 묻고, 답을 도메인 문서에 기록한다.**
- **`app/prototype/*`은 구조 유지 대상** — 삭제·대규모 개편 금지 (요청에 없는 프로토타입 제거는 🔴).
- **Figma 접근은 MCP 전용** — REST·public API·토큰 발급 금지 (`figma-bridge` §0-0).
- 위험 경로의 미확정 계약·배포 직전엔 사용자 확인. 커밋·푸시는 `git-flow.md`(작업 브랜치 → dev PR, CI+리뷰).
- 자세한 컨벤션은 `conventions.md`, 리뷰는 `review-standard.md`.
