type BadgeProps = {
  text: string;
  type?: "success" | "warning" | "danger" | "default";
};

const typeStyles: Record<NonNullable<BadgeProps["type"]>, string> = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-700",
  warning: "border-amber-200 bg-amber-50 text-amber-700",
  danger: "border-rose-200 bg-rose-50 text-rose-700",
  default: "border-slate-200 bg-slate-50 text-slate-600",
};

export default function Badge({ text, type = "default" }: BadgeProps) {
  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${typeStyles[type]}`}
    >
      {text}
    </span>
  );
}
