import type { IntegrationProviderId } from "@/lib/settings/types";

export type IntegrationMeta = {
  id: IntegrationProviderId;
  name: string;
  description: string;
  category: "Accounting" | "Payments" | "Communications" | "Telematics" | "Compliance";
};

export const SETTINGS_INTEGRATIONS: IntegrationMeta[] = [
  {
    id: "quickbooks",
    name: "QuickBooks Online",
    description: "Sync invoices, expenses, and payments.",
    category: "Accounting",
  },
  {
    id: "xero",
    name: "Xero",
    description: "Two-way AR, bills, and reconciliation.",
    category: "Accounting",
  },
  {
    id: "stripe",
    name: "Stripe",
    description: "Collect payments and manage payouts.",
    category: "Payments",
  },
  {
    id: "plaid",
    name: "Plaid",
    description: "Bank balances and cash-flow sync.",
    category: "Payments",
  },
  {
    id: "twilio",
    name: "Twilio",
    description: "SMS check calls and driver messaging.",
    category: "Communications",
  },
  {
    id: "samsara",
    name: "Samsara",
    description: "Telematics, HOS, and fault codes.",
    category: "Telematics",
  },
  {
    id: "motive",
    name: "Motive",
    description: "ELD, location, and safety events.",
    category: "Telematics",
  },
  {
    id: "geotab",
    name: "Geotab",
    description: "Fleet tracking and engine data.",
    category: "Telematics",
  },
  {
    id: "fmcsa",
    name: "FMCSA",
    description: "Carrier snapshot, inspections, crashes.",
    category: "Compliance",
  },
];
