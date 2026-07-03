"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getActiveTenantId } from "@/lib/data/tenant";
import {
  parseCreateTruckInput,
  parseUpdateTruckInput,
} from "@/lib/services/fleet/form-parsing";
import { parseCreateTrailerInput } from "@/lib/services/fleet/trailer-form-parsing";
import { getFleetService } from "@/lib/services/fleet";

export async function createTruckAction(formData: FormData) {
  const tenantId = getActiveTenantId();
  const input = parseCreateTruckInput(formData);
  const truck = await getFleetService().createTruck(tenantId, input);

  revalidatePath("/fleet");
  revalidatePath("/fleet/trucks");
  redirect(`/fleet/trucks/${truck.id}`);
}

export async function updateTruckAction(truckId: string, formData: FormData) {
  const tenantId = getActiveTenantId();
  const input = parseUpdateTruckInput(formData);

  await getFleetService().updateTruck(tenantId, truckId, input);

  revalidatePath("/fleet");
  revalidatePath("/fleet/trucks");
  revalidatePath(`/fleet/trucks/${truckId}`);
  revalidatePath(`/fleet/trucks/${truckId}/edit`);
  redirect(`/fleet/trucks/${truckId}`);
}

export async function createTrailerAction(formData: FormData) {
  const tenantId = getActiveTenantId();
  const input = parseCreateTrailerInput(formData);

  await getFleetService().createTrailer(tenantId, input);

  revalidatePath("/fleet");
  revalidatePath("/fleet/trailers");
  redirect("/fleet/trailers");
}
