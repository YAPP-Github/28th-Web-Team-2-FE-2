---
name: test-strategy
description: AI-native 테스트 전략. Vitest(유닛)+Playwright(E2E), 스펙 검증, 동어반복 금지, 위험 경로 게이트. test-writer/구현 agent가 참조.
---

# 테스트 전략 (AI-native)

agent가 작성·실행·수정. 비용은 토큰뿐 — 검증을 많이.

## 핵심 원칙
- **테스트는 구현이 아니라 요구사항(스펙)을 검증한다.** 구현을 그대로 베낀 동어반복(tautological) 테스트 금지.
- 잘못된 동작을 "정답"으로 굳히지 않도록, 의심되면 사용자에게 확인.

## 범위
- **유닛: Vitest** — 로직·유틸·훅
- **E2E: Playwright** — 핵심 사용자 흐름 + 위험 경로 위주 (전체 X)
- self-healing: 실패 로그 읽고 수정하는 루프

## 게이트
- **위험 경로 변경 → 테스트 통과를 머지 게이트로 강제.**
- 린트/CI 하드블록은 안 하되, 리뷰는 빡세게.
