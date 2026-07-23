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
3. 컴포넌트마다 **`/playground` 스토리 추가** — §1-1 규약대로 (규격 1개=파일 1개, Figma 출처 명시, 흰 배경)
4. **빌드 1회(`pnpm build`) → 푸시 전 리뷰 1회 → 바로 main 푸시** (full git 권한). **여기서 끝.** 푸시하면 CI가 자동 배포하므로 결과는 **배포된 Vercel `/playground`에서 확인** — 로컬 `pnpm dev` 불필요.
5. Figma를 고치면 **재-sync는 자동이 아니다** — "고쳤어요"를 알리고 figma-implementer 재실행 (stale 방지 생명선)

> ⚡ **디자이너 플로우는 4단계에서 끝난다.** 테스트 코드 작성·E2E·스크린샷 회귀·플랜 문서 작성은 디자이너 작업 범위 밖 — 필요해지면 추후 test-writer가 일괄로 한다. 리뷰도 푸시 전 1회면 충분(code-reviewer가 토큰·a11y 등 디자인 체크를 겸함, 상세 검증이 필요할 때만 design-reviewer 별도 요청).

> ⚠️ **레포에 남기는 산출물은 컴포넌트 코드 + `/playground` 스토리뿐이다** (conventions #12). 플랜·설계 MD·독립 미리보기 HTML 같은 작업 보조 파일을 커밋하지 않는다 — superpowers 등 개인 플러그인이 이런 파일을 만들려 하면 그 파이프라인 대신 위 워크플로우(design-system-builder)를 쓴다. 결과 확인은 배포된 `/playground`에서.

## 1-1. 플레이그라운드 스토리 규약 (필수)

`apps/web/app/playground` = 디자이너가 결과를 확인하는 갤러리. 스토리북 대신 쓰는 우리 규격:

- **Figma에 있는 규격만 등록한다.** Figma에 없는 임의 시드·shadcn 기본 컴포넌트 금지. 모든 스토리는 `figma` 필드(node id)로 출처를 명시.
- **규격 1개 = 스토리 파일 1개** — `_stories/<규격이름>.tsx`에 만들고 `_stories/registry.ts`에 한 줄 등록. **디자이너가 커밋 하나 = 파일 하나**로 자기 작업을 알아볼 수 있게 분리 유지(여러 규격을 한 파일에 합치지 않는다).
- **`group` 지정 필수** — `파운데이션`(타이포·컬러·간격 등 토큰류) / `컴포넌트`(버튼·입력 등 UI 부품) / `패턴`(조합 규칙). 목차와 본문이 이 그룹으로 묶여 정렬된다. 새 그룹이 필요하면 `_stories/types.ts`의 `StoryGroup`에 추가.
- **배경은 흰색 고정** — 페이지가 `bg-white`로 강제한다. 다크모드·전역 테마가 대조 기준을 흔들면 안 됨. 스토리 안에서 배경색을 바꾸지 말 것(어두운 배경 검증이 필요한 규격은 스토리 내부에 명시적 대비 블록으로).
- **좌측 목차** — registry에 등록하면 자동으로 좌측(모바일은 상단) 목차에 잡힌다.
- 스토리 내용 = 그 규격의 **모든 variant·state 나열** (타이포는 전 스케일, 컴포넌트는 variant × hover/disabled/loading 등).

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
