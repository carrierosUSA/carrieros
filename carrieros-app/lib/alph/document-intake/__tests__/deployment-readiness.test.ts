import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const route = readFileSync("app/api/readiness/route.ts", "utf8");
const readiness = readFileSync("lib/system/readiness.ts", "utf8");
const smoke = readFileSync("scripts/unauthenticated-smoke.mjs", "utf8");

test("readiness is distinct from liveness and fails closed", () => {
  assert.match(route, /getSystemReadiness\(\)\.readyForControlledTesting/);
  assert.match(route, /ready \? 200 : 503/);
  assert.match(route, /"ready" : "not_ready"/);
  assert.match(route, /force-dynamic/);
});

test("readiness returns no configuration names values or dependency details", () => {
  assert.doesNotMatch(route, /process\.env|checks|publicSecretLeak|label|detail|supabase|openai/i);
  assert.doesNotMatch(route, /fetch\(|createServerClient|database/);
  assert.match(route, /no-store, max-age=0/);
  assert.match(route, /noindex, nofollow/);
});

test("readiness source requires every configuration group and secret hygiene", () => {
  assert.match(readiness, /checks\.every/);
  assert.match(readiness, /!publicSecretLeak/);
  for (const name of ["NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY", "OPENAI_API_KEY", "ALPH_DOCUMENT_BUCKET"]) assert.ok(readiness.includes(name));
});

test("credential-free production smoke expects readiness 503 with an empty body for HEAD", () => {
  assert.match(smoke, /delete env\.ALPH_DOCUMENT_BUCKET/);
  assert.match(smoke, /readiness\.status, 503/);
  assert.match(smoke, /\{ status: "not_ready" \}/);
  assert.match(smoke, /readinessHead\.text\(\), ""/);
});
