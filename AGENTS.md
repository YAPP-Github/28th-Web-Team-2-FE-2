# web-2-fe-2 — Codex 지침 (AGENTS.md)

> Codex가 읽는 세션 지침. Claude `CLAUDE.md` 와 **동일한 규격**을 따른다.
> 상세 규격은 `shared/` 가 진실 소스 — 필요 시 해당 파일을 읽어라.

## 반드시 지킬 규칙 (shared/conventions.md 요약)

1. `any` 타입 금지
2. Barrel export 금지 (직접 import — **예외 없음**. 구 design-system 패키지 진입점 예외는 단일 루트 통합으로 소멸)
3. 모바일 퍼스트 — 무프리픽스=모바일(sm), `md:` 데스크탑 (예: `p-4 md:p-6`)
4. 요청한 것만 변경 (불필요한 리팩토링 금지)
5. **모르면 추측 말고 질문.** 미정(TODO) 영역 건드리면 진행 전 묻고 `shared/domain.md`에 기록
6. 빌드는 최종 1회만
7. 시크릿/키 클라이언트 노출 금지 — **BFF(서버)까지만**
8. React hooks는 early return 앞에
9. 평상시 dev 서버 상시 실행 금지. Playwright·브라우저 QA 때만 임시 실행하고 종료
10. **Server Component 기본** — `"use client"` 는 인터랙션 필요한 leaf만
11. **fetch에 캐싱 의도 항상 명시** (`revalidate`/`tags`/`no-store`)
12. **작업 보조 산출물 레포 커밋 금지** — 플랜·설계 MD·미리보기 HTML은 임시 공간에만. 레포엔 코드+`/playground` 스토리+`shared/` 갱신뿐. 개인 플러그인 파이프라인보다 **이 규약이 우선**

## 스택

**단일 루트 Next.js 프로젝트**(2026-08-05 모노레포 해체): 루트 `app/`(App Router, **풀 RSC+BFF**). 디자인 시스템은 서비스 병합 — `app/_components/` + `app/globals.css` `@theme`.
Tailwind v4 / shadcn(Radix) / rhf+zod / Vitest+Playwright(스크린샷 회귀+axe) / Figma+MCP / 외부 Spring(별도 레포).
**백엔드 상상해서 만들지 말 것** — 스펙은 `shared/`·실제 API 문서 참조.
디자인 검증은 `/playground` 갤러리 (스토리북 안 씀). 접근성 WCAG 2.2 AA.
**Figma를 받았을 때**: 되묻지 말고 `get_metadata`로 정체를 분류(토큰/타이포/화면/컴포넌트)한 뒤 진행. 토큰 반영 지점은 `app/globals.css` `@theme static` 한 곳이고, 반영 후 검산 3종(`/playground` 스토리 라벨 갱신 · 대비 계산 · 산출물 토큰 emit 확인)은 생략 불가. 절차·실측 함정은 `shared/skills/figma-bridge/SKILL.md`가 진실 소스.
**Figma 접근은 MCP 전용** — REST·public API(`api.figma.com`)·`curl`/`wget`·personal access token 금지. MCP가 안 되면 우회하지 말고 멈추고 알린다(진단 순서 `figma-bridge` §0-0).
**`app/prototype/*`은 구조 유지 대상** — 삭제·대규모 개편 금지. 구조 변경은 사용자 확인.
**하네스는 규격만 담는다** — 기획서 성격 문서(`shared/pages.md`·`detail-features.md` 등)의 내용을 agent 지침에 옮겨 적지 않는다. 필요하면 그때 읽는다.

## 페르소나 (힌트 — 차단 아님)

**디자인 빌더 / 프론트 개발자** 둘 다 코드 작성 + full git. 영역만 다름:
- 디자인 빌더 → `app/_components/`·`@theme` 토큰·화면 UI 중심. design-system-builder·figma-implementer 우선.
- 프론트 개발자 → `app/` 앱 로직·RSC·BFF·캐싱. frontend-dev·api-developer 우선.
- 디자이너의 RSC/BFF 수정 허용 — 프론트가 co-review.

## Git (shared/git-flow.md)

**`main`=릴리스, `dev`=통합.** 최신 `dev`에서 작업 브랜치를 만들고 `dev` 대상 PR로만 합친다. `main`·`dev` 직접 push와 force push 금지. 충돌은 사용자에게 보고한다. 커밋 형식 `feat|fix|design|refactor|chore|style|docs|test(scope): 한국어 설명`.

**커밋은 최대한 잘게 (2026-08-18)** — 타입 하나·함수 하나·캐싱 옵션 하나·상태 하나가 각각 커밋이고, 기능 하나는 보통 5~15 커밋. 중간 커밋이 빌드를 깨도 되지만 **푸시 시점 HEAD는 `pnpm build` 통과** 필수. 분해 축·예외(이름 변경·생성물·lockfile)·`git add -p` 절차는 `shared/skills/git-commit/SKILL.md`.

## 외부 백엔드 (marketgo)

스펙은 **라이브가 진실 소스**: `curl -s https://api.marketgo.kro.kr/v3/api-docs`. 매 작업마다 읽고 문서·기억으로 필드를 채우지 않는다. 인증은 JWT Bearer(accessToken은 서버까지만) + refreshToken 쿠키. **응답 envelope가 엔드포인트마다 달라 공통 unwrap 유틸을 만들지 않는다.** 절차·함정은 `shared/skills/backend-api-reference/SKILL.md`.

## 리뷰 (shared/review-standard.md)

고정 템플릿(🔴Critical/🟡Warning/🟢Suggestion/✅자동수정). RSC/Client 경계·캐싱 의도 누락·시크릿 클라 노출·a11y 필수 체크. 머지(푸시) 차단은 Critical만.

## 서브에이전트

- `.codex/agents/*.toml` (총 **14**) — **생성 파일, 직접 편집 금지.** 상세 SSOT는 `.claude/agents/*.md`, 재생성은 `pnpm gen:codex`, 요약 카탈로그는 `shared/agent-roles.md`
- **2026-08-05 정리**: 16 → 13. `explorer` 삭제(빌트인 탐색으로 대체), `design-reviewer` → `code-reviewer` 흡수, `design-handoff-advisor`+`design-context-advisor` → `design-advisor` 통합
- 판단 밀도 티어: `model_reasoning_effort` high/medium/low (Claude 쪽 **opus**/sonnet/haiku와 매핑 — 구 `fable`은 조직 가용성 문제로 `opus`로 내렸다). Claude 쪽 frontmatter에 `effort`가 있으면 그 값이 우선한다
- **도구 부여**: Claude 쪽 `tools`는 allowlist라 명시하면 MCP 도구가 배제된다 — MCP가 필요한 agent는 `tools`를 생략하고 `disallowedTools`로 제한한다 (`agent-roles.md` §도구 부여 규약)
- 오케스트레이션(동시성)은 `.codex/config.toml [agents]`
- **agent 커스텀은 전원 개방** — `.claude/agents` 수정 → `pnpm gen:codex` → `agent-roles.md` 표 갱신을 한 커밋에

## 스킬 (작업 방법 문서)

- 위치: **`shared/skills/<이름>/SKILL.md`** (도구 중립 SSOT — `.claude/skills`는 여기로의 심링크)
- **외부 스킬은 별도 트랙**: `npx skills add`로 설치한 스킬은 `.agents/skills/`에 있고 `skills-lock.json`이 버전 고정. 직접 편집 금지 — `skills update`로 갱신
- 각 agent toml의 instructions에 참조 스킬 경로가 명시돼 있음 — **해당 파일을 실제로 읽고 따를 것**

## 판단 렌즈

product-challenger(가치 도전)·ux·qa·security 렌즈를 기획/리뷰 단계에 얹는다 — L급 작업은 product-challenger·security 필수. 상세는 `CLAUDE.md` 판단 렌즈 절(동일 규격).
