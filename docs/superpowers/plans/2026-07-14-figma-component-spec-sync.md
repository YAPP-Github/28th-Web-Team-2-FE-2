# Figma Component Spec Sync Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 최신 Figma 규격에 맞춰 CTA pressed 색상과 Indicator Bar 치수를 코드와 독립 미리보기에 동기화한다.

**Architecture:** 기존 공개 API와 컴포넌트 구조는 유지하고 CVA variant와 Tailwind 토큰만 최소 수정한다. 독립 HTML은 동일한 토큰과 치수를 정적으로 복제하며, Figma의 `discription` 오타는 코드에 반영하지 않는다.

**Tech Stack:** React, TypeScript, Tailwind CSS v4, class-variance-authority, HTML/CSS

## Global Constraints

- `any` 타입과 컴포넌트 내부 raw hex·arbitrary Tailwind 값을 사용하지 않는다.
- 공개 prop 타입과 Playground 스토리 구성은 변경하지 않는다.
- `blue/100`은 Figma Variable 값 `#D2E2FF`를 그대로 동기화한다.
- Indicator Bar는 전체 40×6px, 활성 16×6px, 점 6×6px, gap 6px을 유지한다.
- `description` 표기는 올바른 철자를 유지한다.
- CTA pressed의 흰색 텍스트는 디자이너가 명시적으로 승인한 접근성 예외로 유지한다.
- 기존 `.codex/config.toml` 삭제와 `.codex/config.toml.bak`은 수정하거나 커밋하지 않는다.
- 개발 서버는 실행하지 않으며 build는 최종 1회만 시도한다.

---

### Task 1: CTA pressed 색상 동기화

**Files:**
- Modify: `packages/design-system/src/tokens.css`
- Modify: `packages/design-system/src/components/cta.tsx`
- Modify: `figma-components-preview.html`

**Interfaces:**
- Consumes: Figma `blue/100 = #D2E2FF`, 기존 `CtaStatus = "default" | "disabled" | "pressed"`
- Produces: 기존 API를 유지하면서 pressed 상태에 `bg-blue-100`을 적용한 `Cta`

- [x] **Step 1: 변경 전 계약 검사 실패 확인**

Run: `rg -n -- '--color-blue-100: #d2e2ff' packages/design-system/src/tokens.css`

Expected: no matches and exit code 1.

Run: `rg -n 'pressed: "bg-blue-100"' packages/design-system/src/components/cta.tsx`

Expected: no matches and exit code 1.

- [x] **Step 2: 토큰과 CTA variant 구현**

`packages/design-system/src/tokens.css`의 컬러 목록에 다음 값을 추가한다.

```css
--color-blue-100: #d2e2ff;
```

`packages/design-system/src/components/cta.tsx`의 pressed variant를 다음과 같이 변경한다.

```ts
pressed: "bg-blue-100",
```

`figma-components-preview.html`에는 `--blue-100: #d2e2ff;`를 추가하고 `.cta-pressed`를 다음과 같이 변경한다.

```css
.cta-pressed {
  background: var(--blue-100);
}
```

- [x] **Step 3: 변경 후 계약 검사 성공 확인**

Run: `rg -n -- '--color-blue-100: #d2e2ff|pressed: "bg-blue-100"' packages/design-system/src/tokens.css packages/design-system/src/components/cta.tsx`

Expected: exactly 2 matches.

---

### Task 2: Indicator Bar 치수 동기화

**Files:**
- Modify: `packages/design-system/src/components/indicator-bar.tsx`
- Modify: `figma-components-preview.html`

**Interfaces:**
- Consumes: 기존 `IndicatorBarStep = 1 | 2 | 3`
- Produces: 공개 API를 유지하면서 16px 활성 막대와 6px gap을 렌더링하는 `IndicatorBar`

- [x] **Step 1: 변경 전 계약 검사 실패 확인**

Run: `rg -n 'gap-1.5.*w-4 bg-gray-900' packages/design-system/src/components/indicator-bar.tsx`

Expected: no matches and exit code 1.

- [x] **Step 2: Indicator Bar 구현**

최상위 class를 다음 값으로 변경한다.

```tsx
className={cn("flex h-1.5 w-10 items-center gap-1.5", className)}
```

활성/비활성 폭을 다음 값으로 변경한다.

```tsx
item === step ? "w-4 bg-gray-900" : "w-1.5 bg-gray-50"
```

독립 HTML의 `.indicator`는 `justify-content: space-between` 대신 `gap: 6px`을 사용하고 `.indicator .active`의 폭을 `16px`로 변경한다.

- [x] **Step 3: 변경 후 계약 검사 성공 확인**

Run: `rg -n 'gap-1.5|w-4 bg-gray-900' packages/design-system/src/components/indicator-bar.tsx`

Expected: exactly 2 matches.

Run: `rg -n 'gap: 6px|width: 16px' figma-components-preview.html`

Expected: both updated Indicator rules are present.

---

### Task 3: 범위 및 품질 검증

**Files:**
- Verify: `packages/design-system/src/tokens.css`
- Verify: `packages/design-system/src/components/cta.tsx`
- Verify: `packages/design-system/src/components/indicator-bar.tsx`
- Verify: `figma-components-preview.html`

**Interfaces:**
- Consumes: Task 1과 Task 2 결과
- Produces: 최신 Figma 계약과 일치하는 검증 결과

- [x] **Step 1: 금지 패턴과 오타 검사**

Run: `rg -n '\bany\b|use client|#[0-9A-Fa-f]{3,8}|\[[^]]+\]' packages/design-system/src/components/cta.tsx packages/design-system/src/components/indicator-bar.tsx`

Expected: no matches and exit code 1.

Run: `rg -n 'discription' packages/design-system/src figma-components-preview.html`

Expected: no matches and exit code 1.

- [x] **Step 2: 독립 HTML 구조와 상태 수 검사**

Run: `xmllint --noout figma-components-preview.html`

Expected: no output and exit code 0.

Run: `rg -o 'data-component="[^"]+"' figma-components-preview.html | wc -l`

Expected: `7`.

Run: `rg -o 'data-state="[^"]+"' figma-components-preview.html | wc -l`

Expected: `18`.

- [x] **Step 3: diff와 실행 가능 검증**

Run: `git diff --check`

Expected: no output and exit code 0.

Run: `pnpm lint`

Expected: exit code 0 when pnpm is available; otherwise record `command not found` without retrying.

Run once at the very end: `pnpm build`

Expected: exit code 0 when pnpm is available; otherwise record `command not found` without retrying.

- [x] **Step 4: 변경 커밋**

```bash
git add packages/design-system/src/tokens.css packages/design-system/src/components/cta.tsx packages/design-system/src/components/indicator-bar.tsx figma-components-preview.html docs/superpowers/plans/2026-07-14-figma-component-spec-sync.md
git commit -m "design(components): 변경된 Figma 규격 동기화"
```
