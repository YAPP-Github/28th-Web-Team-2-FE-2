import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "coverage/**",
    "playwright-report/**",
    "test-results/**",
    "next-env.d.ts",
  ]),
  {
    // seed-design/** 는 SEED CLI가 생성·관리하는 벤더 스니펫이다(seed-design.json의 path).
    // 손으로 고치면 `npx @seed-design/cli upgrade` 때 덮여써서 같은 지적이 되돌아온다
    // (design-guide.md §1-2 "직접 편집 금지"). 그래서 파일을 고치는 대신
    // 이 두 규칙만 이 경로에서 끈다 — 나머지 규칙은 그대로 적용된다.
    files: ["seed-design/**/*.{ts,tsx}"],
    rules: {
      // `interface Props extends X {}` — SEED가 공개 타입 이름을 노출하려고 쓰는 관용 패턴
      "@typescript-eslint/no-empty-object-type": "off",
      // forwardRef 래퍼에 displayName을 붙이지 않는 SEED 스타일
      "react/display-name": "off",
    },
  },
]);

export default eslintConfig;
