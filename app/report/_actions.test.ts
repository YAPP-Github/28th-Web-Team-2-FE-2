import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  clearTokens: vi.fn(),
  createReport: vi.fn(),
  ensureCurrentUserRegion: vi.fn(),
  getAccessToken: vi.fn(),
  getVerifiedSelectedRegion: vi.fn(),
}));

vi.mock("@/app/_lib/api/auth/session", () => ({
  clearTokens: mocks.clearTokens,
  getAccessToken: mocks.getAccessToken,
}));
vi.mock("@/app/_lib/api/server/regions", () => ({
  ensureCurrentUserRegion: mocks.ensureCurrentUserRegion,
}));
vi.mock("@/app/_lib/api/server/reports", () => ({ createReport: mocks.createReport }));
vi.mock("@/app/_lib/api/server/selected-region", () => ({
  getVerifiedSelectedRegion: mocks.getVerifiedSelectedRegion,
}));

import { FIXED_REGION_ID } from "@/app/_lib/api/fixed-region";
import { submitReportAction } from "./_actions";

describe("제보 제출 액션", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getAccessToken.mockResolvedValue("access-token");
    mocks.getVerifiedSelectedRegion.mockResolvedValue({
      regionId: FIXED_REGION_ID,
      regionName: "공덕동",
    });
    mocks.ensureCurrentUserRegion.mockResolvedValue(undefined);
    mocks.createReport.mockResolvedValue(undefined);
  });

  it("기존 매장 제보는 같은 storeId만 Spring 요청에 전달한다", async () => {
    await expect(
      submitReportAction({ itemId: 37, storeId: 7, price: 3000, amount: 1, unit: "kg" }),
    ).resolves.toEqual({ status: "success" });

    expect(mocks.createReport).toHaveBeenCalledOnce();
    const request = mocks.createReport.mock.calls[0]?.[0];
    expect(request).toEqual(
      expect.objectContaining({ itemId: 37, token: "access-token" }),
    );
    expect(request.body).toEqual(
      expect.objectContaining({ regionId: FIXED_REGION_ID, storeId: 7 }),
    );
    expect(request.body.store).toBeUndefined();
    expect(request.body.photoUrl).toBeUndefined();
  });
});
