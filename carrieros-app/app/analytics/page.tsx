import Link from "next/link";
import OperationalPageShell from "@/components/premium/OperationalPageShell";
import { REPORTS_WORKSPACE_LINKS } from "@/lib/navigation/daily-use";

export default function AnalyticsPage() {
  return (
    <OperationalPageShell
      title="Reports"
      subtitle="Revenue, loads, fleet, fuel, payroll, and compliance — pick a report."
      eyebrow="Reports"
      action={
        <Link
          href="/dashboard"
          className="rounded-xl bg-[#2563EB] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(37,99,235,0.28)] transition hover:bg-blue-500"
        >
          Home
        </Link>
      }
    >
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {REPORTS_WORKSPACE_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-[16px] border border-[#EAEAEA] bg-[#F8FAFC] px-5 py-4 transition hover:-translate-y-0.5 hover:border-[#BFDBFE] hover:bg-white hover:shadow-[0_12px_28px_rgba(37,99,235,0.08)]"
          >
            <h2 className="text-[15px] font-semibold text-[#0F172A]">
              {link.name}
            </h2>
            <p className="mt-1.5 text-[13px] leading-5 text-[#6B7280]">
              Open {link.name.toLowerCase()} reporting
            </p>
          </Link>
        ))}
      </div>
    </OperationalPageShell>
  );
}
