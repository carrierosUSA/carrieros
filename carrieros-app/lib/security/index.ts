/**
 * Transpo.ai enterprise security helpers (incremental foundation).
 * @see docs/architecture/security/00-README.md
 */

export {
  applySecurityHeaders,
  BASELINE_SECURITY_HEADERS,
  CSP_REPORT_ONLY,
  SECURITY_HEADER_NAMES,
} from "@/lib/security/headers";

export {
  getServerSecret,
  hasPublicSecretLeak,
  SERVER_ONLY_SECRET_NAMES,
  warnIfPublicSecretLeak,
  type ServerOnlySecretName,
} from "@/lib/security/secrets";

export {
  createRequestId,
  logSecurityEvent,
  type LogSecurityEventInput,
  type SecurityEventKind,
} from "@/lib/security/audit";
