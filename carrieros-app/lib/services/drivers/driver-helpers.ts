import type { Driver } from "@/lib/types";
import { getTruckById } from "@/lib/data/fleet-store";

export function slugifyDriverName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function nextDriverId(name: string): string {
  return `${slugifyDriverName(name)}-${Date.now().toString().slice(-4)}`;
}

export function formatPayRate(driver: Driver): string {
  if (driver.payType === "per_mile") {
    return `$${driver.payRate.toFixed(2)}/mi`;
  }

  if (driver.payType === "hourly") {
    return `$${driver.payRate.toFixed(2)}/hr`;
  }

  return `${driver.payRate}%`;
}

export function getTruckLabel(truckId?: string): string | undefined {
  if (!truckId) {
    return undefined;
  }

  const truck = getTruckById(truckId);
  return truck ? `Unit ${truck.unitNumber}` : undefined;
}

export function buildNovaInsights(driver: Driver): string[] {
  const insights: string[] = [];
  const today = new Date();

  if (driver.status === "onboarding") {
    insights.push("Complete onboarding checklist before first dispatch assignment.");
  }

  if (new Date(driver.medicalExpiresAt) <= new Date(today.getTime() + 90 * 86400000)) {
    insights.push("Medical card expiration is approaching. Schedule renewal.");
  }

  if (new Date(driver.licenseExpiresAt) <= new Date(today.getTime() + 90 * 86400000)) {
    insights.push("CDL expiration is approaching. Verify renewal documentation.");
  }

  if (!driver.truckId && driver.status === "active") {
    insights.push("No truck assignment found. Dispatch assignment recommended.");
  }

  if (insights.length === 0) {
    insights.push("Compliance documents are valid.");
    insights.push("No urgent safety or payroll actions required.");
  }

  return insights;
}

export function buildNovaSummary(driver: Driver): string {
  return buildNovaInsights(driver)[0] ?? "Driver profile is up to date.";
}
