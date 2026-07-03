"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getActiveTenantId } from "@/lib/data/tenant";
import {
  parseAssignDriverInput,
  parseCreateDriverInput,
  parseCreateTimeOffInput,
  parseUpdateDriverInput,
} from "@/lib/services/drivers/form-parsing";
import { getDriverService } from "@/lib/services/drivers";

function revalidateDriverPaths(driverId: string) {
  revalidatePath("/drivers");
  revalidatePath("/drivers/directory");
  revalidatePath(`/drivers/${driverId}`);
  revalidatePath(`/drivers/${driverId}/edit`);
  revalidatePath(`/drivers/${driverId}/assignment`);
  revalidatePath(`/drivers/${driverId}/license`);
  revalidatePath(`/drivers/${driverId}/medical`);
  revalidatePath(`/drivers/${driverId}/payroll`);
  revalidatePath(`/drivers/${driverId}/performance`);
  revalidatePath(`/drivers/${driverId}/safety`);
  revalidatePath(`/drivers/${driverId}/timeline`);
  revalidatePath(`/drivers/${driverId}/documents`);
  revalidatePath(`/drivers/${driverId}/time-off`);
}

export async function createDriverAction(formData: FormData) {
  const tenantId = getActiveTenantId();
  const input = parseCreateDriverInput(formData);
  const driver = await getDriverService().createDriver(tenantId, input);

  revalidatePath("/drivers");
  revalidatePath("/drivers/directory");
  redirect(`/drivers/${driver.id}`);
}

export async function updateDriverAction(driverId: string, formData: FormData) {
  const tenantId = getActiveTenantId();
  const input = parseUpdateDriverInput(formData);

  await getDriverService().updateDriver(tenantId, driverId, input);
  revalidateDriverPaths(driverId);
  redirect(`/drivers/${driverId}`);
}

export async function assignDriverAction(driverId: string, formData: FormData) {
  const tenantId = getActiveTenantId();
  const input = parseAssignDriverInput(formData);

  await getDriverService().assignDriver(tenantId, driverId, input);
  revalidateDriverPaths(driverId);
  redirect(`/drivers/${driverId}/assignment`);
}

export async function createTimeOffAction(driverId: string, formData: FormData) {
  const tenantId = getActiveTenantId();
  const input = parseCreateTimeOffInput(formData);

  await getDriverService().createTimeOff(tenantId, driverId, input);
  revalidateDriverPaths(driverId);
  redirect(`/drivers/${driverId}/time-off`);
}

export async function deleteDriverAction(driverId: string) {
  const tenantId = getActiveTenantId();

  await getDriverService().deleteDriver(tenantId, driverId);
  revalidatePath("/drivers");
  revalidatePath("/drivers/directory");
  redirect("/drivers/directory");
}
