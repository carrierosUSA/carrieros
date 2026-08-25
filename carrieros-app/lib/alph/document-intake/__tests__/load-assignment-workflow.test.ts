import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const migration = readFileSync(resolve(process.cwd(), "supabase/migrations/20260821170000_load_assignment_workflow.sql"), "utf8");
const rollback = readFileSync(resolve(process.cwd(), "supabase/rollback/20260821170000_load_assignment_workflow_rollback.sql"), "utf8");
const action = readFileSync(resolve(process.cwd(), "app/actions/dispatch.ts"), "utf8");

test("driver directory exposes only verified same-company driver accounts", () => {
  assert.match(migration, /from auth\.users u/);
  assert.match(migration, /raw_app_meta_data ->> 'company_id' = public\.document_intake_company_id\(\)::text/);
  assert.match(migration, /raw_app_meta_data ->> 'business_role' = 'driver'/);
  assert.doesNotMatch(migration.slice(migration.indexOf("list_assignable_company_drivers"), migration.indexOf("create or replace function public.assign_verified_load")), /email|phone/i);
});

test("assignment is role-scoped, company-isolated, and human confirmed", () => {
  assert.match(migration, /v_role not in \('super_admin','owner','dispatcher'\)/);
  assert.match(migration, /u\.id = p_driver_user_id/);
  assert.match(migration, /u\.raw_app_meta_data ->> 'company_id' = v_company::text/);
  assert.match(migration, /p_equipment_fit_verified is not true/);
  assert.match(migration, /p_hos_verified is not true/);
  assert.match(migration, /p_safety_verified is not true/);
});

test("assignment is pending-only, locked, unique, and idempotent", () => {
  assert.match(migration, /for update/);
  assert.match(migration, /v_status <> 'pending'/);
  assert.match(migration, /a\.ended_at is null/);
  assert.match(migration, /e\.request_id = p_request_id/);
});

test("assignment audit does not dispatch or authorize movement", () => {
  assert.match(migration, /'approval_recorded', 'pending'/);
  assert.match(migration, /Assignment does not dispatch or authorize movement/);
  assert.doesNotMatch(migration, /update public\.loads[\s\S]*set status/);
  assert.match(action, /db\.rpc\("assign_verified_load"/);
});

test("rollback disables workflow without deleting operational data", () => {
  assert.match(rollback, /drop function if exists public\.assign_verified_load/);
  assert.match(rollback, /drop function if exists public\.list_assignable_company_drivers/);
  assert.doesNotMatch(rollback, /delete from|truncate|drop table/i);
});
