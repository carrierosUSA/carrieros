import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const page = readFileSync("app/dispatch/DispatchWorkspace.tsx", "utf8");

test("dispatch search covers operational identifiers without server writes", () => {
  for (const field of ["loadNumber", "pickupNumber", "brokerName", "origin", "destination", "truckUnit", "trailerUnit", "exceptionSummary", "status"]) assert.match(page, new RegExp(`load\\.${field}`));
  assert.match(page, /type="search"/);
  assert.doesNotMatch(page, /\b(?:insert|update|delete)\s*\(/i);
});

test("priority filtering combines with the selected workflow tab", () => {
  assert.match(page, /matches\(load, tab\)/);
  assert.match(page, /priorityFilter === "all" \|\| load\.priority === priorityFilter/);
  assert.match(page, /searchMatches\(load, query\)/);
  assert.match(page, /Red priority/);
  assert.match(page, /Amber priority/);
  assert.match(page, /Green priority/);
});

test("filter controls are accessible and clearly report results", () => {
  assert.match(page, /aria-pressed=\{tab === item\}/);
  assert.match(page, /Search dispatch loads/);
  assert.match(page, /Filter by priority/);
  assert.match(page, /aria-live="polite"/);
  assert.match(page, /matching load/);
  assert.match(page, /Clear filters/);
  assert.match(page, /No loads match these filters/);
});
