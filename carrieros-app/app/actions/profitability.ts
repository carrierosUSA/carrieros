"use server";

import { requireDocumentAuth } from "@/lib/auth/supabase-server";
import { TruckProfitabilityRepository, type TruckProfitability } from "@/lib/profitability/truck-profitability";

const DATE = /^\d{4}-\d{2}-\d{2}$/;

export async function getTruckProfitabilityAction(input: { start: string; end: string }): Promise<
  { ok: true; rows: TruckProfitability[] } | { ok: false; error: string }
> {
  if (!DATE.test(input.start) || !DATE.test(input.end) || input.start > input.end) {
    return { ok: false, error: "Choose a valid reporting period." };
  }
  try {
    const auth = await requireDocumentAuth();
    if (!["super_admin", "owner", "accounting"].includes(auth.businessRole)) {
      return { ok: false, error: "Profitability is restricted to owners and accounting." };
    }
    const rows = await new TruckProfitabilityRepository().list(auth.accessToken, input.start, input.end);
    return { ok: true, rows };
  } catch {
    return { ok: false, error: "Verified profitability is unavailable." };
  }
}
