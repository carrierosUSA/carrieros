import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import test from "node:test";

const foundation = readFileSync(
  "supabase/migrations/20260720090000_document_intake_foundation.sql",
  "utf8",
).replace(/\s+/g, " ");
const grants = readFileSync(
  "supabase/migrations/20260720210000_document_intake_role_grants.sql",
  "utf8",
).replace(/\s+/g, " ");

test("only reviewed document and load-operation migrations are present", () => {
  assert.deepEqual(readdirSync("supabase/migrations").sort(), [
    "20260720090000_document_intake_foundation.sql",
    "20260720210000_document_intake_role_grants.sql",
    "20260814110000_document_intake_hardening.sql",
    "20260814120000_load_operations_foundation.sql",
    "20260816190000_rate_confirmation_load_creation.sql",
    "20260821150000_load_update_workflow.sql",
    "20260821170000_load_assignment_workflow.sql",
    "20260821190000_dispatch_release_gate.sql",
    "20260821210000_verified_load_closure.sql",
    "20260821230000_finance_receivables.sql",
    "20260822010000_verified_fleet_registry.sql",
    "20260822030000_verified_driver_compliance.sql",
    "20260822050000_verified_maintenance.sql",
    "20260822070000_verified_driver_payroll.sql",
    "20260822090000_verified_company_settings.sql",
    "20260822110000_verified_fuel_ifta_ledger.sql",
    "20260822130000_verified_team_access.sql",
    "20260822150000_verified_broker_directory.sql",
    "20260822170000_broker_load_verification_gate.sql",
  ]);
});

test("RLS derives company and approval role from app metadata", () => {
  assert.match(foundation, /auth\.jwt\(\) -> 'app_metadata' ->> 'company_id'/);
  assert.match(foundation, /auth\.jwt\(\) -> 'app_metadata' ->> 'business_role'/);
  assert.match(foundation, /alter table public\.documents enable row level security/);
  assert.match(foundation, /auth\.uid\(\) = decided_by/);
});

test("role grants preserve least privilege", () => {
  assert.match(grants, /from anon, authenticated, service_role/);
  assert.match(grants, /grant insert on table public\.document_approvals to authenticated/);
  assert.doesNotMatch(grants, /grant (?:insert|update|delete) on table public\.documents to authenticated/);
});
