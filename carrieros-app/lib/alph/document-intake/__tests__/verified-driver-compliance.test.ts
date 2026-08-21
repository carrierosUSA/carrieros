import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";
const migration=readFileSync(resolve(process.cwd(),"supabase/migrations/20260822030000_verified_driver_compliance.sql"),"utf8");
const rollback=readFileSync(resolve(process.cwd(),"supabase/rollback/20260822030000_verified_driver_compliance_rollback.sql"),"utf8");
const actions=readFileSync(resolve(process.cwd(),"app/actions/drivers.ts"),"utf8");

test("driver profiles are company-isolated and contain no SSN",()=>{assert.match(migration,/create table public\.driver_profiles/);assert.match(migration,/unique \(company_id, driver_user_id\)/);assert.match(migration,/enable row level security/);assert.doesNotMatch(migration,/social_security|\bssn\b/i)});
test("profiles require existing same-company driver accounts",()=>{assert.match(migration,/from auth\.users u where u\.id = p_driver_user_id/);assert.match(migration,/raw_app_meta_data ->> 'company_id' = v_company::text/);assert.match(migration,/raw_app_meta_data ->> 'business_role' = 'driver'/)});
test("compliance writes are safety scoped and append audited",()=>{assert.match(migration,/v_role not in \('super_admin','owner','safety'\)/);assert.match(migration,/create table public\.driver_profile_events/);assert.match(migration,/unique \(company_id, request_id\)/);assert.doesNotMatch(migration,/grant (?:insert|update|delete).*driver_profiles to authenticated/i)});
test("assignment requires active driver with current CDL and medical card",()=>{assert.match(migration,/before insert or update of driver_user_id/);assert.match(migration,/p\.status = 'active'/);assert.match(migration,/p\.cdl_expires_on >= current_date/);assert.match(migration,/p\.medical_card_expires_on >= current_date/);assert.match(migration,/create or replace function public\.list_assignable_company_drivers/)});
test("server action authenticates and uses atomic profile RPC",()=>{assert.match(actions,/requireDocumentAuth\(\)/);assert.match(actions,/db\.rpc\("save_verified_driver_profile"/);assert.match(actions,/\["super_admin","owner","safety"\]/)});
test("rollback preserves driver compliance and audit history",()=>{assert.match(rollback,/preserves history/);assert.doesNotMatch(rollback,/delete from|truncate|drop table/i)});
