"use server";
import { revalidatePath } from "next/cache";
import { requireDocumentAuth } from "@/lib/auth/supabase-server";
import type { BusinessRole } from "@/lib/auth/roles";
import { FleetAssetsRepository, type FleetAsset } from "@/lib/fleet/assets";
import { getSupabaseAuthenticatedUserClient } from "@/lib/supabase/server";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const READ_ROLES = new Set<BusinessRole>(["super_admin","owner","dispatcher","maintenance","safety"]);
const WRITE_ROLES = new Set<BusinessRole>(["super_admin","owner","maintenance","safety"]);
type Result = { ok: true; assets: FleetAsset[]; canManage: boolean } | { ok: false; error: string };
async function auth(readOnly = true) { const value = await requireDocumentAuth(); if (!(readOnly ? READ_ROLES : WRITE_ROLES).has(value.businessRole)) throw new Error("unauthorized"); return value; }
export async function getFleetAssetsAction(): Promise<Result> { try { const user = await auth(); return { ok: true, assets: await new FleetAssetsRepository().list(user.accessToken), canManage: WRITE_ROLES.has(user.businessRole) }; } catch { return { ok: false, error: "Fleet is restricted to authenticated operational and safety roles." }; } }

export async function saveVerifiedFleetAssetAction(input: {
  assetId?: string | null; assetType: "truck" | "trailer"; unitNumber: string; vin: string;
  year?: number | null; make?: string | null; model?: string | null;
  status: FleetAsset["status"]; annualInspectionExpiresOn: string; registrationExpiresOn: string;
  isReefer: boolean; note?: string | null; requestId: string;
}): Promise<Result> {
  const unitNumber = input.unitNumber.trim().slice(0,80); const vin = input.vin.trim().toUpperCase();
  const validDate = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(new Date(`${value}T00:00:00Z`).getTime());
  if ((input.assetId && !UUID_PATTERN.test(input.assetId)) || !UUID_PATTERN.test(input.requestId) || !unitNumber || !/^[A-HJ-NPR-Z0-9]{17}$/.test(vin) || !validDate(input.annualInspectionExpiresOn) || !validDate(input.registrationExpiresOn)) return { ok: false, error: "Enter verified unit, 17-character VIN, inspection date, and registration date." };
  try {
    const user = await auth(false); const db = getSupabaseAuthenticatedUserClient(user.accessToken);
    const result = await db.rpc("save_verified_fleet_asset", {
      p_asset_id: input.assetId ?? null, p_asset_type: input.assetType, p_unit_number: unitNumber, p_vin: vin,
      p_year: input.year ?? null, p_make: input.make?.trim().slice(0,100) || null, p_model: input.model?.trim().slice(0,100) || null,
      p_status: input.status, p_annual_inspection_expires_on: input.annualInspectionExpiresOn,
      p_registration_expires_on: input.registrationExpiresOn, p_is_reefer: input.isReefer,
      p_note: input.note?.trim().slice(0,2000) || null, p_request_id: input.requestId,
    });
    if (result.error) return { ok: false, error: "Fleet record could not be saved. Verify uniqueness and factual fields." };
    revalidatePath("/fleet");
    return { ok: true, assets: await new FleetAssetsRepository().list(user.accessToken), canManage: true };
  } catch { return { ok: false, error: "Fleet record was not saved. No equipment state changed." }; }
}
