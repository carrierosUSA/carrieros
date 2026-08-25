import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const sql = readFileSync("supabase/migrations/20260822230000_verified_truck_profitability.sql", "utf8").replace(/\s+/g, " ");
const rollback = readFileSync("supabase/rollback/20260822230000_verified_truck_profitability_rollback.sql", "utf8").replace(/\s+/g, " ");
const action = readFileSync("app/actions/profitability.ts", "utf8");
const page = readFileSync("app/profitability/page.tsx", "utf8");

test("truck profitability is finance-only, company-scoped, and read-only", () => {
  assert.match(sql, /v_role not in \('super_admin','owner','accounting'\)/);
  assert.match(sql, /l\.company_id=v_company/);
  assert.match(sql, /e\.company_id=v_company/);
  assert.doesNotMatch(sql, /insert into|update public|delete from/);
});

test("earned revenue needs a verified lifecycle event and latest truck assignment", () => {
  assert.match(sql, /e\.event_type='status_changed' and e\.status in \('delivered','closed'\)/);
  assert.match(sql, /order by x\.approved_at desc limit 1/);
  assert.match(sql, /l\.status in \('delivered','closed'\)/);
  assert.match(sql, /count\(e\.id\) filter\(where e\.rate_cents is null\)/);
});

test("only active assigned expenses affect truck contribution", () => {
  assert.match(sql, /e\.status='active'.*e\.asset_id is not null/);
  assert.match(sql, /r\.revenue_cents-coalesce\(x\.expense_cents,0\)/);
  assert.match(sql, /e\.asset_id is null/);
});

test("server action reauthenticates and limits the reporting period", () => {
  assert.match(action, /requireDocumentAuth\(\)/);
  assert.match(action, /super_admin.*owner.*accounting/);
  assert.match(sql, /p_end - p_start > 366/);
});

test("UI discloses exclusions, missing data, and accounting boundary", () => {
  assert.match(page, /not a tax return or accounting statement/);
  assert.match(page, /preventing automatic double counting/);
  assert.match(page, /Missing rates remain visible as incomplete data/);
  assert.match(page, /never allocated automatically/);
});

test("rollback removes only the derived reader", () => {
  assert.match(rollback, /drop function if exists public\.list_verified_truck_profitability/);
  assert.doesNotMatch(rollback, /drop table|delete from/);
});
