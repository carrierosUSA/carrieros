import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const repository = readFileSync(
  "lib/alph/document-intake/supabase-repository.ts",
  "utf8",
);
const actions = readFileSync("app/actions/document-center.ts", "utf8");
const auth = readFileSync("lib/auth/supabase-server.ts", "utf8");

test("protected requests use server-verified authentication", () => {
  assert.match(auth, /auth\.getUser\(\)/);
  assert.match(auth, /deriveVerifiedSupabaseIdentity\(user\)/);
  assert.match(actions, /requireDocumentAuth\(\)/);
});

test("approval uses the authenticated user client", () => {
  assert.match(
    repository,
    /getSupabaseAuthenticatedUserClient\(input\.accessToken\)/,
  );
  assert.match(repository, /requires_approval: true/);
  assert.match(repository, /isDocumentConfirmationFinal/);
});

test("document intake has no operational or financial table writes", () => {
  assert.doesNotMatch(
    `${repository}\n${actions}`,
    /\.from\("(?:loads|invoices|payments|payroll|settlements|accounting_entries)"\)/,
  );
});

test("server logs never receive document or credential content", () => {
  assert.doesNotMatch(`${repository}\n${actions}`, /console\.(?:log|error|warn)/);
});
