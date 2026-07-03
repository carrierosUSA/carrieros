import Link from "next/link";
import type { Load } from "@/lib/types";
import { formatCurrency } from "@/lib/services/loads/load-helpers";

type LoadOverviewPanelProps = {
  load: Load;
  customerName: string;
  brokerName?: string;
  driverName?: string;
  driverId?: string;
  truckLabel?: string;
  truckId?: string;
};

export default function LoadOverviewPanel({
  load,
  customerName,
  brokerName,
  driverName,
  driverId,
  truckLabel,
  truckId,
}: LoadOverviewPanelProps) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 lg:col-span-2">
      <h2 className="font-semibold text-zinc-100">Load Overview</h2>
      <div className="mt-4 grid gap-3 text-sm text-zinc-300 sm:grid-cols-2">
        <p>
          <strong className="text-zinc-100">Reference:</strong> {load.reference}
        </p>
        <p>
          <strong className="text-zinc-100">Customer:</strong> {customerName}
        </p>
        <p>
          <strong className="text-zinc-100">Broker:</strong> {brokerName ?? "Direct"}
        </p>
        <p>
          <strong className="text-zinc-100">Driver:</strong>{" "}
          {driverId && driverName ? (
            <Link href={`/drivers/${driverId}`} className="text-blue-400">
              {driverName}
            </Link>
          ) : (
            "Unassigned"
          )}
        </p>
        <p>
          <strong className="text-zinc-100">Truck:</strong>{" "}
          {truckId && truckLabel ? (
            <Link href={`/fleet/trucks/${truckId}`} className="text-blue-400">
              {truckLabel}
            </Link>
          ) : (
            "Unassigned"
          )}
        </p>
        <p>
          <strong className="text-zinc-100">Rate:</strong> {formatCurrency(load.rate)}
        </p>
        <p>
          <strong className="text-zinc-100">Miles:</strong> {load.miles}
        </p>
        <p>
          <strong className="text-zinc-100">Pickup:</strong> {load.pickupDate}
        </p>
        <p>
          <strong className="text-zinc-100">Delivery:</strong> {load.deliveryDate}
        </p>
        <p>
          <strong className="text-zinc-100">Documents:</strong> {load.documentIds.length}{" "}
          linked
        </p>
        <p>
          <strong className="text-zinc-100">Invoice:</strong>{" "}
          {load.invoiceId ?? "Not generated"}
        </p>
      </div>
    </div>
  );
}
