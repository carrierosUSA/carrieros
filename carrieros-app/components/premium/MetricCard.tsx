type PremiumMetricCardProps = {
  label: string;
  value: string;
  detail: string;
  accent?: "blue" | "emerald" | "amber" | "rose" | "slate";
};

const accentStyles: Record<
  NonNullable<PremiumMetricCardProps["accent"]>,
  { shell: string; dot: string }
> = {
  blue: {
    shell: "bg-blue-50 text-blue-700",
    dot: "from-blue-500 to-cyan-400",
  },
  emerald: {
    shell: "bg-emerald-50 text-emerald-700",
    dot: "from-emerald-500 to-teal-400",
  },
  amber: {
    shell: "bg-amber-50 text-amber-700",
    dot: "from-amber-500 to-orange-400",
  },
  rose: {
    shell: "bg-rose-50 text-rose-700",
    dot: "from-rose-500 to-red-400",
  },
  slate: {
    shell: "bg-slate-100 text-slate-700",
    dot: "from-slate-500 to-slate-400",
  },
};

export default function PremiumMetricCard({
  label,
  value,
  detail,
  accent = "slate",
}: PremiumMetricCardProps) {
  return (
    <article className="group rounded-[1.5rem] border border-slate-200/75 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_45px_rgba(15,23,42,0.09)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[13px] font-medium text-slate-500">{label}</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
            {value}
          </p>
        </div>
        <div
          className={`grid h-10 w-10 place-items-center rounded-2xl ${accentStyles[accent].shell}`}
        >
          <span
            className={`h-4 w-4 rounded-full bg-gradient-to-br ${accentStyles[accent].dot} shadow-sm`}
          />
        </div>
      </div>
      <p className="mt-3 text-sm text-slate-500">{detail}</p>
    </article>
  );
}
