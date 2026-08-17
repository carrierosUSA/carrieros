"use server";

import { revalidatePath } from "next/cache";
import { SupabaseDocumentIntakeRepository } from "@/lib/alph/document-intake";
import { requireDocumentAuth } from "@/lib/auth/supabase-server";
import { canCreateLoads } from "@/lib/auth/load-permissions";
import { LoadOperationsRepository } from "@/lib/operations/load-repository";
import { getSupabaseAuthenticatedUserClient } from "@/lib/supabase/server";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type CreateDraftLoadResult =
  | { ok: true; loadId: string; existing: boolean }
  | { ok: false; error: string };

function safeCreationError(message: string): string {
  if (message.includes("complete pickup and delivery locations")) {
    return "Load number, pickup address/city/state, and delivery address/city/state must be verified before creating the draft load.";
  }
  if (message.includes("City, ST format")) {
    return "Use City, ST format for both pickup and delivery locations, then confirm the document review again.";
  }
  if (message.includes("confirmed rate confirmation")) {
    return "A confirmed Rate Confirmation is required before a load can be created.";
  }
  return "Draft-load creation is not available yet. No operational or financial record changed.";
}

export async function createDraftLoadFromRateConfirmationAction(input: {
  documentId: string;
}): Promise<CreateDraftLoadResult> {
  const auth = await requireDocumentAuth();
  if (!canCreateLoads(auth.businessRole)) {
    return { ok: false, error: "Your authenticated role cannot create loads." };
  }
  if (!UUID_PATTERN.test(input.documentId)) {
    return { ok: false, error: "The load-creation request is invalid." };
  }

  try {
    const document = await new SupabaseDocumentIntakeRepository().getDocument({
      documentId: input.documentId,
      companyId: auth.companyId,
      accessToken: auth.accessToken,
    });
    if (
      !document ||
      document.category !== "rate_confirmation" ||
      document.status !== "ready" ||
      document.approvalStatus !== "approved"
    ) {
      return {
        ok: false,
        error: "A confirmed Rate Confirmation is required before a load can be created.",
      };
    }
    const existingLoads = await new LoadOperationsRepository().findBySourceDocuments({
      companyId: auth.companyId,
      accessToken: auth.accessToken,
      documentIds: [input.documentId],
    });
    const existingLoadId = existingLoads.get(input.documentId);
    if (existingLoadId) {
      return { ok: true, loadId: existingLoadId, existing: true };
    }

    const db = getSupabaseAuthenticatedUserClient(auth.accessToken);
    const result = await db.rpc("create_load_from_confirmed_rate_confirmation", {
      p_document_id: input.documentId,
    });
    if (result.error || typeof result.data !== "string" || !UUID_PATTERN.test(result.data)) {
      return { ok: false, error: safeCreationError(result.error?.message ?? "") };
    }

    revalidatePath("/documents");
    revalidatePath("/dispatch");
    revalidatePath(`/dispatch/${result.data}`);
    return { ok: true, loadId: result.data, existing: false };
  } catch {
    return {
      ok: false,
      error: "Draft-load creation is not available yet. No operational or financial record changed.",
    };
  }
}
