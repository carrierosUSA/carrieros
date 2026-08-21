import "server-only";
import { getSupabaseAuthenticatedUserClient } from "@/lib/supabase/server";

export type FleetAsset = {
  id: string; assetType: "truck" | "trailer"; unitNumber: string; vin: string;
  year?: number; make?: string; model?: string;
  status: "active" | "maintenance" | "out_of_service" | "retired";
  annualInspectionExpiresOn: string; registrationExpiresOn: string; isReefer: boolean; verifiedAt: string;
};
type Row = Record<string, unknown>;
const text = (value: unknown) => typeof value === "string" ? value : "";
export class FleetAssetsRepository {
  async list(accessToken: string): Promise<FleetAsset[]> {
    const db = getSupabaseAuthenticatedUserClient(accessToken);
    const result = await db.rpc("list_verified_fleet_assets");
    if (result.error) throw new Error("Authorized fleet registry is unavailable.");
    return (Array.isArray(result.data) ? result.data : []).flatMap((value): FleetAsset[] => {
      if (!value || typeof value !== "object") return [];
      const row = value as Row; const id = text(row.id); const assetType = text(row.asset_type); const status = text(row.status);
      if (!id || (assetType !== "truck" && assetType !== "trailer") || !["active","maintenance","out_of_service","retired"].includes(status)) return [];
      return [{ id, assetType, unitNumber: text(row.unit_number), vin: text(row.vin), year: Number.isFinite(Number(row.year)) ? Number(row.year) : undefined, make: text(row.make) || undefined, model: text(row.model) || undefined, status: status as FleetAsset["status"], annualInspectionExpiresOn: text(row.annual_inspection_expires_on), registrationExpiresOn: text(row.registration_expires_on), isReefer: row.is_reefer === true, verifiedAt: text(row.verified_at) }];
    });
  }
}
