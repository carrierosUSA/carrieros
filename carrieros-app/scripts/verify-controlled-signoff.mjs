import { spawnSync } from "node:child_process";

const acceptancePath=process.argv[2];
const provenancePath=process.argv[3];
if(!acceptancePath||!provenancePath){
  console.error("Usage: npm run signoff:verify -- <acceptance-record.json> <release-provenance.json>");
  console.error("No merge, deployment, migration, user, or production action was performed.");
  process.exit(2);
}

function verify(script,args,label){
  const result=spawnSync(process.execPath,[script,...args],{encoding:"utf8",stdio:["ignore","pipe","pipe"]});
  if(result.status!==0){
    console.error(`Controlled signoff failed: ${label} did not pass its independent verifier.`);
    console.error(`Run the ${label} verifier separately for value-safe failure details.`);
    console.error("No merge, deployment, migration, user, or production action was performed.");
    process.exit(1);
  }
}

verify("scripts/verify-acceptance-record.mjs",[acceptancePath],"acceptance record");
verify("scripts/release-provenance.mjs",["verify",provenancePath],"release provenance");

console.log("Controlled development signoff passed: fresh human acceptance and clean release provenance independently match the exact current commit. No evidence values printed and no merge, deployment, migration, user, or production action performed.");
