import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const guide = readFileSync("docs/release-candidate-handoff.md", "utf8");

test("release candidate starts with verified source recovery", () => {
  assert.match(guide, /git bundle verify/);
  assert.match(guide, /refs\/heads\/codex\/live-dispatch-data:refs\/heads\/codex\/release-candidate/);
  assert.match(guide, /npm ci/);
  assert.match(guide, /npm run verify:testing/);
});

test("development preparation is isolated and fail closed", () => {
  assert.match(guide, /Transpo\.ai Development/);
  assert.match(guide, /never production/i);
  assert.match(guide, /npm run verify:development-target/);
  assert.match(guide, /Applying SQL remains a separate human-approved database action/);
});

test("human acceptance and release authority cannot be fabricated", () => {
  assert.match(guide, /Do not fabricate acceptance evidence/);
  assert.match(guide, /acceptance:verify/);
  assert.match(guide, /provenance:verify/);
  assert.match(guide, /signoff:verify/);
  assert.match(guide, /separately approve and record each/);
});
