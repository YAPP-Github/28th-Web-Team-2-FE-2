# Git 워크플로우 (단일 진실 소스 · 도구 무관)

> **전신 프로젝트와 정책이 다르다**: 신규 서비스 초기 단계라 **속도 우선 — main 직접 푸시 허용, PR 최소화.**
> 디자이너·프론트 모두 full git(commit·push) 권한을 가진다.

## 기본 흐름 (main 직접)

```
세션 시작(자동 pull) → 작업 → 푸시 전 code-reviewer 1회 (Critical만 수정) → git pull --rebase origin main → git push origin main
```

## 세션 시작 = 자동 pull (전원 main 직접 푸시의 안전판)

- **Claude Code 세션이 시작되면 `git pull --rebase --autostash origin main`이 자동 실행**된다 (`.claude/settings.json` SessionStart hook — 레포에 커밋돼 있어 팀 전원 동일 적용).
- 낡은(stale) 상태로 작업을 시작해 푸시 시점에 히스토리가 갈라지는 사고를 원천 차단하는 습관 장치.
- 자동 pull이 **실패**하면 세션에 ⚠️ 메시지가 뜬다 → 작업 시작 전에 충돌·네트워크부터 해결.
- 터미널에서 직접 작업할 때도 같은 습관: **작업 시작 전 `git pull --rebase` 먼저.** (개인 편의: `git config pull.rebase true`, `git config rebase.autoStash true` 로컬 설정 권장)

- **main 직접 커밋·푸시 허용.** 브랜치·PR은 의무가 아니다.
- **푸시 전 리뷰 1회는 유지** — PR 게이트를 없앤 대신의 최소 안전판. "리뷰해줘" 한 번이면 됨. Critical만 고치고 나머지는 flag로 남겨도 된다.
- 푸시 전 `git pull --rebase origin main` 으로 동료 커밋과 정렬. **충돌 나면 agent가 자동 해결 금지 — 사용자에게 묻는다.**
- `--force` / `--force-with-lease` **main에는 금지** (히스토리 공유 중).

## PR을 쓰는 경우 (선택)

다음은 PR 권장 — 강제는 아니지만 이럴 땐 리뷰가 비동기로 필요해서다:

- **RSC/BFF 경계 변경** (server↔client 전환, Route Handler 추가·삭제, 캐싱 전략 변경) — 프론트 co-review 대상
- 위험 경로(`TODO(✍️):` 인증·결제 등)
- 되돌리기 어려운 대규모 구조 변경

브랜치 네이밍(쓸 때만): `feat/<짧은설명>` `fix/<…>` `design/<…>` (디자이너 작업)

## 커밋

- 형식: `feat(scope): 한국어 설명` (feat/fix/refactor/chore/style/docs/design)
- **`design` 타입 신설** — 디자인 시스템(토큰·공통 컴포넌트) 작업. 예: `design(button): 버튼 위계 variant 추가`
- 논리 단위로 분리.

## 계정·인증 (이 레포 고정)

- 원격: `YAPP-Github/28th-Web-Team-2-FE-2` (private)
- git 사용자: `HoberMin <sonhomin98@naver.com>` (레포 로컬 설정)
- 인증: 레포 로컬 credential helper가 **gh의 HoberMin 토큰**을 공급 — 전역 gh 활성 계정과 무관하게 이 폴더는 HoberMin으로 동작

## 게이트 (⏸ 사용자 확인)

- rebase/pull 충돌 발생 시
- 위험 경로 변경 직전
- 배포 직전
- (전신의 "커밋·푸시 전 로컬 vs PR 질문" 게이트는 **폐기** — main 직접이 기본)
