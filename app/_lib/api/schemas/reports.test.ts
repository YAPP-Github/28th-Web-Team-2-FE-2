import { describe, expect, it } from "vitest";
import { createReportRequestSchema } from "./reports";

const kakaoStore = {
  id: "343636183",
  placeName: "아현식자재마트",
  addressName: "서울 마포구 아현동 618-19",
  placeUrl: "http://place.map.kakao.com/343636183",
  categoryName: "가정,생활 > 대형마트",
  roadAddressName: "서울 마포구 마포대로 173-14",
  phone: "070-4495-9114",
  categoryGroupCode: "MT1",
  categoryGroupName: "대형마트",
  x: 126.95344340170016,
  y: 37.55075307648572,
  distance: 424,
};

describe("create report request schema", () => {
  it("실제 카카오 가게와 공덕동 regionId payload를 허용한다", () => {
    expect(
      createReportRequestSchema.safeParse({
        regionId: "1144010200",
        reportType: "PURCHASE",
        price: 3_000,
        unit: "1kg",
        amount: 1,
        store: kakaoStore,
      }).success,
    ).toBe(true);
  });

  it("가게 상세에서 넘어온 기존 매장 ID payload를 허용한다", () => {
    expect(
      createReportRequestSchema.safeParse({
        regionId: "1144010200",
        reportType: "PURCHASE",
        price: 3_000,
        unit: "1kg",
        amount: 1,
        storeId: 7,
      }).success,
    ).toBe(true);
  });

  it("사진 URL이 없는 제보 payload를 허용한다", () => {
    const result = createReportRequestSchema.safeParse({
      regionId: "1144010200",
      reportType: "PURCHASE",
      price: 3_000,
      unit: "1kg",
      amount: 1,
      store: kakaoStore,
    });

    expect(result.success).toBe(true);
    if (result.success) expect(result.data.photoUrl).toBeUndefined();
  });

  it("잘못된 법정동 코드와 필수 가게 필드를 거부한다", () => {
    expect(
      createReportRequestSchema.safeParse({
        regionId: "11440102",
        reportType: "PURCHASE",
        price: 3_000,
        unit: "1kg",
        amount: 1,
        store: { id: "343636183", placeName: "아현식자재마트" },
      }).success,
    ).toBe(false);
  });
});
