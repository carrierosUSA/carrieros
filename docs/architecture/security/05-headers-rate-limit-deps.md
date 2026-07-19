# 05 — Headers, Rate Limits & Dependencies

**Parent:** [00-README.md](./00-README.md)

---

## Security headers (applied this pass)

| Header | Value | Mode |
|--------|-------|------|
| `X-Frame-Options` | `DENY` | Enforced |
| `X-Content-Type-Options` | `nosniff` | Enforced |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Enforced |
| `Permissions-Policy` | camera=(), microphone=(self), geolocation=(self), payment=(), usb=() | Enforced |
| `X-XSS-Protection` | `0` | Enforced (modern browsers; avoid legacy XSS auditor) |
| `Content-Security-Policy-Report-Only` | Self + unsafe-inline/eval + https images/connect | **Report-Only** (does not block) |

**Where applied**

1. `carrieros-app/next.config.ts` → `headers()` for `/:path*`
2. `carrieros-app/proxy.ts` (Next.js 16 Proxy) → same baseline + `X-Request-Id`
3. Constants: `lib/security/headers.ts`

**Why CSP is Report-Only:** Leaflet maps, Next/React inline styles/scripts, and localhost HMR must not break. Move to enforce after collecting reports and adding nonces per Next CSP guide.

**Compatibility:** Headers do not alter login/demo flows. Microphone/geolocation remain allowed for self (driver/voice features).

---

## Rate limiting

| Component | Behavior |
|-----------|----------|
| `MemoryRateLimiter` | Sliding window in-process (default) |
| `NoopRateLimiter` | Tests / external limiter swap |
| Alph Server Action | 60 req / 60s per user (`SENSITIVE_RATE_LIMITS.alphCommand`) |

**Limitations:** Memory limiter is **not** shared across multiple Node instances. Before multi-instance production, wire Redis/Upstash (see [`../api/11-performance.md`](../api/11-performance.md)).

---

## Dependency audit (`npm audit`)

**Context:** Dependency tree is intentionally small (`next`, `react`, `react-dom`, `leaflet`, `lucide-react`).

| Item | Result |
|------|--------|
| Audit date | July 19, 2026 (assessment pass) |
| Command | `cd carrieros-app && npm audit` |
| Result | **2 moderate** — `postcss <8.5.10` (XSS via unescaped `</style>` in stringify) pulled in by `next@16.2.9` |
| Do not | `npm audit fix --force` (suggests downgrading to `next@9` — breaking) |
| Policy | Wait for Next patch that bumps postcss; track GHSA-qx2v-qp2m-jg93; fail CI on high/critical |

### Recommended CI gate

```bash
npm audit --audit-level=high
```

Fail the pipeline on high/critical. Document exceptions with expiry.

---

## Operational tips

- After header changes, verify: `curl -sI http://127.0.0.1:3000/ | rg -i 'x-frame|content-type-options|referrer|permissions-policy|content-security'`
- Do not enable strict CSP enforce on day one.
- Prefer `proxy.ts` for request-scoped IDs; `next.config` headers cover static edge cases.
