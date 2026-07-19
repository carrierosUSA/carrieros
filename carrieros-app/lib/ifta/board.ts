import { getTruckById } from "@/lib/data/fleet-store";
import { DEMO_TENANT_ID } from "@/lib/data/tenant";
import {
  filterByQuarter,
  getCurrentQuarter,
  listIftaFuelPurchases,
  listIftaReports,
  listIftaTrips,
  quarterFromDate,
} from "./store";
import { estimateJurisdictionTax, getStateName, getTaxRate } from "./tax";
import type {
  IftaDashboardKpis,
  IftaFuelPurchase,
  IftaQuarterId,
  IftaQuarterRow,
  IftaStateRow,
  IftaTripSegment,
  IftaTruckRow,
  IftaTruckStateBreakdown,
  UsStateCode,
} from "./types";

export function formatMiles(n: number): string {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(
    Math.round(n),
  );
}

export function formatGallons(n: number): string {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 1,
    minimumFractionDigits: 0,
  }).format(n);
}

export function formatMpg(n: number): string {
  if (!Number.isFinite(n) || n <= 0) return "—";
  return n.toFixed(1);
}

export function formatMoney(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(n);
}

function sumMiles(trips: IftaTripSegment[]): {
  total: number;
  taxable: number;
  nonTaxable: number;
} {
  let total = 0;
  let taxable = 0;
  let nonTaxable = 0;
  for (const t of trips) {
    total += t.miles;
    if (t.taxable) taxable += t.miles;
    else nonTaxable += t.miles;
  }
  return { total, taxable, nonTaxable };
}

function sumFuel(fuel: IftaFuelPurchase[]): {
  gallons: number;
  cost: number;
  missing: number;
} {
  let gallons = 0;
  let cost = 0;
  let missing = 0;
  for (const f of fuel) {
    gallons += f.gallons;
    cost += f.totalCost;
    if (f.receiptStatus === "missing") missing += 1;
  }
  return { gallons, cost, missing };
}

export function computeMpg(miles: number, gallons: number): number {
  if (gallons <= 0) return 0;
  return Math.round((miles / gallons) * 10) / 10;
}

export function buildDashboardKpis(
  quarter: IftaQuarterId,
  year: number,
  tenantId = DEMO_TENANT_ID,
): IftaDashboardKpis {
  const trips = filterByQuarter(listIftaTrips(tenantId), quarter, year);
  const fuel = filterByQuarter(listIftaFuelPurchases(tenantId), quarter, year);
  const miles = sumMiles(trips);
  const fuelSum = sumFuel(fuel);
  const mpg = computeMpg(miles.total, fuelSum.gallons);
  const states = buildStateRows(quarter, year, tenantId);
  const estimatedIftaTax = states.reduce((s, row) => s + row.estimatedTax, 0);

  const current = getCurrentQuarter();
  return {
    currentQuarter: `${quarter} ${year}`,
    milesDriven: miles.total,
    taxableMiles: miles.taxable,
    nonTaxableMiles: miles.nonTaxable,
    fuelPurchasedGallons: fuelSum.gallons,
    fuelPurchasedCost: fuelSum.cost,
    mpg,
    estimatedIftaTax: Math.round(estimatedIftaTax * 100) / 100,
    missingFuelReceipts: fuelSum.missing,
  };
}

export function buildTruckRows(
  quarter: IftaQuarterId,
  year: number,
  tenantId = DEMO_TENANT_ID,
): IftaTruckRow[] {
  const trips = filterByQuarter(listIftaTrips(tenantId), quarter, year);
  const fuel = filterByQuarter(listIftaFuelPurchases(tenantId), quarter, year);
  const truckIds = new Set([
    ...trips.map((t) => t.truckId),
    ...fuel.map((f) => f.truckId),
  ]);

  const rows: IftaTruckRow[] = [];
  for (const truckId of truckIds) {
    const truckTrips = trips.filter((t) => t.truckId === truckId);
    const truckFuel = fuel.filter((f) => f.truckId === truckId);
    const miles = sumMiles(truckTrips);
    const fuelSum = sumFuel(truckFuel);
    const mpg = computeMpg(miles.total, fuelSum.gallons);
    const statesVisited = [
      ...new Set(truckTrips.map((t) => t.state)),
    ].sort() as UsStateCode[];
    const breakdown = buildTruckStateBreakdown(truckId, quarter, year, tenantId);
    const estimatedTax = breakdown.reduce((s, b) => s + b.estimatedTax, 0);
    const truck = getTruckById(truckId);

    rows.push({
      truckId,
      unitNumber: truck?.unitNumber ?? truckId.replace("truck-", ""),
      totalMiles: miles.total,
      totalFuel: fuelSum.gallons,
      mpg,
      statesVisited,
      estimatedTax: Math.round(estimatedTax * 100) / 100,
    });
  }

  return rows.sort((a, b) => a.unitNumber.localeCompare(b.unitNumber));
}

export function buildTruckStateBreakdown(
  truckId: string,
  quarter: IftaQuarterId,
  year: number,
  tenantId = DEMO_TENANT_ID,
): IftaTruckStateBreakdown[] {
  const trips = filterByQuarter(listIftaTrips(tenantId), quarter, year).filter(
    (t) => t.truckId === truckId,
  );
  const fuel = filterByQuarter(
    listIftaFuelPurchases(tenantId),
    quarter,
    year,
  ).filter((f) => f.truckId === truckId);

  const allMiles = sumMiles(trips);
  const allFuel = sumFuel(fuel);
  const fleetMpg = computeMpg(allMiles.total, allFuel.gallons) || 6.5;

  const states = new Set<UsStateCode>([
    ...trips.map((t) => t.state),
    ...fuel.map((f) => f.state),
  ]);

  const rows: IftaTruckStateBreakdown[] = [];
  for (const state of states) {
    const stateTrips = trips.filter((t) => t.state === state);
    const stateFuel = fuel.filter((f) => f.state === state);
    const miles = sumMiles(stateTrips);
    const fuelSum = sumFuel(stateFuel);
    const taxRate = getTaxRate(state);
    const estimatedTax = estimateJurisdictionTax({
      taxableMiles: miles.taxable,
      gallonsPurchasedInState: fuelSum.gallons,
      fleetMpg,
      taxRate,
    });
    rows.push({
      state,
      stateName: getStateName(state),
      miles: miles.total,
      taxableMiles: miles.taxable,
      gallons: fuelSum.gallons,
      mpg: computeMpg(miles.total, fuelSum.gallons),
      taxRate,
      estimatedTax,
    });
  }

  return rows.sort((a, b) => b.miles - a.miles);
}

export function buildStateRows(
  quarter: IftaQuarterId,
  year: number,
  tenantId = DEMO_TENANT_ID,
): IftaStateRow[] {
  const trips = filterByQuarter(listIftaTrips(tenantId), quarter, year);
  const fuel = filterByQuarter(listIftaFuelPurchases(tenantId), quarter, year);
  const allMiles = sumMiles(trips);
  const allFuel = sumFuel(fuel);
  const fleetMpg = computeMpg(allMiles.total, allFuel.gallons) || 6.5;

  const states = new Set<UsStateCode>([
    ...trips.map((t) => t.state),
    ...fuel.map((f) => f.state),
  ]);

  const rows: IftaStateRow[] = [];
  for (const state of states) {
    const stateTrips = trips.filter((t) => t.state === state);
    const stateFuel = fuel.filter((f) => f.state === state);
    const miles = sumMiles(stateTrips);
    const fuelSum = sumFuel(stateFuel);
    const taxRate = getTaxRate(state);
    const estimatedTax = estimateJurisdictionTax({
      taxableMiles: miles.taxable,
      gallonsPurchasedInState: fuelSum.gallons,
      fleetMpg,
      taxRate,
    });
    rows.push({
      state,
      stateName: getStateName(state),
      totalMiles: miles.total,
      taxableMiles: miles.taxable,
      fuelPurchasedCost: fuelSum.cost,
      gallons: fuelSum.gallons,
      mpg: computeMpg(miles.total, fuelSum.gallons),
      taxRate,
      estimatedTax,
    });
  }

  return rows.sort((a, b) => b.totalMiles - a.totalMiles);
}

export function buildQuarterRows(
  year: number,
  tenantId = DEMO_TENANT_ID,
): IftaQuarterRow[] {
  const quarters: IftaQuarterId[] = ["Q1", "Q2", "Q3", "Q4"];
  const trips = listIftaTrips(tenantId);
  const fuel = listIftaFuelPurchases(tenantId);
  const reports = listIftaReports(tenantId);

  return quarters.map((quarter) => {
    const qTrips = filterByQuarter(trips, quarter, year);
    const qFuel = filterByQuarter(fuel, quarter, year);
    const miles = sumMiles(qTrips);
    const fuelSum = sumFuel(qFuel);
    const mpg = computeMpg(miles.total, fuelSum.gallons);
    const states = buildStateRows(quarter, year, tenantId);
    const estimatedTax = states.reduce((s, r) => s + r.estimatedTax, 0);
    return {
      quarter,
      year,
      label: `${quarter} ${year}`,
      totalMiles: miles.total,
      taxableMiles: miles.taxable,
      gallons: fuelSum.gallons,
      mpg,
      estimatedTax: Math.round(estimatedTax * 100) / 100,
      tripCount: qTrips.length,
      fuelCount: qFuel.length,
      reportCount: reports.filter(
        (r) => r.quarter === quarter && r.year === year,
      ).length,
    };
  });
}

export function listFuelForView(
  quarter: IftaQuarterId,
  year: number,
  tenantId = DEMO_TENANT_ID,
): IftaFuelPurchase[] {
  return filterByQuarter(listIftaFuelPurchases(tenantId), quarter, year).sort(
    (a, b) => b.date.localeCompare(a.date),
  );
}

export function summarizeForPackage(
  quarter: IftaQuarterId,
  year: number,
  tenantId = DEMO_TENANT_ID,
) {
  const kpis = buildDashboardKpis(quarter, year, tenantId);
  return {
    totalMiles: kpis.milesDriven,
    taxableMiles: kpis.taxableMiles,
    nonTaxableMiles: kpis.nonTaxableMiles,
    gallons: kpis.fuelPurchasedGallons,
    mpg: kpis.mpg,
    estimatedTax: kpis.estimatedIftaTax,
    missingReceipts: kpis.missingFuelReceipts,
  };
}

export function tripsForQuarterLabel(trips: IftaTripSegment[]) {
  return trips.map((t) => {
    const q = quarterFromDate(t.date);
    return { ...t, quarterLabel: `${q.quarter} ${q.year}` };
  });
}
