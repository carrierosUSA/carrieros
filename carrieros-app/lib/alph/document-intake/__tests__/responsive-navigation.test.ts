import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const sidebar = readFileSync("components/Sidebar.tsx", "utf8");
const css = readFileSync("app/globals.css", "utf8").replace(/\s+/g, " ");

test("navigation is grouped and scrolls as modules grow", () => {
  for (const group of ["Operations", "Fleet & Safety", "Finance", "Network", "Intelligence"]) assert.match(sidebar, new RegExp(group.replace("&", "&")));
  assert.match(sidebar, /overflow-y-auto/);
  assert.doesNotMatch(sidebar, /absolute bottom-6/);
});

test("active module is derived from the verified current path", () => {
  assert.match(sidebar, /usePathname\(\)/);
  assert.match(sidebar, /aria-current=\{active \? "page"/);
  assert.match(sidebar, /pathname\.startsWith/);
});

test("mobile navigation has explicit open close and overlay controls", () => {
  assert.match(sidebar, /aria-label="Open navigation"/);
  assert.match(sidebar, /aria-label="Close navigation"/);
  assert.match(sidebar, /aria-label="Close navigation overlay"/);
  assert.match(sidebar, /lg:hidden/);
});

test("mobile content removes desktop sidebar offset", () => {
  assert.match(css, /@media \(max-width: 1023px\)/);
  assert.match(css, /main > section\.ml-72 \{ margin-left: 0 !important;/);
  assert.match(css, /padding-top: 5\.5rem !important/);
});

test("Nova remains explicitly assistive and read-only", () => {
  assert.match(sidebar, /Assistive and read-only/);
});
