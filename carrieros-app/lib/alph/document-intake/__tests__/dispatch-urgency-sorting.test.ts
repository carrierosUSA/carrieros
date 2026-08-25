import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const page = readFileSync("app/dispatch/DispatchWorkspace.tsx", "utf8");

test("dispatch defaults to urgent-first local sorting", () => {
  assert.match(page, /useState<SortMode>\("urgent"\)/);
  assert.match(page, /const priority=\{red:0,amber:1,green:2\}/);
  assert.match(page, /Number\(isAppointmentOverdue\(b\)\)-Number\(isAppointmentOverdue\(a\)\)/);
  assert.match(page, /priority\[a\.priority\]-priority\[b\.priority\]/);
});

test("operator can choose appointment or newest ordering", () => {
  assert.match(page, /Sort dispatch loads/);
  assert.match(page, /Urgent first/);
  assert.match(page, /Appointment first/);
  assert.match(page, /Newest load first/);
  assert.match(page, /sortLoads\(filtered, sortMode\)/);
});

test("only actionable past appointments receive an overdue label", () => {
  assert.match(page, /\["delivered","closed","cancelled"\]\.includes\(load\.status\)/);
  assert.match(page, /parsed<Date\.now\(\)/);
  assert.match(page, /Overdue recorded appointment/);
  assert.match(page, /nextAppointmentTimezone/);
});

test("sorting is a copied client-side view and performs no operational mutation", () => {
  assert.match(page, /return \[\.\.\.loads\]\.sort/);
  assert.doesNotMatch(page, /\b(?:insert|update|delete)\s*\(/i);
  assert.doesNotMatch(page, /saveVerified|db\.rpc/);
});
