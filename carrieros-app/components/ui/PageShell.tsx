type PageShellProps = {
  title: string;
  description: string;
  eyebrow?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
};

/**
 * Standard list/detail page chrome:
 * title → one-line description → primary action → working area.
 */
export default function PageShell({
  title,
  description,
  eyebrow,
  action,
  children,
  className = "",
}: PageShellProps) {
  return (
    <div
      className={`w-full rounded-[16px] bg-white p-4 text-[#111827] sm:p-5 lg:p-6 ${className}`}
    >
      <div className="mx-auto max-w-[1560px] space-y-4">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            {eyebrow ? (
              <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#6B7280]">
                {eyebrow}
              </p>
            ) : null}
            <h1
              className={`transpo-page-title ${eyebrow ? "mt-1" : ""} text-[22px] sm:text-[24px]`}
            >
              {title}
            </h1>
            <p className="mt-1 text-[14px] text-[#6B7280]">{description}</p>
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </header>
        {children}
      </div>
    </div>
  );
}
