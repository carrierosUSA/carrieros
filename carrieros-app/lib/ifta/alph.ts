import { DEMO_TENANT_ID } from "@/lib/data/tenant";
import {
  buildStateRows,
  buildTruckRows,
  computeMpg,
  listFuelForView,
} from "./board";
import { filterByQuarter, listIftaTrips } from "./store";
import type {
  IftaAlphAlert,
  IftaQuarterId,
  UsStateCode,
} from "./types";

const EXPECTED_MPG_MIN = 4.5;
const EXPECTED_MPG_MAX = 9.5;

export function detectIftaAlphAlerts(
  quarter: IftaQuarterId,
  year: number,
  tenantId = DEMO_TENANT_ID,
): IftaAlphAlert[] {
  const alerts: IftaAlphAlert[] = [];
  const fuel = listFuelForView(quarter, year, tenantId);
  const trucks = buildTruckRows(quarter, year, tenantId);
  const states = buildStateRows(quarter, year, tenantId);
  const trips = filterByQuarter(listIftaTrips(tenantId), quarter, year);

  const missing = fuel.filter((f) => f.receiptStatus === "missing");
  if (missing.length > 0) {
    alerts.push({
      id: "alph-missing-receipts",
      type: "missing_receipt",
      severity: missing.length >= 3 ? "critical" : "warning",
      message: `${missing.length} fuel purchase${missing.length === 1 ? "" : "s"} missing receipts in ${quarter} ${year}.`,
      fixLabel: "Review fuel",
      fixAction: "fuel",
    });
  }

  const duplicates = fuel.filter((f) => f.receiptStatus === "duplicate_suspect");
  if (duplicates.length > 0) {
    alerts.push({
      id: "alph-duplicate-receipts",
      type: "duplicate_receipt",
      severity: "warning",
      message: `${duplicates.length} receipt${duplicates.length === 1 ? "" : "s"} look like possible duplicates.`,
      fixLabel: "Check duplicates",
      fixAction: "fuel",
      relatedId: duplicates[0]?.id,
    });
  }

  for (const truck of trucks) {
    if (truck.totalFuel > 0 && (truck.mpg < EXPECTED_MPG_MIN || truck.mpg > EXPECTED_MPG_MAX)) {
      alerts.push({
        id: `alph-mpg-${truck.truckId}`,
        type: "suspicious_mpg",
        severity: truck.mpg < 3.5 || truck.mpg > 12 ? "critical" : "warning",
        message: `Unit ${truck.unitNumber} shows unusual MPG (${truck.mpg}). Verify miles and fuel.`,
        fixLabel: "Open truck",
        fixAction: "truck_detail",
        relatedId: truck.truckId,
      });
    }
  }

  // Mileage discrepancy: fuel implies miles far from recorded miles
  for (const truck of trucks) {
    if (truck.totalFuel <= 0 || truck.totalMiles <= 0) continue;
    const impliedMiles = truck.totalFuel * 6.5;
    const delta = Math.abs(impliedMiles - truck.totalMiles) / truck.totalMiles;
    if (delta > 0.45) {
      alerts.push({
        id: `alph-miles-${truck.truckId}`,
        type: "mileage_discrepancy",
        severity: "warning",
        message: `Unit ${truck.unitNumber}: fuel vs miles diverge by ${Math.round(delta * 100)}%. Possible ELD gap.`,
        fixLabel: "Review truck",
        fixAction: "trucks",
        relatedId: truck.truckId,
      });
    }
  }

  // States with fuel but no miles
  for (const state of states) {
    if (state.gallons > 0 && state.totalMiles === 0) {
      alerts.push({
        id: `alph-missing-miles-${state.state}`,
        type: "missing_state_miles",
        severity: "critical",
        message: `${state.stateName}: fuel purchased but no miles recorded — audit risk.`,
        fixLabel: "State view",
        fixAction: "states",
        relatedId: state.state,
      });
    }
  }

  // States with miles but no fuel (info)
  const highMileNoFuel = states.filter(
    (s) => s.taxableMiles > 200 && s.gallons === 0,
  );
  if (highMileNoFuel.length > 0) {
    const sample = highMileNoFuel.slice(0, 2).map((s) => s.state).join(", ");
    alerts.push({
      id: "alph-no-fuel-states",
      type: "missing_state_miles",
      severity: "info",
      message: `Miles in ${sample}${highMileNoFuel.length > 2 ? ` (+${highMileNoFuel.length - 2})` : ""} with no in-state fuel — verify through-trip gallons.`,
      fixLabel: "State view",
      fixAction: "states",
    });
  }

  // Potential audit: PA high rate + missing receipt, or many missing
  const pa = states.find((s) => s.state === ("PA" as UsStateCode));
  const paMissing = fuel.some(
    (f) => f.state === "PA" && f.receiptStatus === "missing",
  );
  if (pa && pa.estimatedTax > 50 && paMissing) {
    alerts.push({
      id: "alph-audit-pa",
      type: "audit_risk",
      severity: "critical",
      message: "Pennsylvania liability with a missing receipt — high audit exposure.",
      fixLabel: "Fix receipt",
      fixAction: "fuel",
    });
  }

  if (missing.length >= 4) {
    alerts.push({
      id: "alph-audit-volume",
      type: "audit_risk",
      severity: "warning",
      message: "Multiple missing receipts this quarter may delay accountant filing.",
      fixLabel: "Generate report",
      fixAction: "generate",
    });
  }

  // Fleet-level MPG sanity
  const fleetGallons = fuel.reduce((s, f) => s + f.gallons, 0);
  const fleetMiles = trips.reduce((s, t) => s + t.miles, 0);
  const fleetMpg = computeMpg(fleetMiles, fleetGallons);
  if (fleetGallons > 0 && (fleetMpg < EXPECTED_MPG_MIN || fleetMpg > EXPECTED_MPG_MAX)) {
    alerts.push({
      id: "alph-fleet-mpg",
      type: "suspicious_mpg",
      severity: "info",
      message: `Fleet MPG for ${quarter} is ${fleetMpg} — outside the typical 4.5–9.5 range.`,
      fixLabel: "Export data",
      fixAction: "export",
    });
  }

  return alerts;
}
