# Figma Common Components Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the seven component specifications in Figma section `395:9705` as reusable design-system components and register every state in the playground.

**Architecture:** Keep one public React component per Figma specification under `packages/design-system/src/components`. Components are server-compatible and stateless; button specifications use native buttons, while text fields are intentionally visual-only. Tailwind classes consume Figma-synced `@theme` color and typography tokens.

**Tech Stack:** React 19, TypeScript strict, Tailwind CSS v4, class-variance-authority, Next.js App Router playground

## Global Constraints

- Do not use `any`, raw hex colors, arbitrary Tailwind values, or internal barrel files.
- Keep components mobile-first and server-compatible; do not add `"use client"`.
- Do not introduce variants or behavior absent from Figma.
- Preserve unrelated `.codex/config.toml` working-tree changes.
- Do not start a development server.
- Run the project build only once, at final verification.
- The current environment has no `node`, `npm`, or `pnpm`; record commands that cannot execute rather than claiming success.

---

### Task 1: Synchronize Figma color tokens

**Files:**
- Modify: `packages/design-system/src/tokens.css`

**Interfaces:**
- Consumes: Figma Variables used by node `395:9705`.
- Produces: `--color-white`, `--color-gray-50`, `--color-gray-200`, `--color-gray-400`, `--color-gray-800`, `--color-gray-900`, `--color-blue-400`, and `--color-red-300` Tailwind tokens.

- [ ] **Step 1: Confirm variable values from Figma**

Use `get_variable_defs(fileKey="TRXXVUvIwh8vh7FbBusXCO", nodeId="395:9705")` and require exact variable names and values.

- [ ] **Step 2: Add only confirmed tokens**

```css
--color-white: #ffffff;
--color-gray-50: #f5f6fb;
--color-gray-200: #c2c6d1;
--color-gray-400: #626670;
--color-gray-800: #272e3f;
--color-gray-900: #0f172a;
--color-blue-400: #659bff;
--color-red-300: #ff5858;
```

Do not create a Kakao yellow token because the Figma fill is not present in the returned variable definitions.

- [ ] **Step 3: Check the token diff**

Run: `git diff --check -- packages/design-system/src/tokens.css`

Expected: exit 0.

### Task 2: Implement button components

**Files:**
- Create: `packages/design-system/src/components/cta.tsx`
- Create: `packages/design-system/src/components/cta-small.tsx`
- Create: `packages/design-system/src/components/cta-insta.tsx`
- Create: `packages/design-system/src/components/survey-button.tsx`
- Create: `packages/design-system/src/icons/link-icon.tsx`

**Interfaces:**
- Consumes: `cn(...inputs: ClassValue[]): string` and color/type tokens from Task 1.
- Produces: `Cta`, `CtaSmall`, `CtaInsta`, `SurveyButton` plus their prop types.

- [ ] **Step 1: Define wished-for public types before implementation**

```tsx
type CtaProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  status?: "default" | "disabled" | "pressed";
};

type CtaSmallProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "stroke" | "strokeIcon" | "fill";
};

type SurveyButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  status?: "default" | "activated";
};
```

- [ ] **Step 2: Implement Figma variants with CVA**

Use native `<button type="button">`, forward remaining button attributes, set `disabled` when `Cta.status === "disabled"`, and merge caller classes with `cn`.

- [ ] **Step 3: Implement the local link icon**

Render a 24×24 inline SVG with `aria-hidden="true"`, `focusable="false"`, and the Figma link path. Do not use the expiring MCP asset URL.

- [ ] **Step 4: Run available static checks**

Run: `git diff --check -- packages/design-system/src/components packages/design-system/src/icons`

Expected: exit 0.

### Task 3: Implement visual fields and indicator

**Files:**
- Create: `packages/design-system/src/components/text-field.tsx`
- Create: `packages/design-system/src/components/text-field-set.tsx`
- Create: `packages/design-system/src/components/indicator-bar.tsx`

**Interfaces:**
- Consumes: `TextField` from `text-field.tsx` and tokens from Task 1.
- Produces: `TextField`, `TextFieldSet`, `IndicatorBar` plus their prop types.

- [ ] **Step 1: Define visual-only state APIs**

```tsx
interface TextFieldProps extends HTMLAttributes<HTMLDivElement> {
  status?: "focused" | "entered" | "placeholder" | "error";
  text?: string;
}

interface TextFieldSetProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "description";
  text?: string;
  description?: string;
}

interface IndicatorBarProps extends HTMLAttributes<HTMLDivElement> {
  step?: 1 | 2 | 3;
}
```

- [ ] **Step 2: Implement visual fields**

Render `TextField` as a `<div>`, never an `<input>`. Compose it in `TextFieldSet` and conditionally render the description only for the `description` variant.

- [ ] **Step 3: Implement CSS indicator segments**

Render three rounded spans, make the active span 14px-equivalent using a design-system CSS class, keep inactive spans 6px circles, and mark the wrapper `aria-hidden="true"`.

- [ ] **Step 4: Run available static checks**

Run: `git diff --check -- packages/design-system/src/components`

Expected: exit 0.

### Task 4: Publish components and add playground stories

**Files:**
- Modify: `packages/design-system/src/index.ts`
- Create: `apps/web/app/playground/_stories/cta.tsx`
- Create: `apps/web/app/playground/_stories/cta-small.tsx`
- Create: `apps/web/app/playground/_stories/cta-insta.tsx`
- Create: `apps/web/app/playground/_stories/text-field.tsx`
- Create: `apps/web/app/playground/_stories/text-field-set.tsx`
- Create: `apps/web/app/playground/_stories/survey-button.tsx`
- Create: `apps/web/app/playground/_stories/indicator-bar.tsx`
- Modify: `apps/web/app/playground/_stories/registry.ts`

**Interfaces:**
- Consumes: all seven components from Tasks 2 and 3 and the existing `Story` interface.
- Produces: package exports and seven `group: "컴포넌트"` playground entries.

- [ ] **Step 1: Add direct exports at the public package entry**

Export each component and prop type directly from its concrete module. Do not create `components/index.ts`.

- [ ] **Step 2: Create one story per Figma specification**

Each story uses a `w-full max-w-sm` preview container, labels every state, and records the source node URL. Render every state listed in the design spec.

- [ ] **Step 3: Register all stories**

Import the seven story objects directly and append them to `stories` after `typographyStory`.

- [ ] **Step 4: Check the story diff**

Run: `git diff --check -- apps/web/app/playground packages/design-system/src/index.ts`

Expected: exit 0.

### Task 5: Review and verify

**Files:**
- Review: all files changed by Tasks 1–4

**Interfaces:**
- Consumes: completed implementation.
- Produces: review findings and fresh verification evidence.

- [ ] **Step 1: Review requirements and prohibited patterns**

Run:

```bash
rg -n "\bany\b|#[0-9a-fA-F]{3,8}|\[[^]]+\]|use client" packages/design-system/src/components packages/design-system/src/icons
```

Expected: no matches for prohibited types, raw colors, arbitrary Tailwind values, or client directives.

- [ ] **Step 2: Run lint**

Run: `pnpm lint`

Expected: exit 0. If `pnpm` is unavailable, record the environment failure exactly.

- [ ] **Step 3: Run the single final build**

Run: `pnpm build`

Expected: exit 0. This is the only build attempt. If `pnpm` is unavailable, record the environment failure exactly and do not claim the build passed.

- [ ] **Step 4: Inspect final scope**

Run: `git status --short && git diff --check && git diff --stat && git diff -- packages/design-system apps/web/app/playground`

Expected: only requested implementation, plan documentation, and pre-existing `.codex` changes are present; whitespace check exits 0.
