import type { DriverSafetyEvent } from "@/lib/types";

type SafetyEventCardProps = {
  event: DriverSafetyEvent;
  driverName: string;
};

const severityStyles = {
  low: "border-green-800 bg-green-950 text-green-400",
  medium: "border-amber-800 bg-amber-950 text-amber-400",
  high: "border-red-800 bg-red-950 text-red-400",
};

export default function SafetyEventCard({ event, driverName }: SafetyEventCardProps) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-blue-400">{driverName}</p>
          <h2 className="mt-1 text-lg font-semibold text-zinc-100">{event.title}</h2>
        </div>
        <span
          className={`rounded-full border px-3 py-1 text-xs font-semibold capitalize ${severityStyles[event.severity]}`}
        >
          {event.severity}
        </span>
      </div>
      <p className="mt-4 text-sm text-zinc-300">{event.description}</p>
      <div className="mt-5 flex gap-4 text-sm text-zinc-400">
        <span>{new Date(event.occurredAt).toLocaleDateString()}</span>
        <span className="capitalize">{event.status}</span>
      </div>
    </div>
  );
}
