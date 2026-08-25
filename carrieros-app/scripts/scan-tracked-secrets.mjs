import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { extname } from "node:path";

const binaryExtensions=new Set([".avif",".bundle",".gif",".ico",".jpeg",".jpg",".pdf",".png",".webp",".woff",".woff2",".zip"]);
const rules=[
  ["private key",/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/],
  ["OpenAI credential",/\bsk-(?:proj-|svcacct-)?[A-Za-z0-9_-]{20,}\b/],
  ["GitHub credential",/\b(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9]{20,}\b/],
  ["AWS access key",/\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/],
  ["Slack credential",/\bxox[baprs]-[A-Za-z0-9-]{20,}\b/],
  ["Stripe live credential",/\b(?:sk|rk)_live_[A-Za-z0-9]{16,}\b/],
  ["Supabase secret",/\bsb_secret_[A-Za-z0-9_-]{20,}\b/],
  ["Twilio API key",/\bSK[0-9a-f]{32}\b/i],
  ["credential-bearing database URL",/\b(?:postgres(?:ql)?|mysql|mongodb(?:\+srv)?):\/\/[^:\s/]+:[^@\s/]+@/i],
];

function git(args,options={}){return execFileSync("git",args,{stdio:["pipe","pipe","ignore"],...options})}
let files;try{files=git(["ls-files","-z"]).toString("utf8").split("\0").filter(Boolean)}catch{console.error("Tracked-secret scan failed closed: Git tracked files could not be enumerated. No external action was performed.");process.exit(1)}
const findings=[];
const findingKeys=new Set();
function addFinding(path,label){const key=`${path}\0${label}`;if(!findingKeys.has(key)){findingKeys.add(key);findings.push([path,label])}}
function scan(bytes,path){
  if(binaryExtensions.has(extname(path).toLowerCase())||bytes.subarray(0,8192).includes(0))return;
  const source=bytes.toString("utf8");
  for(const[label,pattern]of rules)if(pattern.test(source))addFinding(path,label);
}
for(const file of files){
  let bytes;try{bytes=readFileSync(file)}catch{addFinding(file,"unreadable tracked file");continue}
  scan(bytes,file);
}

let historyBlobCount=0;
try{
  const objects=git(["rev-list","--objects","HEAD"]).toString("utf8").trim().split("\n").filter(Boolean);
  const paths=new Map();
  const hashes=[];
  for(const line of objects){const split=line.indexOf(" "),hash=split<0?line:line.slice(0,split),path=split<0?"(historical object)":line.slice(split+1);if(!paths.has(hash)){paths.set(hash,path);hashes.push(hash)}}
  const checks=git(["cat-file","--batch-check=%(objectname) %(objecttype) %(objectsize)"],{input:`${hashes.join("\n")}\n`}).toString("utf8").trim().split("\n");
  for(const check of checks){
    const[hash,type,sizeText]=check.split(" ");
    if(type!=="blob")continue;
    historyBlobCount++;
    const path=paths.get(hash)??"(historical blob)";
    const size=Number(sizeText);
    let bytes;try{bytes=git(["cat-file","blob",hash],{maxBuffer:Math.max(size+1024,1024*1024)})}catch{addFinding(path,"unreadable historical blob");continue}
    scan(bytes,path);
  }
}catch{addFinding("Git history","unreadable reachable history")}
if(findings.length){
  console.error("Tracked-secret scan failed:");
  for(const[file,label]of findings)console.error(`- ${file}: possible ${label}`);
  console.error("Matched values were not printed. Remove and rotate any real credential before continuing. No external action was performed.");
  process.exit(1);
}
console.log(`Tracked-secret scan passed: ${files.length} tracked paths and ${historyBlobCount} reachable historical blobs checked against ${rules.length} credential classes. No values printed and no external action performed.`);
