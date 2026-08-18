import { ZodError } from "zod";
import { BackendApiError } from "@/app/_lib/api/backend-api-error";

interface BffErrorBody {
  error: {
    code: string;
    message: string;
  };
}

function errorResponse(status: number, code: string, message: string): Response {
  const body: BffErrorBody = { error: { code, message } };
  return Response.json(body, { status });
}

function clientErrorMessage(status: number): string {
  if (status === 401) return "로그인이 필요해요.";
  if (status === 403) return "요청할 권한이 없어요.";
  if (status === 404) return "요청한 정보를 찾지 못했어요.";
  if (status === 409) return "현재 상태에서는 요청을 처리할 수 없어요.";
  if (status === 429) return "요청이 많아요. 잠시 후 다시 시도해 주세요.";
  return "요청 내용을 확인해 주세요.";
}

export function toBffErrorResponse(error: unknown): Response {
  if (error instanceof BackendApiError) {
    if (error.status >= 400 && error.status < 500) {
      return errorResponse(error.status, `BACKEND_${error.status}`, clientErrorMessage(error.status));
    }

    return errorResponse(502, "BACKEND_UNAVAILABLE", "백엔드 응답을 처리하지 못했어요.");
  }

  if (error instanceof ZodError) {
    return errorResponse(502, "INVALID_BACKEND_RESPONSE", "백엔드 응답 형식이 올바르지 않아요.");
  }

  return errorResponse(500, "INTERNAL_ERROR", "요청을 처리하지 못했어요.");
}
