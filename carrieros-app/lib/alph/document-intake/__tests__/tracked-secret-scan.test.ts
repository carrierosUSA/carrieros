import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import test from "node:test";

const scanner=readFileSync("scripts/scan-tracked-secrets.mjs","utf8");
const pkg=readFileSync("package.json","utf8");

test("tracked source passes the credential-pattern scan without exposing values",()=>{
  const result=spawnSync(process.execPath,["scripts/scan-tracked-secrets.mjs"],{encoding:"utf8"});
  assert.equal(result.status,0,result.stderr);
  assert.match(result.stdout,/tracked paths checked against 9 credential classes/);
  assert.match(result.stdout,/No values printed and no external action performed/);
});

test("tracked-secret scan covers high-risk provider and private-key classes",()=>{
  for(const label of ["private key","OpenAI credential","GitHub credential","AWS access key","Slack credential","Stripe live credential","Supabase secret","Twilio API key","credential-bearing database URL"])assert.ok(scanner.includes(label));
  assert.match(scanner,/git",\["ls-files","-z"\]/);
  assert.match(scanner,/Matched values were not printed/);
  assert.match(scanner,/unreadable tracked file/);
});

test("testing and release checkpoints both run the tracked-secret scan",()=>{
  assert.match(pkg,/"security:scan": "node scripts\/scan-tracked-secrets\.mjs"/);
  for(const command of ["verify:testing","verify:release"]){
    const line=pkg.split("\n").find(value=>value.includes(`\"${command}\"`));
    assert.ok(line?.includes("security:scan"),`${command} must include security:scan`);
  }
});
