import type { Truck } from "@/lib/types";
import { DEMO_TENANT_ID } from "@/lib/data/tenant";

export const trucks: Truck[] = [
  {
    tenantId: DEMO_TENANT_ID,
    id: "truck-102",
    unitNumber: "102",
    status: "assigned",
    driverId: "onkar-singh",
    location: "San Antonio, TX",
  },
  {
    tenantId: DEMO_TENANT_ID,
    id: "truck-104",
    unitNumber: "104",
    status: "available",
    location: "San Antonio, TX",
  },
];

export function getTruckById(id: string): Truck | undefined {
  return trucks.find((truck) => truck.id === id);
}
