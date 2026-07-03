type PremiumStatusBadgeProps = {
  label: string;
  tone?: "green" | "amber" | "red" | "blue" | "slate";
};

const toneStyles: Record<NonNullable<PremiumStatusBadgeProps["tone"]>, string> = {
  green: "border-emerald-200 bg-emerald-50 text-emerald-700",
  amber: "border-amber-200 bg-amber-50 text-amber-700",
  red: "border-rose-200 bg-rose-50 text-rose-700",
  blue: "border-blue-200 bg-blue-50 text-blue-700",
  slate: "border-slate-200 bg-slate-50 text-slate-600",
};

export default function PremiumStatusBadge({
  label,
  tone = "slate",
}: PremiumStatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${toneStyles[tone]}`}
    >
      {label}
    </span>
  );
}
