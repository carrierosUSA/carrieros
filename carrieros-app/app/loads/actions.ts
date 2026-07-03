"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/session";
import {
  type LoadStatus,
} from "@/lib/types";
import {
  parseCreateLoadInput,
  parseUpdateLoadInput,
} from "@/lib/services/loads/form-parsing";
import { getLoadService } from "@/lib/services/loads";

export async function createLoadAction(formData: FormData) {
  const { tenantId } = requireRole(["owner", "dispatcher"]);
  const input = parseCreateLoadInput(formData);
  const load = await getLoadService().createLoad(tenantId, input);

  revalidatePath("/loads");
  redirect(`/loads/${load.id}`);
}

export async function updateLoadAction(loadId: string, formData: FormData) {
  const { tenantId } = requireRole(["owner", "dispatcher"]);
  const input = parseUpdateLoadInput(formData);

  await getLoadService().updateLoad(tenantId, loadId, input);

  revalidatePath("/loads");
  revalidatePath(`/loads/${loadId}`);
  revalidatePath(`/loads/${loadId}/edit`);
  redirect(`/loads/${loadId}`);
}

export async function assignDriverAction(loadId: string, formData: FormData) {
  const { tenantId } = requireRole(["owner", "dispatcher"]);
  const driverId = String(formData.get("driverId") ?? "").trim();

  if (!driverId) {
    throw new Error("Driver is required.");
  }

  await getLoadService().assignDriver(tenantId, loadId, { driverId });

  revalidatePath("/loads");
  revalidatePath(`/loads/${loadId}`);
}

export async function assignTruckAction(loadId: string, formData: FormData) {
  const { tenantId } = requireRole(["owner", "dispatcher"]);
  const truckId = String(formData.get("truckId") ?? "").trim();

  if (!truckId) {
    throw new Error("Truck is required.");
  }

  await getLoadService().assignTruck(tenantId, loadId, { truckId });

  revalidatePath("/loads");
  revalidatePath(`/loads/${loadId}`);
}

export async function updateLoadStatusAction(loadId: string, status: LoadStatus) {
  const { tenantId } = requireRole(["owner", "dispatcher"]);
  const validStatuses: LoadStatus[] = [
    "dispatched",
    "picked_up",
    "in_transit",
    "delivered",
  ];

  if (!validStatuses.includes(status)) {
    throw new Error("Unsupported status action.");
  }

  await getLoadService().updateLoad(tenantId, loadId, { status });

  revalidatePath("/");
  revalidatePath("/loads");
  revalidatePath(`/loads/${loadId}`);
  revalidatePath(`/loads/${loadId}/tracking`);

  if (status === "delivered") {
    revalidatePath("/finance");
  }

}
