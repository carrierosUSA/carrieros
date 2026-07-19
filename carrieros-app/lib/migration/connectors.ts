import type { MigrationConnector } from "@/lib/migration/types";

/**
 * Future TMS / accounting connectors.
 * Architecture only — does not change the core CSV import pipeline.
 */
export const MIGRATION_CONNECTORS: MigrationConnector[] = [
  {
    id: "samsara",
    name: "Samsara",
    description: "Fleet roster and vehicle master data.",
    status: "coming_soon",
    exportHint: "Export vehicles and drivers as CSV from Samsara Reports.",
  },
  {
    id: "motive",
    name: "Motive (KeepTruckin)",
    description: "Drivers, vehicles, and fuel cards.",
    status: "coming_soon",
    exportHint: "Export driver and vehicle lists as CSV.",
  },
  {
    id: "quickbooks",
    name: "QuickBooks",
    description: "Customers, invoices, and expenses.",
    status: "coming_soon",
    exportHint: "Export customers and invoices as CSV or Excel.",
  },
  {
    id: "mcs",
    name: "McLeod",
    description: "Loads, customers, and settlements.",
    status: "coming_soon",
    exportHint: "Coming soon — use CSV exports for now.",
  },
  {
    id: "tmw",
    name: "TMW / Trimble",
    description: "Dispatch history and equipment.",
    status: "coming_soon",
    exportHint: "Coming soon — use CSV exports for now.",
  },
  {
    id: "pc_miler",
    name: "PC*MILER / ALK",
    description: "Mileage and route history.",
    status: "coming_soon",
  },
  {
    id: "google_sheets",
    name: "Google Sheets",
    description: "Paste a sheet link or download CSV.",
    status: "available",
    exportHint: "File → Download → CSV, then upload in the wizard.",
  },
  {
    id: "excel",
    name: "Excel / CSV",
    description: "Spreadsheet exports from any TMS.",
    status: "available",
    exportHint: "CSV is fully supported. Excel: export as CSV for mapping.",
  },
];

export type MigrationConnectorAdapter = {
  id: string;
  /** Reserved for future OAuth / API pull — never auto-writes data */
  connect?: () => Promise<{ ok: boolean; message: string }>;
  exportHint: string;
};

export function getConnectorAdapter(id: string): MigrationConnectorAdapter | undefined {
  const connector = MIGRATION_CONNECTORS.find((c) => c.id === id);
  if (!connector) return undefined;
  return {
    id: connector.id,
    exportHint: connector.exportHint ?? "Export as CSV and upload in AI Migration Center.",
    connect: async () => ({
      ok: false,
      message: "Direct connectors are coming soon. Export as CSV to migrate safely today.",
    }),
  };
}
