export type CommandPaletteCategory =
  | "advanced"
  | "platform"
  | "loads"
  | "drivers"
  | "workforce"
  | "wallet"
  | "network"
  | "exchange"
  | "companies"
  | "brokers"
  | "customers"
  | "invoices"
  | "trucks"
  | "trailers"
  | "documents"
  | "workflows";

export type CommandPaletteResult = {
  id: string;
  category: CommandPaletteCategory;
  title: string;
  subtitle?: string;
  href: string;
  keywords: string[];
};

export const COMMAND_PALETTE_CATEGORY_LABELS: Record<CommandPaletteCategory, string> = {
  advanced: "Advanced",
  platform: "Platform",
  loads: "Loads",
  drivers: "Drivers",
  workforce: "Workforce",
  wallet: "Wallet",
  network: "Verified Network",
  exchange: "Transpo Exchange™",
  companies: "Companies",
  brokers: "Brokers",
  customers: "Customers",
  invoices: "Invoices",
  trucks: "Trucks",
  trailers: "Trailers",
  documents: "Documents",
  workflows: "Workflows",
};

export const COMMAND_PALETTE_CATEGORY_ORDER: CommandPaletteCategory[] = [
  "advanced",
  "platform",
  "loads",
  "drivers",
  "workforce",
  "wallet",
  "network",
  "exchange",
  "companies",
  "brokers",
  "customers",
  "invoices",
  "trucks",
  "trailers",
  "documents",
  "workflows",
];
