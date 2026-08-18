# 코딩 컨벤션 (단일 진실 소스 · 도구 무관)

> Claude `CLAUDE.md` 와 Codex `AGENTS.md` 가 이 문서를 참조한다. 팀 전원·모든 도구 공통 규격.
> **이 프로젝트는 전신(CSR 전용)과 달리 RSC+BFF가 기본이다.**

## 최상위 불변 규칙

1. **`any` 타입 금지** — proper 타입 정의
2. **Barrel export 금지** — `index.ts` re-export 하지 않고 직접 import (**예외 없음** — 구 `packages/design-system` 패키지 진입점 예외는 단일 루트 통합으로 근거 소멸, 2026-08-05)
3. **모바일 퍼스트** — 무프리픽스 = 모바일(sm 기준), `md:` 부터 데스크탑. 예: `p-4 md:p-6`
4. **요청한 것만 변경** — 요청에 없는 리팩토링·정리·기능 추가 금지
5. **모르면 추측 말고 질문** — 의도 불분명·자료 없음 → 멈추고 한 가지 질문으로 확인 (전역)
6. **빌드는 최종 1회만** — 중간 빌드 금지, 작업 마무리 시점에만
7. **시크릿/키 클라이언트 노출 금지** — 비밀값·외부 Spring 토큰은 **BFF(서버)까지만**. 클라이언트 번들·로그·`NEXT_PUBLIC_` 에 절대 넣지 않음
8. **React hooks는 early return 앞에** — 모든 hook은 조건문/early return 이전
9. **개발 서버는 필요할 때만 실행** — 상시 실행하지 않는다. Playwright·브라우저 QA에는 테스트 runner가 `pnpm dev`/`pnpm start`를 임시 실행할 수 있고 검증 후 반드시 종료한다
10. **Server Component가 기본** — `"use client"` 는 인터랙션·브라우저 API·클라 상태가 **정말 필요한 leaf**에만. 지시어를 올리기 전에 "이걸 서버에서 못 하나?"부터 묻는다
11. **데이터는 서버에서, 캐싱은 명시적으로** — RSC/BFF fetch에는 캐싱 의도(`revalidate`/`tags`/`no-store`)를 **항상 명시**. 캐싱 전략 없는 fetch는 리뷰 flag 대상
12. **작업 보조 산출물 레포 커밋 금지** — 플랜·설계 메모·체크리스트 MD, 독립 미리보기 HTML 등 에이전트/플러그인이 작업 중 만드는 파일은 세션 임시 공간에만 둔다. 레포에 남는 산출물은 **코드 + `/playground` 스토리 + `shared/` 문서 갱신**뿐. 개인 플러그인(superpowers 등)의 파이프라인 규약이 이와 충돌하면 **이 규약이 우선** — 프로젝트 전용 플로우(design-system-builder 등)를 탄다.
    - **예외 (2026-08-05, 2026-08-10 범위 확장)**: `디자인_docs/`는 디자인시스템 관련 자료(디자이너가 전달하는 Figma Variables 원본 파일, 참고·의사결정 정리 문서, **Figma 전수조사 결과 문서** 등)를 아카이빙하는 용도로 이 규칙의 명시적 예외다. 진실 소스가 아니며(여전히 Figma→`@theme static`), 코드가 이 폴더를 참조하지 않는다. 규약은 `디자인_docs/README.md`.

## 스택 (확정)

- 구조: **단일 루트 Next.js 프로젝트** (모노레포 아님 — 2026-08-05 전환) — 루트에 `app/`(App Router). 디자인 시스템은 별도 패키지·폴더가 아니라 **서비스 안에 병합**: 공통 컴포넌트는 `app/_components/`, 유틸은 `app/_lib/`, **토큰은 `app/globals.css`의 `@theme` 블록**. 워크스페이스·패키지 경계 없음. **2026-08-05 현재 `app/_components/`·`app/_lib/`는 존재하지 않는다** — Figma에 컴포넌트 규격이 없어서(토큰만 있다) 만들 게 없기 때문. 규격이 올라오면 그때 생성한다
- 프론트: **Next.js (App Router) + Tailwind CSS v4**
- 백엔드: **외부 Spring (별도 레포)** — 이 레포엔 도메인 백엔드 구현 없음
- **렌더링 전략 (확정 2026-07-13)**: **풀 RSC + BFF.**
  - Server Component 기본, 데이터는 서버에서 fetch.
  - `app/api/*` Route Handler가 **외부 Spring 앞단 BFF** — 토큰·시크릿은 여기(서버)까지만, 응답 가공·캐싱도 여기서.
  - 클라이언트 인터랙션(폼·토글·낙관적 업데이트)만 `"use client"` + 필요 시 **TanStack Query**.
  - 뮤테이션은 **Server Actions 우선**, 클라 편의가 크면 TanStack Mutation 허용.
- **캐싱 (적극 활용 — 이 프로젝트의 학습 목표)**: 정적 렌더링/Full Route Cache 기본 → 동적 필요 시에만 opt-out. `fetch(..., { next: { revalidate, tags } })` + 뮤테이션에서 `revalidateTag`/`revalidatePath`. 비-fetch 데이터는 `unstable_cache`. Route Segment Config(`export const revalidate/dynamic`)로 라우트 단위 선언. → `data-fetching` 스킬이 상세.
- **React Compiler**: opt-in 활성 (자동 메모이제이션 — 수동 `memo`/`useMemo` 남발 금지)
- 컴포넌트: **shadcn/ui(Radix 기반)** 위에 `app/_components/` 구축 — a11y가 기본 내장되는 최대 지렛대
- 폼: **react-hook-form + zod** (Server Actions와 병용 시 zod 스키마 공유)
- 패키지 매니저: **pnpm** (워크스페이스 없음 — 단일 프로젝트)
- 테스트: **Vitest(유닛) + Playwright(E2E + `toHaveScreenshot` 시각 회귀 + axe a11y)**
- 디자인 검증: **`app/playground`** 갤러리 라우트 (스토리북 안 씀) — **런칭 전까진 배포에서도 공개**(팀 검증용 Vercel이 보는 화면). 실사용자 릴리즈 시 Vercel env `PLAYGROUND_DISABLED=1`로 숨김 (`TODO(✍️):` 런칭 시점에 설정). 스토리 규약(Figma 규격만·1규격 1파일·흰 배경 고정·좌측 목차)은 `design-guide.md §1-1`
- 디자인: **Figma + MCP**, 토큰은 Figma Variables → `app/globals.css`의 Tailwind v4 `@theme static` 블록으로 스냅샷 sync (`figma-bridge` 스킬). **디자이너가 이 블록에 직접 주입해도 된다.** `static`인 이유: 미사용 토큰까지 항상 emit해야 시맨틱 alias·SEED 오버라이드가 끊기지 않는다
- 접근성: **WCAG 2.2 AA 목표** — Radix 기본기 + axe 자동 검사 + `accessibility` 스킬
- 폰트: **Wanted Sans Variable 1종** (SIL OFL) — 동적 서브셋 92분할 self-host(`public/fonts/wanted-sans/`, `@font-face`는 `app/fonts/wanted-sans-subset.css`). 페이지당 2~4조각(≈50~100KB)만 내려받는다. **버전 업 외 직접 편집 금지**
- 다국어: 안 함 (한국어 only)

## 미정 (TODO — 건드리는 작업이면 사용자에게 묻고 여기 기록)

- `TODO(✍️):` 도메인·서비스 정의 (`domain.md` 참조 — 스켈레톤 상태)
- ~~외부 Spring API 스펙~~ → **확보(2026-08-18)**: marketgo Swagger `https://api.marketgo.kro.kr/v3/api-docs`. **라이브가 진실 소스** — 매 작업마다 조회하고 문서에 필드를 복제하지 않는다 (`backend-api-reference` 스킬). 남은 미정은 그 스킬 §4
- `TODO(✍️):` PWA(Serwist) 도입 여부 — 전신에선 확정이었으나 이 프로젝트에선 미정
- `TODO(✍️):` 전역 클라이언트 상태 도구 (필요해질 때)
- `TODO(✍️):` PPR — Next stable 승격 시 재검토
