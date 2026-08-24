import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const script = readFileSync("scripts/unauthenticated-smoke.mjs", "utf8");
const config = readFileSync("next.config.ts", "utf8");
const pkg = JSON.parse(readFileSync("package.json", "utf8")) as { scripts: Record<string, string> };

test("production smoke runs locally with external credentials removed", () => {
  assert.match(script, /delete env\.NEXT_PUBLIC_SUPABASE_URL/);
  assert.match(script, /delete env\.SUPABASE_SERVICE_ROLE_KEY/);
  assert.match(script, /delete env\.OPENAI_API_KEY/);
  assert.match(script, /127\.0\.0\.1/);
  assert.doesNotMatch(script, /https:\/\//);
});

test("production smoke verifies fail-closed routes and 404 behavior", () => {
  for (const route of ["/", "/dispatch", "/documents", "/driver", "/finance", "/system-readiness"]) assert.ok(script.includes(`"${route}"`));
  assert.match(script, /destination\.pathname, "\/login"/);
  assert.match(script, /destination\.searchParams\.get\("error"\), "configuration"/);
  assert.match(script, /missing\.status, 404/);
});

test("global browser hardening headers are configured and smoke checked", () => {
  for (const header of ["X-Content-Type-Options", "X-Frame-Options", "Referrer-Policy", "Permissions-Policy"]) {
    assert.ok(config.includes(header));
    assert.ok(script.toLowerCase().includes(header.toLowerCase()));
  }
});

test("testing and release verification include production smoke after build", () => {
  for (const command of ["verify:testing", "verify:release"]) assert.match(pkg.scripts[command], /build.*smoke:unauthenticated.*npm audit/);
});
