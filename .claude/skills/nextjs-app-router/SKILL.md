---
name: nextjs-app-router
description: Next.js App Router best practice — 풀 RSC + BFF 기준. Server Component 기본, "use client" leaf 최소화, 스트리밍, Server Actions. frontend-dev/api-developer/code-reviewer/planner가 참조.
---

# Next.js App Router — 풀 RSC + BFF (이 프로젝트 확정 전략)

> 출처: nextjs.org/docs (공식). 전신 프로젝트(CSR 전용)와 반대 — **여기선 서버가 기본이다.**

## 기본 원칙

- **Server Component가 기본.** 파일에 지시어가 없으면 서버. `"use client"`는 다음이 *정말* 필요한 컴포넌트에만: 이벤트 핸들러 / `useState`·`useEffect` / 브라우저 API.
- **지시어는 leaf에.** 페이지 최상단에 `"use client"` 붙이면 하위 트리 전부 클라 번들로 끌려간다. 인터랙션 부분만 작은 클라 컴포넌트로 분리해 서버 트리에 꽂는다.
- **서버→클라 경계로는 직렬화 가능한 props만.** 함수·클래스 인스턴스 전달 불가(Server Actions 제외).
- 클라 컴포넌트 안에서 서버 컴포넌트가 필요하면 **children으로 내려꽂는다** (import 금지).

## 데이터 흐름 (BFF)

```
RSC (async 컴포넌트, 서버 fetch)
  → lib/api/* 서버 함수 (server-only 가드)
    → 외부 Spring  ← 토큰·시크릿은 여기까지만
클라 인터랙션 → app/api/* Route Handler(BFF) or Server Action
```

- RSC에서 직접 `await fetch()` — useEffect 페칭 금지 (클라에서 첫 로드 데이터 가져오면 RSC 이점 소멸)
- 같은 데이터 여러 곳 필요 → 그냥 각각 fetch (React가 요청 dedupe). props drilling으로 안 내려도 됨
- 병렬 fetch: `Promise.all` / 순차 의존만 await 체인

## 스트리밍 & 로딩

- 라우트 로딩은 `loading.tsx` (Full Route 스트리밍)
- 느린 데이터 구간만 `<Suspense fallback>` 으로 감싸 **부분 스트리밍** — LCP 체감 개선의 핵심
- `generateMetadata`로 OG/메타는 서버에서

## Server Actions (뮤테이션 기본)

- `"use server"` 함수 + `<form action>` / `useActionState`
- 뮤테이션 후 **반드시 `revalidateTag`/`revalidatePath`** (캐시 무효화 짝)
- 입력은 zod로 서버에서 재검증 (클라 검증만 믿지 않기)

## 캐싱 → `data-fetching` 스킬이 상세 (revalidate/tags 의무)

## 안티패턴 (리뷰 flag)

- 인터랙션 없는 컴포넌트의 `"use client"`
- 첫 로드 데이터를 useEffect/TanStack Query로 클라 페칭
- 클라 컴포넌트에서 비밀 env 접근 (`NEXT_PUBLIC_` 아닌 것)
- `server-only` 가드 없는 서버 전용 모듈
- React Compiler 있는데 수동 `memo`/`useMemo` 도배
