import { parseCsvText } from "@/lib/migration/parsers/csv";
import {
  detectFileKind,
  validateMigrationFile,
} from "@/lib/migration/parsers/validate-file";
import type { ParsedSheet } from "@/lib/migration/types";

export { parseCsvText } from "@/lib/migration/parsers/csv";
export {
  validateMigrationFile,
  detectFileKind,
  extensionOf,
} from "@/lib/migration/parsers/validate-file";

/**
 * Parse an uploaded file into a sheet.
 * Real: CSV/TSV text. Stub: XLSX/PDF/QuickBooks (demo extract or export guidance).
 */
export async function parseMigrationFile(file: File): Promise<ParsedSheet> {
  const validation = validateMigrationFile(file.name, file.type, file.size);
  if (!validation.ok) {
    throw new Error(validation.reason);
  }

  const kind = validation.kind;

  if (kind === "csv" || file.name.toLowerCase().endsWith(".tsv")) {
    const text = await file.text();
    const { headers, rows } = parseCsvText(text);
    if (headers.length === 0) {
      throw new Error("No columns found. Check that the first row has headers.");
    }
    return {
      fileName: file.name,
      fileKind: "csv",
      headers,
      rows,
      stubParse: false,
    };
  }

  if (kind === "xlsx") {
    // No xlsx dependency in package.json — guide user + offer empty stub structure.
    return {
      fileName: file.name,
      fileKind: "xlsx",
      headers: [],
      rows: [],
      stubParse: true,
      parseNote:
        "Excel files are accepted for the migration package. For live column mapping, export the sheet as CSV (File → Save As → CSV) and upload again. Sample CSVs are available on the dashboard.",
    };
  }

  if (kind === "pdf" || kind === "quickbooks" || kind === "image") {
    return {
      fileName: file.name,
      fileKind: kind,
      headers: ["Document", "Detected type", "Notes"],
      rows: [
        {
          Document: file.name,
          "Detected type": kind === "pdf" ? "PDF report" : kind,
          Notes:
            "AI will classify this document in Document Import. Spreadsheet-style mapping needs a CSV export.",
        },
      ],
      stubParse: true,
      parseNote:
        "PDF and accounting exports are classified by Alph. Structured imports work best from CSV.",
    };
  }

  const text = await file.text().catch(() => "");
  if (text.includes(",") || text.includes("\t")) {
    const { headers, rows } = parseCsvText(text);
    if (headers.length > 0) {
      return {
        fileName: file.name,
        fileKind: detectFileKind(file.name, file.type),
        headers,
        rows,
        stubParse: false,
        parseNote: "Parsed as delimited text.",
      };
    }
  }

  return {
    fileName: file.name,
    fileKind: "other",
    headers: [],
    rows: [],
    stubParse: true,
    parseNote: "Could not parse this file. Export as CSV and try again.",
  };
}

/** Google Sheets: paste URL is stored as metadata; user should also export CSV. */
export function parseGoogleSheetsReference(urlOrLabel: string): ParsedSheet {
  const trimmed = urlOrLabel.trim();
  const isUrl = /docs\.google\.com\/spreadsheets/i.test(trimmed);
  return {
    fileName: isUrl ? "Google Sheets link" : trimmed || "Google Sheets",
    fileKind: "google_sheets",
    headers: [],
    rows: [],
    stubParse: true,
    parseNote: isUrl
      ? "Google Sheets link saved. For import, open the sheet → File → Download → Comma-separated values (.csv), then upload that CSV here."
      : "Enter a Google Sheets URL, or download the sheet as CSV and upload it.",
  };
}
