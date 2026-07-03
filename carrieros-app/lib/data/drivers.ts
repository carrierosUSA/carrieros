import type { Driver } from "@/lib/types";
import { DEMO_TENANT_ID } from "@/lib/data/tenant";

export const drivers: Driver[] = [
  {
    tenantId: DEMO_TENANT_ID,
    id: "onkar-singh",
    name: "Onkar Singh",
    role: "Owner / Driver",
    status: "Active",
    truck: "Truck 102",
    phone: "210-555-0000",
    license: "CDL A",
    medical: "Valid until Dec 2026",
    location: "San Antonio, TX",
    href: "/drivers/onkar-singh",
  },
  {
    tenantId: DEMO_TENANT_ID,
    id: "lovepreet-kaur",
    name: "Lovepreet Kaur",
    role: "Operations Manager",
    status: "Active",
    truck: "Not assigned",
    phone: "210-555-0000",
    license: "CDL A",
    medical: "Valid until Jan 2027",
    location: "San Antonio, TX",
    href: "/drivers/onkar-singh",
  },
];

export function getDriverById(id: string): Driver | undefined {
  return drivers.find((driver) => driver.id === id);
}
