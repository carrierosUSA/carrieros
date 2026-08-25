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

let files;try{files=execFileSync("git",["ls-files","-z"],{stdio:["ignore","pipe","ignore"]}).toString("utf8").split("\0").filter(Boolean)}catch{console.error("Tracked-secret scan failed closed: Git tracked files could not be enumerated. No external action was performed.");process.exit(1)}
const findings=[];
for(const file of files){
  if(binaryExtensions.has(extname(file).toLowerCase()))continue;
  let bytes;try{bytes=readFileSync(file)}catch{findings.push([file,"unreadable tracked file"]);continue}
  if(bytes.subarray(0,8192).includes(0))continue;
  const source=bytes.toString("utf8");
  for(const[label,pattern]of rules)if(pattern.test(source))findings.push([file,label]);
}
if(findings.length){
  console.error("Tracked-secret scan failed:");
  for(const[file,label]of findings)console.error(`- ${file}: possible ${label}`);
  console.error("Matched values were not printed. Remove and rotate any real credential before continuing. No external action was performed.");
  process.exit(1);
}
console.log(`Tracked-secret scan passed: ${files.length} tracked paths checked against ${rules.length} credential classes. No values printed and no external action performed.`);
