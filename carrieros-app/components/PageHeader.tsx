type PageHeaderProps = {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  action?: React.ReactNode;
  variant?: "default" | "hero";
  className?: string;
};

export default function PageHeader({
  title,
  subtitle,
  eyebrow,
  action,
  variant = "default",
  className = "",
}: PageHeaderProps) {
  const titleClassName =
    variant === "hero"
      ? "mt-2 text-[28px] font-bold tracking-[-0.03em] text-[#111827] sm:text-[32px]"
      : "text-[22px] font-bold tracking-[-0.03em] text-[#111827] sm:text-[24px]";

  return (
    <div
      className={`flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between ${className}`}
    >
      <div className="min-w-0">
        {eyebrow ? (
          <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#2563EB]">
            {eyebrow}
          </p>
        ) : null}
        <h1 className={titleClassName}>{title}</h1>
        {subtitle ? (
          <p className={`text-[14px] text-[#6B7280] ${eyebrow ? "mt-2" : "mt-1"}`}>
            {subtitle}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
