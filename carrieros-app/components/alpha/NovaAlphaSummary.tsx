import Link from "next/link";
import Badge from "@/components/Badge";

type AlphaAction = {
  title: string;
  description: string;
  href: string;
  severity: "success" | "warning" | "danger" | "default";
};

type NovaAlphaSummaryProps = {
  companyName: string;
  actions: AlphaAction[];
};

export default function NovaAlphaSummary({
  companyName,
  actions,
}: NovaAlphaSummaryProps) {
  const primaryAction = actions[0];

  return (
    <section className="rounded-2xl border border-blue-900/50 bg-blue-950/40 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-blue-300">Nova Alpha</p>
          <h2 className="mt-2 text-2xl font-semibold text-zinc-100">
            Today&apos;s business command summary
          </h2>
          <p className="mt-2 text-sm text-blue-200/80">
            {companyName} has {actions.length} operating item
            {actions.length === 1 ? "" : "s"} for the owner or dispatcher to
            review before the next dispatch move.
          </p>
        </div>

        <Link
          href="/loads/new"
          className="rounded-xl bg-blue-600 px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-blue-500"
        >
          Start Demo Workflow
        </Link>
      </div>

      <div className="mt-6 grid gap-3">
        {actions.map((action) => (
          <div
            key={action.title}
            className="rounded-xl border border-blue-900/40 bg-zinc-950/60 p-4"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold text-zinc-100">
                    {action.title}
                  </h3>
                  <Badge text={action.severity} type={action.severity} />
                </div>
                <p className="mt-2 text-sm text-zinc-400">
                  {action.description}
                </p>
              </div>
              <Link
                href={action.href}
                className="shrink-0 rounded-xl border border-blue-800 px-4 py-2 text-center text-sm font-semibold text-blue-300 transition hover:bg-blue-950"
              >
                Show Me
              </Link>
            </div>
          </div>
        ))}
      </div>

      {primaryAction ? (
        <p className="mt-4 text-xs text-blue-300/70">
          Suggested first click: {primaryAction.title}
        </p>
      ) : null}
    </section>
  );
}
