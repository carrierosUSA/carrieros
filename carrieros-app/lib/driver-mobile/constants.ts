import { DEMO_DRIVER_ID } from "@/lib/driver-mobile/seed";

export function resolveDriverId(searchParams?: {
  driverId?: string | string[] | null;
}): string {
  const raw = searchParams?.driverId;
  const value = Array.isArray(raw) ? raw[0] : raw;
  return value?.trim() || DEMO_DRIVER_ID;
}

export const DRIVER_DOC_UPLOAD_TYPES = [
  { id: "pod", label: "POD" },
  { id: "bol", label: "BOL" },
  { id: "rate_con", label: "Rate Con" },
  { id: "lumper", label: "Lumper" },
  { id: "fuel", label: "Fuel" },
  { id: "scale", label: "Scale" },
  { id: "washout", label: "Washout" },
  { id: "repair", label: "Repair" },
  { id: "accident_photos", label: "Accident Photos" },
  { id: "delivery_photos", label: "Delivery Photos" },
] as const;

export const EXPENSE_CATEGORIES = [
  { id: "fuel", label: "Fuel" },
  { id: "hotel", label: "Hotel" },
  { id: "parking", label: "Parking" },
  { id: "toll", label: "Toll" },
  { id: "lumper", label: "Lumper" },
  { id: "repairs", label: "Repairs" },
  { id: "other", label: "Other" },
] as const;

export const DVIR_AREAS = [
  "Brakes",
  "Lights",
  "Tires",
  "Coupling",
  "Steering",
  "Horn",
  "Wipers",
  "Mirrors",
  "Other",
] as const;

export const REJECT_REASONS = [
  "Hours of service",
  "Equipment mismatch",
  "Too far empty",
  "Rate too low",
  "Personal conflict",
  "Other",
] as const;
