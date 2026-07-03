import Link from "next/link";

type NovaInsightCardProps = {
  title: string;
  actionLabel: string;
  href: string;
  tone?: "green" | "amber" | "red" | "blue";
};

const toneStyles: Record<NonNullable<NovaInsightCardProps["tone"]>, string> = {
  green: "bg-emerald-500",
  amber: "bg-amber-500",
  red: "bg-rose-500",
  blue: "bg-blue-500",
};

export default function NovaInsightCard({
  title,
  actionLabel,
  href,
  tone = "blue",
}: NovaInsightCardProps) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
    >
      <div className="flex min-w-0 items-center gap-3">
        <span className={`h-2.5 w-2.5 rounded-full ${toneStyles[tone]}`} />
        <span className="truncate text-sm font-medium text-slate-800">{title}</span>
      </div>
      <span className="shrink-0 text-sm font-semibold text-slate-950">
        {actionLabel}
      </span>
    </Link>
  );
}
