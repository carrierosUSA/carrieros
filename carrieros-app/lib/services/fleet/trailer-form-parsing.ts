import type { CreateTrailerInput } from "@/lib/services/fleet/fleet-inputs";
import type { TrailerStatus, TrailerType } from "@/lib/types";
import { TRAILER_STATUSES, TRAILER_TYPES } from "@/lib/types";

function isTrailerStatus(value: string): value is TrailerStatus {
  return TRAILER_STATUSES.includes(value as TrailerStatus);
}

function isTrailerType(value: string): value is TrailerType {
  return TRAILER_TYPES.includes(value as TrailerType);
}

function parseOptionalNumber(value: FormDataEntryValue | null): number | undefined {
  const raw = String(value ?? "").trim();
  if (!raw) {
    return undefined;
  }
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function parseCreateTrailerInput(formData: FormData): CreateTrailerInput {
  const location = String(formData.get("location") ?? "").trim();
  const truckId = String(formData.get("truckId") ?? "").trim();
  const statusValue = String(formData.get("status") ?? "available").trim();
  const typeValue = String(formData.get("type") ?? "dry_van").trim();
  const licenseState = String(formData.get("licenseState") ?? "").trim();
  const vin = String(formData.get("vin") ?? "").trim();
  const make = String(formData.get("make") ?? "").trim();
  const lastServiceDate = String(formData.get("lastServiceDate") ?? "").trim();

  return {
    unitNumber: String(formData.get("unitNumber") ?? "").trim(),
    type: isTrailerType(typeValue) ? typeValue : "dry_van",
    status: isTrailerStatus(statusValue) ? statusValue : "available",
    licensePlate: String(formData.get("licensePlate") ?? "").trim(),
    licenseState: licenseState || undefined,
    vin: vin || undefined,
    year: parseOptionalNumber(formData.get("year")),
    make: make || undefined,
    location: location || undefined,
    truckId: truckId || undefined,
    lastServiceDate: lastServiceDate || undefined,
    mileage: parseOptionalNumber(formData.get("mileage")),
    lengthFt: parseOptionalNumber(formData.get("lengthFt")),
  };
}
