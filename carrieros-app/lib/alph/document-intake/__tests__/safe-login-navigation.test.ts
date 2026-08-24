import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { PROTECTED_APP_PREFIXES, isProtectedAppPath, safeAppReturnPath } from "../../../auth/app-routes";

test("every protected workspace can return to its exact local path after login", () => {
  for (const prefix of PROTECTED_APP_PREFIXES) {
    const path = `${prefix}/verified?period=2026-08#record`;
    assert.equal(safeAppReturnPath(path), path);
    assert.equal(isProtectedAppPath(prefix), true);
  }
  assert.equal(safeAppReturnPath("/?view=command"), "/?view=command");
});

test("external malformed public and oversized login destinations fail closed", () => {
  for (const value of [
    "https://evil.example/dispatch",
    "//evil.example/dispatch",
    "\\\\evil.example\\dispatch",
    "javascript:alert(1)",
    "/login",
    "/auth/unauthorized",
    "/definitely-public",
    "/dispatch\r\nLocation: https://evil.example",
    `/${"x".repeat(2050)}`,
    null,
  ]) assert.equal(safeAppReturnPath(value), "/documents");
});

test("proxy and login share one protected-route authority", () => {
  const proxy = readFileSync("proxy.ts", "utf8");
  const action = readFileSync("app/login/actions.ts", "utf8");
  assert.match(proxy, /isProtectedAppPath as isProtectedRoute/);
  assert.match(action, /safeAppReturnPath/);
  assert.match(proxy, /return isProtectedRoute\(pathname\)/);
  assert.doesNotMatch(proxy, /PROTECTED_APP_PREFIXES\.some/);
});

test("login handles configuration and service failures without exposing details", () => {
  const action = readFileSync("app/login/actions.ts", "utf8");
  const page = readFileSync("app/login/page.tsx", "utf8");
  assert.match(action, /error=configuration/);
  assert.match(action, /error=service_unavailable/);
  assert.match(action, /email\.length > 320/);
  assert.match(action, /password\.length > 1024/);
  assert.doesNotMatch(page, /error\.(?:message|stack)/);
  assert.match(page, /No session was created/);
});
