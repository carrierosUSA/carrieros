"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { MORE_LINKS } from "@/lib/driver-app/constants";

export default function MoreHub() {
  return (
    <div className="space-y-5 animate-[carrieros-fade-in_0.35s_ease]">
      <div>
        <h2 className="text-[22px] font-bold tracking-tight">More</h2>
        <p className="mt-1 text-[14px] text-[var(--dm-muted)]">
          Maintenance, payroll, safety, connected services, and Alph.
        </p>
      </div>

      <div className="space-y-2">
        {MORE_LINKS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex min-h-14 items-center gap-3 rounded-[18px] bg-[var(--dm-surface)] px-4 py-3.5 transition active:scale-[0.99]"
          >
            <span className="min-w-0 flex-1">
              <span className="block text-[15px] font-semibold">{item.title}</span>
              <span className="block text-[13px] text-[var(--dm-muted)]">{item.subtitle}</span>
            </span>
            <ChevronRight className="h-5 w-5 shrink-0 text-[var(--dm-muted)]" />
          </Link>
        ))}
      </div>
    </div>
  );
}
