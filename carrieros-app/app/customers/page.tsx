import Link from "next/link";
import OperationalPageShell from "@/components/premium/OperationalPageShell";
import { listBrokersByTenant } from "@/lib/data/brokers";
import { listCompaniesByTenant } from "@/lib/data/companies";
import { getActiveTenantId } from "@/lib/data/tenant";

const hubs = [
  {
    title: "Brokers",
    description: "Credit, contacts, payments, and lane history.",
    href: "/brokers",
    countKey: "brokers" as const,
  },
  {
    title: "Shippers",
    description: "Shipper accounts in the companies directory.",
    href: "/customers/view/shippers",
    countKey: "companies" as const,
  },
  {
    title: "Customers",
    description: "Paying accounts and partners.",
    href: "/customers/view/customers",
    countKey: null,
  },
  {
    title: "Receivers",
    description: "Consignees and delivery contacts.",
    href: "/customers/view/receivers",
    countKey: null,
  },
  {
    title: "Contacts",
    description: "People at brokers and shippers.",
    href: "/customers/view/contacts",
    countKey: null,
  },
  {
    title: "Communication",
    description: "Calls, messages, and check-ins.",
    href: "/communications",
    countKey: null,
  },
];

export default function CustomersPage() {
  const tenantId = getActiveTenantId();
  const brokers = listBrokersByTenant(tenantId);
  const companies = listCompaniesByTenant(tenantId);
  const counts = {
    brokers: brokers.length,
    companies: companies.length,
  };

  return (
    <OperationalPageShell
      title="Customers"
      subtitle="Brokers, shippers, and partners — complete relationship work here."
      eyebrow="Customers"
    >
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {hubs.map((hub) => (
          <Link
            key={hub.href}
            href={hub.href}
            className="rounded-[16px] bg-[#F8FAFC] px-5 py-4 transition hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_12px_28px_rgba(37,99,235,0.08)]"
          >
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="text-[15px] font-semibold text-[#0F172A]">
                {hub.title}
              </h2>
              {hub.countKey ? (
                <span className="text-[13px] font-bold text-[#2563EB]">
                  {counts[hub.countKey]}
                </span>
              ) : null}
            </div>
            <p className="mt-1.5 text-[13px] leading-5 text-[#6B7280]">
              {hub.description}
            </p>
          </Link>
        ))}
      </div>
    </OperationalPageShell>
  );
}
