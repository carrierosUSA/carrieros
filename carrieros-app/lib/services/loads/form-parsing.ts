import type {
  CreateLoadInput,
  LoadStopInput,
  UpdateLoadInput,
} from "@/lib/services/loads/load-inputs";
import type { LoadStatus } from "@/lib/types";
import { LOAD_STATUSES } from "@/lib/types";

function readOptionalString(formData: FormData, name: string): string | undefined {
  const value = String(formData.get(name) ?? "").trim();
  return value || undefined;
}

function readStop(formData: FormData, prefix: "origin" | "destination"): LoadStopInput {
  const scheduledAt = String(formData.get(`${prefix}ScheduledAt`) ?? "").trim();
  const date = String(formData.get(`${prefix}Date`) ?? "").trim();
  const time = String(formData.get(`${prefix}Time`) ?? "").trim();
  const appointmentRaw = String(formData.get(`${prefix}AppointmentType`) ?? "").trim();
  const appointmentType =
    appointmentRaw === "apt" || appointmentRaw === "fcfs" ? appointmentRaw : undefined;

  let combinedScheduledAt: string | undefined;

  if (scheduledAt) {
    combinedScheduledAt = new Date(scheduledAt).toISOString();
  } else if (date && time) {
    combinedScheduledAt = new Date(`${date}T${time}`).toISOString();
  } else if (date) {
    combinedScheduledAt = new Date(`${date}T00:00`).toISOString();
  }

  return {
    city: String(formData.get(`${prefix}City`) ?? "").trim(),
    state: String(formData.get(`${prefix}State`) ?? "").trim(),
    address: readOptionalString(formData, `${prefix}Address`),
    scheduledAt: combinedScheduledAt,
    appointmentType,
    company: readOptionalString(formData, `${prefix}Company`),
    contactName: readOptionalString(formData, `${prefix}ContactName`),
    phone: readOptionalString(formData, `${prefix}Phone`),
    email: readOptionalString(formData, `${prefix}Email`),
  };
}

function readBrokerId(formData: FormData): string | undefined {
  const brokerId = String(formData.get("brokerId") ?? "").trim();
  return brokerId || undefined;
}

function isLoadStatus(value: string): value is LoadStatus {
  return LOAD_STATUSES.includes(value as LoadStatus);
}

function readOptionalNumber(formData: FormData, name: string): number | undefined {
  const value = String(formData.get(name) ?? "").trim();
  if (!value) {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function readSmartLoadFields(formData: FormData) {
  return {
    driverId: readOptionalString(formData, "driverId"),
    truckId: readOptionalString(formData, "truckId"),
    equipmentType: readOptionalString(formData, "equipmentType"),
    temperature: readOptionalString(formData, "temperature"),
    paymentTerms: readOptionalString(formData, "paymentTerms"),
    brokerContactName: readOptionalString(formData, "brokerContactName"),
    brokerPhone: readOptionalString(formData, "brokerPhone"),
    brokerEmail: readOptionalString(formData, "brokerEmail"),
    loadNumber: readOptionalString(formData, "loadNumber"),
    brokerLoadId: readOptionalString(formData, "brokerLoadId"),
    poNumber: readOptionalString(formData, "poNumber"),
    commodity: readOptionalString(formData, "commodity"),
    weight: readOptionalNumber(formData, "weight"),
    pieces: readOptionalNumber(formData, "pieces"),
    notes: readOptionalString(formData, "notes"),
  };
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
    ...readSmartLoadFields(formData),
  };
}

export function parseUpdateLoadInput(formData: FormData): UpdateLoadInput {
  const statusValue = String(formData.get("status") ?? "").trim();

  return {
    ...parseCreateLoadInput(formData),
    status: isLoadStatus(statusValue) ? statusValue : undefined,
  };
}
