"use server";

import { revalidatePath } from "next/cache";
import { requireDocumentAuth } from "@/lib/auth/supabase-server";
import { ExpenseRepository, type Expense } from "@/lib/expenses/ledger";
import { FleetAssetsRepository, type FleetAsset } from "@/lib/fleet/assets";
import { getSupabaseAuthenticatedUserClient } from "@/lib/supabase/server";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const CATEGORIES = new Set([
  "fuel", "maintenance", "insurance", "tolls", "permits", "parking",
  "factoring", "software", "payroll", "other",
]);

type Result =
  | { ok: true; expenses: Expense[]; assets: FleetAsset[] }
  | { ok: false; error: string };

async function workspace() {
  const auth = await requireDocumentAuth();
  if (!["super_admin", "owner", "accounting"].includes(auth.businessRole)) {
    throw new Error("Not authorized");
  }
  const [expenses, assets] = await Promise.all([
    new ExpenseRepository().list(auth.accessToken),
    new FleetAssetsRepository().list(auth.accessToken).catch(() => []),
  ]);
  return { auth, expenses, assets };
}

export async function getExpensesAction(): Promise<Result> {
  try {
    const { expenses, assets } = await workspace();
    return { ok: true, expenses, assets };
  } catch {
    return { ok: false, error: "Expenses are restricted to owners and accounting." };
  }
}

export async function recordExpenseAction(input: {
  assetId?: string;
  category: string;
  date: string;
  amountCents: number;
  vendor?: string;
  reference?: string;
  note: string;
  requestId: string;
}): Promise<Result> {
  if (
    (input.assetId && !UUID.test(input.assetId)) ||
    !UUID.test(input.requestId) ||
    !CATEGORIES.has(input.category) ||
    !DATE.test(input.date) ||
    !Number.isSafeInteger(input.amountCents) ||
    input.amountCents <= 0 ||
    input.note.trim().length < 3
  ) return { ok: false, error: "Enter valid verified expense facts." };

  try {
    const { auth } = await workspace();
    const db = getSupabaseAuthenticatedUserClient(auth.accessToken);
    const result = await db.rpc("record_verified_operating_expense", {
      p_asset_id: input.assetId || null,
      p_category: input.category,
      p_incurred_on: input.date,
      p_amount_cents: input.amountCents,
      p_vendor: input.vendor?.trim() || null,
      p_source_reference: input.reference?.trim() || null,
      p_note: input.note.trim(),
      p_request_id: input.requestId,
    });
    if (result.error) return { ok: false, error: "Expense was not recorded. Verify the asset and source." };
    revalidatePath("/expenses");
    const { expenses, assets } = await workspace();
    return { ok: true, expenses, assets };
  } catch {
    return { ok: false, error: "Expense was not recorded." };
  }
}

export async function voidExpenseAction(input: {
  expenseId: string;
  reason: string;
  requestId: string;
}): Promise<Result> {
  if (!UUID.test(input.expenseId) || !UUID.test(input.requestId) || input.reason.trim().length < 3) {
    return { ok: false, error: "A factual void reason is required." };
  }
  try {
    const { auth } = await workspace();
    const db = getSupabaseAuthenticatedUserClient(auth.accessToken);
    const result = await db.rpc("void_verified_operating_expense", {
      p_expense_id: input.expenseId,
      p_reason: input.reason.trim(),
      p_request_id: input.requestId,
    });
    if (result.error) return { ok: false, error: "Active expense was not voided." };
    revalidatePath("/expenses");
    const { expenses, assets } = await workspace();
    return { ok: true, expenses, assets };
  } catch {
    return { ok: false, error: "Expense was not voided." };
  }
}
