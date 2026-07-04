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
      className={`rounded-[14px] border border-blue-100 bg-blue-50 p-5 shadow-[0_8px_24px_rgba(37,99,235,0.08)] ${className}`}
    >
      <p className="text-sm font-semibold text-blue-700">{title}</p>
      <p className="mt-1 text-sm text-blue-700/80">{message}</p>
      {actionHref ? (
        <Link
          href={actionHref}
          className="mt-4 inline-flex rounded-xl border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-blue-700 transition hover:border-blue-300"
        >
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
