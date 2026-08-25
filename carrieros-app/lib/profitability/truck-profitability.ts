import "server-only";
import { getSupabaseAuthenticatedUserClient } from "@/lib/supabase/server";

export type TruckProfitability = {
  assetId: string;
  unitNumber: string;
  loadCount: number;
  revenueCents: number;
  expenseCents: number;
  netCents: number;
  missingRateLoadCount: number;
  companyWideExpenseCents: number;
  unmappedLoadCount: number;
};

type Row = Record<string, unknown>;
const text = (value: unknown) => typeof value === "string" ? value : "";
const number = (value: unknown) => Number.isFinite(Number(value)) ? Number(value) : 0;

export class TruckProfitabilityRepository {
  async list(accessToken: string, start: string, end: string): Promise<TruckProfitability[]> {
    const db = getSupabaseAuthenticatedUserClient(accessToken);
    const result = await db.rpc("list_verified_truck_profitability", { p_start: start, p_end: end });
    if (result.error) throw new Error("Truck profitability is unavailable");
    return (Array.isArray(result.data) ? result.data : []).flatMap((item) => {
      if (!item || typeof item !== "object") return [];
      const row = item as Row;
      const assetId = text(row.asset_id), unitNumber = text(row.unit_number);
      return assetId && unitNumber ? [{
        assetId, unitNumber, loadCount: number(row.load_count), revenueCents: number(row.revenue_cents),
        expenseCents: number(row.expense_cents), netCents: number(row.net_cents),
        missingRateLoadCount: number(row.missing_rate_load_count), companyWideExpenseCents: number(row.company_wide_expense_cents),
        unmappedLoadCount: number(row.unmapped_load_count),
      }] : [];
    });
  }
}
