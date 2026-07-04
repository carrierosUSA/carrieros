import Link from "next/link";

type DetailSlideOverProps = {
  title: string;
  subtitle?: string;
  closeHref: string;
  children: React.ReactNode;
};

export function DetailSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[14px] border border-[#E5E7EB] bg-[#F8F9FB] p-4">
      <h3 className="text-sm font-semibold text-slate-950">{title}</h3>
      <div className="mt-3">{children}</div>
    </section>
  );
}

export function DetailGrid({
  items,
}: {
  items: { label: string; value: React.ReactNode }[];
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {items.map((item) => (
        <div key={item.label} className="rounded-xl border border-[#E5E7EB] bg-white p-3">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
            {item.label}
          </p>
          <div className="mt-1 text-sm font-medium text-slate-800">{item.value}</div>
        </div>
      ))}
    </div>
  );
}

export default function DetailSlideOver({
  title,
  subtitle,
  closeHref,
  children,
}: DetailSlideOverProps) {
  return (
    <div className="fixed inset-0 z-40 lg:left-[72px]">
      <Link
        href={closeHref}
        className="absolute inset-0 bg-slate-900/20 backdrop-blur-[1px]"
        aria-label="Close details"
      />
      <aside className="relative ml-auto flex h-full w-full max-w-full flex-col border-l border-[#E5E7EB] bg-white shadow-2xl shadow-slate-950/10 lg:w-[560px]">
        <header className="sticky top-0 z-10 border-b border-[#E5E7EB] bg-white/95 px-5 py-4 backdrop-blur">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">
                Click to Open Details
              </p>
              <h2 className="mt-1 text-2xl font-semibold tracking-[-0.035em] text-slate-950">
                {title}
              </h2>
              {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
            </div>
            <Link
              href={closeHref}
              className="grid h-9 w-9 place-items-center rounded-xl border border-[#E5E7EB] bg-[#F8F9FB] text-lg text-slate-500 transition hover:border-blue-200 hover:text-slate-950"
              aria-label="Close details"
            >
              ×
            </Link>
          </div>
        </header>
        <div className="flex-1 space-y-4 overflow-y-auto p-5">{children}</div>
      </aside>
    </div>
  );
}
