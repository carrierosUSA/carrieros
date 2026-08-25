import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";

const script=readFileSync("scripts/release-provenance.mjs","utf8");

test("release provenance inspection exposes only hashes and value-free metadata",()=>{
  const result=spawnSync(process.execPath,["scripts/release-provenance.mjs","inspect"],{encoding:"utf8"});
  assert.equal(result.status,0,result.stderr);
  const record=JSON.parse(result.stdout);
  assert.deepEqual(Object.keys(record),["schemaVersion","commit","nodeVersion","packageLockSha256","migrations","rollbacks","verificationWorkflowSha256","workingTreeClean"]);
  assert.match(record.commit,/^[0-9a-f]{40}$/);
  assert.match(record.packageLockSha256,/^[0-9a-f]{64}$/);
  assert.match(record.verificationWorkflowSha256,/^[0-9a-f]{64}$/);
  assert.ok(record.migrations.count>=1);
  assert.match(record.migrations.sha256,/^[0-9a-f]{64}$/);
  assert.ok(record.rollbacks.count>=1);
  assert.match(record.rollbacks.sha256,/^[0-9a-f]{64}$/);
  assert.doesNotMatch(result.stdout,/password|secret|token|credential|api.?key|service.?role.?key/i);
});

test("release provenance rejects malformed and expanded schemas without echoing values",()=>{
  const directory=mkdtempSync(join(tmpdir(),"transpo-provenance-"));
  const path=join(directory,"record.json");
  try{
    writeFileSync(path,JSON.stringify({schemaVersion:1,privateValue:"must-not-print"}));
    const result=spawnSync(process.execPath,["scripts/release-provenance.mjs","verify",path],{encoding:"utf8"});
    assert.equal(result.status,1);
    assert.match(result.stderr,/exact release provenance schema/);
    assert.doesNotMatch(result.stderr,/must-not-print/);
    assert.match(result.stderr,/No merge, deployment, migration, user, or production action was performed/);
  }finally{rmSync(directory,{recursive:true,force:true})}
});

test("release provenance creation is restricted to ignored local evidence",()=>{
  assert.match(script,/output must remain inside testing-records\//);
  assert.match(script,/flag:"wx"/);
  assert.match(script,/tracked Git worktree must be clean/);
  assert.match(script,/--untracked-files=no/);
  assert.match(script,/packageLockSha256/);
  assert.match(script,/rollbacks:sqlSet/);
  assert.match(script,/verificationWorkflowSha256/);
});
