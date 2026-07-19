import { MIGRATION_CATEGORY_LABELS } from "@/lib/migration/categories";
import type {
  AlphMigrationSummary,
  MigrationCategory,
  MigrationRun,
  MigrationSandboxRecord,
  MigrationYear,
} from "@/lib/migration/types";

/**
 * Post-import Alph summary — decision support only.
 * Never auto-approves financial or compliance correctness.
 */
export function buildAlphMigrationSummary(
  run: MigrationRun,
  sandbox: MigrationSandboxRecord[],
): AlphMigrationSummary {
  const records = sandbox.filter((r) => r.runId === run.id);
  const byCat = (c: MigrationCategory) =>
    records.filter((r) => r.category === c);

  const drivers = byCat("drivers");
  const trucks = byCat("trucks");
  const loads = byCat("loads");
  const customers = byCat("customers");
  const brokers = byCat("brokers");
  const invoices = byCat("invoices");

  const year: MigrationYear | null = run.year;
  const yearLabel = year ? String(year) : "recent history";

  const customerNames = uniqueField(customers, "name").slice(0, 5);
  const brokerNames = uniqueField(brokers, "name").slice(0, 5);
  if (customerNames.length === 0) {
    customerNames.push(...uniqueField(loads, "customer").slice(0, 5));
  }
  if (brokerNames.length === 0) {
    brokerNames.push(...uniqueField(loads, "broker").slice(0, 5));
  }

  const revenueHint = estimateRevenue(loads, invoices);
  const missing: string[] = [];
  const dataIssues: string[] = [];

  if (drivers.some((d) => !d.data.licenseNumber)) {
    missing.push("Some drivers are missing license numbers.");
  }
  if (trucks.some((t) => !t.data.vin)) {
    missing.push("Some trucks are missing VINs.");
  }
  if (run.counts.warnings > 0) {
    dataIssues.push(
      `${run.counts.warnings} rows had warnings during cleaning — review before relying on them for compliance.`,
    );
  }
  if (run.counts.duplicates > 0) {
    dataIssues.push(
      `${run.counts.duplicates} possible duplicates were flagged. Confirm which records to keep.`,
    );
  }
  if (invoices.length > 0) {
    dataIssues.push(
      "Invoice amounts were imported as data only — Alph does not certify books as correct.",
    );
  }

  const util =
    trucks.length > 0 && drivers.length > 0
      ? `About ${drivers.length} drivers and ${trucks.length} trucks are in the migration sandbox for ${yearLabel}. Utilization trends need live ELD data to confirm.`
      : "Add both drivers and trucks to estimate utilization.";

  const cats = run.categories
    .map((c) => MIGRATION_CATEGORY_LABELS[c])
    .join(", ");

  return {
    id: `sum-${run.id}`,
    runId: run.id,
    createdAt: new Date().toISOString(),
    year,
    business: `Imported ${run.counts.imported} records across ${cats || "selected categories"} for ${yearLabel}. This is a starting picture of the operation — not a certified financial close.`,
    fleet:
      trucks.length > 0
        ? `${trucks.length} trucks landed in the sandbox${
            uniqueField(trucks, "make")[0]
              ? ` (including ${uniqueField(trucks, "make").slice(0, 3).join(", ")})`
              : ""
          }. Review unit numbers and VINs before assigning loads.`
        : "No trucks were imported in this run.",
    drivers:
      drivers.length > 0
        ? `${drivers.length} drivers imported. Confirm CDL and medical dates before putting anyone on a load.`
        : "No drivers were imported in this run.",
    customers:
      customers.length > 0 || customerNames.length > 0
        ? `Customer signals point to ${customerNames.slice(0, 3).join(", ") || "imported accounts"}. Treat as a directory seed — verify contacts.`
        : "No customer directory rows in this import.",
    brokers:
      brokers.length > 0 || brokerNames.length > 0
        ? `Broker signals: ${brokerNames.slice(0, 3).join(", ") || "imported brokers"}. Verify MC/DOT before accepting freight.`
        : "No broker rows in this import.",
    revenueTrends: revenueHint,
    topCustomers: customerNames.length ? customerNames : ["Not enough customer data yet"],
    topBrokers: brokerNames.length ? brokerNames : ["Not enough broker data yet"],
    utilization: util,
    missingInfo: missing.length
      ? missing
      : ["No critical gaps detected in the imported fields — still verify against source files."],
    dataIssues: dataIssues.length
      ? dataIssues
      : ["No major data issues recorded for this run."],
    suggestedImprovements: [
      "Confirm overwrite choices if you re-import the same year.",
      "Connect ELD later to validate truck utilization against the sandbox roster.",
      "Use Document Import for PODs and rate cons that were not in spreadsheets.",
      "Ask Alph for a morning briefing after you review Drivers and Fleet.",
    ],
    decisionSupportOnly: true,
  };
}

function uniqueField(
  records: MigrationSandboxRecord[],
  field: string,
): string[] {
  const set = new Set<string>();
  for (const r of records) {
    const v = (r.data[field] ?? "").trim();
    if (v) set.add(v);
  }
  return [...set];
}

function estimateRevenue(
  loads: MigrationSandboxRecord[],
  invoices: MigrationSandboxRecord[],
): string {
  const amounts: number[] = [];
  for (const r of [...loads, ...invoices]) {
    const raw = r.data.rate ?? r.data.amount ?? "";
    const n = Number(String(raw).replace(/[^0-9.-]/g, ""));
    if (!Number.isNaN(n) && n > 0) amounts.push(n);
  }
  if (amounts.length === 0) {
    return "Not enough rate or invoice amounts to sketch a revenue trend. Import load rates or invoices (as data) for a clearer picture.";
  }
  const total = amounts.reduce((a, b) => a + b, 0);
  const avg = total / amounts.length;
  return `From ${amounts.length} priced rows, imported amounts total about $${Math.round(total).toLocaleString()} (avg $${Math.round(avg).toLocaleString()}). This is an import sketch only — not an accounting statement.`;
}
