/**
 * JSON response helpers for `/api/v1`.
 */

import { ApiError, logApiError, toApiError, type ApiErrorBody } from "@/lib/api/errors";
import { withRequestIdHeaders } from "@/lib/api/request-id";

export type ApiSuccessMeta = {
  request_id: string;
  pagination?: Record<string, unknown>;
  [key: string]: unknown;
};

export type ApiSuccessBody<T> = {
  data: T;
  meta: ApiSuccessMeta;
};

export function jsonOk<T>(
  data: T,
  requestId: string,
  init?: { status?: number; meta?: Omit<ApiSuccessMeta, "request_id">; headers?: HeadersInit },
): Response {
  const body: ApiSuccessBody<T> = {
    data,
    meta: {
      request_id: requestId,
      ...init?.meta,
    },
  };

  return Response.json(body, {
    status: init?.status ?? 200,
    headers: withRequestIdHeaders(requestId, {
      "Content-Type": "application/json",
      ...Object.fromEntries(new Headers(init?.headers).entries()),
    }),
  });
}

export function jsonError(err: ApiError): Response {
  logApiError(err);
  const body: ApiErrorBody = err.toJSON();
  return Response.json(body, {
    status: err.httpStatus,
    headers: withRequestIdHeaders(err.requestId, {
      "Content-Type": "application/json",
      ...(err.code === "rate_limited" ? { "Retry-After": "60" } : {}),
    }),
  });
}

export function jsonFromUnknownError(requestId: string, err: unknown): Response {
  return jsonError(toApiError(requestId, err));
}
