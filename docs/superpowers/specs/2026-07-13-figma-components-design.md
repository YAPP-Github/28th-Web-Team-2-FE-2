# Figma 공통 컴포넌트 구현 설계

## 목적과 범위

Figma `Looky Design`의 섹션 `395:9705`에 정의된 공통 컴포넌트 7종을 `packages/design-system`에 구현한다.

- `CTA`: `default`, `disabled`, `pressed`
- `CTA_small`: `stroke`, `stroke_icn`, `fill`
- `CTA_insta`: `default`
- `textfield`: `focused`, `entered`, `placeholder`, `error`
- `textfield_set`: `default`, `description`
- `btn_survey`: `default`, `activated`
- `indicatorbar`: `step1`, `step2`, `step3`

각 규격은 Figma와 일대일로 추적할 수 있도록 별도 공개 컴포넌트로 유지한다. 화면이나 API 로직은 이번 범위에 포함하지 않는다.

## 파일과 공개 API

각 컴포넌트는 `packages/design-system/src/components/` 아래의 직접 파일로 구현하고, 디자인 시스템의 유일하게 허용된 공개 진입점인 `packages/design-system/src/index.ts`에서 내보낸다. 내부 barrel 파일은 만들지 않는다.

컴포넌트 이름은 코드 관례에 맞춰 PascalCase를 사용한다.

- `Cta`
- `CtaSmall`
- `CtaInsta`
- `TextField`
- `TextFieldSet`
- `SurveyButton`
- `IndicatorBar`

모든 컴포넌트는 `className`을 받아 호출부가 배치 관련 스타일을 추가할 수 있게 하되, Figma에 없는 시각 variant를 추가하지 않는다.

## 컴포넌트 동작

### 버튼 계열

`Cta`, `CtaSmall`, `CtaInsta`, `SurveyButton`은 시맨틱 `<button>`으로 렌더링한다. 각 컴포넌트는 `ButtonHTMLAttributes<HTMLButtonElement>`를 기반으로 기본 버튼 속성을 전달한다.

- `Cta`의 기본 상태는 `default`다. `disabled` variant는 실제 `disabled` 속성과 연결한다. `pressed`는 Figma의 눌린 시각 상태를 재현하는 명시적 variant다.
- `CtaSmall`은 `stroke`, `strokeIcon`, `fill` variant를 제공한다. `strokeIcon`의 링크 아이콘은 만료되는 원격 asset 대신 저장소에 포함된 SVG React 컴포넌트로 렌더링한다.
- `CtaInsta`는 Figma가 별도 컴포넌트로 정의했으므로 `CtaSmall`과 외형이 유사하더라도 별도 공개 API로 유지한다.
- `SurveyButton`은 `default`, `activated` variant를 제공한다.

명시하지 않은 `type`은 폼 제출 사고를 막기 위해 `button`으로 설정한다.

### 시각 전용 필드

`TextField`는 사용자 결정에 따라 실제 입력 요소가 아닌 시각 전용 `<div>`로 구현한다. `status`와 `text`를 받아 Figma 상태를 렌더링하며 포커스, 입력, validation 동작을 내부에서 만들지 않는다.

`TextFieldSet`은 `TextField`를 조합하고 `description` variant에서 설명 문구를 표시한다. 설명은 오류 색상으로 렌더링되지만 실제 폼 오류 연결이나 `aria-describedby`는 이 시각 전용 규격의 책임이 아니다.

### 인디케이터

`IndicatorBar`는 원격 PNG를 사용하지 않고 세 개의 캡슐형 막대를 CSS로 렌더링한다. `step1`, `step2`, `step3`에 따라 활성 막대 위치만 변경한다. 진행 상태를 전달할 의미가 없는 장식용 컴포넌트이므로 기본적으로 접근성 트리에서 제외한다.

## 스타일과 토큰

Figma 노드에서 확인된 색과 타이포그래피만 사용한다. 컬러 변수는 Figma Variables의 이름을 Tailwind v4 `@theme` 이름으로 변환해 `packages/design-system/src/tokens.css`에 동기화한다. raw hex와 arbitrary value는 컴포넌트 코드에 사용하지 않는다.

확인된 주요 토큰은 `white`, `gray/50`, `gray/200`, `gray/400`, `gray/800`, `gray/900`, `blue/400`, `red/300`과 카카오 공유 버튼 배경색이다. 카카오 배경색의 변수 연결 여부와 정확한 변수명은 구현 전 Figma에서 다시 읽고, 변수에 연결되지 않은 값이면 임의 토큰을 만들지 않고 구현을 중단한다.

타이포그래피는 이미 동기화된 `head-point1/16`, `head-point1/18`, `body/16-medium` 토큰을 사용한다. 크기와 간격은 Tailwind 기본 spacing/radius 유틸리티로 정확히 표현 가능한 값만 사용한다.

컴포넌트 너비는 모바일 컨테이너에 맞게 `w-full`로 두고, Figma의 350px 폭은 playground 스토리의 컨테이너가 책임진다. 높이, padding, radius와 내부 간격은 Figma 규격을 유지한다.

## Playground

`apps/web/app/playground/_stories/`에 규격별 파일 7개를 만들고 registry에 각각 등록한다. 모든 스토리는 `group: "컴포넌트"`와 원본 Figma node URL을 기록하고, 해당 규격의 모든 variant/state를 흰 배경에서 나열한다.

playground는 표시 용도이므로 `TextField` 상태는 정적 prop으로 재현하고 버튼 이벤트 로직은 추가하지 않는다.

## 테스트와 검증

구현은 테스트 우선으로 진행한다.

- 각 컴포넌트가 올바른 시맨틱 요소와 기본 variant를 렌더링하는지 검증한다.
- 모든 Figma variant/state가 대응 prop으로 렌더링되는지 검증한다.
- `Cta`의 disabled variant가 실제 `disabled` 속성을 갖는지 검증한다.
- 시각 전용 `TextField`가 `<input>`으로 렌더링되지 않는지 검증한다.
- `IndicatorBar`가 단계별 활성 위치와 장식용 접근성 처리를 지키는지 검증한다.

컴포넌트 테스트와 lint를 먼저 수행하고, 프로젝트 규칙에 따라 최종 검증에서만 `pnpm build`를 한 번 실행한다. dev 서버는 실행하지 않는다.

## 접근성 및 오류 처리

버튼은 키보드와 보조기술이 기본 동작을 얻도록 네이티브 요소를 사용하고, 최소 56px 또는 64px 높이로 모바일 터치 영역을 충족한다. 링크 아이콘은 버튼 텍스트가 의미를 전달하므로 장식 요소로 처리한다.

이번 범위에는 비동기 데이터나 실패 상태가 없다. 잘못된 variant는 TypeScript union으로 컴파일 단계에서 차단한다.

## 제외 사항

- 실제 폼 입력과 validation
- 로딩 variant 등 Figma에 없는 상태
- 화면 단위 배치와 API 연동
- Figma 원본 수정 또는 Code Connect 등록
- 관련 없는 기존 코드 리팩터링
