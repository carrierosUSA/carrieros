import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const sql = readFileSync("supabase/migrations/20260822210000_verified_operating_expenses.sql", "utf8").replace(/\s+/g, " ");
const rollback = readFileSync("supabase/rollback/20260822210000_verified_operating_expenses_rollback.sql", "utf8").replace(/\s+/g, " ");
const action = readFileSync("app/actions/expenses.ts", "utf8");
const page = readFileSync("app/expenses/page.tsx", "utf8");

test("expense records and events are company scoped and finance restricted", () => {
  assert.match(sql, /expense_asset_company_fk foreign key\(company_id,asset_id\)/);
  assert.match(sql, /company_id=public\.document_intake_company_id\(\).*current_business_role\(\)in\('super_admin','owner','accounting'\)/);
  assert.match(sql, /revoke all privileges on table public\.operating_expenses,public\.operating_expense_events from public,anon,authenticated,service_role/);
});

test("recording validates factual inputs, same-company assets, and idempotency", () => {
  assert.match(sql, /p_incurred_on>current_date\+1/);
  assert.match(sql, /p_amount_cents is null or p_amount_cents<=0/);
  assert.match(sql, /Same-company asset not found/);
  assert.match(sql, /where company_id=c and request_id=p_request_id/);
  assert.match(sql, /'recorded',trim\(p_note\),u,p_request_id\|\|':recorded'/);
});

test("corrections void rather than delete and preserve an audit event", () => {
  assert.match(sql, /set status='voided',updated_at=now\(\)/);
  assert.match(sql, /'voided',trim\(p_reason\),u,p_request_id/);
  assert.doesNotMatch(sql, /delete from public\.operating_expenses/);
  assert.doesNotMatch(rollback, /drop table/);
});

test("server actions reauthorize and only invoke guarded RPCs", () => {
  assert.match(action, /requireDocumentAuth\(\)/);
  assert.match(action, /record_verified_operating_expense/);
  assert.match(action, /void_verified_operating_expense/);
  assert.match(action, /\^\[0-9a-f\]\{8\}/);
});

test("expense UI warns about duplicates and avoids accounting claims", () => {
  assert.match(page, /avoid duplicate entry/);
  assert.match(page, /No tax treatment inferred/);
  assert.match(page, /Consult an accountant for tax treatment/);
  assert.match(page, /Void and preserve history/);
});
