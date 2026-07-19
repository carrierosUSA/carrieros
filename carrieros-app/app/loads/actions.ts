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

  if (input.driverId) {
    await getLoadService().assignDriver(tenantId, load.id, { driverId: input.driverId });
  } else if (input.truckId) {
    await getLoadService().assignTruck(tenantId, load.id, { truckId: input.truckId });
  }

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

export type ReassignDriverResult = {
  driverName: string;
  driverPhone: string;
  truckNumber?: string;
  trailerNumber?: string;
};

export type ReassignTruckResult = {
  truckNumber: string;
  trailerNumber?: string;
};

export type ReassignTrailerResult = {
  trailerNumber: string;
  truckNumber?: string;
};

export async function reassignDriverAction(
  loadId: string,
  driverId: string,
): Promise<ReassignDriverResult> {
  const { tenantId } = requireRole(["owner", "dispatcher"]);

  if (!driverId.trim()) {
    throw new Error("Driver is required.");
  }

  await getLoadService().assignDriver(tenantId, loadId, { driverId });

  const load = await getLoadService().getLoad(tenantId, loadId);
  const { getDriverById } = await import("@/lib/data/drivers");
  const { getTruckById } = await import("@/lib/data/trucks");
  const { getTrailerForTruck } = await import("@/lib/dispatch/load-board");

  const driver = getDriverById(driverId);

  if (!driver) {
    throw new Error("Driver not found.");
  }

  const truck = load?.truckId ? getTruckById(load.truckId) : undefined;
  const trailer = getTrailerForTruck(load?.truckId);

  revalidatePath("/loads");
  revalidatePath(`/loads/${loadId}`);

  return {
    driverName: driver.name,
    driverPhone: driver.phone,
    truckNumber: truck?.unitNumber,
    trailerNumber: trailer?.unitNumber,
  };
}

export async function reassignTruckAction(
  loadId: string,
  truckId: string,
): Promise<ReassignTruckResult> {
  const { tenantId } = requireRole(["owner", "dispatcher"]);

  if (!truckId.trim()) {
    throw new Error("Truck is required.");
  }

  await getLoadService().assignTruck(tenantId, loadId, { truckId });

  const load = await getLoadService().getLoad(tenantId, loadId);
  const { getTruckById } = await import("@/lib/data/trucks");
  const { getTrailerForTruck } = await import("@/lib/dispatch/load-board");

  const truck = getTruckById(truckId);

  if (!truck) {
    throw new Error("Truck not found.");
  }

  const trailer = getTrailerForTruck(load?.truckId);

  revalidatePath("/loads");
  revalidatePath(`/loads/${loadId}`);

  return {
    truckNumber: truck.unitNumber,
    trailerNumber: trailer?.unitNumber,
  };
}

export async function reassignTrailerAction(
  loadId: string,
  trailerId: string,
): Promise<ReassignTrailerResult> {
  const { tenantId } = requireRole(["owner", "dispatcher"]);

  if (!trailerId.trim()) {
    throw new Error("Trailer is required.");
  }

  const { getTrailerById } = await import("@/lib/data/trucks");
  const { getTruckById } = await import("@/lib/data/trucks");
  const { getTrailerForTruck } = await import("@/lib/dispatch/load-board");

  const trailer = getTrailerById(trailerId);

  if (!trailer || trailer.tenantId !== tenantId) {
    throw new Error("Trailer not found.");
  }

  const load = await getLoadService().getLoad(tenantId, loadId);

  if (!load) {
    throw new Error("Load not found.");
  }

  if (load.truckId) {
    const currentTrailer = getTrailerForTruck(load.truckId);
    if (currentTrailer && currentTrailer.id !== trailerId) {
      currentTrailer.truckId = undefined;
    }

    trailer.truckId = load.truckId;
  } else if (trailer.truckId) {
    await getLoadService().assignTruck(tenantId, loadId, { truckId: trailer.truckId });
  } else {
    throw new Error("Assign a truck before reassigning trailer.");
  }

  const updatedLoad = await getLoadService().getLoad(tenantId, loadId);
  const truck = updatedLoad?.truckId ? getTruckById(updatedLoad.truckId) : undefined;

  revalidatePath("/loads");
  revalidatePath(`/loads/${loadId}`);

  return {
    trailerNumber: trailer.unitNumber,
    truckNumber: truck?.unitNumber,
  };
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
