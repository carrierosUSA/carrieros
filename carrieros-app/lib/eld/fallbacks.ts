import type { EldFallbackImportKind } from "./types";

export type EldFallbackOption = {
  kind: EldFallbackImportKind;
  title: string;
  description: string;
  accept: string;
  iftaRelevant: boolean;
  tip: string;
};

export const ELD_FALLBACK_OPTIONS: EldFallbackOption[] = [
  {
    kind: "csv_import",
    title: "CSV Import",
    description: "Upload vehicle or state mileage exports as CSV.",
    accept: ".csv,text/csv",
    iftaRelevant: true,
    tip: "Best for weekly IFTA mileage when your ELD portal can export CSV.",
  },
  {
    kind: "excel_import",
    title: "Excel Import",
    description: "Upload .xlsx / .xls fleet or HOS summaries.",
    accept: ".xlsx,.xls,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    iftaRelevant: true,
    tip: "Keep column headers like Unit, State, Miles, Date for cleaner mapping.",
  },
  {
    kind: "manual_mileage",
    title: "Manual Mileage Upload",
    description: "Enter or attach a simple mileage worksheet for specific trucks.",
    accept: ".csv,.xlsx,.txt",
    iftaRelevant: true,
    tip: "Use when you only need a few units updated before filing.",
  },
  {
    kind: "fuel_report",
    title: "Fuel Report Upload",
    description: "Upload fuel card or ELD fuel purchase reports.",
    accept: ".csv,.xlsx,.pdf",
    iftaRelevant: true,
    tip: "Pairs with IFTA fuel gallons when live fuel data is unavailable.",
  },
  {
    kind: "scheduled_email",
    title: "Scheduled Email Import",
    description: "Record a recurring email report you forward into CarrierOS.",
    accept: ".eml,.txt,.pdf",
    iftaRelevant: false,
    tip: "Save the sample email once — ops can match the schedule later.",
  },
  {
    kind: "eld_report",
    title: "ELD Report Upload",
    description: "Upload PDF or portal reports from your ELD as a stub import.",
    accept: ".pdf,.csv,.xlsx,.zip",
    iftaRelevant: false,
    tip: "Useful for HOS snapshots and compliance packets while API access is pending.",
  },
];

export function getFallbackOption(
  kind: EldFallbackImportKind,
): EldFallbackOption | undefined {
  return ELD_FALLBACK_OPTIONS.find((o) => o.kind === kind);
}
