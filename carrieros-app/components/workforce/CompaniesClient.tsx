"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Building2 } from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";
import type { HiringCompany } from "@/lib/types/workforce";
import {
  EMPLOYER_COMPANY_TYPE_LABELS,
} from "@/lib/types/workforce";
import { TRANSPO_COLORS } from "@/lib/design-system/colors";

export default function CompaniesClient({ companies }: { companies: HiringCompany[] }) {
  const [query, setQuery] = useState("");
  const [type, setType] = useState("all");

  const filtered = useMemo(() => {
    return companies.filter((c) => {
      if (type !== "all" && c.type !== type) return false;
      if (!query.trim()) return true;
      const q = query.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        c.tagline.toLowerCase().includes(q) ||
        c.hqCity.toLowerCase().includes(q)
      );
    });
  }, [companies, query, type]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search companies"
          className="h-10 min-w-[200px] flex-1 rounded-[10px] bg-[#F8F9FB] px-3 text-[14px] outline-none ring-1 ring-[#EAEAEA] focus:ring-[#2563EB]"
        />
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="h-10 rounded-[10px] bg-[#F8F9FB] px-3 text-[14px] outline-none ring-1 ring-[#EAEAEA]"
        >
          <option value="all">All types</option>
          {Object.entries(EMPLOYER_COMPANY_TYPE_LABELS).map(([id, label]) => (
            <option key={id} value={id}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No companies found"
          description="Try another type or search."
        />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {filtered.map((c) => (
            <Link
              key={c.id}
              href={`/workforce/companies/${c.id}`}
              className="flex h-full flex-col rounded-[16px] bg-[#F8F9FB] p-4 transition hover:bg-[#EFF6FF]"
            >
              <div className="flex items-start gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-[12px] bg-white text-[14px] font-bold text-[#2563EB] shadow-[inset_0_0_0_1px_#EAEAEA]">
                  {c.logoInitials}
                </span>
                <div className="min-w-0">
                  <p className="text-[15px] font-semibold text-[#111827]">
                    {c.name}
                    {c.verified ? (
                      <span className={`ml-2 text-[12px] font-medium ${TRANSPO_COLORS.success.text}`}>
                        Verified
                      </span>
                    ) : null}
                  </p>
                  <p className="mt-0.5 text-[13px] text-[#6B7280]">
                    {EMPLOYER_COMPANY_TYPE_LABELS[c.type]} · {c.hqCity}, {c.hqState}
                  </p>
                </div>
              </div>
              <p className="mt-3 line-clamp-2 text-[14px] text-[#334155]">{c.tagline}</p>
              <div className="mt-auto flex flex-wrap gap-x-3 gap-y-1 pt-4 text-[13px] text-[#6B7280]">
                <span className="font-semibold text-[#111827]">{c.openPositions} open</span>
                <span>{c.rating.toFixed(1)} ★ ({c.reviewCount})</span>
                {c.dotNumber ? <span>{c.dotNumber}</span> : null}
                {c.mcNumber ? <span>{c.mcNumber}</span> : null}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
