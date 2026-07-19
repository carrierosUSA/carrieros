import { NextResponse } from "next/server";
import { runAlphFoundationSelfCheck } from "@/lib/alph/selfcheck";
import { ALPH_IDENTITY } from "@/lib/alph/identity";
import { ensureAlphToolsRegistered, listAlphTools } from "@/lib/alph/tools";

/**
 * Lightweight Alph foundation probe.
 * Does not call external model providers.
 */
export async function GET() {
  ensureAlphToolsRegistered();
  const check = await runAlphFoundationSelfCheck();
  return NextResponse.json({
    ok: check.ok,
    assistant: ALPH_IDENTITY,
    toolCount: listAlphTools().length,
    checks: check.checks,
  });
}
