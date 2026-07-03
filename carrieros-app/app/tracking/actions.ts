"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/session";
import { getTrackingService } from "@/lib/services/tracking";

export async function disableTrackingAction(loadId: string) {
  const { tenantId } = requireRole(["owner", "dispatcher"]);
  await getTrackingService().disableTracking(tenantId, loadId);

  revalidatePath(`/loads/${loadId}`);
  revalidatePath(`/loads/${loadId}/tracking`);
  redirect(`/loads/${loadId}/tracking`);
}
