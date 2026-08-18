import { describe, expect, it } from "vitest";
import {
  createReportEnvelopeSchema,
  createReportRequestSchema,
  reportTypeSchema,
} from "./reports";

/** 서버가 실제로 받아들이는 최소 조합. `unit`은 items.default_unit 값 그대로다. */
const VALID_REQUEST = {
  regionId: "1121510100",
  reportType: "PURCHASE",
  price: 3500,
  unit: "1kg",
  amount: 1,
  store: {
    id: "11840060",
    placeName: "행복마트",
    addressName: "서울 관악구 신림동 1-1",
  },
};

describe("createReportRequestSchema", () => {
  it("필수 필드가 모두 있으면 통과한다", () => {
    const parsed = createReportRequestSchema.parse(VALID_REQUEST);

    expect(parsed.regionId).toBe("1121510100");
    expect(parsed.reportType).toBe("PURCHASE");
  });

  it("regionId가 없으면 거부한다", () => {
    const { regionId: _regionId, ...withoutRegion } = VALID_REQUEST;

    expect(() => createReportRequestSchema.parse(withoutRegion)).toThrow();
  });

  it("reportType이 없으면 거부한다", () => {
    const { reportType: _reportType, ...withoutType } = VALID_REQUEST;

    expect(() => createReportRequestSchema.parse(withoutType)).toThrow();
  });

  it("정의되지 않은 reportType을 거부한다", () => {
    expect(() =>
      createReportRequestSchema.parse({ ...VALID_REQUEST, reportType: "GUESSED" }),
    ).toThrow();
  });

  // `/regions/nearby`가 int64로 주는 서울 코드는 앞자리 0이 잘려 9자리로 도착한다.
  it("숫자로 온 서울 법정동 코드의 앞자리 0을 복원한다", () => {
    const parsed = createReportRequestSchema.parse({ ...VALID_REQUEST, regionId: 111010100 });

    expect(parsed.regionId).toBe("0111010100");
  });

  // padStart를 무조건 적용하면 8자리가 "00"+8자리로 10자리가 되어 검증을 통과해버린다.
  it("자릿수가 모자란 숫자 코드를 거부한다", () => {
    expect(() => createReportRequestSchema.parse({ ...VALID_REQUEST, regionId: 11215101 })).toThrow();
  });

  it("자릿수가 모자란 문자열 코드를 거부한다", () => {
    expect(() => createReportRequestSchema.parse({ ...VALID_REQUEST, regionId: "11215101" })).toThrow();
  });

  it("자릿수가 넘치는 코드를 거부한다", () => {
    expect(() => createReportRequestSchema.parse({ ...VALID_REQUEST, regionId: 11215101001 })).toThrow();
  });

  // 서버 resolveStoreId가 둘 다 오면 400을 준다 — 요청을 만들기 전에 막는다.
  it("storeId와 store를 동시에 보내면 거부한다", () => {
    expect(() =>
      createReportRequestSchema.parse({ ...VALID_REQUEST, storeId: 7 }),
    ).toThrow();
  });

  it("storeId만 보내는 경우를 허용한다", () => {
    const { store: _store, ...withoutStore } = VALID_REQUEST;
    const parsed = createReportRequestSchema.parse({ ...withoutStore, storeId: 7 });

    expect(parsed.storeId).toBe(7);
    expect(parsed.store).toBeUndefined();
  });

  // 서버는 둘 다 없으면 storeId를 null로 저장한다(400이 아니다).
  it("매장 정보가 아예 없는 경우도 허용한다", () => {
    const { store: _store, ...withoutStore } = VALID_REQUEST;

    expect(() => createReportRequestSchema.parse(withoutStore)).not.toThrow();
  });

  it("가격과 양은 양수만 받는다", () => {
    expect(() => createReportRequestSchema.parse({ ...VALID_REQUEST, price: 0 })).toThrow();
    expect(() => createReportRequestSchema.parse({ ...VALID_REQUEST, amount: 0 })).toThrow();
  });
});

describe("createReportEnvelopeSchema", () => {
  it("서버 공통 envelope에서 data를 꺼낸다", () => {
    const parsed = createReportEnvelopeSchema.parse({
      code: "SUCCESS",
      message: "요청이 성공적으로 처리되었습니다.",
      data: { reportId: 12 },
    });

    expect(parsed.data.reportId).toBe(12);
  });

  // envelope를 벗기지 않은 예전 스키마는 이 응답을 통과시켰다 — 회귀 방지.
  it("envelope 없이 온 응답은 거부한다", () => {
    expect(() => createReportEnvelopeSchema.parse({ reportId: 12 })).toThrow();
  });
});

describe("reportTypeSchema", () => {
  it("서버 ReportType enum 두 값만 허용한다", () => {
    expect(reportTypeSchema.parse("PURCHASE")).toBe("PURCHASE");
    expect(reportTypeSchema.parse("OBSERVED")).toBe("OBSERVED");
    expect(() => reportTypeSchema.parse("PURCHASED")).toThrow();
  });
});
