---
name: playwright-e2e
description: Playwright E2E best practice. user-facing locator, web-first assertion, 격리, flaky 회피. test-writer가 참조.
---

# Playwright E2E Best Practice

> 출처: playwright.dev/docs/best-practices (공식).

## 철학
- **사용자 눈에 보이는 동작을 검증** — 내부 함수명·CSS 클래스 같은 구현 디테일 X
- **테스트 격리** — 각 테스트는 독립 스토리지·데이터. 공통 셋업은 `beforeEach`/setup project
- 외부 사이트 의존 금지 → Network API로 **응답 모킹**

## 핵심
- **Locator는 user-facing**: `getByRole('button', { name: '제출' })` 선호, XPath/CSS 클래스 회피
- **Web-first assertion**: `toBeVisible()` 등 자동 대기·재시도. `isVisible()` 즉시 체크 금지
- `filter()`로 locator 좁히기 → 견고성
- `codegen`으로 견고한 locator 생성 (role/text/test-id 우선)
- 인증 상태는 setup project로 재사용 (매번 로그인 X)
- `expect.soft()`로 여러 실패 모아 보기

## CI
- 커밋마다 실행, Linux, 필요한 브라우저만 설치(`install chromium --with-deps`), 샤딩으로 병렬
- ESLint `@typescript-eslint/no-floating-promises`로 await 누락 검출

## 우리 정책 (test-strategy)
- E2E는 **핵심 사용자 흐름 + 위험 경로** 위주 (전체 X)
- 구현 베끼는 동어반복 테스트 금지 — 요구사항(스펙) 검증
