import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import test from "node:test";

const script=readFileSync("scripts/verify-controlled-signoff.mjs","utf8");
const pkg=readFileSync("package.json","utf8");
const guide=readFileSync("docs/testing-handoff.md","utf8");

test("controlled signoff requires both evidence files and performs no action",()=>{
  const result=spawnSync(process.execPath,["scripts/verify-controlled-signoff.mjs"],{encoding:"utf8"});
  assert.equal(result.status,2);
  assert.match(result.stderr,/acceptance-record\.json.*release-provenance\.json/);
  assert.match(result.stderr,/No merge, deployment, migration, user, or production action was performed/);
});

test("controlled signoff verifies human acceptance before clean provenance",()=>{
  const acceptance=script.indexOf('verify("scripts/verify-acceptance-record.mjs"');
  const provenance=script.indexOf('verify("scripts/release-provenance.mjs"');
  assert.ok(acceptance>0&&provenance>acceptance);
  assert.match(script,/stdio:\["ignore","pipe","pipe"\]/);
  assert.match(script,/No evidence values printed/);
  assert.doesNotMatch(script,/merge\(|deploy\(|supabase|migration.*apply|git.*push/i);
});

test("controlled signoff is documented but never added to unattended CI",()=>{
  assert.match(pkg,/"signoff:verify": "node scripts\/verify-controlled-signoff\.mjs"/);
  assert.match(guide,/npm run signoff:verify --/);
  assert.match(guide,/does not authorize a merge, migration, deployment or production change/);
  assert.doesNotMatch(readFileSync("../.github/workflows/verify.yml","utf8"),/signoff:verify/);
});
