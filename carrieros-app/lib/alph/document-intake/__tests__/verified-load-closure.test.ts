import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const migration = readFileSync(resolve(process.cwd(), "supabase/migrations/20260821210000_verified_load_closure.sql"), "utf8");
const rollback = readFileSync(resolve(process.cwd(), "supabase/rollback/20260821210000_verified_load_closure_rollback.sql"), "utf8");
const action = readFileSync(resolve(process.cwd(), "app/actions/dispatch.ts"), "utf8");

test("closure documents are linked by company-safe foreign keys", () => {
  assert.match(migration, /create table public\.load_document_links/);
  assert.match(migration, /load_document_links_load_company_fk/);
  assert.match(migration, /load_document_links_document_company_fk/);
  assert.match(migration, /enable row level security/);
  assert.doesNotMatch(migration, /grant (?:insert|update|delete).*load_document_links to authenticated/i);
});

test("only current human-approved POD and invoice qualify", () => {
  assert.match(migration, /d\.document_type = p_type/);
  assert.match(migration, /d\.status = 'ready'/);
  assert.match(migration, /r\.document_version_id = d\.current_version_id/);
  assert.match(migration, /a\.status = 'approved'/);
  assert.match(migration, /approval\.decision = 'approved'/);
});

test("linking evidence is role-scoped, idempotent, and never closes", () => {
  assert.match(migration, /v_role not in \('super_admin','owner','dispatcher'\)/);
  assert.match(migration, /e\.request_id = p_request_id/);
  assert.match(migration, /Load was not closed/);
  const linkFunction = migration.slice(migration.indexOf("public.link_verified_closure_document"), migration.indexOf("public.close_verified_load"));
  assert.doesNotMatch(linkFunction, /update public\.loads set status/);
});

test("closure requires delivered state, both documents, and resolved exceptions", () => {
  assert.match(migration, /v_status <> 'delivered'/);
  assert.match(migration, /l\.document_type = 'pod'/);
  assert.match(migration, /l\.document_type = 'invoice'/);
  assert.match(migration, /p_exceptions_resolved is not true/);
  assert.match(migration, /v_exception is not null and p_note is null/);
  assert.match(migration, /set status = 'closed', exception_summary = null/);
});

test("server actions re-authenticate and use atomic RPCs", () => {
  assert.match(action, /requireDocumentAuth\(\)/);
  assert.match(action, /db\.rpc\("link_verified_closure_document"/);
  assert.match(action, /db\.rpc\("close_verified_load"/);
});

test("rollback preserves document links and operational history", () => {
  assert.match(rollback, /disable future closure operations/);
  assert.doesNotMatch(rollback, /delete from|truncate|drop table/i);
});
