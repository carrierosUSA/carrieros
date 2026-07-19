import type { UsStateCode } from "./types";

/** Stub IFTA fuel tax rates ($/gallon) — illustrative only, not filing rates. */
export const IFTA_TAX_RATES: Record<UsStateCode, number> = {
  TX: 0.2,
  OK: 0.19,
  AR: 0.245,
  MO: 0.17,
  IL: 0.454,
  IN: 0.34,
  OH: 0.385,
  PA: 0.741,
  TN: 0.27,
  LA: 0.2,
  KS: 0.26,
  NM: 0.21,
  CO: 0.22,
  IA: 0.3,
  KY: 0.26,
  MS: 0.184,
};

export const STATE_NAMES: Record<UsStateCode, string> = {
  TX: "Texas",
  OK: "Oklahoma",
  AR: "Arkansas",
  MO: "Missouri",
  IL: "Illinois",
  IN: "Indiana",
  OH: "Ohio",
  PA: "Pennsylvania",
  TN: "Tennessee",
  LA: "Louisiana",
  KS: "Kansas",
  NM: "New Mexico",
  CO: "Colorado",
  IA: "Iowa",
  KY: "Kentucky",
  MS: "Mississippi",
};

export function getTaxRate(state: UsStateCode): number {
  return IFTA_TAX_RATES[state] ?? 0.25;
}

export function getStateName(state: UsStateCode): string {
  return STATE_NAMES[state] ?? state;
}

/**
 * Estimated IFTA tax for a jurisdiction:
 * (taxableMiles / fleetMpg) * taxRate − (gallonsPurchasedInState * taxRate)
 * Simplified net liability stub used for dashboard estimates.
 */
export function estimateJurisdictionTax(input: {
  taxableMiles: number;
  gallonsPurchasedInState: number;
  fleetMpg: number;
  taxRate: number;
}): number {
  const mpg = input.fleetMpg > 0 ? input.fleetMpg : 6.5;
  const taxedGallons = input.taxableMiles / mpg;
  const liability = taxedGallons * input.taxRate;
  const credit = input.gallonsPurchasedInState * input.taxRate;
  return Math.round((liability - credit) * 100) / 100;
}

export function formatTax(amount: number): string {
  const abs = Math.abs(amount);
  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(abs);
  if (amount < 0) return `−${formatted}`;
  if (amount > 0) return formatted;
  return formatted;
}
