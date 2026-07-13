# 도메인 (단일 진실 소스 · 도구 무관)

> 채울 때마다 이 문서를 갱신 → Claude/Codex 양쪽이 같이 참조. **미정은 추측 금지, `TODO(✍️)`로.**
> 페이지 단위 상세 스펙은 → `shared/product-spec.md`
> **⚠️ 스켈레톤 상태** — 서비스가 정의되면 채운다. 전신(looky) 도메인은 이식하지 않았다.

## 0. 제품 경계
- `TODO(✍️):` 서비스명/도메인
- `TODO(✍️):` 한 줄 정의
- `TODO(✍️):` 회원/비회원 모델 (인증·세션·재방문 설계의 전제)

## 1. 비즈니스 & 서비스
- `TODO(✍️):` 핵심 가치 / 수익 모델 / 타겟 / 유입 채널

## 2. 핵심 구조
- `TODO(✍️):` 인증·식별
- `TODO(✍️):` 유저 플로우
- `TODO(✍️):` 핵심 엔티티·상태머신

## 3. 아키텍처 제약 (확정분)
- **pnpm 모노레포**: `apps/web`(Next.js) + `packages/design-system`(독립, 추후 분리 전제)
- **풀 RSC + BFF** — Server Component 기본, `apps/web/app/api/*` Route Handler가 외부 Spring 앞단. 상세 → `conventions.md`
- 외부 백엔드: **Spring (별도 레포)** — `TODO(✍️):` API 스펙
- 캐싱 적극 활용 (revalidate/tags 명시 의무) → `data-fetching` 스킬

## 4. 코딩 컨벤션
→ `conventions.md`. 도메인 특화 규칙은 생기면 여기에.

## 5. UI 원칙
- **모바일 퍼스트** (확정)
- **상태 3종 필수**: 로딩 / 에러 / 빈
- **WCAG 2.2 AA 목표** (확정)
  - 예외: CTA `pressed`의 `blue/100` 배경과 흰색 텍스트 조합은 디자이너가 Figma 원형 유지로 승인함 (2026-07-14, 대비 약 1.31:1)
- `TODO(✍️):` 핵심 비주얼·타겟 톤 → `design-guide.md`

## 6. 개발 환경
- pnpm workspace, Vitest + Playwright(스크린샷 회귀 + axe), 프론트 전용 레포 + 외부 Spring(별도)
- 디자인 검증: `/playground` 갤러리 (스토리북 안 씀)
- `TODO(✍️):` 배포 타겟(Vercel 여부) / 분석 도구
