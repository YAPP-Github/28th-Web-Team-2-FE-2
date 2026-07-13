# Figma 컴포넌트 규격 동기화 설계

## 목적

Figma `Looky Design`의 컴포넌트 섹션 `395:9705`에서 변경된 규격을 기존 디자인 시스템 코드에 최소 범위로 동기화한다.

## 확인된 변경

### CTA pressed

- Figma node: `395:9842`
- 배경색: `gray/800` (`#272E3F`)에서 `blue/100` (`#D2E2FF`)으로 변경
- 높이 56px, radius 16px, padding 8px, 흰색 `head-point1/18` 텍스트는 유지

### Indicator Bar

- Figma nodes: `754:4137`, `754:4141`, `754:4145`
- 활성 막대: 16×6px
- 비활성 점: 6×6px
- 요소 간 간격: 6px
- 전체 크기: 40×6px
- 색상 `gray/900`, `gray/50`은 유지

### Text Field Set 오타

Figma의 `discription` 표기는 디자이너가 오타라고 확인했다. 공개 API와 기본 문구는 올바른 `description`을 유지하며 오타를 코드에 동기화하지 않는다.

### 접근성 예외

CTA pressed의 `blue/100` 배경과 흰색 텍스트 대비는 약 1.31:1로 WCAG 2.2 AA 기준에 미달한다. 디자이너가 Figma 원형 유지를 명시적으로 승인했으므로 이번 동기화에서는 흰색 텍스트를 유지하며, 예외 결정을 `shared/domain.md`에 기록한다.

## 구현 범위

- `packages/design-system/src/tokens.css`에 Figma Variable `blue/100`을 `--color-blue-100`으로 동기화
- `Cta`의 `pressed` variant를 `bg-blue-100`으로 변경
- `IndicatorBar`를 활성 폭 16px, 고정 gap 6px 구조로 변경
- `figma-components-preview.html`의 CTA pressed와 Indicator Bar 규격을 동일하게 갱신
- 기존 공개 컴포넌트명, prop 타입, 기본 상태, Playground 스토리 구성은 유지

## 제외 범위

- 변경이 확인되지 않은 나머지 5개 컴포넌트 수정
- Figma 원본의 `discription` 오타 수정
- 새로운 상태나 인터랙션 추가
- 관련 없는 코드 리팩터링

## 검증

- 최신 Figma 값과 토큰·치수의 일대일 비교
- 컴포넌트 영역의 raw hex, arbitrary value, `any`, 불필요한 `use client` 부재 확인
- 독립 HTML의 7개 컴포넌트와 18개 상태 유지 확인
- `git diff --check`와 리뷰 수행
- 실행 환경에 `pnpm`이 있으면 lint와 최종 build 1회를 수행하고, 없으면 실행 불가 결과를 기록
