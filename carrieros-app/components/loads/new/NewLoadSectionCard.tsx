"use client";

type NewLoadSectionCardProps = {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
};

export default function NewLoadSectionCard({
  title,
  description,
  action,
  children,
}: NewLoadSectionCardProps) {
  return (
    <section className="rounded-[16px] border border-[#EAEAEA] bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-[15px] font-semibold text-slate-950">{title}</h2>
          {description ? (
            <p className="mt-0.5 text-[13px] text-slate-500">{description}</p>
          ) : null}
        </div>
        {action}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">{children}</div>
    </section>
  );
}
