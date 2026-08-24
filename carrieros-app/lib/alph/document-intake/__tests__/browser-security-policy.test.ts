import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const config = readFileSync("next.config.ts", "utf8");
const smoke = readFileSync("scripts/unauthenticated-smoke.mjs", "utf8");

test("browser policy blocks framing unsafe base URLs external forms and objects", () => {
  assert.match(config, /Content-Security-Policy/);
  for (const directive of ["base-uri 'self'", "form-action 'self'", "frame-ancestors 'none'", "object-src 'none'"]) {
    assert.ok(config.includes(directive));
    assert.ok(smoke.includes(directive));
  }
  assert.match(config, /X-Frame-Options/);
  assert.match(config, /DENY/);
});

test("safe partial CSP avoids unreviewed application resource restrictions", () => {
  assert.doesNotMatch(config, /default-src|script-src|style-src|connect-src|img-src/);
});

test("cross-origin window isolation and DNS prefetch disabling are smoke verified", () => {
  assert.match(config, /Cross-Origin-Opener-Policy/);
  assert.match(config, /same-origin/);
  assert.match(config, /X-DNS-Prefetch-Control/);
  assert.match(smoke, /cross-origin-opener-policy/);
  assert.match(smoke, /x-dns-prefetch-control/);
});

test("security policy stays global and value-free", () => {
  assert.match(config, /source: "\/:path\*"/);
  assert.doesNotMatch(config, /process\.env|SUPABASE|OPENAI|secret/i);
});
