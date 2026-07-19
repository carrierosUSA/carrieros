# 06 — Error Format

**Status:** Target design · Foundation types in `carrieros-app/lib/api/errors.ts`

---

## Goals

- Consistent JSON errors for all `/api/v1` clients
- **User-safe** `message` vs **technical** log line
- Correlation via `request_id`
- Validation details without leaking internals

---

## Error envelope

```json
{
  "error": {
    "code": "validation_error",
    "message": "Check the highlighted fields and try again.",
    "request_id": "req_01HZX…",
    "retryable": false,
    "details": {
      "fields": [
        { "path": "email", "message": "Enter a valid email." }
      ]
    }
  }
}
```

| Field | Required | Description |
|-------|----------|-------------|
| `code` | yes | Stable machine code (snake_case) |
| `message` | yes | User-facing, plain language |
| `request_id` | yes | Same as `X-Request-Id` |
| `retryable` | recommended | Client may retry if true |
| `details` | optional | Structured extras (fields, conflicts) |

**Never** put stack traces, SQL, or secrets in `message` / `details`.

---

## Logging (server)

For every error response, log:

```text
level, request_id, code, http_status, user_id?, company_id?,
route, technical_message, stack? (server-only)
```

`technical_message` is **log-only** — not returned to clients.

---

## Standard codes → HTTP

| `code` | HTTP | Retryable | When |
|--------|------|-----------|------|
| `validation_error` | 400 | no | Schema / field errors |
| `bad_request` | 400 | no | Malformed JSON, missing header |
| `unauthorized` | 401 | no | No/invalid session |
| `step_up_required` | 401/403 | no | MFA / re-auth needed |
| `forbidden` | 403 | no | Authenticated but no permission |
| `not_found` | 404 | no | Missing in tenant (or hide cross-tenant) |
| `conflict` | 409 | no | Version / unique conflict |
| `idempotency_conflict` | 409 | no | Same key, different body |
| `rate_limited` | 429 | yes | Include `Retry-After` |
| `payload_too_large` | 413 | no | Upload limits |
| `unprocessable` | 422 | no | Semantically invalid |
| `human_approval_required` | 422 | no | Constitution gate — draft only |
| `dependency_failed` | 502 | yes | Upstream ELD/payment/OCR |
| `internal_error` | 500 | maybe | Unexpected |

---

## Mapping from thrown errors

Foundation `ApiError` carries `code`, `httpStatus`, `message`, `technicalMessage`, `details`, `retryable`.
Unknown throws → `internal_error` + log technical message.

Server Actions may keep throwing `Error` for UI forms; when shared services are used from HTTP, prefer `ApiError` or map at the adapter.

---

## Related

- Request ID: [11-performance.md](./11-performance.md) (observability) + `lib/api/request-id.ts`
- Validation details: [04-validation.md](./04-validation.md)
- Auth failures: [05-authorization.md](./05-authorization.md)
