import type { LoadTimelineEvent } from "@/lib/types";

type LoadTimelineProps = {
  events: LoadTimelineEvent[];
};

function formatTimestamp(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function LoadTimeline({ events }: LoadTimelineProps) {
  const sortedEvents = [...events].sort(
    (a, b) => new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime(),
  );

  return (
    <div className="space-y-0">
      {sortedEvents.map((event, index) => {
        const isLast = index === sortedEvents.length - 1;

        return (
          <div key={event.id} className="relative flex gap-4 pb-6 last:pb-0">
            {!isLast ? (
              <span className="absolute left-[7px] top-4 h-full w-px bg-zinc-800" />
            ) : null}

            <span className="relative mt-1 h-4 w-4 shrink-0 rounded-full border-2 border-blue-500 bg-zinc-950" />

            <div>
              <p className="font-medium text-zinc-100">{event.label}</p>
              <p className="mt-1 text-sm text-zinc-500">
                {formatTimestamp(event.occurredAt)}
                {event.location ? ` · ${event.location}` : ""}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
