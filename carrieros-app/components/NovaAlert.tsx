import Link from "next/link";

type NovaAlertProps = {
  title?: string;
  message: string;
  actionHref?: string;
  actionLabel?: string;
  className?: string;
};

export default function NovaAlert({
  title = "Nova Alert",
  message,
  actionHref,
  actionLabel = "Show Me",
  className = "mt-8",
}: NovaAlertProps) {
  return (
    <div
      className={`rounded-2xl border border-blue-900/50 bg-blue-950/40 p-5 ${className}`}
    >
      <p className="text-sm font-semibold text-blue-300">{title}</p>
      <p className="mt-1 text-sm text-blue-400/80">{message}</p>
      {actionHref ? (
        <Link
          href={actionHref}
          className="mt-4 inline-flex rounded-xl border border-blue-800 px-4 py-2 text-sm font-semibold text-blue-200 transition hover:bg-blue-900/60"
        >
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
