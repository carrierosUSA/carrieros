import type { CreateDriverInput, UpdateDriverInput } from "@/lib/services/drivers/driver-inputs";
import type { DriverPayType, DriverStatus } from "@/lib/types";
import { DRIVER_STATUSES } from "@/lib/types";

function isDriverStatus(value: string): value is DriverStatus {
  return DRIVER_STATUSES.includes(value as DriverStatus);
}

function isPayType(value: string): value is DriverPayType {
  return value === "per_mile" || value === "hourly" || value === "percentage";
}

export function parseCreateDriverInput(formData: FormData): CreateDriverInput {
  const truckId = String(formData.get("truckId") ?? "").trim();
  const statusValue = String(formData.get("status") ?? "active").trim();
  const payTypeValue = String(formData.get("payType") ?? "per_mile").trim();

  return {
    name: String(formData.get("name") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim(),
    role: String(formData.get("role") ?? "").trim(),
    status: isDriverStatus(statusValue) ? statusValue : "active",
    phone: String(formData.get("phone") ?? "").trim(),
    location: String(formData.get("location") ?? "").trim(),
    hireDate: String(formData.get("hireDate") ?? "").trim(),
    licenseClass: String(formData.get("licenseClass") ?? "").trim(),
    licenseNumber: String(formData.get("licenseNumber") ?? "").trim(),
    licenseState: String(formData.get("licenseState") ?? "").trim(),
    licenseExpiresAt: String(formData.get("licenseExpiresAt") ?? "").trim(),
    medicalExpiresAt: String(formData.get("medicalExpiresAt") ?? "").trim(),
    payRate: Number(formData.get("payRate")),
    payType: isPayType(payTypeValue) ? payTypeValue : "per_mile",
    truckId: truckId || undefined,
  };
}

export function parseUpdateDriverInput(formData: FormData): UpdateDriverInput {
  return parseCreateDriverInput(formData);
}

export function parseAssignDriverInput(formData: FormData) {
  const truckId = String(formData.get("truckId") ?? "").trim();
  return { truckId: truckId || undefined };
}

export function parseCreateTimeOffInput(formData: FormData) {
  return {
    startDate: String(formData.get("startDate") ?? "").trim(),
    endDate: String(formData.get("endDate") ?? "").trim(),
    reason: String(formData.get("reason") ?? "").trim(),
  };
}
