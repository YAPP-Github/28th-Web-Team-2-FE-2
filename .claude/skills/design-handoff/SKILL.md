---
name: design-handoff
description: 디자이너→프론트 핸드오프 규약. 디자인 토큰·스펙을 figma-implementer가 추측 없이 받도록 Figma Variables 그룹 구조·표기·체크리스트를 정의. design-handoff-advisor가 참조.
---

# 디자이너 → 프론트 핸드오프 규약

**목적: 디자이너가 넘긴 형식이 figma-implementer가 받는 형식과 안 갈라지게.**
이 하네스는 "토큰을 추측하지 말고 화이트리스트 안에서만"이 원칙(`figma-bridge`)이라, 디자이너 산출물에 공백이 있으면 구현이 **멈춘다(게이트)**. 그래서 핸드오프는 "예쁜 형식"이 아니라 **"코드가 깨지지 않고 받는 형식"**으로 맞춘다.

## 대원칙: 토큰은 문서가 아니라 Figma Variables로

- 색·간격·타이포는 **Figma Variables로 정의** → `figma-bridge`가 Tailwind v4 `@theme`로 **자동 추출**. 수동 hex 문서는 보조일 뿐.
- Variable로 정의하면 **"`gray 100: #` vs `gray: {100: #}`" 논쟁 자체가 사라진다** — Figma Variable 그룹이 그대로 토큰 구조가 되기 때문.

## 토큰 구조 = 네임스페이스 / 군 / 단계 (3단 그룹)

`gray-100` 같은 flat 표기는 **그룹 구조를 한 줄로 직렬화한 것일 뿐**이다. 디자이너가 머릿속에 가져야 할 진짜 형태는 **그룹(nested)**:

```
color / gray / 100          ← Figma Variable 그룹
   ↓ figma-bridge 자동 추출
--color-gray-100            ← Tailwind v4 @theme 토큰
   ↓ 유틸 자동 생성
bg-gray-100, text-gray-100  ← 개발자가 쓰는 클래스
```

→ Figma Variable 이름은 **슬래시 그룹**으로: `color/gray/100`, `color/brand/500`. 그러면 1:1로 안 깨지고 흐른다.

### 네임스페이스(맨 앞 그룹)는 Tailwind v4 규격을 따른다

| Figma Variable 그룹 | Tailwind 토큰 | 생성되는 유틸 |
|---|---|---|
| `color/*` | `--color-*` | `bg-`, `text-`, `border-` |
| `spacing/*` (또는 기준 `--spacing`) | `--spacing-*` | `p-`, `m-`, `gap-` |
| `text/*` (폰트 크기) | `--text-*` | `text-`(size) |
| `font-weight/*` | `--font-weight-*` | `font-` |
| `radius/*` | `--radius-*` | `rounded-` |
| `shadow/*` | `--shadow-*` | `shadow-` |
| `breakpoint/*` | `--breakpoint-*` | `sm: md:` 반응형 |

## 표기 규칙 (디자이너가 지킬 것)

- **그룹 구조 유지**: `color/gray/100` (✅) — flat `gray100`·`그레이-100`(❌, 매핑 깨짐).
- **단계 스케일**은 숫자 일관되게: `50, 100, 200 … 900`. 중간에 `gray-150` 같은 변칙 단계 만들지 말 것(스케일 깨짐).
- **색은 oklch 권장**(지각 균일). hex로 줘도 추출은 되지만 oklch가 일관됨.
- **원시 토큰 ↔ 시맨틱 토큰 구분**: `color/gray/100`(원시)을 화면에서 직접 쓰기보다, `color/surface/default → {gray/100}` 같은 **시맨틱 alias**를 정의하면 다크모드·리브랜딩에 강함. (도입 여부는 디자인 시스템 성숙도에 따라, 초기엔 원시만으로도 OK.)

## 문서/시트로 줄 수밖에 없을 때 (Figma Variables 불가 시 fallback)

그래도 **그룹 구조를 유지**한다. 권장 형태(JSON/표 어느 쪽이든):

```
color
  gray   { 100: oklch(...), 200: oklch(...), ... }
  brand  { 500: oklch(...) }
spacing  { 1: 4px, 2: 8px, ... }
radius   { sm: 4px, md: 8px }
```

→ flat `gray-100: #...` 나열보다 이게 figma-bridge 매핑 규칙과 결이 같다. 단 이건 **임시 경로** — 매핑 안 되는 변수는 구현이 게이트로 멈추니, 결국 Figma Variables로 옮기는 게 정답.

## "추측을 못 하게" — 토큰 외에 핸드오프에 꼭 명시할 것

figma-implementer는 **MCP가 못 가져온 값을 추측하지 않고 멈춘다.** 멈춤을 줄이려면 디자이너가 미리:

- **인터랙션 상태 전부**: default / hover / pressed / disabled / focus 색·스타일.
- **3종 상태**(이 하네스 필수): 로딩 / 에러 / **빈 화면(empty state)** 디자인. (피드·탭·목록 전부)
- **반응형**: 모바일 퍼스트가 기본 — 모바일(무프리픽스) 스펙을 먼저, `md:`부터 데스크탑. 브레이크포인트 **값**을 토큰으로.
- **타이포 스케일**: 크기뿐 아니라 line-height·weight 짝까지.
- **컴포넌트 경계**: 같은 버튼이 화면마다 다르면 그 차이를 토큰/variant로 명시(임의 변형 금지).

## 핸드오프 직전 셀프 체크리스트

- [ ] 토큰을 Figma Variables로 정의했고, 이름이 `네임스페이스/군/단계` 슬래시 그룹인가
- [ ] 단계 스케일 숫자가 일관적인가 (변칙 단계 없음)
- [ ] 모든 인터랙션 상태 + 3종 상태(로딩/에러/빈)를 그렸는가
- [ ] 모바일 퍼스트 스펙 + 브레이크포인트 값이 있는가
- [ ] 화이트리스트 밖 raw 값(임의 hex·`13px` 같은 비스케일 값)을 화면에 쓰지 않았는가

> 이 체크리스트를 통과하면 figma-implementer가 게이트로 멈출 일이 거의 없다. 막히면 그건 디자인 공백 신호 → 디자이너에게 되돌아온다.
