"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { CarrierOSRole } from "@/lib/auth/session";
import { requireDocumentAuth } from "@/lib/auth/supabase-server";
import {
  parseCaptureLoadDocumentInput,
  parsePreparePacketInput,
} from "@/lib/services/documents/form-parsing";
import { getDocumentService } from "@/lib/services/documents";

const DOCUMENT_OPERATOR_ROLES = new Set<CarrierOSRole>([
  "owner",
  "dispatcher",
  "accounting",
]);

function revalidatePacketPaths(loadId: string) {
  revalidatePath("/");
  revalidatePath("/finance");
  revalidatePath("/documents");
  revalidatePath("/loads");
  revalidatePath(`/loads/${loadId}`);
  revalidatePath(`/loads/${loadId}/documents`);
  revalidatePath(`/documents/packets/${loadId}`);
  revalidatePath(`/documents/packets/${loadId}/send`);
}

async function requireDocumentOperator() {
  const auth = await requireDocumentAuth();
  if (!DOCUMENT_OPERATOR_ROLES.has(auth.businessRole)) {
    redirect("/auth/unauthorized");
  }
  return auth;
}

export async function captureLoadDocumentAction(
  loadId: string,
  formData: FormData,
) {
  const auth = await requireDocumentOperator();
  const input = parseCaptureLoadDocumentInput(loadId, formData);

  await getDocumentService().captureLoadDocument(auth.companyId, input);
  revalidatePacketPaths(loadId);
  redirect(`/documents/packets/${loadId}`);
}

export async function generateInvoiceDraftAction(loadId: string) {
  const auth = await requireDocumentOperator();

  await getDocumentService().generateInvoiceDraft(auth.companyId, loadId);
  revalidatePacketPaths(loadId);
  redirect(`/documents/packets/${loadId}`);
}

export async function preparePacketAction(loadId: string, formData: FormData) {
  const auth = await requireDocumentOperator();
  const input = parsePreparePacketInput(loadId, formData);

  await getDocumentService().preparePacket(auth.companyId, input);
  revalidatePacketPaths(loadId);
  redirect(`/documents/packets/${loadId}/send`);
}
