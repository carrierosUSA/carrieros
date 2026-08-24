import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { evaluateCoreConfiguration } from "../../../system/config-validation";

const valid = {
  NEXT_PUBLIC_SUPABASE_URL: "https://abcdefghijklmnopqrst.supabase.co",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key-value-12345",
  SUPABASE_SERVICE_ROLE_KEY: "service-key-value-67890",
  OPENAI_API_KEY: "openai-key-value-12345",
  ALPH_DOCUMENT_BUCKET: "company-documents",
};

test("valid core configuration satisfies every value-free readiness gate", () => {
  assert.deepEqual(evaluateCoreConfiguration(valid), {
    supabaseUrl: true,
    supabaseAnonKey: true,
    supabaseServiceRole: true,
    openAiKey: true,
    documentBucket: true,
  });
});

test("malformed URLs placeholders and unsafe bucket names fail closed", () => {
  const state = evaluateCoreConfiguration({
    ...valid,
    NEXT_PUBLIC_SUPABASE_URL: "http://example.com",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: "YOUR_ANON_KEY",
    OPENAI_API_KEY: "placeholder",
    ALPH_DOCUMENT_BUCKET: "../unsafe bucket",
  });
  assert.equal(state.supabaseUrl, false);
  assert.equal(state.supabaseAnonKey, false);
  assert.equal(state.openAiKey, false);
  assert.equal(state.documentBucket, false);
});

test("anonymous and service credentials must be distinct", () => {
  const shared = "shared-credential-value";
  const state = evaluateCoreConfiguration({
    ...valid,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: shared,
    SUPABASE_SERVICE_ROLE_KEY: shared,
  });
  assert.equal(state.supabaseAnonKey, true);
  assert.equal(state.supabaseServiceRole, false);
});

test("release preflight enforces the same high-risk boundaries", () => {
  const release = readFileSync("scripts/release-preflight.mjs", "utf8");
  assert.match(release, /\[a-z0-9\]\{20\}/);
  assert.match(release, /must not be identical/);
  assert.match(release, /bucket\.length>100/);
  assert.doesNotMatch(release, /console\.(?:log|error)\([^)]*process\.env/);
});
