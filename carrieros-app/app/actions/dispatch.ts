"use server";

import { revalidatePath } from "next/cache";
import { requireDocumentAuth } from "@/lib/auth/supabase-server";
import { LoadOperationsRepository } from "@/lib/operations/load-repository";
import type {
  DispatchBoardLoad,
  LoadDetail,
  LoadUpdateCapabilities,
} from "@/lib/operations/load-types";
import {
  allowedNextLoadStatuses,
  canRecordLoadFacts,
  isLoadStatus,
} from "@/lib/operations/load-workflow";
import { getSupabaseAuthenticatedUserClient } from "@/lib/supabase/server";
import type { LoadStatus } from "@/lib/types/load";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type LoadDetailResult =
  | {
      ok: true;
      load: LoadDetail | null;
      capabilities: LoadUpdateCapabilities | null;
    }
  | { ok: false; error: string };

export type VerifiedLoadUpdateInput = {
  loadId: string;
  expectedStatus: LoadStatus;
  nextStatus?: LoadStatus | null;
  location?: string | null;
  eta?: string | null;
  exceptionSummary?: string | null;
  note?: string | null;
  requestId: string;
};

export type VerifiedLoadUpdateResult =
  | {
      ok: true;
      load: LoadDetail;
      capabilities: LoadUpdateCapabilities;
    }
  | { ok: false; error: string };

function capabilities(
  role: Parameters<typeof canRecordLoadFacts>[0],
  status: LoadStatus,
): LoadUpdateCapabilities {
  return {
    canRecordFacts: canRecordLoadFacts(role),
    allowedNextStatuses: allowedNextLoadStatuses(role, status),
    closureRequiresDocuments: status === "delivered",
  };
}

function optionalText(value: unknown, maxLength: number): string | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  if (!normalized) return null;
  return normalized.slice(0, maxLength);
}

function safeUpdateError(message: string): string {
  if (message.includes("status changed")) {
    return "This load changed in another session. Reload the verified load before saving.";
  }
  if (message.includes("status transition")) {
    return "That lifecycle transition is not allowed from the current verified status.";
  }
  if (message.includes("Cancellation requires")) {
    return "A factual cancellation reason is required.";
  }
  if (message.includes("Closure requires")) {
    return "Closing requires verified POD, invoice, and resolved exceptions.";
  }
  if (message.includes("not authorized") || message.includes("not actively assigned")) {
    return "Your authenticated role or assignment cannot make this update.";
  }
  return "The verified update could not be saved. No load state changed.";
}

export async function getDispatchBoardAction(): Promise<
  | { ok: true; loads: DispatchBoardLoad[] }
  | { ok: false; error: string }
> {
  try {
    const auth = await requireDocumentAuth();
    const loads = await new LoadOperationsRepository().listBoard({
      companyId: auth.companyId,
      accessToken: auth.accessToken,
    });
    return { ok: true, loads };
  } catch {
    return { ok: false, error: "Live load data is not configured yet." };
  }
}

export async function getLoadDetailAction(loadId: string): Promise<LoadDetailResult> {
  if (!UUID_PATTERN.test(loadId)) {
    return { ok: false, error: "The load reference is invalid." };
  }
  try {
    const auth = await requireDocumentAuth();
    const load = await new LoadOperationsRepository().getDetail({
      companyId: auth.companyId,
      accessToken: auth.accessToken,
      loadId,
    });
    return {
      ok: true,
      load,
      capabilities: load
        ? capabilities(auth.businessRole, load.status)
        : null,
    };
  } catch {
    return { ok: false, error: "Authorized load detail is not available." };
  }
}

export async function updateVerifiedLoadAction(
  input: VerifiedLoadUpdateInput,
): Promise<VerifiedLoadUpdateResult> {
  if (
    !UUID_PATTERN.test(input.loadId) ||
    !UUID_PATTERN.test(input.requestId) ||
    !isLoadStatus(input.expectedStatus) ||
    (input.nextStatus != null && !isLoadStatus(input.nextStatus))
  ) {
    return { ok: false, error: "The verified update request is invalid." };
  }

  const location = optionalText(input.location, 300);
  const exceptionSummary = optionalText(input.exceptionSummary, 1_000);
  const note = optionalText(input.note, 4_000);
  let eta: string | null = null;
  if (input.eta) {
    const parsed = new Date(input.eta);
    if (Number.isNaN(parsed.getTime())) {
      return { ok: false, error: "Enter a valid verified ETA." };
    }
    eta = parsed.toISOString();
  }
  if (!input.nextStatus && !location && !eta && !exceptionSummary && !note) {
    return { ok: false, error: "Enter at least one verified operational fact." };
  }

  try {
    const auth = await requireDocumentAuth();
    if (!canRecordLoadFacts(auth.businessRole)) {
      return { ok: false, error: "Your authenticated role cannot update loads." };
    }
    const db = getSupabaseAuthenticatedUserClient(auth.accessToken);
    const result = await db.rpc("record_verified_load_update", {
      p_load_id: input.loadId,
      p_expected_status: input.expectedStatus,
      p_next_status: input.nextStatus ?? null,
      p_location: location,
      p_eta: eta,
      p_exception_summary: exceptionSummary,
      p_note: note,
      p_request_id: input.requestId,
    });
    if (result.error) {
      return { ok: false, error: safeUpdateError(result.error.message) };
    }

    revalidatePath("/dispatch");
    revalidatePath(`/dispatch/${input.loadId}`);
    const load = await new LoadOperationsRepository().getDetail({
      companyId: auth.companyId,
      accessToken: auth.accessToken,
      loadId: input.loadId,
    });
    if (!load) {
      return {
        ok: false,
        error: "The update was recorded, but the authorized load could not be reloaded.",
      };
    }
    return {
      ok: true,
      load,
      capabilities: capabilities(auth.businessRole, load.status),
    };
  } catch {
    return { ok: false, error: "The verified update could not be saved. No load state changed." };
  }
}
