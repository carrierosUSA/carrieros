import Link from "next/link";

type DispatchOpsPanelProps = {
  title: string;
  description: string;
  primaryHref: string;
  primaryLabel: string;
  secondaryHref?: string;
  secondaryLabel?: string;
};

export default function DispatchOpsPanel({
  title,
  description,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
}: DispatchOpsPanelProps) {
  return (
    <div className="rounded-[16px] bg-[#F5F7FA] px-5 py-6 sm:px-6">
      <h2 className="text-[18px] font-semibold text-[#111827]">{title}</h2>
      <p className="mt-2 max-w-2xl text-[14px] leading-6 text-[#6B7280]">
        {description}
      </p>
      <div className="mt-5 flex flex-wrap gap-2">
        <Link
          href={primaryHref}
          className="inline-flex h-10 items-center rounded-full bg-[#2563EB] px-5 text-[13px] font-semibold text-white transition hover:bg-[#1D4ED8]"
        >
          {primaryLabel}
        </Link>
        {secondaryHref && secondaryLabel ? (
          <Link
            href={secondaryHref}
            className="inline-flex h-10 items-center rounded-full bg-white px-5 text-[13px] font-semibold text-[#334155] shadow-[inset_0_0_0_1px_#E5E7EB] transition hover:text-[#111827]"
          >
            {secondaryLabel}
          </Link>
        ) : null}
      </div>
    </div>
  );
}
