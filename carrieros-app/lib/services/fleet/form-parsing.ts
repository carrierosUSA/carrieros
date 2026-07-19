import type { CreateTruckInput, UpdateTruckInput } from "@/lib/services/fleet/fleet-inputs";
import type { TruckStatus } from "@/lib/types";
import { TRUCK_STATUSES } from "@/lib/types";

function isTruckStatus(value: string): value is TruckStatus {
  return TRUCK_STATUSES.includes(value as TruckStatus);
}

export function parseCreateTruckInput(formData: FormData): CreateTruckInput {
  const driverId = String(formData.get("driverId") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim();
  const lastServiceDate = String(formData.get("lastServiceDate") ?? "").trim();
  const licenseState = String(formData.get("licenseState") ?? "").trim();
  const statusValue = String(formData.get("status") ?? "available").trim();

  return {
    unitNumber: String(formData.get("unitNumber") ?? "").trim(),
    status: isTruckStatus(statusValue) ? statusValue : "available",
    make: String(formData.get("make") ?? "").trim(),
    model: String(formData.get("model") ?? "").trim(),
    year: Number(formData.get("year")),
    vin: String(formData.get("vin") ?? "").trim(),
    licensePlate: String(formData.get("licensePlate") ?? "").trim(),
    licenseState: licenseState || undefined,
    mileage: Number(formData.get("mileage")),
    driverId: driverId || undefined,
    location: location || undefined,
    lastServiceDate: lastServiceDate || undefined,
  };
}

export function parseUpdateTruckInput(formData: FormData): UpdateTruckInput {
  return parseCreateTruckInput(formData);
}
