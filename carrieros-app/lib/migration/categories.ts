import type { MigrationCategory } from "@/lib/migration/types";

export const MIGRATION_CATEGORIES: MigrationCategory[] = [
  "drivers",
  "trucks",
  "trailers",
  "loads",
  "customers",
  "brokers",
  "invoices",
  "payroll",
  "fuel",
  "maintenance",
  "documents",
  "expenses",
  "settlements",
];

export const MIGRATION_CATEGORY_LABELS: Record<MigrationCategory, string> = {
  drivers: "Drivers",
  trucks: "Trucks",
  trailers: "Trailers",
  loads: "Loads",
  customers: "Customers",
  brokers: "Brokers",
  invoices: "Invoices",
  payroll: "Payroll",
  fuel: "Fuel",
  maintenance: "Maintenance",
  documents: "Documents",
  expenses: "Expenses",
  settlements: "Settlements",
};

export const MIGRATION_CATEGORY_DESCRIPTIONS: Record<MigrationCategory, string> = {
  drivers: "Driver roster, CDL, and contact details",
  trucks: "Power units, VIN, and unit numbers",
  trailers: "Trailer fleet and equipment",
  loads: "Load history and lanes",
  customers: "Shippers and bill-to accounts",
  brokers: "Broker roster and MC/DOT",
  invoices: "Invoice history (import only — not certified)",
  payroll: "Pay runs and settlements",
  fuel: "Fuel purchases and IFTA-related exports",
  maintenance: "Repair and PM history",
  documents: "PODs, rate cons, and packets",
  expenses: "Trip and operating expenses",
  settlements: "Driver and carrier settlements",
};

/** Canonical fields per category used by the mapping engine */
export const CATEGORY_TARGET_FIELDS: Record<MigrationCategory, string[]> = {
  drivers: [
    "name",
    "phone",
    "email",
    "licenseNumber",
    "licenseState",
    "licenseClass",
    "licenseExpiresAt",
    "medicalExpiresAt",
    "hireDate",
    "status",
    "location",
    "homeTerminal",
  ],
  trucks: [
    "unitNumber",
    "vin",
    "make",
    "model",
    "year",
    "licensePlate",
    "licenseState",
    "mileage",
    "status",
    "location",
  ],
  trailers: [
    "unitNumber",
    "vin",
    "type",
    "make",
    "year",
    "licensePlate",
    "status",
  ],
  loads: [
    "reference",
    "originCity",
    "originState",
    "destinationCity",
    "destinationState",
    "pickupDate",
    "deliveryDate",
    "rate",
    "broker",
    "customer",
    "status",
  ],
  customers: ["name", "contact", "phone", "email", "city", "state", "mcNumber"],
  brokers: ["name", "mcNumber", "dotNumber", "phone", "email", "city", "state"],
  invoices: [
    "invoiceNumber",
    "loadReference",
    "amount",
    "dueDate",
    "status",
    "customer",
    "broker",
  ],
  payroll: ["driverName", "period", "grossPay", "deductions", "netPay", "status"],
  fuel: ["date", "truckUnit", "gallons", "amount", "state", "vendor"],
  maintenance: ["date", "truckUnit", "description", "amount", "vendor", "category"],
  documents: ["fileName", "type", "loadReference", "driverName", "date"],
  expenses: ["date", "category", "amount", "driverName", "truckUnit", "notes"],
  settlements: ["driverName", "period", "amount", "status", "loadCount"],
};

export const MIGRATION_YEARS = [2022, 2023, 2024, 2025, 2026] as const;

export const WIZARD_STEPS: {
  id: import("@/lib/migration/types").MigrationWizardStep;
  label: string;
  number: number;
}[] = [
  { id: "categories", label: "Categories", number: 1 },
  { id: "upload", label: "Upload", number: 2 },
  { id: "mapping", label: "Column mapping", number: 3 },
  { id: "cleaning", label: "Data cleaning", number: 4 },
  { id: "preview", label: "Preview", number: 5 },
  { id: "confirm", label: "Confirm", number: 6 },
  { id: "importing", label: "Import", number: 7 },
  { id: "summary", label: "Alph summary", number: 8 },
];
