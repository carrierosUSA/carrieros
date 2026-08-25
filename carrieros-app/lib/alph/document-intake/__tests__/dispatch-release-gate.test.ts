import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const migration = readFileSync(resolve(process.cwd(), "supabase/migrations/20260821190000_dispatch_release_gate.sql"), "utf8");
const rollback = readFileSync(resolve(process.cwd(), "supabase/rollback/20260821190000_dispatch_release_gate_rollback.sql"), "utf8");
const action = readFileSync(resolve(process.cwd(), "app/actions/dispatch.ts"), "utf8");

test("pending-to-dispatched transition has a database trigger gate", () => {
  assert.match(migration, /before update of status on public\.loads/);
  assert.match(migration, /old\.status = 'pending' and new\.status = 'dispatched'/);
});

test("dispatch release requires active verified assignment and actual truck", () => {
  assert.match(migration, /a\.ended_at is null/);
  assert.match(migration, /a\.equipment_fit_verified is true/);
  assert.match(migration, /a\.hos_verified is true/);
  assert.match(migration, /a\.safety_verified is true/);
  assert.match(migration, /char_length\(trim\(a\.truck_unit\)\)/);
});

test("assigned driver remains verified and company-isolated at release", () => {
  assert.match(migration, /join auth\.users u on u\.id = a\.driver_user_id/);
  assert.match(migration, /raw_app_meta_data ->> 'company_id' = new\.company_id::text/);
  assert.match(migration, /raw_app_meta_data ->> 'business_role' = 'driver'/);
});

test("UI capabilities hide dispatch before assignment", () => {
  assert.match(action, /nextStatus !== "dispatched" \|\| hasActiveAssignment/);
  assert.match(action, /Boolean\(load\.driverUserId\)/);
});

test("rollback preserves operational history", () => {
  assert.match(rollback, /drop trigger if exists loads_verified_dispatch_release/);
  assert.doesNotMatch(rollback, /delete from|truncate|drop table/i);
});
