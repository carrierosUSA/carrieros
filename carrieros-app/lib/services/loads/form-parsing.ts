import type { CreateLoadInput, UpdateLoadInput } from "@/lib/services/loads/load-inputs";
import type { LoadStatus } from "@/lib/types";
import { LOAD_STATUSES } from "@/lib/types";

function readStop(formData: FormData, prefix: "origin" | "destination") {
  const scheduledAt = String(formData.get(`${prefix}ScheduledAt`) ?? "").trim();

  return {
    city: String(formData.get(`${prefix}City`) ?? "").trim(),
    state: String(formData.get(`${prefix}State`) ?? "").trim(),
    scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : undefined,
  };
}

function readBrokerId(formData: FormData): string | undefined {
  const brokerId = String(formData.get("brokerId") ?? "").trim();
  return brokerId || undefined;
}

function isLoadStatus(value: string): value is LoadStatus {
  return LOAD_STATUSES.includes(value as LoadStatus);
}

export function parseCreateLoadInput(formData: FormData): CreateLoadInput {
  return {
    customerId: String(formData.get("customerId") ?? "").trim(),
    brokerId: readBrokerId(formData),
    origin: readStop(formData, "origin"),
    destination: readStop(formData, "destination"),
    pickupDate: String(formData.get("pickupDate") ?? "").trim(),
    deliveryDate: String(formData.get("deliveryDate") ?? "").trim(),
    rate: Number(formData.get("rate")),
    miles: Number(formData.get("miles")),
  };
}

export function parseUpdateLoadInput(formData: FormData): UpdateLoadInput {
  const statusValue = String(formData.get("status") ?? "").trim();

  return {
    ...parseCreateLoadInput(formData),
    status: isLoadStatus(statusValue) ? statusValue : undefined,
  };
}
