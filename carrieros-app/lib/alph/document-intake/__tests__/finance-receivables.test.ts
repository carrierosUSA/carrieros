import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const migration = readFileSync(resolve(process.cwd(), "supabase/migrations/20260821230000_finance_receivables.sql"), "utf8");
const rollback = readFileSync(resolve(process.cwd(), "supabase/rollback/20260821230000_finance_receivables_rollback.sql"), "utf8");
const actions = readFileSync(resolve(process.cwd(), "app/actions/finance.ts"), "utf8");
const page = readFileSync(resolve(process.cwd(), "app/finance/page.tsx"), "utf8");

test("finance reads and writes are restricted to owners and accounting", () => {
  assert.match(migration, /current_business_role\(\) in \('super_admin','owner','accounting'\)/);
  assert.doesNotMatch(migration, /current_business_role\(\) in \([^)]*driver/);
  assert.match(actions, /\["super_admin", "owner", "accounting"\]/);
});

test("invoice requires delivered load, verified rate, and approved linked document", () => {
  assert.match(migration, /v_status not in \('delivered','closed'\)/);
  assert.match(migration, /l\.document_type = 'invoice'/);
  assert.match(migration, /public\.is_current_approved_document\(l\.document_id, 'invoice'\)/);
  assert.match(migration, /Verified load rate is not available/);
});

test("payment rows are append-only, idempotent, and cannot exceed balance", () => {
  assert.match(migration, /create table public\.load_payments/);
  assert.match(migration, /unique \(company_id, request_id\)/);
  assert.match(migration, /v_paid \+ p_amount_cents > v_rate/);
  assert.doesNotMatch(migration, /grant (?:update|delete).*load_payments/i);
});

test("partial and full payment states derive from verified totals", () => {
  assert.match(migration, /then 'paid' else 'partial'/);
  assert.match(migration, /paid_cents = v_paid \+ p_amount_cents/);
});

test("server actions authenticate, validate, and use atomic finance RPCs", () => {
  assert.match(actions, /requireDocumentAuth\(\)/);
  assert.match(actions, /db\.rpc\("record_verified_invoice"/);
  assert.match(actions, /db\.rpc\("record_verified_payment"/);
  assert.match(page, /crypto\.randomUUID/);
});

test("rollback preserves all invoice and payment history", () => {
  assert.match(rollback, /preserves invoice\/payment history/);
  assert.doesNotMatch(rollback, /delete from|truncate|drop table|drop column/i);
});
