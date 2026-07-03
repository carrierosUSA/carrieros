import type { Broker } from "@/lib/types";
import { DEMO_TENANT_ID } from "@/lib/data/tenant";

export const brokers: Broker[] = [
  {
    tenantId: DEMO_TENANT_ID,
    id: "broker-freightline",
    name: "FreightLine Logistics",
    mcNumber: "MC-482910",
  },
  {
    tenantId: DEMO_TENANT_ID,
    id: "broker-capital",
    name: "Capital Freight Partners",
    mcNumber: "MC-771204",
  },
];

export function listBrokersByTenant(tenantId: string): Broker[] {
  return brokers.filter((broker) => broker.tenantId === tenantId);
}

export function getBrokerById(id: string): Broker | undefined {
  return brokers.find((broker) => broker.id === id);
}
