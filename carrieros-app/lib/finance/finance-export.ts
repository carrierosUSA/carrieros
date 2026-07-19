export function downloadTextFile(filename: string, content: string, mime: string) {
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

export function downloadFinancePdfSummary(title: string, lines: string[]) {
  const body = [
    "Transpo.ai Finance Export",
    title,
    `Generated: ${new Date().toLocaleString()}`,
    "",
    ...lines,
    "",
    "(PDF stub — replace with real PDF renderer when integrations ship.)",
  ].join("\n");

  downloadTextFile(
    `${title.toLowerCase().replace(/\s+/g, "-")}.txt`,
    body,
    "text/plain;charset=utf-8",
  );
}

export function downloadFinanceExcelCsv(filename: string, headers: string[], rows: string[][]) {
  const escape = (cell: string) => {
    if (cell.includes(",") || cell.includes('"') || cell.includes("\n")) {
      return `"${cell.replace(/"/g, '""')}"`;
    }
    return cell;
  };

  const csv = [headers.map(escape).join(","), ...rows.map((r) => r.map(escape).join(","))].join(
    "\n",
  );

  downloadTextFile(filename, csv, "text/csv;charset=utf-8");
}
