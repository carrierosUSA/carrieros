import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";

const script = readFileSync("scripts/verify-acceptance-record.mjs", "utf8");
const example = JSON.parse(readFileSync("docs/development-acceptance-record.example.json", "utf8"));
const currentCommit = spawnSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).stdout.trim();

function passedRecord() {
  const passed = (names: string[]) => Object.fromEntries(names.map((name) => [name, "passed"]));
  return {
    environment: "development",
    projectReferenceConfirmed: true,
    tester: "Sanitized development tester",
    testedAt: new Date().toISOString(),
    commit: currentCommit,
    automatedCheckpoint: "passed",
    roles: passed(["owner","dispatcher","accounting","safety","maintenance","driver","read_only"]),
    criticalFlows: passed(["documentToPendingLoad","verifiedAssignmentAndDispatchGate","driverIsolationAndStopUpdates","podInvoiceAndClosure","invoiceAndPaymentBoundaries","novaReadOnlyBoundary"]),
    viewports: passed(["phone","tablet","desktop"]),
    stopConditions: passed(["companyIsolation","driverIsolation","financialRoleBoundary","explicitMutationConfirmation","noPrivateValueExposure","reviewedMigrationIdentity"]),
    notes: "Sanitized fixture only.",
  };
}

test("example is explicitly pending and contains no sensitive fields", () => {
  assert.equal(example.environment, "development");
  assert.equal(example.projectReferenceConfirmed, false);
  assert.equal(example.automatedCheckpoint, "pending");
  assert.doesNotMatch(JSON.stringify(example), /password|secret|token|credential|api.?key|service.?role.?key/i);
});

test("complete sanitized acceptance evidence passes without printing record values", () => {
  const directory = mkdtempSync(join(tmpdir(), "transpo-acceptance-"));
  const path = join(directory, "record.json");
  try {
    writeFileSync(path, JSON.stringify(passedRecord()));
    const result = spawnSync(process.execPath, ["scripts/verify-acceptance-record.mjs", path], { encoding: "utf8" });
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /7 roles, 6 critical flows, 3 viewports, and 6 stop-condition boundaries verified/);
    assert.doesNotMatch(result.stdout, new RegExp(`Sanitized development tester|${currentCommit}`, "i"));
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test("acceptance evidence for a different commit fails closed", () => {
  const directory = mkdtempSync(join(tmpdir(), "transpo-acceptance-"));
  const path = join(directory, "record.json");
  const staleCommit = currentCommit === "a".repeat(40) ? "b".repeat(40) : "a".repeat(40);
  try {
    writeFileSync(path, JSON.stringify({ ...passedRecord(), commit: staleCommit }));
    const result = spawnSync(process.execPath, ["scripts/verify-acceptance-record.mjs", path], { encoding: "utf8" });
    assert.equal(result.status, 1);
    assert.match(result.stderr, /commit must match the currently checked-out Git commit/);
    assert.doesNotMatch(result.stderr, new RegExp(`${currentCommit}|${staleCommit}`, "i"));
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test("non-UTC future and stale acceptance timestamps fail closed", () => {
  const directory = mkdtempSync(join(tmpdir(), "transpo-acceptance-"));
  const cases = [
    { testedAt: new Date().toString(), message: /exact UTC ISO timestamp/ },
    { testedAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(), message: /must not be in the future/ },
    { testedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(), message: /no more than seven days old/ },
  ];
  try {
    for (const [index, testCase] of cases.entries()) {
      const path = join(directory, `record-${index}.json`);
      writeFileSync(path, JSON.stringify({ ...passedRecord(), testedAt: testCase.testedAt }));
      const result = spawnSync(process.execPath, ["scripts/verify-acceptance-record.mjs", path], { encoding: "utf8" });
      assert.equal(result.status, 1);
      assert.match(result.stderr, testCase.message);
      assert.doesNotMatch(result.stderr, new RegExp(testCase.testedAt.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    }
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test("unknown root and group fields fail the exact acceptance schema", () => {
  const directory = mkdtempSync(join(tmpdir(), "transpo-acceptance-"));
  const path = join(directory, "record.json");
  const record = passedRecord();
  try {
    writeFileSync(path, JSON.stringify({
      ...record,
      privateNotes: "must-not-be-printed",
      roles: { ...record.roles, auditor: "passed" },
    }));
    const result = spawnSync(process.execPath, ["scripts/verify-acceptance-record.mjs", path], { encoding: "utf8" });
    assert.equal(result.status, 1);
    assert.match(result.stderr, /record\.privateNotes is not allowed/);
    assert.match(result.stderr, /roles\.auditor is not allowed/);
    assert.doesNotMatch(result.stderr, /must-not-be-printed/);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test("pending cross-environment and sensitive records fail closed", () => {
  const directory = mkdtempSync(join(tmpdir(), "transpo-acceptance-"));
  const path = join(directory, "record.json");
  try {
    writeFileSync(path, JSON.stringify({ ...passedRecord(), environment: "production", apiKey: "forbidden" }));
    const result = spawnSync(process.execPath, ["scripts/verify-acceptance-record.mjs", path], { encoding: "utf8" });
    assert.equal(result.status, 1);
    assert.match(result.stderr, /environment must equal development/);
    assert.match(result.stderr, /forbidden sensitive field/);
    assert.match(result.stderr, /No merge, deployment, migration, user, or production action was performed/);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test("verifier covers required role flow viewport and stop-condition groups", () => {
  for (const group of ["requiredRoles","requiredFlows","requiredViewports","requiredStops"]) assert.ok(script.includes(group));
  assert.match(script, /commit must be a full 40-character Git hash/);
  assert.match(script, /commit must match the currently checked-out Git commit/);
  assert.match(script, /git",\["rev-parse","HEAD"\]/);
  assert.match(script, /maximumAcceptanceAgeMs=7\*24\*60\*60\*1000/);
  assert.match(script, /testedAt must be an exact UTC ISO timestamp/);
  assert.match(script, /rejectUnknownKeys/);
  assert.match(script, /allowedTopLevel/);
  assert.match(script, /No record values printed/);
});
