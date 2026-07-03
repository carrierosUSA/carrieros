import type { CreateTrailerInput } from "@/lib/services/fleet/fleet-inputs";
import type { TrailerStatus } from "@/lib/types";
import { TRAILER_STATUSES } from "@/lib/types";

function isTrailerStatus(value: string): value is TrailerStatus {
  return TRAILER_STATUSES.includes(value as TrailerStatus);
}

export function parseCreateTrailerInput(formData: FormData): CreateTrailerInput {
  const location = String(formData.get("location") ?? "").trim();
  const truckId = String(formData.get("truckId") ?? "").trim();
  const statusValue = String(formData.get("status") ?? "available").trim();

  return {
    unitNumber: String(formData.get("unitNumber") ?? "").trim(),
    type: String(formData.get("type") ?? "").trim(),
    status: isTrailerStatus(statusValue) ? statusValue : "available",
    licensePlate: String(formData.get("licensePlate") ?? "").trim(),
    location: location || undefined,
    truckId: truckId || undefined,
  };
}
