import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const migration = readFileSync("supabase/migrations/20260825130000_verified_driver_contact_handoff.sql", "utf8").replace(/\s+/g, " ");
const rollback = readFileSync("supabase/rollback/20260825130000_verified_driver_contact_handoff_rollback.sql", "utf8").replace(/\s+/g, " ");
const repository = readFileSync("lib/operations/load-repository.ts", "utf8");
const page = readFileSync("app/dispatch/[loadId]/LoadDetailWorkspace.tsx", "utf8");

test("contact handoff is restricted to current eligible same-company drivers", () => {
  assert.match(migration, /current_business_role\(\) in \('super_admin','owner','dispatcher'\)/);
  assert.match(migration, /p\.company_id = public\.document_intake_company_id\(\)/);
  assert.match(migration, /business_role' = 'driver'/);
  assert.match(migration, /p\.status = 'active'/);
  assert.match(migration, /cdl_expires_on >= current_date/);
  assert.match(migration, /medical_card_expires_on >= current_date/);
});

test("only a validated E.164 account phone is returned", () => {
  assert.match(migration, /u\.phone ~ '\^\\\+\[1-9\]\[0-9\]\{7,14\}\$'/);
  assert.match(repository, /\^\\\+\[1-9\]\\d\{7,14\}\$/);
  assert.match(repository, /contactPhone: contactPhone\(entry\.contact_phone\)/);
});

test("contact controls require an assigned verified phone and only hand off to local apps", () => {
  assert.match(page, /<DriverContact phone=\{detail\.driverContactPhone\} assigned=\{Boolean\(detail\.driverUserId\)\}/);
  assert.match(page, /href=\{`tel:\$\{phone\}`\}/);
  assert.match(page, /href=\{`sms:\$\{phone\}`\}/);
  assert.match(page, /Driver account phone unavailable/);
  assert.doesNotMatch(page, /Communication provider coming soon/);
});

test("rollback removes phone output without deleting operational records", () => {
  assert.match(rollback, /preserving all driver, assignment, and audit records/);
  assert.doesNotMatch(rollback, /delete from|truncate|drop table/i);
  assert.match(rollback, /returns table\(user_id uuid, display_name text\)/);
});
