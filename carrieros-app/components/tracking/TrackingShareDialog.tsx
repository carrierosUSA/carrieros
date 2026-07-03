import Link from "next/link";

type TrackingShareDialogProps = {
  token: string;
  loadId: string;
};

export default function TrackingShareDialog({
  token,
  loadId,
}: TrackingShareDialogProps) {
  const href = `/track/${token}`;

  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
      <p className="text-sm font-semibold text-blue-400">Share Tracking Link</p>
      <h2 className="mt-1 text-lg font-semibold text-zinc-100">
        Secure public tracking
      </h2>
      <p className="mt-2 text-sm text-zinc-400">
        No login required. Link expires automatically after delivery or when
        disabled by dispatch.
      </p>

      <div className="mt-5 rounded-xl border border-zinc-800 bg-zinc-950 p-4">
        <p className="break-all text-sm font-mono text-zinc-200">{href}</p>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <Link
          href={href}
          className="rounded-xl bg-blue-600 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-blue-500"
        >
          Open Public Link
        </Link>
        <Link
          href={`/loads/${loadId}/tracking`}
          className="rounded-xl border border-zinc-700 px-4 py-3 text-center text-sm font-semibold text-zinc-100 transition hover:bg-zinc-800"
        >
          Manage Tracking
        </Link>
      </div>
    </section>
  );
}
