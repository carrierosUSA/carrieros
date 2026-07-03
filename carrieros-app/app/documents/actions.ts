"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getActiveTenantId } from "@/lib/data/tenant";
import {
  parseCaptureLoadDocumentInput,
  parsePreparePacketInput,
} from "@/lib/services/documents/form-parsing";
import { getDocumentService } from "@/lib/services/documents";

function revalidatePacketPaths(loadId: string) {
  revalidatePath("/");
  revalidatePath("/documents");
  revalidatePath("/loads");
  revalidatePath(`/loads/${loadId}`);
  revalidatePath(`/loads/${loadId}/documents`);
  revalidatePath(`/documents/packets/${loadId}`);
  revalidatePath(`/documents/packets/${loadId}/send`);
}

export async function captureLoadDocumentAction(
  loadId: string,
  formData: FormData,
) {
  const tenantId = getActiveTenantId();
  const input = parseCaptureLoadDocumentInput(loadId, formData);

  await getDocumentService().captureLoadDocument(tenantId, input);
  revalidatePacketPaths(loadId);
  redirect(`/documents/packets/${loadId}`);
}

export async function generateInvoiceDraftAction(loadId: string) {
  const tenantId = getActiveTenantId();

  await getDocumentService().generateInvoiceDraft(tenantId, loadId);
  revalidatePacketPaths(loadId);
  redirect(`/documents/packets/${loadId}`);
}

export async function preparePacketAction(loadId: string, formData: FormData) {
  const tenantId = getActiveTenantId();
  const input = parsePreparePacketInput(loadId, formData);

  await getDocumentService().preparePacket(tenantId, input);
  revalidatePacketPaths(loadId);
  redirect(`/documents/packets/${loadId}/send`);
}
