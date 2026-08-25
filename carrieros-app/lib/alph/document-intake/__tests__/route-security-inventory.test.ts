import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join, relative, sep } from "node:path";
import test from "node:test";
import { isProtectedAppPath, PROXY_BYPASS_PATHS } from "../../../auth/app-routes";

function routeFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return routeFiles(path);
    return entry.name === "page.tsx" || entry.name === "route.ts" ? [path] : [];
  });
}

function routeFromFile(file: string): string {
  const parts = relative("app", file).split(sep);
  parts.pop();
  if (!parts.length) return "/";
  return `/${parts.map((part) => part.replace(/^\[.*\]$/, "verified-id")).join("/")}`;
}

const files = routeFiles("app");
const routes = files.map((file) => ({ file, route: routeFromFile(file) }));
const bypass = new Set<string>(PROXY_BYPASS_PATHS);

test("every application page and API route is protected or explicitly classified", () => {
  assert.ok(routes.length >= 40, "route inventory unexpectedly shrank");
  for (const item of routes) {
    assert.ok(
      isProtectedAppPath(item.route) || bypass.has(item.route),
      `${item.file} (${item.route}) is neither protected nor an explicit proxy bypass`,
    );
  }
});

test("explicit proxy bypasses are exact minimal and never overlap protected paths", () => {
  assert.deepEqual([...PROXY_BYPASS_PATHS].sort(), [
    "/api/health",
    "/api/readiness",
    "/auth/missing-company",
    "/auth/unauthorized",
    "/login",
    "/logout",
  ]);
  for (const route of PROXY_BYPASS_PATHS) assert.equal(isProtectedAppPath(route), false, `${route} must not have ambiguous classification`);
});

test("self-guarded logout re-verifies the user before rendering or mutation", () => {
  const page = readFileSync("app/logout/page.tsx", "utf8");
  const action = readFileSync("app/login/actions.ts", "utf8");
  assert.match(page, /getSupabaseCookieClient/);
  assert.match(page, /if \(!user\) redirect\("\/login"\)/);
  assert.match(action, /export async function logoutAction/);
  assert.match(action, /await supabase\.auth\.getUser\(\)/);
  assert.match(action, /await supabase\.auth\.signOut\(\)/);
});

test("only minimal health auth-state and login pages bypass the proxy", () => {
  for (const { file, route } of routes.filter((item) => bypass.has(item.route))) {
    const source = readFileSync(file, "utf8");
    if (route.startsWith("/api/")) {
      assert.doesNotMatch(source, /createServerClient|service_role|DATABASE_URL|redirect\(/);
    } else if (route.startsWith("/auth/")) {
      assert.doesNotMatch(source, /process\.env|createServerClient|service_role|DATABASE_URL/);
    }
  }
});
