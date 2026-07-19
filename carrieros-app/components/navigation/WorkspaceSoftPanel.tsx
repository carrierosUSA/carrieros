import Link from "next/link";
import type { SoftPanelDef } from "@/lib/navigation/workspace-panels";
import OperationalPageShell from "@/components/premium/OperationalPageShell";

type WorkspaceSoftPanelProps = {
  panel: SoftPanelDef;
  eyebrow: string;
};

export default function WorkspaceSoftPanel({
  panel,
  eyebrow,
}: WorkspaceSoftPanelProps) {
  return (
    <OperationalPageShell
      title={panel.title}
      subtitle={panel.subtitle}
      eyebrow={eyebrow}
    >
      <div className="rounded-[16px] bg-[#F5F7FA] px-5 py-6 sm:px-6">
        <p className="max-w-2xl text-[14px] leading-6 text-[#6B7280]">
          {panel.description}
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Link
            href={panel.primaryHref}
            className="inline-flex h-10 items-center rounded-full bg-[#2563EB] px-5 text-[13px] font-semibold text-white transition hover:bg-[#1D4ED8]"
          >
            {panel.primaryLabel}
          </Link>
          {panel.secondaryHref && panel.secondaryLabel ? (
            <Link
              href={panel.secondaryHref}
              className="inline-flex h-10 items-center rounded-full bg-white px-5 text-[13px] font-semibold text-[#334155] shadow-[inset_0_0_0_1px_#E5E7EB] transition hover:text-[#111827]"
            >
              {panel.secondaryLabel}
            </Link>
          ) : null}
        </div>
      </div>
    </OperationalPageShell>
  );
}
