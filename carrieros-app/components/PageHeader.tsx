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
      ? "mt-2 text-4xl font-semibold tracking-tight text-slate-950"
      : "text-3xl font-semibold tracking-tight text-slate-950";

  const subtitleClassName = eyebrow ? "mt-3 text-slate-500" : "mt-2 text-slate-500";

  return (
    <div className={`flex items-center justify-between ${className}`}>
      <div>
        {eyebrow ? (
          <p className="text-sm font-medium text-blue-600">{eyebrow}</p>
        ) : null}
        <h1 className={titleClassName}>{title}</h1>
        {subtitle ? <p className={subtitleClassName}>{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
}
