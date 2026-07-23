const badgeStyles = {
  success: "bg-emerald-100 text-emerald-800",
} as const;

type BadgeProps = {
  text: string;
  type: keyof typeof badgeStyles;
};

export default function Badge({ text, type }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${badgeStyles[type]}`}
    >
      {text}
    </span>
  );
}
