import "server-only";

import { type z } from "zod";
import { BackendApiError } from "@/app/_lib/api/backend-api-error";

const DEFAULT_BACKEND_API_URL = "https://api.marketgo.kro.kr";

type RevalidatedRequest = {
  cache?: never;
  next: {
    revalidate: number;
    tags?: string[];
  };
};

type UncachedRequest = {
  cache: "no-store";
  next?: never;
};

export type BackendRequestInit = Omit<RequestInit, "cache"> &
  (RevalidatedRequest | UncachedRequest);

function createBackendUrl(path: string): URL {
  if (!path.startsWith("/")) {
    throw new Error(`Backend API path must start with '/': ${path}`);
  }

  const baseUrl = process.env.BACKEND_API_URL ?? DEFAULT_BACKEND_API_URL;
  const normalizedBaseUrl = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  const parsedBaseUrl = new URL(normalizedBaseUrl);

  if (parsedBaseUrl.protocol !== "https:" || parsedBaseUrl.username || parsedBaseUrl.password) {
    throw new Error("BACKEND_API_URL must be an HTTPS URL without embedded credentials");
  }

  return new URL(path.slice(1), parsedBaseUrl);
}

async function readResponsePayload(response: Response): Promise<unknown> {
  if (response.status === 204) return null;

  const contentType = response.headers.get("content-type");
  if (!contentType?.includes("application/json")) {
    return response.text();
  }

  return response.json() as Promise<unknown>;
}

export async function fetchBackend<TSchema extends z.ZodType>(
  path: string,
  schema: TSchema,
  init: BackendRequestInit,
): Promise<z.output<TSchema>> {
  const headers = new Headers(init.headers);
  headers.set("accept", "application/json");

  const response = await fetch(createBackendUrl(path), {
    ...init,
    headers,
  });
  const payload = await readResponsePayload(response);

  if (!response.ok) {
    throw new BackendApiError(response.status, payload);
  }

  return schema.parse(payload);
}
