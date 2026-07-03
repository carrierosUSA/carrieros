import { updateLoadStatusAction } from "@/app/loads/actions";
import LoadStatusBadge from "@/components/loads/LoadStatusBadge";
import type { Load, LoadStatus } from "@/lib/types";

type LoadStatusActionsProps = {
  load: Load;
};

const actions: Array<{
  status: LoadStatus;
  label: string;
  helper: string;
}> = [
  {
    status: "dispatched",
    label: "Dispatch",
    helper: "Driver and truck are assigned.",
  },
  {
    status: "picked_up",
    label: "Picked Up",
    helper: "Freight is loaded and pickup is complete.",
  },
  {
    status: "in_transit",
    label: "In Transit",
    helper: "Truck is moving toward delivery.",
  },
  {
    status: "delivered",
    label: "Delivered",
    helper: "Delivery is complete; trigger documents and invoice closeout.",
  },
];

function actionDisabled(load: Load, status: LoadStatus) {
  if (!load.driverId || !load.truckId) {
    return true;
  }

  const order: LoadStatus[] = [
    "pending",
    "dispatched",
    "picked_up",
    "in_transit",
    "delivered",
    "invoiced",
    "cancelled",
  ];
  return order.indexOf(status) <= order.indexOf(load.status);
}

export default function LoadStatusActions({ load }: LoadStatusActionsProps) {
  const missingAssignment = !load.driverId || !load.truckId;

  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-blue-400">
            Complete Load Workflow
          </p>
          <h2 className="mt-1 text-lg font-semibold text-zinc-100">
            Move this load through the alpha lifecycle
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            Nova uses these milestones to update tracking, documents, finance,
            and owner alerts.
          </p>
        </div>
        <LoadStatusBadge status={load.status} />
      </div>

      {missingAssignment ? (
        <div className="mt-5 rounded-xl border border-amber-900 bg-amber-950/30 p-4 text-sm text-amber-200">
          Assign both a driver and truck before dispatching this load.
        </div>
      ) : null}

      <div className="mt-5 grid gap-3 md:grid-cols-4">
        {actions.map((action) => {
          const disabled = actionDisabled(load, action.status);

          return (
            <form
              key={action.status}
              action={updateLoadStatusAction.bind(null, load.id, action.status)}
            >
              <button
                type="submit"
                disabled={disabled}
                className={`h-full w-full rounded-xl border px-4 py-3 text-left transition ${
                  disabled
                    ? "cursor-not-allowed border-zinc-800 bg-zinc-950 text-zinc-600"
                    : "border-blue-800 bg-blue-950/40 text-blue-100 hover:bg-blue-900/60"
                }`}
              >
                <span className="block text-sm font-semibold">{action.label}</span>
                <span className="mt-1 block text-xs opacity-80">{action.helper}</span>
              </button>
            </form>
          );
        })}
      </div>
    </section>
  );
}
