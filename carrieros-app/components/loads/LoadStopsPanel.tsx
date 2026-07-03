import type { LoadStop } from "@/lib/types";

type LoadStopsPanelProps = {
  origin: LoadStop;
  destination: LoadStop;
  pickupDate: string;
  deliveryDate: string;
};

function formatScheduledAt(value?: string): string {
  if (!value) {
    return "Not scheduled";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function StopCard({
  title,
  stop,
  date,
}: {
  title: string;
  stop: LoadStop;
  date: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-5">
      <p className="text-sm font-medium text-blue-400">{title}</p>
      <p className="mt-2 text-lg font-semibold text-zinc-100">
        {stop.city}, {stop.state}
      </p>
      <div className="mt-4 space-y-2 text-sm text-zinc-400">
        <p>Date: {date}</p>
        <p>Appointment: {formatScheduledAt(stop.scheduledAt)}</p>
      </div>
    </div>
  );
}

export default function LoadStopsPanel({
  origin,
  destination,
  pickupDate,
  deliveryDate,
}: LoadStopsPanelProps) {
  return (
    <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
      <h2 className="font-semibold text-zinc-100">Pickup & Delivery Stops</h2>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <StopCard title="Pickup" stop={origin} date={pickupDate} />
        <StopCard title="Delivery" stop={destination} date={deliveryDate} />
      </div>
    </section>
  );
}
