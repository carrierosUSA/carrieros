import Link from "next/link";
import type { AlphActivityItem } from "@/lib/alph/workspace";

type ExecutiveActivityTimelineProps = {
  activity: AlphActivityItem[];
};

function formatActivityTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function ExecutiveActivityTimeline({
  activity,
}: ExecutiveActivityTimelineProps) {
  return (
    <section>
      <div className="mb-3">
        <h2 className="text-[15px] font-semibold tracking-[-0.01em] text-[#0F172A]">
          Recent Activity
        </h2>
        <p className="mt-0.5 text-[13px] text-[#64748B]">
          What just moved across finance, dispatch, and fleet
        </p>
      </div>

      <div className="rounded-[16px] bg-[#F8FAFC] px-4 py-4 ring-1 ring-[#EAEAEA] sm:px-5">
        {activity.length === 0 ? (
          <p className="py-6 text-center text-[14px] text-[#64748B]">
            No recent activity yet.
          </p>
        ) : (
          <ol className="relative space-y-0">
            {activity.map((item, index) => {
              const isLast = index === activity.length - 1;
              return (
                <li key={item.id} className="relative flex gap-3 pb-4 last:pb-0">
                  <div className="relative flex w-3 shrink-0 flex-col items-center">
                    <span className="mt-1.5 h-2.5 w-2.5 rounded-full bg-[#2563EB] ring-4 ring-[#EFF6FF]" />
                    {!isLast ? (
                      <span className="mt-1 w-px flex-1 bg-[#E2E8F0]" aria-hidden />
                    ) : null}
                  </div>
                  <Link
                    href={item.href}
                    className="min-w-0 flex-1 rounded-[12px] bg-white px-3.5 py-3 ring-1 ring-[#EAEAEA] transition duration-200 hover:ring-[#BFDBFE] hover:shadow-[0_8px_20px_rgba(37,99,235,0.06)]"
                  >
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <p className="text-[14px] font-semibold text-[#0F172A]">
                        {item.title}
                      </p>
                      <p className="text-[12px] font-medium text-[#94A3B8]">
                        {formatActivityTime(item.at)}
                      </p>
                    </div>
                    <p className="mt-0.5 text-[13px] text-[#64748B]">{item.detail}</p>
                  </Link>
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </section>
  );
}
