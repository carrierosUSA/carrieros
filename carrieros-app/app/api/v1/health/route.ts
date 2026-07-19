import {
  jsonFromUnknownError,
  jsonOk,
  resolveRequestId,
} from "@/lib/api";
import { hasPublicSecretLeak } from "@/lib/security/secrets";

/**
 * Liveness probe for `/api/v1`.
 * No tenant data; safe for load balancers. Does not replace any UI route.
 * Reports secret-hygiene status without exposing env values.
 */
export async function GET(request: Request): Promise<Response> {
  const requestId = resolveRequestId(request);

  try {
    const publicSecretLeak = hasPublicSecretLeak();
    return jsonOk(
      {
        status: publicSecretLeak ? "degraded" : "ok",
        service: "transpo-api",
        version: "v1",
        time: new Date().toISOString(),
        security: {
          public_secret_leak: publicSecretLeak,
        },
      },
      requestId,
      { status: publicSecretLeak ? 503 : 200 },
    );
  } catch (err) {
    return jsonFromUnknownError(requestId, err);
  }
}
