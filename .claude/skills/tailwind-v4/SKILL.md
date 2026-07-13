---
name: tailwind-v4
description: Tailwind CSS v4 best practice. CSS-first @theme 토큰, 네임스페이스, arbitrary value 회피, Figma 토큰 연동. frontend-dev/figma-implementer/code-reviewer가 참조.
---

# Tailwind CSS v4 Best Practice

> 출처: tailwindcss.com/docs/theme (공식). v4는 **CSS-first** — config 파일이 아니라 `@theme` 디렉티브.

## 핵심: `@theme` 토큰

```css
@import "tailwindcss";
@theme {
  --color-brand-500: oklch(0.65 0.23 280);  /* → bg-brand-500, text-brand-500... */
  --spacing: 4px;                             /* → p-4, m-8... */
  --breakpoint-sm: 40rem;
}
```
- `@theme` 변수는 CSS 변수 + **유틸 클래스 자동 생성**. 디자인 토큰 전용.
- 토큰 아닌 보조 변수는 `:root` 사용.

## 네임스페이스 (토큰 → 유틸)
`--color-*` → bg/text/border · `--spacing-*` → p/m · `--text-*` → font-size · `--font-weight-*` · `--radius-*` · `--shadow-*` · `--breakpoint-*` → 반응형 변형

## 규칙
- **토큰만 사용, arbitrary value 회피**: ✅ `bg-brand-500` / ❌ `bg-[#3f3cbb]`, `p-[13px]`
- 색은 **oklch** (지각 균일)
- 커스텀 CSS에서도 `var(--color-...)`로 토큰 참조 → 동기화 유지
- 변수 참조 시 `@theme inline` (cascade 이슈 회피)
- **Figma Variables → `@theme` 자동 생성** (figma-bridge). 매핑 안 되면 실패 처리.

## 모바일 퍼스트
무프리픽스 = 모바일(sm 기준), `md:` 데스크탑. 예: `p-4 md:p-6`.
