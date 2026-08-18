---
name: backend-api-reference
description: 외부 Spring API 스펙(marketgo Swagger/OpenAPI) 읽는 법. 스펙은 라이브 조회가 진실 소스 — 문서에 필드를 복제하지 않는다. 상상 금지 게이트. api-developer/frontend-dev/code-reviewer가 참조.
---

# 외부 Spring API 스펙 (marketgo)

> **진실 소스는 살아 있는 OpenAPI 문서다.** 이 파일에는 잘 안 변하는 사실(주소·인증·함정)만 적는다.
> 필드·타입을 여기 복제하면 BE가 바꾸는 순간 낡는다 — **복제 금지.**

## 0. 작업 전 필수 — 스펙을 직접 읽는다

```bash
export SPEC=$(mktemp -t api-docs)   # node가 process.env로 읽으므로 export 필수.
                                    # 고정 경로(/tmp/api-docs.json)는 병렬 세션끼리 덮어쓴다
curl -s https://api.marketgo.kro.kr/v3/api-docs > "$SPEC"

# 편의 함수 — 확장자 없는 임시파일이라 require()가 아니라 JSON.parse로 읽는다
spec() { node -e "const d=JSON.parse(require('fs').readFileSync(process.env.SPEC,'utf8')); $1"; }

# 엔드포인트 목록
spec "for(const[p,o]of Object.entries(d.paths))for(const[m,v]of Object.entries(o))console.log(m.toUpperCase(),p,'|',v.summary||'')"
# 특정 엔드포인트 상세 (파라미터가 \$ref면 그 스키마도 반드시 함께 열 것 — §2 'request' 함정)
spec "console.log(JSON.stringify(d.paths['/api/v1/items'],null,2))"
# 스키마 하나
spec "console.log(JSON.stringify(d.components.schemas.ItemResponse,null,2))"
```

- **기억이나 이 문서로 필드를 채우지 않는다.** 매 작업마다 위를 실행해서 그때의 스펙을 본다.
- Swagger UI(`/swagger-ui/index.html`)는 사람이 보는 화면이다. agent는 **`/v3/api-docs`(JSON)** 를 읽는다.
- 조회가 실패하면(네트워크·서버 다운) **멈추고 사용자에게 알린다.** 기억으로 진행하지 않는다.

## 1. 고정 사실

| 항목 | 값 |
|---|---|
| 문서(JSON) | `https://api.marketgo.kro.kr/v3/api-docs` |
| Swagger UI (사람용) | `https://api.marketgo.kro.kr/swagger-ui/index.html` |
| 인증 | `bearerAuth` — HTTP Bearer, JWT. `Authorization: Bearer <accessToken>` |
| 토큰 발급 | `POST /api/auth/{providerType}/login` (OAuth `idToken` 전달) → `{ accessToken }` |
| 재발급 | `POST /api/auth/reissue` — refreshToken을 **쿠키**로 받는다 |
| base URL 환경변수 | `BACKEND_API_URL`. **서버 전용**(`NEXT_PUBLIC_` 금지) |

- ⚠️ 스펙의 `servers[0].url`이 **`http://`** 로 잡혀 있다(Swagger UI는 https). 코드에는 **https를 쓴다** — 생성기가 뱉은 http를 그대로 박으면 혼합 콘텐츠/리다이렉트 문제가 난다.
- **accessToken은 BFF(서버)까지만.** 클라 번들·`NEXT_PUBLIC_`·로그 노출은 Critical (conventions #7).
- refreshToken이 쿠키라 **BFF가 쿠키를 중계**해야 한다 — RSC/Route Handler에서 `cookies()`를 쓰는 순간 그 라우트는 동적이 된다는 점을 캐싱 전략에 반영한다.

## 2. 함정 (실측 확인 — 2026-08-18)

이 백엔드는 응답 형태가 **엔드포인트마다 다르다.** 하나의 공통 envelope를 가정하고 짜면 깨진다.

- **envelope 불일치**: `/api/v1/regions/search`만 `{ code, message, data }` 로 감싼다. `/api/v1/items`·`/api/v1/stores/nearby` 등은 DTO를 **그대로** 반환하고, `/api/v1/news`·`/api/v1/regions/nearby`는 **최상위 배열**을 반환한다.
  → **공통 unwrap 유틸을 만들지 않는다.** 엔드포인트별 zod 스키마가 각자의 모양을 그대로 검증한다.
- **에러도 성공 스키마로 선언돼 있다**: 400/401/404/502가 성공과 같은 `$ref`를 가리킨다. 즉 **스펙만 보고 에러 body를 알 수 없다** — 실제 에러 응답 모양은 확인이 필요하고, 그때까지 BFF는 **HTTP status로 분기**하고 body는 신뢰하지 않는다.
- **같은 개념의 타입이 갈린다**: `regionId`가 `SearchResult`에서는 `string`, `NearbyRegionResponse`에서는 `int64`, `/api/v1/items`의 쿼리에서는 `string`이다. → 프론트 내부 타입은 **`string`으로 통일**하고 경계에서 변환한다(숫자로 다루면 앞자리 0이 날아간다: `"0111010100"`).
- **KAMIS 응답은 `errorCode`/`errorMessage`를 본문에 담는다** — 200이어도 실패일 수 있다. status만 보고 성공 처리하지 않는다.
- **`security` 선언이 없어도 개인화 응답일 수 있다.** `GET /api/v1/items`·`GET /api/v1/stores/nearby`는 `security` 블록이 **없는데** 응답에 `isLiked`(찜 여부)가 있고 쿼리에 `favoriteOnly`/`onlyLiked`가 있으며 `401`도 선언돼 있다. 스펙만 보고 "공개 엔드포인트"로 판단해 `revalidate` 캐시를 붙이면 **유저 간 찜 데이터가 샌다** (review-standard가 🔴로 규정한 사고). → 개인화 필드가 섞인 응답은 `no-store`이거나, 개인화 부분을 분리해 캐싱한다.
- **쿼리 파라미터 이름이 `request`로 나오는 엔드포인트가 있다 — 그대로 읽으면 400.** `/api/v1/regions/search`·`/api/v1/regions/nearby`·`/api/kamis/daily-prices`는 `{"name":"request","in":"query","schema":{"$ref":...}}` 형태다. springdoc이 POJO 쿼리 바인딩(`@ModelAttribute`)을 뱉은 것으로, **실제 쿼리키는 `request`가 아니라 그 스키마의 속성들**이다.
  - `/regions/search` → `?keyword=성성동`
  - `/regions/nearby` → `?latitude=..&longitude=..`
  - `/kamis/daily-prices` → `?productClsCode=..&itemCategoryCode=..&countryCode=..&regDay=..&convertKgYn=..`
  - **이 세 곳은 `$ref` 스키마를 열어 속성 이름을 확인하고 쿼리를 만든다.** `?request=`를 만들면 400이다.
- 스펙 `info.title`이 `Demo API`다 — 문서가 아직 정리 중이라는 신호. 이상하면 지어내지 말고 BE에 묻는다.

## 3. 규칙 (안 바뀜)

- **백엔드를 상상해서 만들지 않는다.** 스펙에 없는 엔드포인트·필드·에러 형식을 지어내는 것 금지.
- 스펙에 없는 게 필요하면 → **멈추고 사용자에게** (BE에 물어야 할 항목으로 보고).
- 임시 진행이 불가피하면 BFF에 mock을 두되 `TODO(✍️): 스펙 확정 시 교체` 주석 + zod 스키마는 미리 정의.
- 응답은 **zod로 경계 검증** 후 사용 (`as Type` 캐스팅 금지 — `api-patterns`).
- 공통 HTTPS URL·명시적 캐시·오류 경계는 `app/_lib/api/backend-api.ts`와 `bff-error-response.ts`를 사용한다. endpoint별 응답 schema와 안전한 사용자 메시지는 각 BFF에서 확정한다.

## 4. 아직 모르는 것

- `TODO(✍️):` 에러 응답 body 실제 형식 (스펙이 성공 스키마를 재사용해 알 수 없음)
- `TODO(✍️):` 개발/운영 환경 분리 여부 — 지금은 URL이 하나뿐
- `TODO(✍️):` accessToken 만료 시간·재발급 트리거 규약
- `TODO(✍️):` `providerType`에 들어갈 값 목록 (kakao? apple?)
