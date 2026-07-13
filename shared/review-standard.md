# 리뷰 기준 (단일 진실 소스 · 도구 무관)

> code-reviewer / design-reviewer 가 따른다. 팀 전원·모든 도구가 **같은 잣대 + 같은 출력 형식**.
> **main 직접 푸시 체제라 리뷰가 유일한 게이트다 — 푸시 전 1회 필수** (`git-flow.md`).

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
- barrel export (#2 — design-system 공개 진입점 1개는 예외)
- 모바일 퍼스트 위반 (#3)
- React hooks 순서 (#8)
- **로딩 / 에러 / 빈 상태 3종** 처리 누락 (가장 자주 빠짐)
- 시크릿 노출 (#7)
- 범위 일탈 — 요청에 없는 변경 (#4)

**RSC + BFF (이 프로젝트 신설 — Critical 후보)**
- **불필요한 `"use client"`** — 인터랙션 없는 컴포넌트에 지시어 / 지시어를 트리 상단에 올려 서버 이점 파괴
- **캐싱 의도 누락** — BFF·RSC fetch에 `revalidate`/`tags`/`no-store` 미명시 (conventions #11)
- **뮤테이션 후 무효화 누락** — Server Action에서 `revalidateTag`/`revalidatePath` 빠짐
- **시크릿의 클라이언트 유출** — Spring 토큰·비밀값이 client component·`NEXT_PUBLIC_`에 등장 = 🔴 즉시 Critical
- **서버 전용 모듈의 클라 import** (`server-only` 패키지로 가드 권장)
- 수동 `memo`/`useMemo`/`useCallback` 남발 — React Compiler 켜져 있음, 근거 없으면 flag

**접근성 (WCAG 2.2 AA — 신설)**
- 인터랙티브 요소의 키보드 접근·포커스 가시성
- 이미지 `alt` / 아이콘 버튼 `aria-label`
- Radix primitive 있는데 raw `div`로 직접 구현 (a11y 공짜를 버림)
- 터치 타겟 최소 크기 (`accessibility` 스킬 기준)

**디자인**
- 토큰 화이트리스트 밖 raw 값·arbitrary value(`[13px]`) — `figma-bridge` 참조
- **예외: 와이어프레임/초안 산출물은 디자인 토큰 검사 면제**(코드 규칙은 적용)
- 새 공통 컴포넌트에 `/playground` 스토리 누락

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
