/**
 * Lightweight client-side CSV parser (RFC4180-ish).
 * No external dependency required.
 */

export function parseCsvText(text: string): {
  headers: string[];
  rows: Record<string, string>[];
} {
  const records = splitCsvRecords(text);
  if (records.length === 0) {
    return { headers: [], rows: [] };
  }

  const headers = records[0].map((h) => h.trim()).filter(Boolean);
  if (headers.length === 0) {
    return { headers: [], rows: [] };
  }

  const rows: Record<string, string>[] = [];
  for (let i = 1; i < records.length; i++) {
    const cells = records[i];
    if (cells.every((c) => !c.trim())) continue;
    const row: Record<string, string> = {};
    headers.forEach((header, idx) => {
      row[header] = (cells[idx] ?? "").trim();
    });
    rows.push(row);
  }

  return { headers, rows };
}

function splitCsvRecords(text: string): string[][] {
  const normalized = text.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;

  for (let i = 0; i < normalized.length; i++) {
    const ch = normalized[i];
    const next = normalized[i + 1];

    if (inQuotes) {
      if (ch === '"' && next === '"') {
        cell += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        cell += ch;
      }
      continue;
    }

    if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      row.push(cell);
      cell = "";
    } else if (ch === "\n") {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += ch;
    }
  }

  if (cell.length > 0 || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }

  return rows;
}
