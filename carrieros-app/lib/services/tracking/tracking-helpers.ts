import { randomBytes } from "crypto";
import type { Load, LoadStop } from "@/lib/types";

export function createSecureTrackingToken(): string {
  return `trk_${randomBytes(24).toString("base64url")}`;
}

export function formatStop(stop: LoadStop): string {
  return `${stop.city}, ${stop.state}`;
}

export function calculateDeliveryCountdown(load: Load, now = new Date()): string {
  const target = new Date(load.destination.scheduledAt ?? load.deliveryDate);
  const minutes = Math.max(0, Math.round((target.getTime() - now.getTime()) / 60000));

  if (minutes <= 0) {
    return "Due now";
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours <= 0) {
    return `${remainingMinutes}m`;
  }

  return `${hours}h ${remainingMinutes}m`;
}

export function calculateEtaLabel(minutes?: number): string {
  if (minutes === undefined) {
    return "ETA pending";
  }

  if (minutes <= 0) {
    return "Arriving now";
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return hours > 0 ? `${hours}h ${remainingMinutes}m` : `${remainingMinutes}m`;
}

export function driverFirstName(fullName?: string): string | undefined {
  return fullName?.split(" ")[0];
}
