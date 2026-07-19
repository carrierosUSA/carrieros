import Link from "next/link";
import OperationalPageShell from "@/components/premium/OperationalPageShell";
import {
  ADVANCED_CATEGORIES,
  ADVANCED_FINDABILITY_CHIPS,
} from "@/lib/navigation/daily-use";

export default function AdvancedPage() {
  return (
    <OperationalPageShell
      title="Advanced"
      subtitle="Platform-power tools — automation, marketplace, exchange, integrations, migration, developer, security, governance, and admin. Everyday prefs stay in Settings."
      eyebrow="Advanced"
      action={
        <Link
          href="/settings"
          className="inline-flex h-10 items-center rounded-full bg-white px-5 text-[13px] font-semibold text-[#334155] shadow-[inset_0_0_0_1px_#E5E7EB] transition hover:text-[#111827]"
        >
          Company Settings
        </Link>
      }
    >
      <div className="space-y-8">
        <section className="space-y-3" aria-label="Find advanced tools">
          <div>
            <h2 className="text-[16px] font-semibold text-[#0F172A]">
              Find a tool
            </h2>
            <p className="mt-0.5 text-[13px] text-[#6B7280]">
              Jump to Exchange, Partner Center, App Store, API, Trust, Governance,
              and other enterprise surfaces — all stay under Advanced.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {ADVANCED_FINDABILITY_CHIPS.map((chip) => (
              <Link
                key={chip.href + chip.name}
                href={chip.href}
                className="inline-flex h-9 items-center rounded-full bg-[#F1F5F9] px-3.5 text-[12px] font-semibold text-[#334155] transition hover:bg-[#EFF6FF] hover:text-[#2563EB]"
              >
                {chip.name}
              </Link>
            ))}
          </div>
        </section>

        {ADVANCED_CATEGORIES.map((category) => (
          <section key={category.id} id={category.id} className="space-y-3">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <div>
                <h2 className="text-[16px] font-semibold text-[#0F172A]">
                  {category.name}
                </h2>
                <p className="mt-0.5 text-[13px] text-[#6B7280]">
                  {category.description}
                </p>
              </div>
              <Link
                href={`/advanced/view/${category.id}`}
                className="text-[12px] font-semibold text-[#2563EB]"
              >
                Open {category.name} →
              </Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {category.links.map((link) => (
                <Link
                  key={link.href + link.name}
                  href={link.href}
                  className="rounded-[16px] bg-[#F8FAFC] px-5 py-4 transition hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_12px_28px_rgba(37,99,235,0.08)]"
                >
                  <h3 className="text-[15px] font-semibold text-[#0F172A]">
                    {link.name}
                  </h3>
                  <p className="mt-1.5 text-[13px] leading-5 text-[#6B7280]">
                    {link.description}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </OperationalPageShell>
  );
}
