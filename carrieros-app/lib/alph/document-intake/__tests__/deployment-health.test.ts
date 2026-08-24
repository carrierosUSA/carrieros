import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const route = readFileSync("app/api/health/route.ts", "utf8");
const smoke = readFileSync("scripts/unauthenticated-smoke.mjs", "utf8");
const proxy = readFileSync("proxy.ts", "utf8");

test("deployment health response is minimal and performs no dependency access", () => {
  assert.match(route, /\{ status: "ok" \}/);
  assert.match(route, /status: 200/);
  assert.doesNotMatch(route, /process\.env|supabase|database|fetch\(|version|commit|timestamp/);
});

test("health responses cannot be cached or indexed", () => {
  assert.match(route, /no-store, max-age=0/);
  assert.match(route, /noindex, nofollow/);
  assert.match(route, /export function HEAD/);
});

test("production smoke verifies GET and HEAD health behavior", () => {
  assert.match(smoke, /fetch\(`\$\{base\}\/api\/health`/);
  assert.match(smoke, /health\.json\(\)/);
  assert.match(smoke, /method: "HEAD"/);
  assert.match(smoke, /healthHead\.text\(\), ""/);
});

test("public health endpoint is not part of authenticated application prefixes", () => {
  assert.doesNotMatch(proxy, /"\/api\/health"/);
});
