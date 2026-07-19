"use client";

import type { TripReplayStats } from "@/lib/tracking/trip-replay";

type TripReplayStatsProps = {
  stats: TripReplayStats;
  driverName: string;
  loadReference: string;
};

function StatCard({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-[14px] bg-[#F8FAFC] px-3 py-2.5">
      <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-slate-400">
        {label}
      </p>
      <p
        className={`mt-0.5 text-[14px] font-semibold ${
          accent ? "text-[#16A34A]" : "text-slate-900"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

export default function TripReplayStatsPanel({
  stats,
  driverName,
  loadReference,
}: TripReplayStatsProps) {
  return (
    <div className="rounded-[16px] border border-[#EAEAEA] bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-slate-400">
            Trip Replay
          </p>
          <h2 className="mt-0.5 text-[16px] font-bold text-slate-950">
            {loadReference}
          </h2>
        </div>
        <div className="rounded-full border border-[#EAEAEA] bg-[#F8FAFC] px-3 py-1 text-[12px] font-semibold text-slate-700">
          {stats.timeLabel} · {stats.dateLabel}
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
        <StatCard label="Speed" value={`${stats.speedMph} mph`} />
        <StatCard label="Miles Traveled" value={`${stats.milesTraveled} mi`} />
        <StatCard label="Miles Remaining" value={`${stats.milesRemaining} mi`} />
        <StatCard label="ETA" value={stats.eta} accent />
        <StatCard label="Driver" value={driverName} />
        <StatCard label="Status" value={stats.driverStatus} />
      </div>

      <p className="mt-3 text-[13px] text-slate-600">
        <span className="font-medium text-slate-500">Location:</span>{" "}
        {stats.location}
      </p>
    </div>
  );
}
