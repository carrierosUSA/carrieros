import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";

const requiredRoles=["owner","dispatcher","accounting","safety","maintenance","driver","read_only"];
const requiredFlows=["documentToPendingLoad","verifiedAssignmentAndDispatchGate","driverIsolationAndStopUpdates","podInvoiceAndClosure","invoiceAndPaymentBoundaries","novaReadOnlyBoundary"];
const requiredViewports=["phone","tablet","desktop"];
const requiredStops=["companyIsolation","driverIsolation","financialRoleBoundary","explicitMutationConfirmation","noPrivateValueExposure","reviewedMigrationIdentity"];
const allowedTopLevel=["environment","projectReferenceConfirmed","tester","testedAt","commit","automatedCheckpoint","roles","criticalFlows","viewports","stopConditions","notes"];
const forbiddenKey=/password|secret|token|credential|api.?key|service.?role.?key/i;
const maximumAcceptanceAgeMs=7*24*60*60*1000;
const futureClockToleranceMs=5*60*1000;

function object(value){return value!==null&&typeof value==="object"&&!Array.isArray(value)}
function passedGroup(value,names,label,failures){if(!object(value)){failures.push(`${label} is missing`);return}for(const name of names)if(value[name]!=="passed")failures.push(`${label}.${name} must equal passed`)}
function rejectUnknownKeys(value,names,label,failures){if(!object(value))return;const allowed=new Set(names);for(const key of Object.keys(value))if(!allowed.has(key))failures.push(`${label}.${key} is not allowed`)}
function inspectKeys(value,path,failures){if(!object(value))return;for(const[key,child]of Object.entries(value)){const next=path?`${path}.${key}`:key;if(forbiddenKey.test(key))failures.push(`${next} is a forbidden sensitive field`);inspectKeys(child,next,failures)}}

export function validateAcceptanceRecord(record,expectedCommit){
  const failures=[];
  if(!object(record))return["Acceptance record must be a JSON object"];
  inspectKeys(record,"",failures);
  rejectUnknownKeys(record,allowedTopLevel,"record",failures);
  if(record.environment!=="development")failures.push("environment must equal development");
  if(record.projectReferenceConfirmed!==true)failures.push("projectReferenceConfirmed must equal true");
  if(typeof record.tester!=="string"||record.tester.trim().length<2||record.tester.length>100||/REPLACE_|placeholder/i.test(record.tester))failures.push("tester must identify the development tester");
  const testedAt=typeof record.testedAt==="string"?Date.parse(record.testedAt):NaN,now=Date.now();
  if(!Number.isFinite(testedAt)||new Date(testedAt).toISOString()!==record.testedAt)failures.push("testedAt must be an exact UTC ISO timestamp");
  else if(testedAt>now+futureClockToleranceMs)failures.push("testedAt must not be in the future");
  else if(testedAt<now-maximumAcceptanceAgeMs)failures.push("testedAt must be no more than seven days old");
  if(typeof record.commit!=="string"||!/^[0-9a-f]{40}$/i.test(record.commit))failures.push("commit must be a full 40-character Git hash");
  else if(expectedCommit&&record.commit.toLowerCase()!==expectedCommit.toLowerCase())failures.push("commit must match the currently checked-out Git commit");
  if(record.automatedCheckpoint!=="passed")failures.push("automatedCheckpoint must equal passed");
  passedGroup(record.roles,requiredRoles,"roles",failures);
  passedGroup(record.criticalFlows,requiredFlows,"criticalFlows",failures);
  passedGroup(record.viewports,requiredViewports,"viewports",failures);
  passedGroup(record.stopConditions,requiredStops,"stopConditions",failures);
  rejectUnknownKeys(record.roles,requiredRoles,"roles",failures);
  rejectUnknownKeys(record.criticalFlows,requiredFlows,"criticalFlows",failures);
  rejectUnknownKeys(record.viewports,requiredViewports,"viewports",failures);
  rejectUnknownKeys(record.stopConditions,requiredStops,"stopConditions",failures);
  if(typeof record.notes!=="string"||record.notes.length>1000)failures.push("notes must be a string no longer than 1000 characters");
  return failures;
}

const path=process.argv[2];
if(!path){console.error("Usage: npm run acceptance:verify -- <local-record.json>");process.exit(2)}
let record;try{record=JSON.parse(readFileSync(path,"utf8"))}catch{console.error("Acceptance verification failed: record is missing or invalid JSON. No external action was performed.");process.exit(1)}
let currentCommit;try{currentCommit=execFileSync("git",["rev-parse","HEAD"],{encoding:"utf8",stdio:["ignore","pipe","ignore"]}).trim()}catch{console.error("Acceptance verification failed: current Git commit could not be verified. No external action was performed.");process.exit(1)}
if(!/^[0-9a-f]{40}$/i.test(currentCommit)){console.error("Acceptance verification failed: current Git commit could not be verified. No external action was performed.");process.exit(1)}
const failures=validateAcceptanceRecord(record,currentCommit);
if(failures.length){console.error("Acceptance verification failed:");for(const failure of failures)console.error(`- ${failure}`);console.error("No merge, deployment, migration, user, or production action was performed.");process.exit(1)}
console.log(`Development acceptance record passed: ${requiredRoles.length} roles, ${requiredFlows.length} critical flows, ${requiredViewports.length} viewports, and ${requiredStops.length} stop-condition boundaries verified. No record values printed and no external action performed.`);
