/**
 * Run: npx tsx scripts/run-alph-selfcheck.ts
 */
import { runAlphFoundationSelfCheck } from "../lib/alph/selfcheck";

async function main() {
  const result = await runAlphFoundationSelfCheck();
  for (const check of result.checks) {
    const mark = check.pass ? "PASS" : "FAIL";
    console.log(`${mark}  ${check.name}${check.detail ? ` — ${check.detail}` : ""}`);
  }
  console.log(result.ok ? "\nAlph foundation self-check: OK" : "\nAlph foundation self-check: FAILED");
  process.exit(result.ok ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
