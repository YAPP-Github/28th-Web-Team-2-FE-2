# 코딩 컨벤션 (단일 진실 소스 · 도구 무관)

> Claude `CLAUDE.md` 와 Codex `AGENTS.md` 가 이 문서를 참조한다. 팀 전원·모든 도구 공통 규격.
> **이 프로젝트는 전신(CSR 전용)과 달리 RSC+BFF가 기본이다.**

## 최상위 불변 규칙

1. **`any` 타입 금지** — proper 타입 정의
2. **Barrel export 금지** — `index.ts` re-export 하지 않고 직접 import (예외: `packages/design-system`의 공개 진입점 1개는 허용 — 패키지 경계라서)
3. **모바일 퍼스트** — 무프리픽스 = 모바일(sm 기준), `md:` 부터 데스크탑. 예: `p-4 md:p-6`
4. **요청한 것만 변경** — 요청에 없는 리팩토링·정리·기능 추가 금지
5. **모르면 추측 말고 질문** — 의도 불분명·자료 없음 → 멈추고 한 가지 질문으로 확인 (전역)
6. **빌드는 최종 1회만** — 중간 빌드 금지, 작업 마무리 시점에만
7. **시크릿/키 클라이언트 노출 금지** — 비밀값·외부 Spring 토큰은 **BFF(서버)까지만**. 클라이언트 번들·로그·`NEXT_PUBLIC_` 에 절대 넣지 않음
8. **React hooks는 early return 앞에** — 모든 hook은 조건문/early return 이전
9. **개발 서버는 개발자가 실행** — agent는 `pnpm build`(타입체크/빌드 검증)까지만. **`pnpm dev`·`pnpm start` 등 dev/서버 실행 금지**
10. **Server Component가 기본** — `"use client"` 는 인터랙션·브라우저 API·클라 상태가 **정말 필요한 leaf**에만. 지시어를 올리기 전에 "이걸 서버에서 못 하나?"부터 묻는다
11. **데이터는 서버에서, 캐싱은 명시적으로** — RSC/BFF fetch에는 캐싱 의도(`revalidate`/`tags`/`no-store`)를 **항상 명시**. 캐싱 전략 없는 fetch는 리뷰 flag 대상
12. **작업 보조 산출물 레포 커밋 금지** — 플랜·설계 메모·체크리스트 MD, 독립 미리보기 HTML 등 에이전트/플러그인이 작업 중 만드는 파일은 세션 임시 공간에만 둔다. 레포에 남는 산출물은 **코드 + `/playground` 스토리 + `shared/` 문서 갱신**뿐. 개인 플러그인(superpowers 등)의 파이프라인 규약이 이와 충돌하면 **이 규약이 우선** — 프로젝트 전용 플로우(design-system-builder 등)를 탄다

## 스택 (확정)

- 구조: **pnpm 모노레포** — `apps/web`(Next.js 앱) + `packages/design-system`(토큰·공통 컴포넌트, **추후 분리 전제의 독립 패키지**)
- 프론트: **Next.js (App Router) + Tailwind CSS v4**
- 백엔드: **외부 Spring (별도 레포)** — 이 레포엔 도메인 백엔드 구현 없음
- **렌더링 전략 (확정 2026-07-13)**: **풀 RSC + BFF.**
  - Server Component 기본, 데이터는 서버에서 fetch.
  - `apps/web/app/api/*` Route Handler가 **외부 Spring 앞단 BFF** — 토큰·시크릿은 여기(서버)까지만, 응답 가공·캐싱도 여기서.
  - 클라이언트 인터랙션(폼·토글·낙관적 업데이트)만 `"use client"` + 필요 시 **TanStack Query**.
  - 뮤테이션은 **Server Actions 우선**, 클라 편의가 크면 TanStack Mutation 허용.
- **캐싱 (적극 활용 — 이 프로젝트의 학습 목표)**: 정적 렌더링/Full Route Cache 기본 → 동적 필요 시에만 opt-out. `fetch(..., { next: { revalidate, tags } })` + 뮤테이션에서 `revalidateTag`/`revalidatePath`. 비-fetch 데이터는 `unstable_cache`. Route Segment Config(`export const revalidate/dynamic`)로 라우트 단위 선언. → `data-fetching` 스킬이 상세.
- **React Compiler**: opt-in 활성 (자동 메모이제이션 — 수동 `memo`/`useMemo` 남발 금지)
- 컴포넌트: **shadcn/ui(Radix 기반)** 위에 `packages/design-system` 구축 — a11y가 기본 내장되는 최대 지렛대
- 폼: **react-hook-form + zod** (Server Actions와 병용 시 zod 스키마 공유)
- 패키지 매니저: **pnpm** (workspace)
- 테스트: **Vitest(유닛) + Playwright(E2E + `toHaveScreenshot` 시각 회귀 + axe a11y)**
- 디자인 검증: **`apps/web/app/playground`** 갤러리 라우트 (스토리북 안 씀) — **런칭 전까진 배포에서도 공개**(팀 검증용 Vercel이 보는 화면). 실사용자 릴리즈 시 Vercel env `PLAYGROUND_DISABLED=1`로 숨김 (`TODO(✍️):` 런칭 시점에 설정). 스토리 규약(Figma 규격만·1규격 1파일·흰 배경 고정·좌측 목차)은 `design-guide.md §1-1`
- 디자인: **Figma + MCP**, 토큰은 Figma Variables → Tailwind v4 `@theme` 로 스냅샷 sync (`figma-bridge` 스킬)
- 접근성: **WCAG 2.2 AA 목표** — Radix 기본기 + axe 자동 검사 + `accessibility` 스킬
- 다국어: 안 함 (한국어 only)

## 미정 (TODO — 건드리는 작업이면 사용자에게 묻고 여기 기록)

- `TODO(✍️):` 도메인·서비스 정의 (`domain.md` 참조 — 스켈레톤 상태)
- `TODO(✍️):` 외부 Spring API 스펙 (나오면 `backend-api-reference` 스킬 채움)
- `TODO(✍️):` PWA(Serwist) 도입 여부 — 전신에선 확정이었으나 이 프로젝트에선 미정
- `TODO(✍️):` 전역 클라이언트 상태 도구 (필요해질 때)
- `TODO(✍️):` PPR — Next stable 승격 시 재검토
