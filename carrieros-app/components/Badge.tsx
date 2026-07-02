type BadgeProps = {
  text: string;
  type?: "success" | "warning" | "danger" | "default";
};

const typeStyles: Record<NonNullable<BadgeProps["type"]>, string> = {
  success: "border-green-800 bg-green-950 text-green-400",
  warning: "border-amber-800 bg-amber-950 text-amber-400",
  danger: "border-red-800 bg-red-950 text-red-400",
  default: "border-zinc-700 bg-zinc-900 text-zinc-300",
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
