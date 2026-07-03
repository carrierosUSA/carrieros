import type { Customer } from "@/lib/types";
import { DEMO_TENANT_ID } from "@/lib/data/tenant";

export const customers: Customer[] = [
  {
    tenantId: DEMO_TENANT_ID,
    id: "customer-retail-hub",
    name: "Retail Distribution Hub",
    type: "shipper",
  },
  {
    tenantId: DEMO_TENANT_ID,
    id: "customer-gulf-foods",
    name: "Gulf Foods Supply",
    type: "both",
  },
  {
    tenantId: DEMO_TENANT_ID,
    id: "customer-midwest-parts",
    name: "Midwest Auto Parts",
    type: "consignee",
  },
];

export function listCustomersByTenant(tenantId: string): Customer[] {
  return customers.filter((customer) => customer.tenantId === tenantId);
}

export function getCustomerById(id: string): Customer | undefined {
  return customers.find((customer) => customer.id === id);
}
