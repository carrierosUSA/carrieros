import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const workflow = readFileSync("../.github/workflows/verify.yml", "utf8");
const runtime = readFileSync(".nvmrc", "utf8").trim();
const readiness = readFileSync("scripts/testing-readiness.mjs", "utf8");

test("pull requests and the recovery branch run the full verified checkpoint", () => {
  assert.match(workflow, /pull_request:/);
  assert.match(workflow, /branches: \[main\]/);
  assert.match(workflow, /branches: \[codex\/live-dispatch-data\]/);
  assert.match(workflow, /run: npm run verify:testing/);
});

test("continuous verification uses locked installation and the declared Node runtime", () => {
  assert.equal(runtime, "22");
  assert.match(workflow, /node-version-file: carrieros-app\/\.nvmrc/);
  assert.match(workflow, /cache-dependency-path: carrieros-app\/package-lock\.json/);
  assert.match(workflow, /run: npm ci/);
});

test("workflow is least privilege bounded and cancellable", () => {
  assert.match(workflow, /permissions:\s+contents: read/);
  assert.match(workflow, /timeout-minutes: 25/);
  assert.match(workflow, /cancel-in-progress: true/);
  assert.doesNotMatch(workflow, /secrets\.|contents: write|pull-requests: write|deploy|supabase|migration/i);
});

test("third-party workflow actions are pinned to reviewed immutable revisions", () => {
  assert.match(
    workflow,
    /actions\/checkout@11d5960a326750d5838078e36cf38b85af677262 # v4\.4\.0/,
  );
  assert.match(
    workflow,
    /actions\/setup-node@49933ea5288caeca8642d1e84afbd3f7d6820020 # v4\.4\.0/,
  );

  const actionReferences = [...workflow.matchAll(/uses:\s+([^\s#]+)/g)].map(
    ([, reference]) => reference,
  );

  assert.deepEqual(actionReferences, [
    "actions/checkout@11d5960a326750d5838078e36cf38b85af677262",
    "actions/setup-node@49933ea5288caeca8642d1e84afbd3f7d6820020",
  ]);
  assert.ok(actionReferences.every((reference) => /@[0-9a-f]{40}$/.test(reference)));
});

test("local readiness requires the version and CI checkpoint files", () => {
  assert.match(readiness, /\.nvmrc/);
  assert.match(readiness, /\.github\/workflows\/verify\.yml/);
  assert.match(readiness, /least-privilege CI checkpoint/);
});
