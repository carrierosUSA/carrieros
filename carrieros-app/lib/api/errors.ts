/**
 * Standard API error envelope for `/api/v1`.
 * User-facing `message` must never include secrets, SQL, or stack traces.
 * Put technical detail in `technicalMessage` for server logs only.
 */

export type ApiErrorCode =
  | "validation_error"
  | "bad_request"
  | "unauthorized"
  | "step_up_required"
  | "forbidden"
  | "not_found"
  | "conflict"
  | "idempotency_conflict"
  | "rate_limited"
  | "payload_too_large"
  | "unprocessable"
  | "human_approval_required"
  | "dependency_failed"
  | "internal_error";

export type ApiFieldError = {
  path: string;
  message: string;
};

export type ApiErrorDetails = {
  fields?: ApiFieldError[];
  [key: string]: unknown;
};

export type ApiErrorBody = {
  error: {
    code: ApiErrorCode;
    message: string;
    request_id: string;
    retryable?: boolean;
    details?: ApiErrorDetails;
  };
};

export type ApiErrorOptions = {
  code: ApiErrorCode;
  message: string;
  httpStatus: number;
  requestId: string;
  technicalMessage?: string;
  details?: ApiErrorDetails;
  retryable?: boolean;
  cause?: unknown;
};

const DEFAULT_RETRYABLE: Partial<Record<ApiErrorCode, boolean>> = {
  rate_limited: true,
  dependency_failed: true,
  internal_error: true,
};

export class ApiError extends Error {
  readonly code: ApiErrorCode;
  readonly httpStatus: number;
  readonly requestId: string;
  readonly technicalMessage: string;
  readonly details?: ApiErrorDetails;
  readonly retryable: boolean;

  constructor(options: ApiErrorOptions) {
    super(options.message);
    this.name = "ApiError";
    this.code = options.code;
    this.httpStatus = options.httpStatus;
    this.requestId = options.requestId;
    this.technicalMessage = options.technicalMessage ?? options.message;
    this.details = options.details;
    this.retryable =
      options.retryable ?? DEFAULT_RETRYABLE[options.code] ?? false;
    if (options.cause !== undefined) {
      this.cause = options.cause;
    }
  }

  toJSON(): ApiErrorBody {
    return {
      error: {
        code: this.code,
        message: this.message,
        request_id: this.requestId,
        retryable: this.retryable,
        ...(this.details ? { details: this.details } : {}),
      },
    };
  }
}

export function validationError(
  requestId: string,
  fields: ApiFieldError[],
  message = "Check the highlighted fields and try again.",
): ApiError {
  return new ApiError({
    code: "validation_error",
    message,
    httpStatus: 400,
    requestId,
    details: { fields },
    technicalMessage: `validation_error: ${fields.map((f) => f.path).join(", ")}`,
  });
}

export function unauthorizedError(
  requestId: string,
  technicalMessage = "No valid session",
): ApiError {
  return new ApiError({
    code: "unauthorized",
    message: "Sign in to continue.",
    httpStatus: 401,
    requestId,
    technicalMessage,
  });
}

export function forbiddenError(
  requestId: string,
  technicalMessage = "Permission denied",
): ApiError {
  return new ApiError({
    code: "forbidden",
    message: "You don't have permission to do that.",
    httpStatus: 403,
    requestId,
    technicalMessage,
  });
}

export function notFoundError(
  requestId: string,
  technicalMessage = "Resource not found in tenant",
): ApiError {
  return new ApiError({
    code: "not_found",
    message: "We couldn't find that.",
    httpStatus: 404,
    requestId,
    technicalMessage,
  });
}

export function internalError(
  requestId: string,
  technicalMessage: string,
  cause?: unknown,
): ApiError {
  return new ApiError({
    code: "internal_error",
    message: "Something went wrong. Try again or contact support with the request ID.",
    httpStatus: 500,
    requestId,
    technicalMessage,
    cause,
    retryable: true,
  });
}

/** Map unknown failures to a safe ApiError (never leak internals to clients). */
export function toApiError(requestId: string, err: unknown): ApiError {
  if (err instanceof ApiError) {
    return err;
  }

  const technical =
    err instanceof Error ? err.message : "Unknown non-Error throw";
  return internalError(requestId, technical, err);
}

export function logApiError(err: ApiError, extra?: Record<string, unknown>): void {
  console.error("[api]", {
    request_id: err.requestId,
    code: err.code,
    http_status: err.httpStatus,
    technical_message: err.technicalMessage,
    retryable: err.retryable,
    ...extra,
  });
}
