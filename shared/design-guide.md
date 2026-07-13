# 디자인 가이드 (단일 진실 소스 · 디자이너 소유)

> **디자이너가 소유·편집하는 문서.** 이 프로젝트에서 디자이너는 문서만이 아니라 **`packages/design-system` 코드도 소유**한다(바이브코딩 — design-system-builder agent).
> 채울 때마다 갱신 → 미정은 추측 금지, `TODO(✍️)`로.

## 0. 이 문서의 경계 (중요)

- **여기엔 토큰 *값*을 적지 않는다.** 색·간격·타이포 수치의 진실 소스는 **Figma Variables** → figma-implementer가 Tailwind v4 `@theme` 로 sync. 문서에 hex를 복제하면 drift.
- 디자이너의 토큰 역할 = Figma Variable 그룹 구조(`color/gray/100`)·스케일 일관성 **검증** + sync된 `@theme` 결과 확인.
- **여기엔 토큰이 아닌 디자인 룰**을 적는다: 원칙·보이스·컴포넌트 사용 규칙·do/don't.

## 1. 디자이너 워크플로우 (이 프로젝트의 신설 규약)

1. Figma에서 컴포넌트·토큰 작업
2. **design-system-builder** 로 바이브코딩 → `packages/design-system` 에 구현 (Radix/shadcn 기반 — a11y 기본 내장)
3. 컴포넌트마다 **`/playground` 스토리 추가** (variant·상태 나열 + Figma 스크린샷 나란히)
4. design-reviewer(시각·토큰·a11y) → 푸시 전 code-reviewer 1회 → **main 푸시** (full git 권한)
5. Figma를 고치면 **재-sync는 자동이 아니다** — "고쳤어요"를 알리고 figma-implementer 재실행 (stale 방지 생명선)

## 2. 디자인 원칙

- 확정: **모바일 퍼스트**, **WCAG 2.2 AA**, 상태 3종(로딩/에러/빈) 필수
- `TODO(✍️):` 핵심 디자인 원칙 3~5개 / 핵심 비주얼 / 타겟 톤

## 3. UI 보이스 & 톤 (카피 가이드)

- `TODO(✍️):` 호칭(반말/존댓말), 에러·빈 화면 카피 톤

## 4. 컴포넌트 사용 규칙

- 같은 컴포넌트의 화면별 변형은 **variant로 명시**(임의 변형 금지) — `design-handoff` 참조
- 새 공통 컴포넌트는 **Radix primitive가 있으면 그 위에** 만든다 (키보드·ARIA·포커스 공짜)
- `TODO(✍️):` 버튼 위계(주 CTA/보조) 등 컴포넌트별 규칙

## 5. 접근성·디바이스

- **WCAG 2.2 AA 목표** — axe가 Playwright·`/playground`에서 자동 검사
- `TODO(✍️):` 최소 터치 영역·대비·글씨 크기 기준 (`accessibility` 스킬 참조)
