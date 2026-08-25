import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const migration = readFileSync(resolve(process.cwd(), "supabase/migrations/20260822010000_verified_fleet_registry.sql"), "utf8");
const rollback = readFileSync(resolve(process.cwd(), "supabase/rollback/20260822010000_verified_fleet_registry_rollback.sql"), "utf8");
const actions = readFileSync(resolve(process.cwd(), "app/actions/fleet.ts"), "utf8");

test("fleet assets are company-isolated and uniquely identified", () => {
  assert.match(migration, /create table public\.fleet_assets/);
  assert.match(migration, /unique \(company_id, asset_type, unit_number\)/);
  assert.match(migration, /unique \(company_id, vin\)/);
  assert.match(migration, /enable row level security/);
});

test("fleet writes are restricted and append audited", () => {
  assert.match(migration, /v_role not in \('super_admin','owner','maintenance','safety'\)/);
  assert.match(migration, /create table public\.fleet_asset_events/);
  assert.match(migration, /unique \(company_id, request_id\)/);
  assert.doesNotMatch(migration, /grant (?:insert|update|delete).*fleet_assets to authenticated/i);
});

test("VIN and compliance dates require human-verified factual values", () => {
  assert.match(migration, /\^\[A-HJ-NPR-Z0-9\]\{17\}\$/);
  assert.match(migration, /p_annual_inspection_expires_on is null/);
  assert.match(migration, /p_registration_expires_on is null/);
  assert.match(actions, /\^\[A-HJ-NPR-Z0-9\]\{17\}\$/);
});

test("load assignments require active current registry equipment", () => {
  assert.match(migration, /before insert or update of truck_unit, trailer_unit/);
  assert.match(migration, /a\.asset_type = 'truck'/);
  assert.match(migration, /a\.asset_type = 'trailer'/);
  assert.match(migration, /a\.status = 'active'/);
  assert.match(migration, /a\.annual_inspection_expires_on >= current_date/);
  assert.match(migration, /a\.registration_expires_on >= current_date/);
});

test("server action re-authenticates and uses atomic registry RPC", () => {
  assert.match(actions, /requireDocumentAuth\(\)/);
  assert.match(actions, /db\.rpc\("save_verified_fleet_asset"/);
});

test("rollback preserves fleet assets and audit history", () => {
  assert.match(rollback, /preserves fleet history/);
  assert.doesNotMatch(rollback, /delete from|truncate|drop table/i);
});
