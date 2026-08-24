import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const config = readFileSync("next.config.ts", "utf8");
const layout = readFileSync("app/layout.tsx", "utf8");
const proxy = readFileSync("proxy.ts", "utf8");
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

test("transport and cross-origin resource policy fail closed", () => {
  assert.match(config, /Strict-Transport-Security/);
  assert.match(config, /max-age=31536000/);
  assert.match(config, /Cross-Origin-Resource-Policy/);
  assert.match(config, /X-Permitted-Cross-Domain-Policies/);
  assert.match(smoke, /strict-transport-security/);
  assert.match(smoke, /cross-origin-resource-policy/);
  assert.match(smoke, /x-permitted-cross-domain-policies/);
  assert.doesNotMatch(config, /includeSubDomains|preload/);
});

test("unused sensitive browser capabilities are globally denied", () => {
  for (const capability of ["camera", "microphone", "geolocation", "payment", "usb", "serial"]) {
    assert.ok(config.includes(`${capability}=()`));
    assert.ok(smoke.includes(`${capability}=()`));
  }
});

test("security policy stays global and value-free", () => {
  assert.match(config, /source: "\/:path\*"/);
  assert.doesNotMatch(config, /process\.env|SUPABASE|OPENAI|secret/i);
});

test("private operations are globally excluded from search indexing and previews", () => {
  assert.match(config, /X-Robots-Tag/);
  for (const directive of ["noindex", "nofollow", "noarchive", "nosnippet", "noimageindex"]) {
    assert.ok(config.includes(directive));
    assert.ok(smoke.includes(directive));
  }

  assert.match(layout, /robots:/);
  assert.match(layout, /index: false/);
  assert.match(layout, /follow: false/);
  assert.match(layout, /noarchive: true/);
  assert.match(layout, /noimageindex: true/);
  assert.match(layout, /"max-image-preview": "none"/);
});

test("application responses are private no-store while built assets stay cacheable", () => {
  assert.match(proxy, /private, no-store, max-age=0, must-revalidate/);
  assert.match(proxy, /Pragma/);
  assert.match(proxy, /no-cache/);
  assert.match(proxy, /Expires/);
  assert.match(proxy, /return applyPrivateCachePolicy\(response\)/);
  assert.match(proxy, /_next\/static\|_next\/image/);
  assert.match(smoke, /assertPrivateNoStore\(login/);
  assert.match(smoke, /assertPrivateNoStore\(response/);
  assert.match(smoke, /staticAsset/);
  assert.match(smoke, /doesNotMatch/);
});
