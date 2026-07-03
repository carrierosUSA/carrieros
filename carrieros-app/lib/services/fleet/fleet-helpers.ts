import type { Truck } from "@/lib/types";

export function formatTruckLabel(truck: Pick<Truck, "make" | "model" | "year" | "unitNumber">): string {
  return `Unit ${truck.unitNumber} · ${truck.year} ${truck.make} ${truck.model}`;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatMileage(mileage: number): string {
  return new Intl.NumberFormat("en-US").format(mileage);
}

export function nextTruckId(): string {
  return `truck-${Date.now()}`;
}

export function nextTrailerId(): string {
  return `trailer-${Date.now()}`;
}
