import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";
import { allowedNextLoadStatuses } from "@/lib/operations/load-workflow";

const migration = readFileSync(
  resolve(process.cwd(), "supabase/migrations/20260821150000_load_update_workflow.sql"),
  "utf8",
);
const rollback = readFileSync(
  resolve(process.cwd(), "supabase/rollback/20260821150000_load_update_workflow_rollback.sql"),
  "utf8",
);
const action = readFileSync(resolve(process.cwd(), "app/actions/dispatch.ts"), "utf8");

test("forward lifecycle transitions are explicit and role-aware", () => {
  assert.deepEqual(allowedNextLoadStatuses("owner", "pending"), [
    "dispatched",
    "cancelled",
  ]);
  assert.deepEqual(allowedNextLoadStatuses("driver", "pending"), []);
  assert.deepEqual(allowedNextLoadStatuses("driver", "dispatched"), [
    "en_route_to_pickup",
  ]);
  assert.deepEqual(allowedNextLoadStatuses("dispatcher", "arrived_delivery"), [
    "delivered",
    "cancelled",
  ]);
  assert.deepEqual(allowedNextLoadStatuses("owner", "delivered"), []);
});

test("database enforces company, assignment, stale-state, and idempotency boundaries", () => {
  assert.match(migration, /public\.document_intake_company_id\(\)/);
  assert.match(migration, /public\.can_read_load\(id\)/);
  assert.match(migration, /a\.driver_user_id = v_user and a\.ended_at is null/);
  assert.match(migration, /p_expected_status is distinct from v_current_status/);
  assert.match(migration, /e\.request_id = p_request_id/);
  assert.match(migration, /for update/);
});

test("unsafe skips and premature closure are rejected", () => {
  assert.match(migration, /Invalid load status transition/);
  assert.match(
    migration,
    /Closure requires verified POD, invoice, and resolved exceptions/,
  );
  assert.match(migration, /Driver cannot cancel a load/);
  assert.match(migration, /Cancellation requires a factual reason/);
  assert.match(migration, /Closed or cancelled loads are immutable/);
});

test("server action re-authenticates, validates, and writes only through the atomic RPC", () => {
  assert.match(action, /requireDocumentAuth\(\)/);
  assert.match(action, /canRecordLoadFacts\(auth\.businessRole\)/);
  assert.match(action, /db\.rpc\("record_verified_load_update"/);
  assert.doesNotMatch(action, /\.from\("loads"\)\.(?:insert|update|delete)/);
});

test("rollback disables future updates without deleting load history", () => {
  assert.match(rollback, /drop function if exists/);
  assert.doesNotMatch(rollback, /delete from|truncate|drop table/i);
});
