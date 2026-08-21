import "server-only";
import { getSupabaseAuthenticatedUserClient } from "@/lib/supabase/server";

export type Receivable = {
  loadId: string;
  loadNumber: string;
  brokerName?: string;
  loadStatus: string;
  rateCents: number;
  currency: string;
  invoiceNumber?: string;
  invoiceIssuedAt?: string;
  expectedPaymentAt?: string;
  paymentStatus: "unbilled" | "invoiced" | "partial" | "paid";
  paidCents: number;
  paidAt?: string;
};

type Row = Record<string, unknown>;
const text = (value: unknown) => typeof value === "string" ? value : "";
const number = (value: unknown) => Number.isFinite(Number(value)) ? Number(value) : 0;

export class ReceivablesRepository {
  async list(accessToken: string): Promise<Receivable[]> {
    const db = getSupabaseAuthenticatedUserClient(accessToken);
    const result = await db.rpc("list_finance_receivables");
    if (result.error) throw new Error("Authorized receivables are unavailable.");
    const entries = Array.isArray(result.data) ? result.data : [];
    return entries.flatMap((value): Receivable[] => {
      if (!value || typeof value !== "object") return [];
      const row = value as Row;
      const loadId = text(row.load_id);
      if (!loadId) return [];
      const status = text(row.payment_status);
      const paymentStatus: Receivable["paymentStatus"] = status === "invoiced" || status === "partial" || status === "paid" ? status : "unbilled";
      return [{
        loadId,
        loadNumber: text(row.load_number),
        brokerName: text(row.broker_name) || undefined,
        loadStatus: text(row.load_status),
        rateCents: number(row.rate_cents),
        currency: text(row.currency) || "USD",
        invoiceNumber: text(row.invoice_number) || undefined,
        invoiceIssuedAt: text(row.invoice_issued_at) || undefined,
        expectedPaymentAt: text(row.expected_payment_at) || undefined,
        paymentStatus,
        paidCents: number(row.paid_cents),
        paidAt: text(row.paid_at) || undefined,
      }];
    });
  }
}
