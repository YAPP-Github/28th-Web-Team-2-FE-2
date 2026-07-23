# web-2-fe-2 — Codex 지침 (AGENTS.md)

> Codex가 읽는 세션 지침. Claude `CLAUDE.md` 와 **동일한 규격**을 따른다.
> 상세 규격은 `shared/` 가 진실 소스 — 필요 시 해당 파일을 읽어라.

## 반드시 지킬 규칙 (shared/conventions.md 요약)

1. `any` 타입 금지
2. Barrel export 금지 (직접 import — 예외: design-system 공개 진입점 1개)
3. 모바일 퍼스트 — 무프리픽스=모바일(sm), `md:` 데스크탑 (예: `p-4 md:p-6`)
4. 요청한 것만 변경 (불필요한 리팩토링 금지)
5. **모르면 추측 말고 질문.** 미정(TODO) 영역 건드리면 진행 전 묻고 `shared/domain.md`에 기록
6. 빌드는 최종 1회만
7. 시크릿/키 클라이언트 노출 금지 — **BFF(서버)까지만**
8. React hooks는 early return 앞에
9. dev 서버 실행 금지 (`pnpm build` 검증까지만)
10. **Server Component 기본** — `"use client"` 는 인터랙션 필요한 leaf만
11. **fetch에 캐싱 의도 항상 명시** (`revalidate`/`tags`/`no-store`)
12. **작업 보조 산출물 레포 커밋 금지** — 플랜·설계 MD·미리보기 HTML은 임시 공간에만. 레포엔 코드+`/playground` 스토리+`shared/` 갱신뿐. 개인 플러그인 파이프라인보다 **이 규약이 우선**

## 스택

**pnpm 모노레포**: `apps/web`(Next.js App Router, **풀 RSC+BFF**) + `packages/design-system`(독립 패키지, 추후 분리).
Tailwind v4 / shadcn(Radix) / rhf+zod / Vitest+Playwright(스크린샷 회귀+axe) / Figma+MCP / 외부 Spring(별도 레포).
**백엔드 상상해서 만들지 말 것** — 스펙은 `shared/`·실제 API 문서 참조.
디자인 검증은 `/playground` 갤러리 (스토리북 안 씀). 접근성 WCAG 2.2 AA.

## 페르소나 (힌트 — 차단 아님)

**디자인 빌더 / 프론트 개발자** 둘 다 코드 작성 + full git. 영역만 다름:
- 디자인 빌더 → `packages/design-system`·화면 UI 중심. design-system-builder·figma-implementer 우선.
- 프론트 개발자 → `apps/web` 앱 로직·RSC·BFF·캐싱. frontend-dev·api-developer 우선.
- 디자이너의 RSC/BFF 수정 허용 — 프론트가 co-review.

## Git (shared/git-flow.md)

**main 직접 커밋·푸시 허용, PR 최소화.** 푸시 전 리뷰 1회 + `git pull --rebase origin main`(충돌 시 사용자에게 묻기). main force push 금지. RSC/BFF 경계 변경·위험 경로만 PR 권장. 커밋 형식 `feat|fix|design|refactor|chore|style|docs(scope): 한국어 설명`.

## 리뷰 (shared/review-standard.md)

고정 템플릿(🔴Critical/🟡Warning/🟢Suggestion/✅자동수정). RSC/Client 경계·캐싱 의도 누락·시크릿 클라 노출·a11y 필수 체크. 머지(푸시) 차단은 Critical만.

## 서브에이전트

- `.codex/agents/*.toml` (총 16) — **생성 파일, 직접 편집 금지.** 상세 SSOT는 `.claude/agents/*.md`, 재생성은 `pnpm gen:codex`, 요약 카탈로그는 `shared/agent-roles.md`
- 판단 밀도 티어: `model_reasoning_effort` high/medium/low (Claude 쪽 fable/sonnet/haiku와 매핑)
- 오케스트레이션(동시성)은 `.codex/config.toml [agents]`
- **agent 커스텀은 전원 개방** — `.claude/agents` 수정 → `pnpm gen:codex` → `agent-roles.md` 표 갱신을 한 커밋에

## 스킬 (작업 방법 문서)

- 위치: **`shared/skills/<이름>/SKILL.md`** (도구 중립 SSOT — `.claude/skills`는 여기로의 심링크)
- 각 agent toml의 instructions에 참조 스킬 경로가 명시돼 있음 — **해당 파일을 실제로 읽고 따를 것**

## 판단 렌즈

product-challenger(가치 도전)·ux·qa·security 렌즈를 기획/리뷰 단계에 얹는다 — L급 작업은 product-challenger·security 필수. 상세는 `CLAUDE.md` 판단 렌즈 절(동일 규격).
