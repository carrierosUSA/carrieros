import {
  BadgeCheck,
  Box,
  CreditCard,
  DollarSign,
  Truck,
  UserRound,
} from "lucide-react";
import Link from "next/link";

type PremiumMetricCardProps = {
  label: string;
  value: string;
  detail: string;
  accent?: "blue" | "emerald" | "amber" | "rose" | "slate";
  href?: string;
};

const accentStyles: Record<
  NonNullable<PremiumMetricCardProps["accent"]>,
  { shell: string; icon: string }
> = {
  blue: {
    shell: "bg-blue-50 text-blue-700 ring-1 ring-blue-100",
    icon: "text-[#2563EB]",
  },
  emerald: {
    shell: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100",
    icon: "text-emerald-700",
  },
  amber: {
    shell: "bg-amber-50 text-amber-700 ring-1 ring-amber-100",
    icon: "text-amber-700",
  },
  rose: {
    shell: "bg-rose-50 text-rose-700 ring-1 ring-rose-100",
    icon: "text-rose-700",
  },
  slate: {
    shell: "bg-slate-100 text-slate-700 ring-1 ring-slate-200",
    icon: "text-slate-700",
  },
};

function MetricIcon({ label }: { label: string }) {
  const className = "h-5 w-5";

  if (label.toLowerCase().includes("revenue")) {
    return <DollarSign className={className} strokeWidth={2} />;
  }

  if (label.toLowerCase().includes("payment")) {
    return <CreditCard className={className} strokeWidth={2} />;
  }

  if (label.toLowerCase().includes("truck")) {
    return <Truck className={className} strokeWidth={2} />;
  }

  if (label.toLowerCase().includes("driver")) {
    return <UserRound className={className} strokeWidth={2} />;
  }

  if (label.toLowerCase().includes("compliance")) {
    return <BadgeCheck className={className} strokeWidth={2} />;
  }

  return <Box className={className} strokeWidth={2} />;
}

export default function PremiumMetricCard({
  label,
  value,
  detail,
  accent = "slate",
  href,
}: PremiumMetricCardProps) {
  const content = (
    <article className="group flex h-full min-h-[134px] flex-col justify-between rounded-[16px] border border-[#DDE2EA] bg-white p-4 shadow-[0_10px_28px_rgba(15,23,42,0.065)] transition duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-[0_16px_36px_rgba(37,99,235,0.12)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.13em] text-[#6B7280]">{label}</p>
          <p className="mt-2 text-[26px] font-semibold leading-none tracking-[-0.04em] text-[#111827]">
            {value}
          </p>
        </div>
        <div
          className={`grid h-10 w-10 place-items-center rounded-full ${accentStyles[accent].shell}`}
        >
          <span className={accentStyles[accent].icon}>
            <MetricIcon label={label} />
          </span>
        </div>
      </div>
      <p className="mt-3 text-[13px] font-medium text-[#6B7280]">{detail}</p>
    </article>
  );

  if (href) {
    return <Link href={href} className="block h-full">{content}</Link>;
  }

  return content;
}
