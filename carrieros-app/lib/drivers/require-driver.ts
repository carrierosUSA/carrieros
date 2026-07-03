import { notFound } from "next/navigation";
import { getActiveTenantId } from "@/lib/data/tenant";
import { getDriverService } from "@/lib/services/drivers";

export async function requireDriver(driverId: string) {
  const driver = await getDriverService().getDriver(getActiveTenantId(), driverId);

  if (!driver) {
    notFound();
  }

  return driver;
}
