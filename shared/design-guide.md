# 디자인 가이드 (단일 진실 소스 · 디자이너 소유)

> **디자이너가 소유·편집하는 문서.** 이 프로젝트에서 디자이너는 문서만이 아니라 **공통 컴포넌트(`app/_components/`)와 토큰(`app/globals.css` `@theme`) 코드도 소유**한다(바이브코딩 — design-system-builder agent).
> 채울 때마다 갱신 → 미정은 추측 금지, `TODO(✍️)`로.

## 0. 이 문서의 경계 (중요)

- **여기엔 토큰 *값*을 적지 않는다.** 색·간격·타이포 수치의 진실 소스는 **Figma Variables** → `app/globals.css`의 Tailwind v4 `@theme static` 블록으로 sync(figma-implementer 또는 디자이너 직접 주입). 문서에 hex를 복제하면 drift.
- **sync 결과 검산은 `/playground`의 Color·Typography·Radius 스토리에서 한다** — 스토리 라벨에 Figma 원본 hex·스펙이 적혀 있어 스와치와 어긋나면 sync가 틀린 것이다. (hex 오독이 2회 발생한 이력 때문에 만든 안전판)
- 디자이너의 토큰 역할 = Figma Variable 그룹 구조(`color/gray/100`)·스케일 일관성 **검증** + sync된 `@theme` 결과 확인.
- **여기엔 토큰이 아닌 디자인 룰**을 적는다: 원칙·보이스·컴포넌트 사용 규칙·do/don't.

## 1. 디자이너 워크플로우 (이 프로젝트의 신설 규약)

> **단계 전환 (2026-08-05, 확정)**: **UT 단계는 끝났다.** 지금부터 Figma로 전달되는 항목은 UT 프로토타입 참고물이 아니라 **실 서비스의 디자인 가이드**다. 디자이너와의 상시 협업 단계이고, 디자인 시스템(컴포넌트·`@theme` 토큰)은 **디자이너가 직접 코드에 주입할 수 있다.** 그래서 토큰이 별도 패키지·파일이 아니라 서비스의 `app/globals.css` 안에 있다 — 주입 지점이 하나여야 하기 때문.

1. Figma에서 컴포넌트·토큰 작업
2. **design-system-builder** 로 바이브코딩 → `app/_components/` 에 구현 (Radix/shadcn 기반 — a11y 기본 내장)
3. 컴포넌트마다 **`/playground` 스토리 추가** — §1-1 규약대로 (규격 1개=파일 1개, Figma 출처 명시, 흰 배경)
4. **최종 검증 → 리뷰 1회 → 작업 브랜치 push → dev 대상 PR.** 결과는 PR Preview 또는 검증 환경의 `/playground`에서 확인한다.
5. Figma를 고치면 **재-sync는 자동이 아니다** — "고쳤어요"를 알리고 figma-implementer 재실행 (stale 방지 생명선)

> ⚡ **디자이너 플로우는 4단계에서 끝난다.** 기능 테스트 코드 작성은 필요하면 test-writer가 맡는다. 다만 PR 공통 CI와 영향 범위의 브라우저 QA는 생략하지 않는다(code-reviewer가 토큰·a11y·Figma 정합 체크를 겸한다 — 구 design-reviewer는 여기에 흡수됐다).

> ⚠️ **레포에 남기는 산출물은 컴포넌트 코드 + `/playground` 스토리뿐이다** (conventions #12). 플랜·설계 MD·독립 미리보기 HTML 같은 작업 보조 파일을 커밋하지 않는다 — superpowers 등 개인 플러그인이 이런 파일을 만들려 하면 그 파이프라인 대신 위 워크플로우(design-system-builder)를 쓴다. 결과 확인은 배포된 `/playground`에서.

## 1-1. 플레이그라운드 스토리 규약 (필수)

`app/playground` = 디자이너가 결과를 확인하는 갤러리. 스토리북 대신 쓰는 우리 규격:

- **Figma에 있는 규격만 등록한다.** Figma에 없는 임의 시드·shadcn 기본 컴포넌트 금지. 모든 스토리는 `figma` 필드(node id)로 출처를 명시.
- **규격 1개 = 스토리 파일 1개** — `_stories/<규격이름>.tsx`에 만들고 `_stories/registry.ts`에 한 줄 등록. **디자이너가 커밋 하나 = 파일 하나**로 자기 작업을 알아볼 수 있게 분리 유지(여러 규격을 한 파일에 합치지 않는다).
- **`group` 지정 필수** — `파운데이션`(타이포·컬러·간격 등 토큰류) / `컴포넌트`(버튼·입력 등 UI 부품) / `패턴`(조합 규칙). 목차와 본문이 이 그룹으로 묶여 정렬된다. 새 그룹이 필요하면 `_stories/types.ts`의 `StoryGroup`에 추가.
- **배경은 흰색 고정** — 페이지가 `bg-white`로 강제한다. 다크모드·전역 테마가 대조 기준을 흔들면 안 됨. 스토리 안에서 배경색을 바꾸지 말 것(어두운 배경 검증이 필요한 규격은 스토리 내부에 명시적 대비 블록으로).
- **좌측 목차** — registry에 등록하면 자동으로 좌측(모바일은 상단) 목차에 잡힌다.
- 스토리 내용 = 그 규격의 **모든 variant·state 나열** (타이포는 전 스케일, 컴포넌트는 variant × hover/disabled/loading 등).

> **현재 인벤토리 (2026-08-13 갱신)**: `_stories/registry.ts` 기준 **39종** — 파운데이션 3(Color·Typography·Radius) + 컴포넌트 32 + 패턴 4(header-store-detail·section-recent-report·sheet-store-detail·sheet-sort). Design Library `(공유) Component` 페이지(node 437-28228 / 477-9098) 전수 실측을 반영한 대규모 sync는 2026-08-08. 이후로도 개별 컴포넌트가 계속 추가되는 중(예: marker-store-map 클러스터링, badge-reporter-rank 등) — **이 인벤토리는 스냅샷이다, 최신 목록은 항상 `registry.ts`가 진실 소스.**
> 이전에 있던 컴포넌트 스토리 7종(CTA·CTA Small·CTA Insta·Text Field·Text Field Set·Survey Button·Indicator Bar)은 2026-08-05에 **삭제했다** — 전신 프로젝트(Looky) Figma 파일에서 온 규격이고 당시 라이브러리에 원본이 없어 위 "Figma에 있는 규격만 등록" 규칙 위반이었다. 딸린 구현(`app/_components/*`)과 유틸(`app/_lib/cn.ts`), 의존성(`class-variance-authority`·`clsx`·`tailwind-merge`)도 함께 걷어냈다 — 이후 같은 이름들이 Figma 원본 규격으로 다시 등록된 것은 별개다.

## 1-2. 외부 디자인 시스템 — Seed Design (프로토타입 탐색용, 2026-07-23 도입)

당근의 디자인 시스템 **Seed Design**을 UT 프로토타입 실험용으로 도입했다(스킬 설치만 완료, 화면 구현은 별도 세션 예정).

- **위치**: `npx skills add daangn/seed-design`로 설치 → `.agents/skills/seed-design/`(스킬 문서), `.claude/skills/seed-design`(심링크), `skills-lock.json`(버전 고정). 어댑터 구조는 `CLAUDE.md §어댑터·동기화` 참조. 직접 편집 금지 — `npx skills update`로만 갱신.
- **용도 한정**: **UT 프로토타입/실험 참고용**이다. 격리 라우트에서만 쓰고, 정식 디자인 시스템(`app/_components/` · `@theme` 토큰)과 **혼용하지 않는다**.
- **우선순위 (SSOT 충돌 방지)**: 이 프로젝트의 디자인 진실 소스는 **여전히 Figma Variables → `@theme`**. Seed Design은 *참고*일 뿐이며, `/playground` 스토리 규약(§1-1 "Figma에 있는 규격만")·토큰 화이트리스트와 충돌하면 **항상 Figma가 우선**한다. Seed 컴포넌트를 정식 DS로 승격하려면 별도 논의·리뷰 게이트가 필요하다.
- **실 사용 참고**: 셋업·컴포넌트·토큰은 `seed-design` 스킬이 안내(`@seed-design/react`+`@seed-design/css`, `seed-design.json`). 문서: `https://seed-design.io`.
- `TODO(✍️):` UT 시나리오 화면 구현 — 어떤 플로우/화면을 만들지 미정(다음 세션). 격리 라우트 예정.

## 1-3. 프레임·레이어 네이밍 규칙 (핸드오프 전 정리 — 2026-08-10 신설, 08-10 실측 반영 개정)

> 핸드오프 직전 Figma 파일 정리(레이어명·순서 정리, 토큰/그리드/raw값 점검)는 **`figma-handoff-auditor`** 에이전트가 담당한다. 아래는 그 기준. **디자이너가 이미 실제로 쓰고 있던 방식을 그대로 문서화한 것**(F03_야채시세 상세 화면 실측, node `634-4925`) — 새로 지어낸 규칙이 아니다.

**화면(최상위 프레임)**
- `F0X[-N]_화면명` — 예: `F01_홈`, `F03_야채시세 상세`.
- **방향은 Figma → 문서다** (2026-08-13 v2 교정). Figma 프레임명이 진실 소스이고 `shared/pages.md`가
  그걸 따라온다. v1까지는 반대로 적혀 있었는데(문서를 먼저 등록하고 Figma를 맞춘다), 실제로는 아무도
  그렇게 하지 않아 문서만 낡아 있었다 — 08-13 전수조사에서 화면 코드 5개가 어긋난 채 발견됐다.
- **새 화면을 그렸으면 `pages.md`에 알린다.** 문서 등록을 기다릴 필요는 없지만, 알리지 않으면
  문서가 다시 낡는다(실제로 `F01_홈_더보기`·`온라인가 비교_인포메이션`이 문서에 없이 존재했다).
- ⚠️ **한 번호를 여러 화면에 쓰지 않는다.** 지금 `F03`이 지도·야채 상세·가게 상세 3개를,
  `F04`가 찜과 제보 흐름 2개를 가리켜 번호만으로는 화면이 특정되지 않는다.
  문서는 `F03-1/-2/-3`으로 분해해 뒀지만 그건 **문서 전용 우회**다 — `TODO(✍️):` Figma 쪽 정리 필요.

**구조용 프레임·그룹 (화면 안의 레이아웃 요소 — 컴포넌트 아님)**
- **kebab-case 영어, 부모-자식 접두사 체이닝.** 슬래시(`/`)는 쓰지 않는다. 예: `store-summary` → `store-summary-thumbnail` / `store-summary-info` → `store-summary-title`, `price-chart-tooltip-label`.
- 깊이 제한 없이 접두사를 이어 붙인다 — 실제로 4~5단까지 쓰이고 있다(`price-chart-tooltip-label`).
- Figma 자동생성명(`Frame 2085673512`, `Line 6`, `Vector 140323`, `Ellipse 14874` 같은 "타입+숫자" 패턴)은 의미 있는 이름으로 바꾼다.

**슬래시(`/`)는 컴포넌트 라이브러리 전용 — 구조용 레이어에 쓰지 않는다**
- Figma가 컴포넌트 variant·Variable·텍스트 스타일 그룹을 만들 때 `/`를 네이티브로 해석하기 때문에(Assets 패널 폴더 구조), 구조용 프레임에 슬래시를 쓰면 "이거 컴포넌트인가?" 혼동이 생긴다. 실측에서도 슬래시는 컴포넌트 인스턴스(`text/vegetable-trend`, `button/base`)에만 등장했다.
- 컴포넌트 라이브러리 자체의 네이밍·구조 규칙은 **§1-4**로 분리.

**레이어 순서(z-order)**
- 레이어 패널에서 위에 있는 항목이 실제 화면에서도 위에 보이는 요소와 일치해야 한다(붙여넣기 등으로 뒤섞인 순서 금지).

## 1-4. 컴포넌트 라이브러리 네이밍·구조 규칙 (2026-08-10 신설 — Design Library 실측 반영)

> `Design Library` 파일의 컴포넌트 정의 페이지(node `437-28228`) 실측. 이미 4단 구조가 일관되게 쓰이고 있었고, 예외 몇 개가 실제로 발견됐다 — 아래 표기하고 `figma-handoff-auditor`가 이 규칙으로 점검한다.

**구조 4단**
| 단계 | 규칙 | 예시 |
|---|---|---|
| 1. 대분류 섹션 | `숫자 카테고리` | `0 Asset`, `1 Icon`, `2 Action`, `3 Content` |
| 2. 문서 wrapper(컴포넌트 아님) | `sec/카테고리` | `sec/button`, `sec/card`, `sec/nav` |
| 3. 스펙시트 wrapper(컴포넌트 아님) | `spec/카테고리/컴포넌트명` | `spec/button/base`, `spec/card/news` |
| 4. 실제 컴포넌트(마스터 — **코드 매핑 기준**) | `카테고리/컴포넌트명` (슬래시 1개만) | `button/base`, `card/news`, `text/vegetable-trend` |

**컴포넌트 variant(내부 프로퍼티)**
- Figma 컴포넌트 프로퍼티 문법(`속성=값`, 콤마로 다중 병기) 그대로 쓴다 — 이건 Figma 플랫폼이 강제하는 문법이라 별도 규칙이 필요 없다. 예: `variant=primary, state=normal, size=medium`.
- **단, 같은 개념이면 속성 이름을 통일한다.** 실측에서 `filter/chip`은 `state=normal/selected`를 쓰는데 `row/sort-option`은 같은 의미(선택 여부)에 `status=normal/selected`를 써서 속성명이 갈렸다 — 이런 불일치는 `figma-handoff-auditor`가 report 대상으로 잡는다.

**점검 대상 (실측에서 실제로 발견된 위반 유형)**
- **3단 규칙 이탈**: `spec/badge`, `spec/circular`, `spec/vegetable`는 `spec/카테고리/컴포넌트명` 3단이 아니라 2단이다 (`spec/loading/circular`, `spec/image/vegetable`가 규칙대로의 형태) — 의도적 예외인지 실수인지 디자이너 확인 필요.
- **복붙 중복 접두사**: `button/base/button/base/icon/check`처럼 같은 세그먼트가 반복된 이름 — 복붙 후 이름을 안 바꾼 흔적. 정규식으로 "같은 세그먼트 반복" 패턴을 잡아 report.
- **문서 wrapper 이름이 안 갱신된 복제본**: `spec/sheet/store-detail`이 두 번 등장하는데(node `436-28171`, `477-4795`) 두 번째는 실제로는 `sheet/sort` 컴포넌트를 담고 있다 — 복제 후 wrapper 이름을 안 고친 사례. 안의 컴포넌트 이름과 wrapper 이름이 불일치하면 report.

**화면에서 쓰인 인스턴스 ↔ 라이브러리 마스터 대조**
- 컴포넌트가 활용되는 화면 링크 + 컴포넌트(라이브러리) 링크를 함께 받으면, 화면 안 인스턴스 이름이 라이브러리 마스터 이름(`카테고리/컴포넌트명`)과 실제로 일치하는지, 로컬에서 이름이 임의로 바뀌지 않았는지 대조한다.

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
