import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const page = readFileSync("app/system-readiness/page.tsx", "utf8");
const source = readFileSync("lib/system/readiness.ts", "utf8");
const proxy = readFileSync("proxy.ts", "utf8");

test("system readiness is owner protected and proxy guarded", () => {
  assert.match(page, /super_admin/);
  assert.match(page, /owner/);
  assert.match(page, /auth\/unauthorized/);
  assert.match(page, /force-dynamic/);
  assert.match(proxy, /system-readiness/);
});

test("system readiness reports presence without returning environment values", () => {
  assert.match(source, /import "server-only"/);
  assert.match(source, /hasPublicSecretLeak/);
  assert.doesNotMatch(page, /process\.env/);
  assert.match(page, /values stay server-side/);
  assert.match(page, /does not connect to production, apply migrations, create users/);
});
