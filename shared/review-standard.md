# 리뷰 기준 (단일 진실 소스 · 도구 무관)

> code-reviewer 가 따른다 (구 design-reviewer를 흡수해 디자인 정합도 겸한다). 팀 전원·모든 도구가 **같은 잣대 + 같은 출력 형식**.
> 모든 작업 브랜치는 `dev` 대상 PR과 CI를 통과한다. RSC/BFF·인증·캐싱 변경은 보안 렌즈를 포함한 리뷰가 필수다 (`git-flow.md`).

## 출력 형식 (고정 템플릿 — 그대로 사용)

```
## 🔍 코드 리뷰
### 🔴 Critical (푸시 전 반드시 수정)
- [파일:줄] 내용

### 🟡 Warning (권장)
- [파일:줄] 내용

### 🟢 Suggestion (선택)
- [파일:줄] 내용

### ✅ agent가 자동 수정한 항목
- [파일:줄] 내용
```

- 특정 줄 문제 → 그 줄에 인라인 코멘트, 광범위한 건 요약.
- 컨벤션 위반은 **자동 수정할 건 수정 + 나머지는 flag.** 린트/CI로 막지 않음. 대신 **빡세게.**
- 푸시 차단은 **Critical만.**

## 필수 체크 항목

**코드 공통 (전신 유지)**
- `any` 타입 (conventions #1)
- barrel export (#2 — 예외 없음. 단일 루트 통합으로 패키지 진입점 예외 소멸)
- 모바일 퍼스트 위반 (#3)
- React hooks 순서 (#8)
- **로딩 / 에러 / 빈 상태 3종** 처리 누락 (가장 자주 빠짐)
- 시크릿 노출 (#7)
- 범위 일탈 — 요청에 없는 변경 (#4)
- **작업 보조 산출물 커밋** (#12) — 플랜·설계 MD(`docs/` 등)·미리보기 HTML 등 플러그인/에이전트 작업 파일이 diff에 포함 → 🟡 flag + 제거 권고

**RSC + BFF (이 프로젝트 신설 — Critical 후보)**
- **불필요한 `"use client"`** — 인터랙션 없는 컴포넌트에 지시어 / 지시어를 트리 상단에 올려 서버 이점 파괴
- **캐싱 의도 누락** — BFF·RSC fetch에 `revalidate`/`tags`/`no-store` 미명시 (conventions #11)
- **뮤테이션 후 무효화 누락** — Server Action에서 `revalidateTag`/`revalidatePath` 빠짐
- **시크릿의 클라이언트 유출** — Spring 토큰·비밀값이 client component·`NEXT_PUBLIC_`에 등장 = 🔴 즉시 Critical
- **서버 전용 모듈의 클라 import** (`server-only` 패키지로 가드 권장)
- 수동 `memo`/`useMemo`/`useCallback` 남발 — React Compiler 켜져 있음, 근거 없으면 flag

**외부 BE 연동 (marketgo — 2026-08-18 신설)**
- **스펙을 안 읽고 지어낸 필드·엔드포인트** — 라이브 `/v3/api-docs`에 없는 경로/필드가 코드에 등장 = 🔴. 리뷰 시 실제 스펙과 대조한다
- **공통 envelope 가정** — 모든 응답을 하나의 `{code,message,data}`로 unwrap하는 유틸 = 🔴 (이 백엔드는 감싼 것·안 감싼 것·최상위 배열이 섞여 있다)
- **에러 body를 믿고 파싱** — 스펙이 4xx/5xx에 성공 스키마를 재사용해 형식 미상. status 기반 분기가 아니면 🟡
- **`regionId`류 앞자리 0 있는 코드값을 number로** 취급 (`"0111010100"` 유실) = 🔴
- accessToken이 클라 쪽에 등장 / base URL이 `NEXT_PUBLIC_` = 🔴
- 스펙 `servers[0].url`의 `http://`를 그대로 박음 → https로 (🟡)

**커밋 분해 (2026-08-18 신설)**
- 커밋 하나에 여러 사실이 섞임(메시지에 "및/그리고") → 🟡 더 쪼개기 권고
- 이름 변경의 정의와 호출부가 다른 커밋 / `pnpm gen:codex` 생성물이 원본과 다른 커밋 → 🟡 (`git-commit` §2 예외)
- 커밋 수를 늘리려는 무관한 정리·오타 분할 → 🟡 (conventions #4)

**접근성 (WCAG 2.2 AA — 신설)**
- 인터랙티브 요소의 키보드 접근·포커스 가시성
- 이미지 `alt` / 아이콘 버튼 `aria-label`
- Radix primitive 있는데 raw `div`로 직접 구현 (a11y 공짜를 버림)
- 터치 타겟 최소 크기 (`accessibility` 스킬 기준)

**디자인**
- 토큰 화이트리스트 밖 raw 값·arbitrary value(`[13px]`) — `figma-bridge` 참조
- **예외: 와이어프레임/초안 산출물은 디자인 토큰 검사 면제**(코드 규칙은 적용)
- 새 공통 컴포넌트에 `/playground` 스토리 누락
- **🔴 Figma를 MCP가 아닌 경로로 접근** (`figma-bridge` §0-0) — `api.figma.com`·`FIGMA_TOKEN`/`FIGMA_PAT`·figma 대상 `curl`/`fetch`/`WebFetch`. 값 신뢰성이 깨지고 시크릿 규칙(#7) 위반이라 즉시 Critical
- **토큰 sync 회귀 3종** — `@theme static`이 `@theme`로 되돌아갔는지 / 값은 바뀌고 `/playground` 라벨은 그대로인지 / **sync 전후로 대비가 나빠졌는지**(매핑 오류 신호. Figma 원본이 원래 미달인 건은 flag 대상 아님 — `design-feedback` §2관문)

**프로토타입 보호**
- **🔴 `app/prototype/*` 삭제·대규모 개편** — 구조 유지 대상이다. 요청에 없는 프로토타입 제거·재구성은 Critical

## 완료 증명 (Verification — "됐다"는 말이 아니라 증거)

작업 완료 보고는 **증거를 첨부**해야 인정된다. agent의 "완료했습니다" 주장만으로 닫지 않는다:

- **빌드·타입체크**: `pnpm build` 실제 출력 (최종 1회 — conventions #6)
- **테스트**: 실행 결과 요약 (실패 있으면 실패로 보고 — 가리지 않기)
- **UI 변경**: `/playground` 스토리 추가 여부 + (가능하면) 스크린샷
- **리뷰**: 푸시 전 code-reviewer 출력 (Critical 0 확인)
- 스킵한 검증이 있으면 **스킵했다고 명시** (했다고 암시 금지)

## 동기화 체크 (어댑터 drift 방지)

- `.claude/agents/*.md` 변경 커밋에 `.codex/agents/*.toml` 재생성(`pnpm gen:codex`) 누락 → 🟡 flag
- `shared/agent-roles.md` 표가 실제 agent와 어긋남 → 🟡 flag

## 탐지 패턴 (Grep — 기계적 1차 검출)

- `: any` / `as any` → any 타입
- `from ['"].*/index['"]` → barrel 의심
- arbitrary value: `\[[0-9]+px\]` / raw hex `#[0-9a-fA-F]{6}` (토큰 외)
- `"use client"` → 각 파일에 인터랙션(핸들러·훅) 실재하는지 확인
- `NEXT_PUBLIC_` → 비밀값 아닌지 확인
- `fetch\(` (app/ 내) → `next:` 옵션 or `no-store` 명시 확인
- `https?://api\.marketgo\.kro\.kr` (app/ 내 하드코딩) → base URL 상수·env로
- `api\.figma\.com` / `FIGMA_TOKEN|FIGMA_PAT|figma.*token` → Figma REST 우회 (🔴)
