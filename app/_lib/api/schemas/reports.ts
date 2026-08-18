// POST /api/v1/items/{itemId}/reports — 우리 동네 가격 제보
//
// 가게 정보는 카카오 장소 검색 결과를 그대로 실어 보낸다(서버가 가게를 새로 만들거나 붙인다).
//
// ⚠️ 이 스키마는 라이브 스펙(`/v3/api-docs`)이 아니라 **서버 구현을 직접 읽고** 맞췄다.
//    springdoc 표기에 드러나지 않는 제약이 셋 있어서다(BE `CreateUserReportUseCase`):
//      1. `unit`은 자유 문자열이 아니다 — `items.default_unit`과 **정확히 같아야** 400을 면한다.
//      2. `storeId`와 `store`는 **상호 배타**다. 둘 다 보내면 400.
//      3. `regionId`·`reportType`은 필수인데 이전 버전 스키마에 아예 없었다(→ 무조건 400).

import { z } from "zod";

/** 법정동 코드 자릿수. `schemas/regions.ts`와 같은 값이다. */
const REGION_ID_LENGTH = 10;

/**
 * 제보에 실어 보낼 법정동 코드.
 *
 * 두 형태가 들어온다.
 *  - **문자열** — `/regions/search`가 주는 값. 앞자리 0이 보존되므로 **정확히 10자리여야** 한다.
 *  - **숫자** — `/regions/nearby`가 int64로 주는 값. 서울(`0` 시작) 코드는 이미 앞자리 0이
 *    잘려 9자리로 도착하므로 `padStart`로 복원한다.
 *
 * ⚠️ 숫자에만 padStart를 적용하는 게 핵심이다. 입력 종류를 가리지 않고 padStart부터 하면
 *    8자리 시군구 코드가 `"00"+8자리` = 10자리가 되어 **자릿수 검증을 그대로 통과한다**
 *    (`schemas/regions.ts`의 수신측 스키마가 지금 이 상태다 — 주석은 "여기서 터뜨린다"고
 *    적혀 있지만 실제로는 안 터진다). 서버는 `@Pattern("\\d{10}")`만 보므로 이 오답을
 *    받아들이고, 조회는 조용히 빈 결과가 된다. 송신측은 원본 자릿수를 알 수 있으니 여기서 막는다.
 */
const reportRegionIdSchema = z
  .union([
    z
      .string()
      .regex(/^\d{10}$/, `법정동 코드는 숫자 ${REGION_ID_LENGTH}자리여야 합니다.`),
    z
      .number()
      .int()
      .positive()
      // 앞자리 0 한 개만 잘릴 수 있다. 그보다 짧거나 길면 애초에 법정동 코드가 아니다.
      .refine(
        (value) =>
          String(value).length >= REGION_ID_LENGTH - 1 &&
          String(value).length <= REGION_ID_LENGTH,
        { message: `법정동 코드는 숫자 ${REGION_ID_LENGTH}자리여야 합니다.` },
      )
      .transform((value) => String(value).padStart(REGION_ID_LENGTH, "0")),
  ]);

/**
 * 제보 유형. 서버 `ReportType` enum과 1:1이다.
 * - `PURCHASE`: 직접 사면서 확인한 가격
 * - `OBSERVED`: 사지 않고 가격표만 본 경우
 */
export const reportTypeSchema = z.enum(["PURCHASE", "OBSERVED"]);

/** 카카오 장소 검색 결과 모양. 필수는 id·placeName·addressName 셋뿐이다. */
export const storeRequestSchema = z.object({
  id: z.string().max(30),
  placeName: z.string().max(100),
  addressName: z.string().max(255),
  placeUrl: z.string().max(500).optional(),
  categoryName: z.string().max(255).optional(),
  roadAddressName: z.string().max(255).optional(),
  phone: z.string().max(30).optional(),
  categoryGroupCode: z.string().max(20).optional(),
  categoryGroupName: z.string().max(50).optional(),
  /** 카카오 좌표 표기 그대로 — x=경도, y=위도다(위경도 순서가 뒤집혀 있으니 주의). */
  x: z.number().optional(),
  y: z.number().optional(),
  distance: z.number().int().min(0).optional(),
});
export type StoreRequest = z.infer<typeof storeRequestSchema>;

export const createReportRequestSchema = z
  .object({
    regionId: reportRegionIdSchema,
    reportType: reportTypeSchema,
    price: z.number().int().positive(),
    /**
     * ⚠️ 자유 입력이 아니다. 서버가 `items.default_unit`과 문자열 일치를 요구한다
     * (`1kg` · `1개` · `1포기` · `100g` 네 가지만 실제로 존재). 품목 상세의 값을
     * 그대로 실어 보내고, 사용자가 고르게 만들지 않는다.
     */
    unit: z.string().max(20),
    amount: z.number().positive(),
    /** 기존 매장에 붙이는 경우. `store`와 동시에 보낼 수 없다. */
    storeId: z.number().int().positive().optional(),
    /** 카카오 검색 결과로 매장을 새로 만드는 경우. `storeId`와 동시에 보낼 수 없다. */
    store: storeRequestSchema.optional(),
    photoUrl: z.string().max(500).optional(),
  })
  // 서버는 둘 다 오면 400을 준다. 요청을 만들기 전에 여기서 막아 원인을 드러낸다.
  .refine((value) => !(value.storeId !== undefined && value.store !== undefined), {
    message: "storeId와 store는 동시에 보낼 수 없습니다.",
    path: ["store"],
  });
export type CreateReportRequest = z.infer<typeof createReportRequestSchema>;

export const createReportResponseSchema = z.object({
  reportId: z.number(),
});
export type CreateReportResponse = z.infer<typeof createReportResponseSchema>;

/**
 * `/api/v1/**`는 서버 `ResponseWrapper`가 전부 `{code, message, data}`로 감싼다.
 * `springFetch`는 envelope를 벗기지 않으므로 호출부는 이 스키마를 써야 한다
 * (`schemas/items.ts`의 `itemPageEnvelopeSchema`와 같은 이유).
 */
export const createReportEnvelopeSchema = z.object({
  code: z.string().optional(),
  message: z.string().optional(),
  data: createReportResponseSchema,
});
