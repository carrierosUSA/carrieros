"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getActiveTenantId } from "@/lib/data/tenant";
import {
  parseCreateLoadInput,
  parseUpdateLoadInput,
} from "@/lib/services/loads/form-parsing";
import { getLoadService } from "@/lib/services/loads";

export async function createLoadAction(formData: FormData) {
  const tenantId = getActiveTenantId();
  const input = parseCreateLoadInput(formData);
  const load = await getLoadService().createLoad(tenantId, input);

  revalidatePath("/loads");
  redirect(`/loads/${load.id}`);
}

export async function updateLoadAction(loadId: string, formData: FormData) {
  const tenantId = getActiveTenantId();
  const input = parseUpdateLoadInput(formData);

  await getLoadService().updateLoad(tenantId, loadId, input);

  revalidatePath("/loads");
  revalidatePath(`/loads/${loadId}`);
  revalidatePath(`/loads/${loadId}/edit`);
  redirect(`/loads/${loadId}`);
}

export async function assignDriverAction(loadId: string, formData: FormData) {
  const tenantId = getActiveTenantId();
  const driverId = String(formData.get("driverId") ?? "").trim();

  if (!driverId) {
    throw new Error("Driver is required.");
  }

  await getLoadService().assignDriver(tenantId, loadId, { driverId });

  revalidatePath("/loads");
  revalidatePath(`/loads/${loadId}`);
}

export async function assignTruckAction(loadId: string, formData: FormData) {
  const tenantId = getActiveTenantId();
  const truckId = String(formData.get("truckId") ?? "").trim();

  if (!truckId) {
    throw new Error("Truck is required.");
  }

  await getLoadService().assignTruck(tenantId, loadId, { truckId });

  revalidatePath("/loads");
  revalidatePath(`/loads/${loadId}`);
}
