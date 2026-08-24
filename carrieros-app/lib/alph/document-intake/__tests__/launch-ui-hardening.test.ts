import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

function files(directory: string): string[] {
  return readdirSync(directory).flatMap((name) => {
    const path = join(directory, name);
    return statSync(path).isDirectory() ? files(path) : path.endsWith(".tsx") ? [path] : [];
  });
}

const appFiles = files("app");
const source = appFiles.map((path) => readFileSync(path, "utf8")).join("\n");
const proxy = readFileSync("proxy.ts", "utf8");
const errorPage = readFileSync("app/error.tsx", "utf8");
const loadingPage = readFileSync("app/loading.tsx", "utf8");
const notFoundPage = readFileSync("app/not-found.tsx", "utf8");

test("authenticated layouts use explicit mobile-safe sidebar offsets", () => {
  assert.doesNotMatch(source, /className="ml-72/);
  assert.ok((source.match(/lg:ml-72/g) ?? []).length >= 27);
  assert.ok((source.match(/pt-20/g) ?? []).length >= 27);
});

test("every authenticated top-level workspace is middleware protected", () => {
  for (const route of ["alerts","analytics","broker-performance","brokers","claims","compliance","dispatch","documents","drivers","expenses","facilities","finance","fleet","ifta","inventory","lanes","maintenance","nova","payroll","profitability","providers","reefer","schedule","settings","year-end"]) assert.match(proxy, new RegExp(`\\"/${route}\\"`));
});

test("global error boundary is non-leaking and explicitly confirms no action", () => {
  assert.match(errorPage, /No operational action was completed/);
  assert.match(errorPage, /onClick=\{reset\}/);
  assert.match(errorPage, /role="alert"/);
  assert.doesNotMatch(errorPage, /\{\s*error\.(?:message|stack|digest)/);
});

test("loading and not-found fallbacks preserve human-control messaging", () => {
  assert.match(loadingPage, /aria-busy="true"/);
  assert.match(loadingPage, /No action is performed/);
  assert.match(notFoundPage, /No record was created, changed, dispatched, or deleted/);
  assert.match(notFoundPage, /Return to Command Center/);
});
