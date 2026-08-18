function readMessage(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;

  const record = payload as Record<string, unknown>;
  if (typeof record.message === "string") return record.message;

  const nestedError = record.error;
  if (!nestedError || typeof nestedError !== "object") return null;

  const nestedMessage = (nestedError as Record<string, unknown>).message;
  return typeof nestedMessage === "string" ? nestedMessage : null;
}

export class BackendApiError extends Error {
  readonly status: number;
  readonly payload: unknown;

  constructor(status: number, payload: unknown) {
    super(readMessage(payload) ?? `Backend request failed with status ${status}`);
    this.name = "BackendApiError";
    this.status = status;
    this.payload = payload;
  }
}
