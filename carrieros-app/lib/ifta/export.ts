import {
  buildStateRows,
  buildTruckRows,
  formatGallons,
  formatMiles,
  formatMoney,
  formatMpg,
  listFuelForView,
  summarizeForPackage,
} from "./board";
import { formatTax, getStateName } from "./tax";
import type {
  IftaFuelPurchase,
  IftaGeneratedReport,
  IftaQuarterId,
  IftaReportKind,
} from "./types";

export function downloadTextFile(
  filename: string,
  content: string,
  mime: string,
) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function escapeCsv(cell: string) {
  if (cell.includes(",") || cell.includes('"') || cell.includes("\n")) {
    return `"${cell.replace(/"/g, '""')}"`;
  }
  return cell;
}

export function downloadIftaCsv(
  filename: string,
  headers: string[],
  rows: string[][],
) {
  const csv = [
    headers.map(escapeCsv).join(","),
    ...rows.map((r) => r.map(escapeCsv).join(",")),
  ].join("\n");
  downloadTextFile(filename, csv, "text/csv;charset=utf-8");
}

/** CSV labeled for Excel — .xlsx extension with CSV content (no heavy deps). */
export function downloadIftaExcelCsv(
  filename: string,
  headers: string[],
  rows: string[][],
) {
  const safeName = filename.endsWith(".xlsx")
    ? filename
    : filename.replace(/\.csv$/i, "") + ".xlsx";
  const csv = [
    headers.map(escapeCsv).join(","),
    ...rows.map((r) => r.map(escapeCsv).join(",")),
  ].join("\n");
  downloadTextFile(
    safeName,
    csv,
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  );
}

export function downloadIftaPdfSummary(title: string, lines: string[]) {
  const body = [
    "Transpo.ai IFTA Report",
    title,
    `Generated: ${new Date().toLocaleString()}`,
    "",
    ...lines,
    "",
    "(PDF text stub — replace with real PDF renderer when integrations ship.)",
  ].join("\n");

  downloadTextFile(
    `${title.toLowerCase().replace(/\s+/g, "-")}.txt`,
    body,
    "text/plain;charset=utf-8",
  );
}

function fuelRows(fuel: IftaFuelPurchase[]): string[][] {
  return fuel.map((f) => [
    f.date,
    f.state,
    f.vendor,
    String(f.gallons),
    String(f.pricePerGallon),
    String(f.totalCost),
    f.receiptStatus,
    f.truckId,
    f.driverId ?? "",
  ]);
}

export function exportReportByKind(
  kind: IftaReportKind | "csv" | "xlsx" | "pdf",
  quarter: IftaQuarterId,
  year: number,
): { format: "csv" | "xlsx" | "pdf" | "txt"; filename: string } {
  const label = `${quarter}-${year}`;
  const trucks = buildTruckRows(quarter, year);
  const states = buildStateRows(quarter, year);
  const fuel = listFuelForView(quarter, year);
  const summary = summarizeForPackage(quarter, year);

  if (kind === "truck_summary" || kind === "csv") {
    const filename = `ifta-truck-summary-${label}.csv`;
    downloadIftaCsv(
      filename,
      ["Truck", "Total Miles", "Total Fuel", "MPG", "States", "Est. Tax"],
      trucks.map((t) => [
        t.unitNumber,
        String(t.totalMiles),
        String(t.totalFuel),
        String(t.mpg),
        t.statesVisited.join("|"),
        String(t.estimatedTax),
      ]),
    );
    return { format: "csv", filename };
  }

  if (kind === "state_summary") {
    const filename = `ifta-state-summary-${label}.csv`;
    downloadIftaCsv(
      filename,
      [
        "State",
        "Name",
        "Total Miles",
        "Taxable Miles",
        "Gallons",
        "Fuel Cost",
        "MPG",
        "Tax Rate",
        "Est. Tax",
      ],
      states.map((s) => [
        s.state,
        s.stateName,
        String(s.totalMiles),
        String(s.taxableMiles),
        String(s.gallons),
        String(s.fuelPurchasedCost),
        String(s.mpg),
        String(s.taxRate),
        String(s.estimatedTax),
      ]),
    );
    return { format: "csv", filename };
  }

  if (kind === "fuel_summary") {
    const filename = `ifta-fuel-summary-${label}.csv`;
    downloadIftaCsv(
      filename,
      [
        "Date",
        "State",
        "Vendor",
        "Gallons",
        "Price/Gal",
        "Total",
        "Receipt",
        "Truck",
        "Driver",
      ],
      fuelRows(fuel),
    );
    return { format: "csv", filename };
  }

  if (kind === "mileage_summary") {
    const filename = `ifta-mileage-summary-${label}.csv`;
    downloadIftaCsv(
      filename,
      ["State", "Total Miles", "Taxable Miles", "Est. Tax"],
      states.map((s) => [
        s.state,
        String(s.totalMiles),
        String(s.taxableMiles),
        String(s.estimatedTax),
      ]),
    );
    return { format: "csv", filename };
  }

  if (kind === "xlsx") {
    const filename = `ifta-package-${label}.xlsx`;
    downloadIftaExcelCsv(
      filename,
      ["Section", "Metric", "Value"],
      [
        ["Summary", "Quarter", `${quarter} ${year}`],
        ["Summary", "Total Miles", String(summary.totalMiles)],
        ["Summary", "Taxable Miles", String(summary.taxableMiles)],
        ["Summary", "Gallons", String(summary.gallons)],
        ["Summary", "MPG", String(summary.mpg)],
        ["Summary", "Estimated Tax", String(summary.estimatedTax)],
        ...states.map((s) => [
          "State",
          `${s.state} miles`,
          String(s.totalMiles),
        ]),
        ...trucks.map((t) => [
          "Truck",
          `Unit ${t.unitNumber} miles`,
          String(t.totalMiles),
        ]),
      ],
    );
    return { format: "xlsx", filename };
  }

  // quarter_summary, package, pdf
  const title =
    kind === "quarter_summary"
      ? `IFTA Quarter Summary ${quarter} ${year}`
      : `IFTA Package ${quarter} ${year}`;
  const lines = [
    `Quarter: ${quarter} ${year}`,
    `Total miles: ${formatMiles(summary.totalMiles)}`,
    `Taxable miles: ${formatMiles(summary.taxableMiles)}`,
    `Non-taxable miles: ${formatMiles(summary.nonTaxableMiles)}`,
    `Fuel gallons: ${formatGallons(summary.gallons)}`,
    `Fleet MPG: ${formatMpg(summary.mpg)}`,
    `Estimated IFTA tax: ${formatTax(summary.estimatedTax)}`,
    `Missing receipts: ${summary.missingReceipts}`,
    "",
    "States:",
    ...states.map(
      (s) =>
        `  ${s.state} (${getStateName(s.state)}): ${formatMiles(s.totalMiles)} mi, ${formatGallons(s.gallons)} gal, tax ${formatTax(s.estimatedTax)}`,
    ),
    "",
    "Trucks:",
    ...trucks.map(
      (t) =>
        `  Unit ${t.unitNumber}: ${formatMiles(t.totalMiles)} mi, ${formatGallons(t.totalFuel)} gal, MPG ${formatMpg(t.mpg)}`,
    ),
  ];
  downloadIftaPdfSummary(title, lines);
  return {
    format: "txt",
    filename: `${title.toLowerCase().replace(/\s+/g, "-")}.txt`,
  };
}

export function buildPackageDownloadLines(report: IftaGeneratedReport): string[] {
  const s = report.summary;
  return [
    `Report: ${report.title}`,
    `Generated by: ${report.generatedBy}`,
    `Generated at: ${new Date(report.generatedAt).toLocaleString()}`,
    `Quarter: ${report.quarter} ${report.year}`,
    "",
    `Total miles: ${formatMiles(s.totalMiles)}`,
    `Taxable miles: ${formatMiles(s.taxableMiles)}`,
    `Non-taxable: ${formatMiles(s.nonTaxableMiles)}`,
    `Gallons: ${formatGallons(s.gallons)}`,
    `MPG: ${formatMpg(s.mpg)}`,
    `Estimated tax: ${formatMoney(s.estimatedTax)}`,
    `Missing receipts: ${s.missingReceipts}`,
  ];
}
