# web-2-fe-2 — Claude Code 지침

> 공유 규격은 `shared/` 가 진실 소스. 이 파일은 그것을 참조 + Claude 전용 오케스트레이션.
> 전신(28th-Web-Team-2-FE) 하네스에서 이식 — **CSR→RSC+BFF 전환, 디자이너 바이브코딩 도입**이 핵심 변경.

## 공유 규격 (필독)

@shared/conventions.md
@shared/review-standard.md
@shared/git-flow.md
@shared/domain.md
@shared/product-spec.md
@shared/design-guide.md

## IMPORTANT (override)

- 위 `conventions.md` 최상위 규칙을 모든 작업에서 준수.
- **모르면 추측 말고 질문. 미정(TODO) 영역 건드리면 진행 전 묻고 `domain.md`에 기록.**
- 위험 경로 변경·배포 직전 = 사용자 확인 게이트. (커밋·푸시는 `git-flow.md` — main 직접 푸시 허용, 단 **푸시 전 리뷰 1회**)

## 드라이버 (라우팅보다 먼저 — 힌트이지 차단이 아님)

> 용어: **드라이버 = 누가 운전하나**(사람 신원). **판단 렌즈 = 어떤 관점으로 보나**(아래 별도 절). 혼용 금지.

**두 드라이버 모두 코드를 짜고, 모두 full git(commit·push)이다.** 드라이버는 "무엇을 막을까"가 아니라 "어떤 agent·스킬을 먼저 꺼낼까"를 정하는 **맥락 힌트**.

| | 🎨 디자인 빌더 | ⚙️ 프론트 개발자 |
|---|---|---|
| 주 영역 | `packages/design-system` (토큰·공통 컴포넌트) + 화면 UI | `apps/web` 앱 로직·RSC·BFF·데이터·성능 |
| 기본 posture | Figma MCP 토큰 → 코드, 시각 정합, a11y, `/playground` 검증 | 아키텍처, Server/Client 경계, 캐싱, 타입 안정성 |
| 코드 범위 | 제한 없음 (RSC/BFF 수정 가능 — 프론트가 co-review) | 전 영역 |
| 우선 agent | design-system-builder · figma-implementer · wireframe-builder · design-reviewer | frontend-dev · api-developer · bug-investigator · code-reviewer |

- **신호로 분류**: Figma·토큰·컴포넌트 시각·플로우 언급 → 디자인 빌더 / 데이터·BFF·성능·버그·타입 언급 → 프론트 개발자. **애매하면 한 줄로 확인.**
- (표의 "🎨 디자인 빌더 / ⚙️ 프론트 개발자"가 두 드라이버다)
- read-only 자문 agent(design-handoff-advisor·design-context-advisor)는 **선택 도구로 존치** — 질문형 요청이면 여전히 이쪽이 가볍고 빠르다.
- **디자이너도 코드 agent를 자유롭게 호출한다.** (전신의 "디자이너 맥락 코드 agent 자제" 규칙은 이 프로젝트에서 폐기)
- **agent 커스텀 개방**: 디자이너 포함 누구나 `.claude/agents/*.md`를 추가·수정할 수 있다. 단 역할 진실 소스인 `shared/agent-roles.md`를 같이 갱신할 것.

## 판단 렌즈 (agent가 아니라 관점 — 리뷰·기획 단계에 주입)

렌즈는 실행 주체가 아니라 **점검 관점**이다. agent를 늘리지 않고 기존 단계에 얹는다:

| 렌즈 | 질문 | 어디에 주입 |
|---|---|---|
| product-challenger | "이거 정말 만들 가치 있나? 더 작게 못 하나?" | planner (계획 첫 절) |
| ux-reviewer | "사용자 여정에서 막히는 데 없나?" | flow-reviewer (기존 역할) |
| qa-reviewer | "실제로 눌러보면 동작하나? 엣지는?" | test-writer·verify 단계 |
| security-reviewer | "공격자라면 어디를 노리나? (시크릿·입력 검증·BFF 우회)" | code-reviewer (리뷰 체크에 포함) |

- L급 작업(새 기능·위험 경로)은 **product-challenger + security-reviewer 렌즈 필수**, S급은 생략 가능.

## 라우팅 (크기 × 위험)

```
            위험 낮음            위험 높음
크기 작음   S 바로 진행         게이트 + 리뷰 강제
크기 큼     M 탐색→구현→리뷰    L 기획+게이트 풀절차
```

- 크기: 파일 1-2=작음 / 3-5=중간 / 5+·새기능=큼
- 위험 경로(`TODO(✍️):` 인증·결제 등) 건드리면 크기 무관 한 단계↑ + 게이트
- "바로/빨리"→내림 / "제대로/꼼꼼히"→올림. 단 위험 경로는 못 내림.
- **RSC/BFF 경계를 바꾸는 작업**(server↔client 전환, Route Handler 추가·삭제, 캐싱 전략 변경)은 위험과 무관하게 **리뷰 1회 강제** — main 직접 푸시 체제의 안전판.

## agent 신호 → 라우팅 테이블

페르소나가 게이트를 안 하므로, **이 테이블이 실질 라우터다.**

| 신호 | agent |
|---|---|
| "어디 있어?", "어떻게 돼있어?" | explorer |
| "전부/하나도 빠짐없이 찾아줘" | auditor |
| "왜 필요해?", "어떻게 설계?", "계획 짜줘" | planner |
| 플로우 검수·CRUD 누락 | flow-reviewer |
| "에러 나", "버그", "왜 안 돼?" | bug-investigator (수정 X) → 구현 agent |
| BFF Route Handler·외부 Spring 연동·캐싱 전략 | api-developer |
| 페이지·화면·인터랙션 구현 | frontend-dev |
| **디자인 시스템 컴포넌트·토큰 (바이브코딩)** | **design-system-builder** |
| Figma 노드 → 코드 변환·토큰 sync | figma-implementer |
| 디자인 확정 전 초안·프로토타입 | wireframe-builder |
| "리뷰해줘" (코드) | code-reviewer |
| 디자인 정합·토큰 위반·a11y 검토 | design-reviewer |
| 테스트 작성·수정 | test-writer |
| 커밋 정리·푸시 | diff-organizer |
| 디자이너 질문 (핸드오프/제품 맥락) | design-handoff-advisor / design-context-advisor |

- 모델 티어(판단 밀도): **높음=fable / 중간=sonnet / 낮음=haiku** — `shared/agent-roles.md`가 진실 소스.

## 전용 플로우

- **디자인 시스템 컴포넌트**(디자이너 바이브코딩): design-system-builder(Radix/shadcn 기반) → `/playground` 스토리 추가 → 빌드 1회 → 푸시 전 리뷰 1회(code-reviewer가 토큰·a11y 겸함) → **바로 main 푸시. 여기서 끝** — 푸시하면 CI 자동 배포, 확인은 배포된 `/playground`. 테스트 작성·플랜 문서는 이 플로우 범위 밖(추후 test-writer 일괄). 상세 design-reviewer는 요청 시만
- **와이어프레임 초안**(디자인 전): 유저 플로우 → flow-reviewer → [⏸] → wireframe-builder(더미 데이터·저충실도) → 배포(⏸) → 피드백. ※ 토큰 검사 면제, design-reviewer 미적용
- **신규 화면**(디자인 확정 후): Figma 확정(⏸) → figma-implementer → design-reviewer + code-reviewer
- **Bug**: bug-investigator(수정X) → 구현 agent → code-reviewer
- **전수검색**: auditor → 구현(일괄) → code-reviewer
- 리뷰는 "리뷰해줘" 자연어로 트리거 (슬래시 커맨드 안 씀)

## 오케스트레이션 (병렬 실행 규약)

- **독립 조사(읽기)는 병렬로** — explorer·auditor·리뷰어 동시 실행 OK. 같은 결론을 위해 순차로 기다리지 않는다.
- **쓰기는 소유 영역이 겹치지 않을 때만 병렬** — 예: design-system과 apps/web 동시 작업 OK, 같은 패키지 내 동시 쓰기 X.
- **공유 파일(conventions·agent-roles 등 shared/)은 한 번에 한 agent만** 수정.
- **구현과 리뷰는 컨텍스트 분리** — 구현한 agent가 자기 결과를 리뷰하지 않는다 (code-reviewer는 별도 컨텍스트).
- 병렬 agent를 띄울 땐 **입력·출력 계약을 프롬프트에 명시** (무엇을 받아 무엇을 반환하는지).
- 대규모 병렬 파일 변경은 worktree 격리 사용.

## 어댑터·동기화 (도구 독립 구조)

```
진실 소스(SSOT)                          어댑터(생성물/참조)
shared/skills/*   ── 심링크 ──▶ .claude/skills/*
.claude/agents/*.md ── pnpm gen:codex ──▶ .codex/agents/*.toml
shared/*.md (규격) ── 참조 ──▶ CLAUDE.md(Claude) · AGENTS.md(Codex)
```

- **agent를 수정한 커밋에는 `pnpm gen:codex` 재생성 결과가 같이 들어가야 한다** — 이게 어댑터 drift를 막는 유일한 규칙 (리뷰 체크 항목).
- `.codex/agents/*.toml`은 직접 편집 금지 (생성 파일).

## 미정 (TODO)

- `TODO(✍️):` 도메인·제품 스펙 전체 (`domain.md`·`product-spec.md` 스켈레톤 상태 — 서비스 확정 시 채움)
- `TODO(✍️):` 위험 경로 목록 (인증·결제 등 — 백엔드 스펙 나오면)
- `TODO(✍️):` PPR(Partial Prerendering) 도입 — Next에서 stable 승격 시 재검토 (지금은 안 씀)
- `TODO(✍️):` Evals — 하네스 개선 측정(리뷰 적중률·재작업률 등). 팀·작업량이 늘면 도입
- `TODO(✍️):` codex 모델 id (`.codex/config.toml`·agents toml)
