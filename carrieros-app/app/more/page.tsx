"use client";

import Link from "next/link";
import { getCurrentSession, type CarrierOSRole } from "@/lib/auth/session";
import { MORE_NAV_GROUPS } from "@/lib/navigation/daily-use";

export default function MorePage() {
  const session = getCurrentSession();
  const role = session.role as CarrierOSRole;

  return (
    <div className="w-full rounded-[16px] bg-white p-3 text-[#111827] sm:p-5 lg:p-6">
      <div className="mx-auto max-w-[960px] space-y-8">
        <header>
          <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#6B7280]">
            More
          </p>
          <h1 className="mt-1 text-[24px] font-bold tracking-[-0.03em] text-[#111827]">
            Everything else
          </h1>
          <p className="mt-1 text-[14px] text-[#6B7280]">
            Drivers, customers, reports, and platform tools — still one click away.
          </p>
        </header>

        {MORE_NAV_GROUPS.map((group) => {
          const links = group.links.filter(
            (link) => !link.roles || link.roles.includes(role),
          );
          if (links.length === 0) return null;

          return (
            <section key={group.id} className="space-y-3">
              <h2 className="text-[13px] font-semibold uppercase tracking-[0.12em] text-[#6B7280]">
                {group.name}
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {links.map((link) => (
                  <Link
                    key={`${group.id}-${link.href}-${link.name}`}
                    href={link.href}
                    className="rounded-[14px] bg-[#F8F9FB] px-4 py-4 transition hover:bg-[#EFF6FF]"
                  >
                    <p className="text-[15px] font-semibold text-[#111827]">
                      {link.name}
                    </p>
                    {link.description ? (
                      <p className="mt-1 text-[13px] leading-5 text-[#6B7280]">
                        {link.description}
                      </p>
                    ) : null}
                    <span className="mt-3 inline-flex text-[12px] font-semibold text-[#2563EB]">
                      Open →
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
