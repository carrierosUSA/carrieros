import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";

const root=process.cwd();
const testingRecords=resolve(root,"testing-records");
const defaultRecord=join(testingRecords,"release-provenance.json");
const exactRootKeys=["schemaVersion","commit","nodeVersion","packageLockSha256","migrations","rollbacks","verificationWorkflowSha256"];
const exactSqlSetKeys=["count","sha256"];
const hash=value=>createHash("sha256").update(value).digest("hex");
const object=value=>value!==null&&typeof value==="object"&&!Array.isArray(value);
const exactKeys=(value,keys)=>object(value)&&Object.keys(value).length===keys.length&&keys.every(key=>Object.hasOwn(value,key));

function git(args){return execFileSync("git",args,{cwd:root,encoding:"utf8",stdio:["ignore","pipe","ignore"]}).trim()}
function clean(){try{return git(["status","--porcelain","--untracked-files=no"])===""}catch{return false}}
function fileHash(path){return hash(readFileSync(path))}
function sqlSet(directory){
  const entries=readdirSync(directory)
    .filter(name=>name.endsWith(".sql")&&statSync(join(directory,name)).isFile())
    .sort()
    .map(name=>`${name}\0${fileHash(join(directory,name))}\n`);
  return{count:entries.length,sha256:hash(entries.join(""))};
}

function currentProvenance(){
  return {
    schemaVersion:1,
    commit:git(["rev-parse","HEAD"]),
    nodeVersion:process.version,
    packageLockSha256:fileHash(join(root,"package-lock.json")),
    migrations:sqlSet(join(root,"supabase","migrations")),
    rollbacks:sqlSet(join(root,"supabase","rollback")),
    verificationWorkflowSha256:fileHash(join(root,"..",".github","workflows","verify.yml")),
  };
}

function validate(record){
  const failures=[];
  if(!exactKeys(record,exactRootKeys))return["record must use the exact release provenance schema"];
  if(record.schemaVersion!==1)failures.push("schemaVersion must equal 1");
  if(typeof record.commit!=="string"||!/^[0-9a-f]{40}$/i.test(record.commit))failures.push("commit must be a full Git hash");
  if(typeof record.nodeVersion!=="string"||!/^v\d+\.\d+\.\d+$/.test(record.nodeVersion))failures.push("nodeVersion must be an exact Node.js version");
  for(const key of ["packageLockSha256","verificationWorkflowSha256"])if(typeof record[key]!=="string"||!/^[0-9a-f]{64}$/i.test(record[key]))failures.push(`${key} must be a SHA-256 digest`);
  for(const key of ["migrations","rollbacks"]){
    if(!exactKeys(record[key],exactSqlSetKeys))failures.push(`${key} must use the exact provenance schema`);
    else{
      if(!Number.isInteger(record[key].count)||record[key].count<1)failures.push(`${key}.count must be a positive integer`);
      if(typeof record[key].sha256!=="string"||!/^[0-9a-f]{64}$/i.test(record[key].sha256))failures.push(`${key}.sha256 must be a SHA-256 digest`);
    }
  }
  return failures;
}

function safeOutputPath(value){
  const path=resolve(root,value??relative(root,defaultRecord));
  if(path!==testingRecords&&!path.startsWith(`${testingRecords}${sep}`))throw new Error("output must remain inside testing-records/");
  return path;
}

function fail(messages){console.error("Release provenance verification failed:");for(const message of messages)console.error(`- ${message}`);console.error("No merge, deployment, migration, user, or production action was performed.");process.exit(1)}

const command=process.argv[2];
if(!["inspect","create","verify"].includes(command)){console.error("Usage: npm run provenance:inspect | npm run provenance:create -- [testing-records/file.json] | npm run provenance:verify -- <testing-records/file.json>");process.exit(2)}

let expected;try{expected=currentProvenance()}catch{fail(["reviewed source metadata could not be read"])}
if(command==="inspect"){
  console.log(JSON.stringify({...expected,workingTreeClean:clean()},null,2));
  process.exit(0);
}
if(command==="create"){
  if(!clean())fail(["tracked Git worktree must be clean"]);
  let path;try{path=safeOutputPath(process.argv[3])}catch(error){fail([error instanceof Error?error.message:"output path is invalid"])}
  mkdirSync(dirname(path),{recursive:true});
  writeFileSync(path,`${JSON.stringify(expected,null,2)}\n`,{encoding:"utf8",flag:"wx"});
  console.log(`Release provenance created inside testing-records/ for commit ${expected.commit.slice(0,12)}. File contents are hashes and value-free runtime metadata only.`);
  process.exit(0);
}

const input=process.argv[3];
if(!input)fail(["a provenance record path is required"]);
let record;try{record=JSON.parse(readFileSync(resolve(root,input),"utf8"))}catch{fail(["record is missing or invalid JSON"])}
const failures=validate(record);
if(failures.length)fail(failures);
if(!clean())fail(["tracked Git worktree must be clean"]);
if(JSON.stringify(record)!==JSON.stringify(expected))fail(["record does not match the exact current commit, runtime, lockfile, migrations, rollbacks, and verification workflow"]);
console.log(`Release provenance verified for commit ${expected.commit.slice(0,12)}: lockfile, ${expected.migrations.count} migrations, ${expected.rollbacks.count} rollbacks, and CI workflow match. No source values printed and no external action performed.`);
