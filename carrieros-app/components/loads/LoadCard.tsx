import Link from "next/link";
import type { Load } from "@/lib/types";
import LoadStatusBadge from "@/components/loads/LoadStatusBadge";
import { formatCurrency, formatLoadLane } from "@/lib/services/loads/load-helpers";

type LoadCardProps = {
  load: Load;
  customerName: string;
  brokerName?: string;
  driverName?: string;
};

export default function LoadCard({
  load,
  customerName,
  brokerName,
  driverName,
}: LoadCardProps) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-blue-400">{load.reference}</p>
          <h2 className="mt-1 text-lg font-semibold text-zinc-100">
            {formatLoadLane(load)}
          </h2>
        </div>
        <LoadStatusBadge status={load.status} />
      </div>

      <div className="mt-5 grid gap-3 text-sm text-zinc-300 sm:grid-cols-2">
        <p>
          <span className="text-zinc-500">Customer:</span> {customerName}
        </p>
        <p>
          <span className="text-zinc-500">Broker:</span> {brokerName ?? "Direct"}
        </p>
        <p>
          <span className="text-zinc-500">Driver:</span> {driverName ?? "Unassigned"}
        </p>
        <p>
          <span className="text-zinc-500">Rate:</span> {formatCurrency(load.rate)}
        </p>
        <p>
          <span className="text-zinc-500">Pickup:</span> {load.pickupDate}
        </p>
        <p>
          <span className="text-zinc-500">Delivery:</span> {load.deliveryDate}
        </p>
      </div>

      {load.novaSummary ? (
        <p className="mt-4 text-sm text-blue-400/80">{load.novaSummary}</p>
      ) : null}

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <Link
          href={`/loads/${load.id}`}
          className="block rounded-xl border border-zinc-700 px-4 py-3 text-center text-sm font-semibold text-zinc-100 transition hover:border-zinc-600 hover:bg-zinc-800"
        >
          View Load
        </Link>
        <Link
          href={`/loads/${load.id}/edit`}
          className="block rounded-xl border border-zinc-700 px-4 py-3 text-center text-sm font-semibold text-zinc-100 transition hover:border-zinc-600 hover:bg-zinc-800"
        >
          Edit Load
        </Link>
      </div>
    </div>
  );
}
