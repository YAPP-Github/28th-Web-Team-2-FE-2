---
name: api-patterns
description: API 레이어 구조 — BFF(Route Handler)·서버 fetch 함수·클라 훅의 3층 패턴. ApiError, zod 경계 검증, 훅 네이밍. api-developer/frontend-dev/code-reviewer가 참조.
---

# API 레이어 패턴 (BFF 3층)

> 전신(CSR·클라 fetch 래퍼 중심)과 다름 — **여기선 서버 함수가 1급이다.**

## 폴더 구조 (`apps/web`)

```
lib/api/
  server/          # RSC·Server Action에서 쓰는 서버 fetch 함수 — `import 'server-only'` 필수
    products.ts    #   getProducts(), getProduct(id) … Spring 직호출 + 캐싱 태그
  client/          # "use client"용 TanStack Query 훅 (BFF 경유)
    useGetProductsAPI.ts
  types/           # 요청·응답 타입 (zod 스키마에서 infer)
  schemas/         # zod 스키마 — Spring 응답 경계 검증
  error.ts         # ApiError
app/api/*/route.ts # BFF Route Handler — 클라가 부르는 유일한 HTTP 표면
```

## 3층 규칙

1. **서버 함수 (`lib/api/server/*`)** — RSC가 직접 호출. `server-only` 가드, Spring 토큰 사용 가능, `next: { revalidate, tags }` 명시, zod로 응답 파싱.
2. **BFF Route Handler (`app/api/*`)** — 클라 인터랙션이 부르는 표면. 내부에서 서버 함수 재사용. 클라에 필요한 모양으로 가공(over-fetch 차단).
3. **클라 훅 (`lib/api/client/*`)** — TanStack Query로 BFF 호출. **Spring 직호출 금지** (토큰이 클라로 새는 경로).

## 공통 규약

- **ApiError**: status·code·message 표준화 throw — 화면 에러 상태가 구분 처리
- **zod 경계 검증**: Spring 응답을 신뢰하지 않는다 — 스키마 parse 후 타입 확정 (`any` 원천 차단)
- **훅 네이밍**: Query `useGet*API` / Mutation `use[Action]*API`
- **queryKey 팩토리**: 도메인별 keys 객체로 중앙 관리
- 뮤테이션: Server Action 우선(+`revalidateTag`), 클라 편의 크면 TanStack Mutation 허용

## 안티패턴 (리뷰 flag)

- 클라 컴포넌트→Spring 직호출 (BFF 우회) = 🔴
- `server-only` 가드 없는 서버 함수
- zod 없이 `as Type` 캐스팅으로 응답 신뢰
- BFF가 Spring 응답을 가공 없이 그대로 프록시만 (BFF 존재 이유 상실 — 필요성 재검토)
