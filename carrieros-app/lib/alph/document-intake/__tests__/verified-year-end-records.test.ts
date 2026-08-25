import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const migrationUrl = new URL("../../../../supabase/migrations/20260823130000_verified_year_end_records.sql", import.meta.url);
const rollbackUrl = new URL("../../../../supabase/rollback/20260823130000_verified_year_end_records_rollback.sql", import.meta.url);
const pageUrl = new URL("../../../../app/year-end/page.tsx", import.meta.url);

test("year-end reader is company-scoped, finance-only, and read-only", async () => {
  const sql = await readFile(migrationUrl, "utf8");
  assert.match(sql, /document_intake_company_id\(\)/);
  assert.match(sql, /r not in\('super_admin','owner','accounting'\)/);
  assert.match(sql, /where l\.company_id=c/);
  assert.match(sql, /where f\.company_id=c/);
  assert.doesNotMatch(sql, /insert into|update public|delete from/i);
});

test("completed load rates use the latest verified completion event and expose missing rates", async () => {
  const sql = await readFile(migrationUrl, "utf8");
  assert.match(sql, /x\.status in\('delivered','closed'\)order by x\.event_at desc limit 1/);
  assert.match(sql, /count\(\*\)filter\(where f\.rate_cents is null\)/);
  assert.match(sql, /l\.status in\('delivered','closed'\)/);
});

test("financial ledgers retain their distinct verification dates", async () => {
  const sql = await readFile(migrationUrl, "utf8");
  assert.match(sql, /f\.invoice_issued_at>=d/);
  assert.match(sql, /p\.paid_at>=d/);
  assert.match(sql, /e\.status='active'and e\.incurred_on>=d/);
  assert.match(sql, /f\.status='active'and f\.purchased_at>=d/);
  assert.match(sql, /s\.period_end>=d/);
  assert.match(sql, /s\.status='paid'and s\.paid_at>=d/);
});

test("year-end UI warns against automatic accounting conclusions", async () => {
  const page = await readFile(pageUrl, "utf8");
  assert.match(page, /not a tax return, deduction schedule, or income statement/i);
  assert.match(page, /Do not add or subtract these columns automatically/);
  assert.match(page, /Consult a qualified accountant or tax professional/);
  assert.doesNotMatch(page, /taxable income\s*=/i);
  assert.doesNotMatch(page, /net profit\s*=/i);
});

test("CSV export carries separate verified ledger values without derived tax fields", async () => {
  const page = await readFile(pageUrl, "utf8");
  assert.match(page, /Completed recorded rates/);
  assert.match(page, /Payments received/);
  assert.match(page, /Operating expense ledger/);
  assert.match(page, /Payroll approved/);
  assert.match(page, /Payroll paid/);
  assert.doesNotMatch(page, /Taxable income|Tax due|Net profit/);
});

test("year-end rollback removes only the read function", async () => {
  const sql = await readFile(rollbackUrl, "utf8");
  assert.match(sql, /drop function if exists public\.list_verified_year_end_records\(integer\)/i);
  assert.doesNotMatch(sql, /drop table/i);
});
