import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const migration = readFileSync(
  resolve(
    process.cwd(),
    "supabase/migrations/20260816190000_rate_confirmation_load_creation.sql",
  ),
  "utf8",
);
const rollback = readFileSync(
  resolve(
    process.cwd(),
    "supabase/rollback/20260816190000_rate_confirmation_load_creation_rollback.sql",
  ),
  "utf8",
);
const action = readFileSync(
  resolve(process.cwd(), "app/actions/load-intake.ts"),
  "utf8",
);
const documentRepository = readFileSync(
  resolve(
    process.cwd(),
    "lib/alph/document-intake/supabase-repository.ts",
  ),
  "utf8",
);

test("load creation is an authenticated role-scoped database transaction", () => {
  assert.match(
    migration,
    /v_role not in \('super_admin','owner','dispatcher'\)/,
  );
  assert.match(migration, /security definer/);
  assert.match(
    migration,
    /grant execute on function public\.create_load_from_confirmed_rate_confirmation\(uuid\) to authenticated/,
  );
  assert.match(action, /requireDocumentAuth\(\)/);
  assert.match(action, /canCreateLoads\(auth\.businessRole\)/);
});

test("only a confirmed current rate confirmation can create one source load", () => {
  assert.match(migration, /d\.document_type = 'rate_confirmation'/);
  assert.match(migration, /d\.status = 'ready'/);
  assert.match(migration, /a\.action_kind = 'confirm_document_review'/);
  assert.match(migration, /approval\.decision = 'approved'/);
  assert.match(migration, /f\.is_verified is not true/);
  assert.match(migration, /loads_one_source_document_uidx/);
});

test("load creation records approval and does not assign or authorize movement", () => {
  assert.match(migration, /insert into public\.document_approvals/);
  assert.match(migration, /insert into public\.load_events/);
  assert.match(migration, /insert into public\.document_audit_history/);
  assert.match(migration, /No driver was assigned and no movement was authorized/);
  assert.doesNotMatch(migration, /insert into public\.load_assignments/);
});

test("rollback disables future creation without deleting operational history", () => {
  assert.match(rollback, /drop function if exists/);
  assert.doesNotMatch(rollback, /delete from|truncate|drop table/i);
});

test("operational proposals never replace the document-review state", () => {
  const filters = documentRepository.match(
    /eq\("action_kind", "confirm_document_review"\)/g,
  );
  assert.ok(filters && filters.length >= 2);
  assert.match(
    documentRepository,
    /eq\("proposed_action_id", proposalId\)/,
  );
});
