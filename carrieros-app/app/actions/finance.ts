"use server";

import { revalidatePath } from "next/cache";
import { requireDocumentAuth } from "@/lib/auth/supabase-server";
import type { BusinessRole } from "@/lib/auth/roles";
import { ReceivablesRepository, type Receivable } from "@/lib/finance/receivables";
import { getSupabaseAuthenticatedUserClient } from "@/lib/supabase/server";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const FINANCE_ROLES = new Set<BusinessRole>(["super_admin", "owner", "accounting"]);
type Result = { ok: true; receivables: Receivable[] } | { ok: false; error: string };

async function authorized() {
  const auth = await requireDocumentAuth();
  if (!FINANCE_ROLES.has(auth.businessRole)) throw new Error("unauthorized");
  return auth;
}

export async function getReceivablesAction(): Promise<Result> {
  try {
    const auth = await authorized();
    return { ok: true, receivables: await new ReceivablesRepository().list(auth.accessToken) };
  } catch {
    return { ok: false, error: "Finance is restricted to authenticated owners and accounting users." };
  }
}

export async function recordVerifiedInvoiceAction(input: {
  loadId: string; invoiceNumber: string; issuedAt: string; paymentTermsDays: number; requestId: string;
}): Promise<Result> {
  const invoiceNumber = input.invoiceNumber.trim().slice(0, 100);
  const issuedAt = new Date(input.issuedAt);
  if (!UUID_PATTERN.test(input.loadId) || !UUID_PATTERN.test(input.requestId) || !invoiceNumber || Number.isNaN(issuedAt.getTime()) || !Number.isInteger(input.paymentTermsDays) || input.paymentTermsDays < 0 || input.paymentTermsDays > 180) {
    return { ok: false, error: "Enter a valid verified invoice number, date, and payment terms." };
  }
  try {
    const auth = await authorized();
    const db = getSupabaseAuthenticatedUserClient(auth.accessToken);
    const result = await db.rpc("record_verified_invoice", {
      p_load_id: input.loadId, p_invoice_number: invoiceNumber, p_issued_at: issuedAt.toISOString(),
      p_payment_terms_days: input.paymentTermsDays, p_request_id: input.requestId,
    });
    if (result.error) return { ok: false, error: "Invoice requires a delivered load, verified rate, and linked approved invoice document." };
    revalidatePath("/finance");
    return { ok: true, receivables: await new ReceivablesRepository().list(auth.accessToken) };
  } catch {
    return { ok: false, error: "The invoice was not recorded. No financial state changed." };
  }
}

export async function recordVerifiedPaymentAction(input: {
  loadId: string; amountCents: number; paidAt: string; paymentReference: string; note?: string; requestId: string;
}): Promise<Result> {
  const paidAt = new Date(input.paidAt);
  const paymentReference = input.paymentReference.trim().slice(0, 200);
  const note = input.note?.trim().slice(0, 2000) || null;
  if (!UUID_PATTERN.test(input.loadId) || !UUID_PATTERN.test(input.requestId) || !Number.isInteger(input.amountCents) || input.amountCents <= 0 || Number.isNaN(paidAt.getTime()) || !paymentReference) {
    return { ok: false, error: "Enter a valid confirmed payment amount, date, and reference." };
  }
  try {
    const auth = await authorized();
    const db = getSupabaseAuthenticatedUserClient(auth.accessToken);
    const result = await db.rpc("record_verified_payment", {
      p_load_id: input.loadId, p_amount_cents: input.amountCents, p_paid_at: paidAt.toISOString(),
      p_payment_reference: paymentReference, p_note: note, p_request_id: input.requestId,
    });
    if (result.error) return { ok: false, error: result.error.message.includes("exceeds") ? "Payment exceeds the verified outstanding balance." : "Payment requires a verified issued invoice and rate." };
    revalidatePath("/finance");
    return { ok: true, receivables: await new ReceivablesRepository().list(auth.accessToken) };
  } catch {
    return { ok: false, error: "The payment was not recorded. No financial state changed." };
  }
}
