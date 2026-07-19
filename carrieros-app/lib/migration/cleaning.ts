import type {
  CleaningIssue,
  CleaningResolution,
  MigrationCategory,
  PreviewRow,
} from "@/lib/migration/types";

const VIN_RE = /^[A-HJ-NPR-Z0-9]{17}$/i;
const MC_RE = /^(MC-?)?\d{4,8}$/i;
const DOT_RE = /^(USDOT-?|DOT-?)?\d{5,9}$/i;
const DATE_RE =
  /^(\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/\d{2,4}|\d{1,2}-\d{1,2}-\d{2,4})$/;
const CURRENCY_RE = /^\$?-?\d{1,3}(,\d{3})*(\.\d{2})?$|^\$?-?\d+(\.\d{2})?$/;

function uid(prefix: string, i: number): string {
  return `${prefix}-${i}-${Math.random().toString(36).slice(2, 7)}`;
}

function isBlank(v: string | undefined): boolean {
  return !v || !v.trim();
}

/**
 * Detect data issues. Suggestions only — never silently modify rows.
 */
export function detectCleaningIssues(
  projected: Record<string, string>[],
  primaryCategory: MigrationCategory,
): CleaningIssue[] {
  const issues: CleaningIssue[] = [];
  const keyField =
    primaryCategory === "drivers"
      ? "name"
      : primaryCategory === "trucks" || primaryCategory === "trailers"
        ? "unitNumber"
        : primaryCategory === "loads"
          ? "reference"
          : primaryCategory === "brokers" || primaryCategory === "customers"
            ? "name"
            : "name";

  const seen = new Map<string, number>();

  projected.forEach((row, rowIndex) => {
    const key = (row[keyField] ?? "").trim().toLowerCase();
    if (key) {
      if (seen.has(key)) {
        issues.push({
          id: uid("dup", rowIndex),
          rowIndex,
          field: keyField,
          kind: "duplicate",
          severity: "warning",
          message: `Possible duplicate of row ${(seen.get(key) ?? 0) + 1} (${keyField}: ${row[keyField]})`,
          resolution: null,
        });
      } else {
        seen.set(key, rowIndex);
      }
    }

    const required =
      primaryCategory === "drivers"
        ? ["name"]
        : primaryCategory === "trucks"
          ? ["unitNumber"]
          : primaryCategory === "loads"
            ? ["reference"]
            : ["name"];

    for (const field of required) {
      if (field in row && isBlank(row[field])) {
        issues.push({
          id: uid("miss", rowIndex),
          rowIndex,
          field,
          kind: "missing_value",
          severity: "error",
          message: `Missing required value: ${field}`,
          resolution: null,
        });
      }
    }

    for (const [field, value] of Object.entries(row)) {
      if (isBlank(value)) continue;

      if (
        /date|expires|hired|pickup|delivery|due/i.test(field) &&
        !DATE_RE.test(value.trim())
      ) {
        issues.push({
          id: uid("date", rowIndex),
          rowIndex,
          field,
          kind: "invalid_date",
          severity: "warning",
          message: `Date may be invalid: ${value}`,
          suggestedValue: suggestDate(value),
          resolution: null,
        });
      }

      if (field === "vin" && !VIN_RE.test(value.replace(/\s/g, ""))) {
        issues.push({
          id: uid("vin", rowIndex),
          rowIndex,
          field,
          kind: "invalid_vin",
          severity: "warning",
          message: `VIN format looks unusual (${value.length} chars)`,
          resolution: null,
        });
      }

      if (field === "mcNumber" && !MC_RE.test(value.replace(/\s/g, ""))) {
        issues.push({
          id: uid("mc", rowIndex),
          rowIndex,
          field,
          kind: "invalid_mc",
          severity: "warning",
          message: `MC number may need review: ${value}`,
          suggestedValue: value.replace(/\s/g, "").toUpperCase(),
          resolution: null,
        });
      }

      if (field === "dotNumber" && !DOT_RE.test(value.replace(/\s/g, ""))) {
        issues.push({
          id: uid("dot", rowIndex),
          rowIndex,
          field,
          kind: "invalid_dot",
          severity: "warning",
          message: `DOT number may need review: ${value}`,
          resolution: null,
        });
      }

      if (
        /amount|rate|pay|gross|net|deductions|cost/i.test(field) &&
        !CURRENCY_RE.test(value.trim())
      ) {
        issues.push({
          id: uid("cur", rowIndex),
          rowIndex,
          field,
          kind: "invalid_currency",
          severity: "info",
          message: `Currency format may need cleanup: ${value}`,
          suggestedValue: value.replace(/[^0-9.-]/g, ""),
          resolution: null,
        });
      }

      if (
        /amount|rate|pay|gross|net|gallons|mileage/i.test(field) &&
        /^-/.test(value.trim().replace("$", ""))
      ) {
        issues.push({
          id: uid("neg", rowIndex),
          rowIndex,
          field,
          kind: "negative_value",
          severity: "warning",
          message: `Negative value found: ${value}`,
          resolution: null,
        });
      }

      if (value !== value.trim() || /\s{2,}/.test(value)) {
        issues.push({
          id: uid("fmt", rowIndex),
          rowIndex,
          field,
          kind: "formatting",
          severity: "info",
          message: `Extra spacing in ${field}`,
          suggestedValue: value.trim().replace(/\s+/g, " "),
          resolution: null,
        });
      }
    }
  });

  return issues;
}

function suggestDate(raw: string): string | undefined {
  const m = raw.trim().match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})$/);
  if (!m) return undefined;
  const year = m[3].length === 2 ? `20${m[3]}` : m[3];
  return `${year}-${m[1].padStart(2, "0")}-${m[2].padStart(2, "0")}`;
}

export function resolveCleaningIssue(
  issues: CleaningIssue[],
  issueId: string,
  resolution: CleaningResolution,
): CleaningIssue[] {
  return issues.map((i) => (i.id === issueId ? { ...i, resolution } : i));
}

export function resolveAllCleaningIssues(
  issues: CleaningIssue[],
  resolution: CleaningResolution,
): CleaningIssue[] {
  return issues.map((i) =>
    i.resolution ? i : { ...i, resolution },
  );
}

/**
 * Build preview rows. Applies user-approved fixes only (never silent).
 */
export function buildPreviewRows(
  projected: Record<string, string>[],
  issues: CleaningIssue[],
  category: MigrationCategory,
): PreviewRow[] {
  return projected.map((row, rowIndex) => {
    const rowIssues = issues.filter((i) => i.rowIndex === rowIndex);
    const data = { ...row };

    for (const issue of rowIssues) {
      if (
        issue.resolution === "fix" &&
        issue.field &&
        issue.suggestedValue != null
      ) {
        data[issue.field] = issue.suggestedValue;
      }
    }

    const skipped = rowIssues.some((i) => i.resolution === "skip");
    const hasError = rowIssues.some(
      (i) => i.severity === "error" && i.resolution !== "skip" && i.resolution !== "fix",
    );
    const hasDup = rowIssues.some(
      (i) => i.kind === "duplicate" && i.resolution !== "skip",
    );
    const hasWarn = rowIssues.some(
      (i) =>
        (i.severity === "warning" || i.severity === "info") &&
        i.resolution == null,
    );

    let status: PreviewRow["status"] = "ready";
    if (skipped) status = "skipped";
    else if (hasError) status = "error";
    else if (hasDup) status = "duplicate";
    else if (hasWarn) status = "warning";

    return {
      id: `row-${rowIndex}`,
      rowIndex,
      category,
      data,
      selected: status === "ready" || status === "warning" || status === "duplicate",
      status,
      issues: rowIssues.map((i) => i.message),
    };
  });
}

export function summarizePreview(rows: PreviewRow[]) {
  return {
    found: rows.length,
    ready: rows.filter((r) => r.status === "ready" && r.selected).length,
    warnings: rows.filter((r) => r.status === "warning").length,
    errors: rows.filter((r) => r.status === "error").length,
    duplicates: rows.filter((r) => r.status === "duplicate").length,
    skipped: rows.filter((r) => r.status === "skipped" || !r.selected).length,
    imported: 0,
  };
}
