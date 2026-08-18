# Git 워크플로우 (단일 진실 소스 · 도구 무관)

> `main`은 릴리스, `dev`는 통합 브랜치다. 모든 기능·API 작업은 최신 `dev`에서 분기해 PR로 쌓는다.
> 디자이너·프론트 모두 작업 브랜치의 commit·push 권한을 가진다.

## 기본 흐름

```
origin/dev fetch → 작업 브랜치 생성 → 조각마다 커밋 → 리뷰
→ lint·unit·production E2E(최종 build 포함) → dev 대상 PR → CI 통과 → merge
```

- `main`과 `dev`에 직접 커밋·푸시하지 않는다.
- 작업 시작 전에 `git fetch origin dev` 후 현재 브랜치가 최신 `origin/dev`를 포함하는지 확인한다.
- 작업 브랜치는 최신 `dev`에서 만든다. 병렬 agent는 각각 독립 worktree와 독립 브랜치를 쓴다.
- API 연동은 독립 사용자 흐름 또는 endpoint 군마다 PR을 나눈다. 공통 API client·인증/session처럼 횡단하는 파일은 owner 한 명만 수정한다.
- PR 전 `pnpm lint`, `pnpm test`, `pnpm test:e2e`를 실행한다. `test:e2e`가 production build를 포함하므로 별도 중간 build를 반복하지 않는다.
- PR 직전 최신 `origin/dev`와 정렬한다. rebase/pull 충돌은 agent가 임의 해결하지 않고 사용자에게 보고한다.
- PR은 가능한 한 Draft로 일찍 만들고 API 계약·브라우저 QA·위험을 본문에 계속 기록한다.

## 브랜치

- 기능/API: `feat/<짧은설명>` (예: `feat/api-auth-kakao`, `feat/api-items`)
- 버그: `fix/<짧은설명>`
- 디자인: `design/<짧은설명>`
- 기반·도구: `chore/<짧은설명>`
- 테스트: `test/<짧은설명>`

브랜치 하나는 한 PR과 한 책임만 가진다. 공통 기반이 필요하면 먼저 별도 PR로 `dev`에 머지한 뒤 후속 브랜치를 최신 `dev`에서 시작한다.

## PR과 게이트

- 일반 작업 PR 대상은 `dev`, 릴리스 PR 대상은 `main`이다.
- `quality`(lint·unit·build)와 `e2e`가 통과해야 한다.
- RSC/BFF 경계, 인증/session, 캐싱, 시크릿 전달 변경은 보안 렌즈를 포함한 리뷰가 필수다.
- 브라우저 QA는 모바일 Chromium을 기본으로 하고, 실제 백엔드·카카오 OAuth 수동 확인 결과와 제약을 PR에 기록한다.
- 계정·MFA·CAPTCHA·redirect-domain이 필요한 외부 로그인은 CI에서 억지로 자동화하지 않는다. 나머지 E2E는 외부 API를 route mock으로 격리한다.
- `main`·`dev` force push 금지. 리뷰가 시작된 작업 브랜치도 force push하지 않는다.

## 릴리스

1. 통합 회귀 QA가 끝난 `dev`에서 `dev → main` 릴리스 PR을 연다.
2. CI와 최종 리뷰가 통과하면 merge commit 방식으로 머지한다.
3. `main` 머지 뒤 기존 sync-fork/Vercel production 배포를 확인한다.

## 커밋

- 형식: `feat|fix|design|refactor|chore|style|docs|test(scope): 한국어 설명`.
- **커밋은 최대한 잘게 쪼갠다 (2026-08-18 정책).** 타입 하나 / 함수 하나 / 캐싱 옵션 하나 / 상태 하나를 각각 커밋하며, 기능 하나가 보통 5~15커밋이다.
- 분해 축·예외·`git add -p` 절차는 `git-commit` 스킬이 진실 소스다.
- 중간 커밋은 빌드를 깨도 되지만 PR로 push하는 HEAD는 전체 검증을 통과해야 한다.
- 커밋 수를 늘리려고 요청에 없는 정리를 끼워 넣지 않는다.

## 계정·인증

- 원격: `YAPP-Github/28th-Web-Team-2-FE-2` (private)
- push·PR은 이 저장소에 쓰기 권한이 있는 인증 계정으로 수행한다.
- 인증 토큰과 `.env.local`은 저장소에 커밋하거나 로그에 출력하지 않는다.

## 게이트 (사용자 확인)

- rebase/pull 충돌 발생 시
- 위험 경로의 계약이 Swagger로 확정되지 않을 때
- `dev → main` 배포 직전
