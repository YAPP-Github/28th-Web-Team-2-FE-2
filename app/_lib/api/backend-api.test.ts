import { afterEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { fetchBackend, type BackendRequestInit } from "@/app/_lib/api/backend-api";

const successSchema = z.object({ data: z.object({ id: z.number() }) });

describe("fetchBackend", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("HTTPS 기본 주소에 경로를 붙이고 응답 스키마를 검증한다", async () => {
    const fetchMock = vi.fn<
      (input: RequestInfo | URL, init?: BackendRequestInit) => Promise<Response>
    >(async () => Response.json({ data: { id: 7 } }, { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      fetchBackend("/api/v1/items", successSchema, {
        next: { revalidate: 60, tags: ["items"] },
      }),
    ).resolves.toEqual({ data: { id: 7 } });

    const [url, init] = fetchMock.mock.calls[0] ?? [];
    expect(String(url)).toBe("https://api.marketgo.kro.kr/api/v1/items");
    expect(init?.next).toEqual({ revalidate: 60, tags: ["items"] });
  });

  it("오류 응답을 상태와 payload가 보존된 BackendApiError로 변환한다", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => Response.json({ message: "unauthorized" }, { status: 401 })),
    );

    const request = fetchBackend("/api/v1/users/me", successSchema, { cache: "no-store" });

    await expect(request).rejects.toMatchObject({
      name: "BackendApiError",
      status: 401,
      message: "unauthorized",
      payload: { message: "unauthorized" },
    });
  });

  it("스키마와 다른 성공 응답을 통과시키지 않는다", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => Response.json({ data: { id: "7" } }, { status: 200 })),
    );

    await expect(
      fetchBackend("/api/v1/items", successSchema, { cache: "no-store" }),
    ).rejects.toBeInstanceOf(z.ZodError);
  });

  it("상대 API 경로만 허용한다", async () => {
    await expect(
      fetchBackend("https://example.com/api", successSchema, { cache: "no-store" }),
    ).rejects.toThrow("Backend API path must start with '/'");
  });

  it("HTTP 또는 credential이 포함된 base URL을 거부한다", async () => {
    vi.stubEnv("BACKEND_API_URL", "http://user:password@example.com");

    await expect(
      fetchBackend("/api/v1/items", successSchema, { cache: "no-store" }),
    ).rejects.toThrow("BACKEND_API_URL must be an HTTPS URL without embedded credentials");
  });
});
