---
name: typescript-strict
description: TypeScript strict 모드 best practice. any 회피, 타입 안전 패턴, 유틸/제네릭 타입, 좁히기. 구현·리뷰 agent가 참조.
---

# TypeScript Strict Best Practice

`tsconfig` strict 전제.

## 핵심 규칙
- **`any` 금지** — 모르면 `unknown` + 타입 가드로 좁히기. `as any` 금지.
- 단언(`as`) 최소화 — 타입 가드/판별 유니온 선호
- **판별 유니온**(discriminated union)으로 상태 모델링 (로딩/성공/에러 등)
- API 응답은 `types.ts`에 명시 (Request/Response). 외부 Spring 스펙과 일치 (backend-api-reference)
- 유틸 타입 활용: `Pick`/`Omit`/`Partial`/`Record`/`ReturnType`
- `satisfies`로 리터럴 추론 유지하며 타입 체크
- 함수 경계에 명시적 타입, 내부는 추론 활용
- enum보다 `as const` 객체 + 유니온 선호

## 안전 패턴
- 옵셔널 체이닝/널 병합으로 명시적 널 처리 (`strictNullChecks`)
- 배열 인덱스 접근 주의 (`noUncheckedIndexedAccess` 권장)
- 제네릭은 제약(`extends`)으로 좁히기
