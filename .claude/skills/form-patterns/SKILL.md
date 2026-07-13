---
name: form-patterns
description: 폼 패턴. react-hook-form + zod + schema 분리. frontend-dev가 폼 작성 시 참조.
---

# 폼 패턴

**react-hook-form + zod** 조합.

## 규칙
- zod 스키마는 `schema.ts`로 분리
- `zodResolver`로 rhf 연결
- 복합 검증은 `.refine()` 체이닝
- 서버 유효성(중복 체크 등)은 mutation 결과를 폼 에러로 통합
- 에러 메시지는 한국어
- 시맨틱: 라벨·에러 연결, 접근성 속성
