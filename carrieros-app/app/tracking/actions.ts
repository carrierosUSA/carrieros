"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getActiveTenantId } from "@/lib/data/tenant";
import { getTrackingService } from "@/lib/services/tracking";

export async function disableTrackingAction(loadId: string) {
  const tenantId = getActiveTenantId();
  await getTrackingService().disableTracking(tenantId, loadId);

  revalidatePath(`/loads/${loadId}`);
  revalidatePath(`/loads/${loadId}/tracking`);
  redirect(`/loads/${loadId}/tracking`);
}
