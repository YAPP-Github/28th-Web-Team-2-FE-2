---
name: web-performance
description: 웹 성능 best practice — Core Web Vitals(LCP/INP/CLS) 기준. 모바일 퍼스트. ★사용자 직접 검토 대상 초안. frontend-dev/code-reviewer가 참조.
---

# 웹 성능 (Core Web Vitals)

> 출처: web.dev/articles/vitals (공식). **★ 직접 검토·보강 권장 초안.** 모바일 위주라 모바일 75퍼센타일 기준.

## 3대 지표 & 임계 (Good)
- **LCP (로딩)** ≤ **2.5s** — 최대 콘텐츠 렌더 시점
- **INP (상호작용)** ≤ **200ms** — 입력 응답성
- **CLS (시각 안정)** ≤ **0.1** — 예기치 않은 레이아웃 이동

## 최적화 (모바일)
**LCP**: 서버 응답(TTFB)↓, 렌더 차단 리소스 제거, above-the-fold 우선 로드, below-fold 이미지 lazy
**INP**: JS 실행 시간↓(모바일 중요), 긴 task 분할, 이벤트 핸들러 최적화 (TBT를 lab 프록시로)
**CLS**: 동적 콘텐츠(이미지/광고/임베드) 공간 예약, 기존 요소 위 삽입 회피, layout 대신 `transform` 애니메이션

## 이미지·폰트·로딩
- next/image, width/height 지정(CLS), 적절한 포맷·사이즈
- 폰트 `display: swap`, preload, 서브셋
- 코드 분할·동적 import (vercel-react-best-practices 연계)

## 측정
- `web-vitals` 라이브러리로 프로덕션 추적
- `TODO(✍️):` 측정 파이프라인(분석 도구) 확정 후 보강
