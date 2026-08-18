import { describe, expect, it } from "vitest";
import { z } from "zod";
import { BackendApiError } from "@/app/_lib/api/backend-api-error";
import { toBffErrorResponse } from "@/app/_lib/api/bff-error-response";

describe("toBffErrorResponse", () => {
  it("백엔드 4xx를 BFF 오류 계약으로 유지한다", async () => {
    const response = toBffErrorResponse(new BackendApiError(401, { message: "로그인이 필요해요." }));

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      error: { code: "BACKEND_401", message: "로그인이 필요해요." },
    });
  });

  it("백엔드 4xx payload의 내부 메시지를 브라우저에 전달하지 않는다", async () => {
    const response = toBffErrorResponse(
      new BackendApiError(400, { message: "constraint user_region_fk failed" }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: { code: "BACKEND_400", message: "요청 내용을 확인해 주세요." },
    });
  });

  it("백엔드 5xx 세부 내용을 클라이언트에 노출하지 않는다", async () => {
    const response = toBffErrorResponse(new BackendApiError(500, { message: "database host" }));

    expect(response.status).toBe(502);
    await expect(response.json()).resolves.toEqual({
      error: { code: "BACKEND_UNAVAILABLE", message: "백엔드 응답을 처리하지 못했어요." },
    });
  });

  it("응답 스키마 위반을 upstream 오류로 구분한다", async () => {
    const issue = z.object({ id: z.number() }).safeParse({ id: "wrong" });
    if (issue.success) throw new Error("Expected schema validation to fail");

    const response = toBffErrorResponse(issue.error);

    expect(response.status).toBe(502);
    await expect(response.json()).resolves.toEqual({
      error: {
        code: "INVALID_BACKEND_RESPONSE",
        message: "백엔드 응답 형식이 올바르지 않아요.",
      },
    });
  });
});
