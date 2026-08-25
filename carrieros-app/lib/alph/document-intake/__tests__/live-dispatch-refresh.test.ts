import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const page = readFileSync("app/dispatch/DispatchWorkspace.tsx", "utf8");
const action = readFileSync("app/actions/dispatch.ts", "utf8");

test("dispatch board performs bounded visible-tab refreshes", () => {
  assert.match(page, /window\.setInterval\(refreshVisible, 30_000\)/);
  assert.match(page, /document\.visibilityState === "visible"/);
  assert.match(page, /visibilitychange/);
  assert.match(page, /window\.clearTimeout\(initialRefresh\)/);
  assert.match(page, /window\.clearInterval\(interval\)/);
});

test("refreshes cannot overlap and stop updating after unmount", () => {
  assert.match(page, /if \(inFlight\.current\) return/);
  assert.match(page, /if \(!mounted\.current\) return/);
  assert.match(page, /mounted\.current = false/);
});

test("operators receive manual and timestamped refresh feedback", () => {
  assert.match(page, /aria-live="polite"/);
  assert.match(page, /lastUpdatedAt/);
  assert.match(page, /Refreshing…/);
  assert.match(page, /onClick=\{\(\) => void refresh\(\)\}/);
});

test("live refresh remains authenticated and read only", () => {
  assert.match(action, /getDispatchBoardAction/);
  assert.match(action, /requireDocumentAuth\(\)/);
  assert.match(action, /new LoadOperationsRepository\(\)\.listBoard/);
  assert.doesNotMatch(page, /insert\(|update\(|delete\(|db\.rpc/);
});
