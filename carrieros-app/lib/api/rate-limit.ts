/**
 * Rate-limit interface for `/api/v1` and sensitive Server Actions.
 * Default: in-memory sliding window (single-instance). Wire Redis/Upstash
 * before multi-instance production abuse becomes real.
 *
 * @see docs/architecture/api/11-performance.md
 * @see docs/architecture/security/05-headers-rate-limit-deps.md
 */

export type RateLimitKey = {
  /** e.g. user:<id>, company:<id>, ip:<hash>, api_key:<prefix> */
  subject: string;
  /** e.g. api:v1:writes, api:v1:ocr, alph:command */
  bucket: string;
};

export type RateLimitResult = {
  allowed: boolean;
  limit: number;
  remaining: number;
  /** Seconds until the window resets; use for Retry-After when denied */
  resetAfterSeconds: number;
};

export interface RateLimiter {
  check(key: RateLimitKey, limit: number, windowSeconds: number): Promise<RateLimitResult>;
}

/** Always allows — use only in tests or when an external limiter is wired. */
export class NoopRateLimiter implements RateLimiter {
  async check(
    _key: RateLimitKey,
    limit: number,
    windowSeconds: number,
  ): Promise<RateLimitResult> {
    return {
      allowed: true,
      limit,
      remaining: limit,
      resetAfterSeconds: windowSeconds,
    };
  }
}

type WindowEntry = { timestamps: number[] };

/**
 * Process-local sliding window. Not shared across instances — upgrade to
 * Redis/Upstash for horizontal scale. Safe for localhost and single deploy.
 */
export class MemoryRateLimiter implements RateLimiter {
  private readonly windows = new Map<string, WindowEntry>();

  async check(
    key: RateLimitKey,
    limit: number,
    windowSeconds: number,
  ): Promise<RateLimitResult> {
    const now = Date.now();
    const windowMs = Math.max(1, windowSeconds) * 1000;
    const mapKey = `${key.bucket}:${key.subject}`;
    const entry = this.windows.get(mapKey) ?? { timestamps: [] };
    const cutoff = now - windowMs;
    entry.timestamps = entry.timestamps.filter((t) => t > cutoff);

    if (entry.timestamps.length >= limit) {
      const oldest = entry.timestamps[0] ?? now;
      const resetAfterSeconds = Math.max(
        1,
        Math.ceil((oldest + windowMs - now) / 1000),
      );
      this.windows.set(mapKey, entry);
      return {
        allowed: false,
        limit,
        remaining: 0,
        resetAfterSeconds,
      };
    }

    entry.timestamps.push(now);
    this.windows.set(mapKey, entry);
    return {
      allowed: true,
      limit,
      remaining: Math.max(0, limit - entry.timestamps.length),
      resetAfterSeconds: windowSeconds,
    };
  }
}

export const defaultRateLimiter: RateLimiter = new MemoryRateLimiter();

/** Sensible defaults for sensitive Alph / mutation surfaces. */
export const SENSITIVE_RATE_LIMITS = {
  alphCommand: { limit: 60, windowSeconds: 60 },
  apiWrite: { limit: 120, windowSeconds: 60 },
} as const;

export function rateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    "X-RateLimit-Limit": String(result.limit),
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(result.resetAfterSeconds),
    ...(result.allowed
      ? {}
      : { "Retry-After": String(Math.max(1, result.resetAfterSeconds)) }),
  };
}
