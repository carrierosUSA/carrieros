import type { AuditLogEntry } from "@/lib/types/workforce";

export default function AuditLogStrip({ entries }: { entries: AuditLogEntry[] }) {
  if (!entries.length) return null;
  return (
    <div className="rounded-[12px] bg-[#F8F9FB] px-4 py-3">
      <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-[#6B7280]">
        Recent sensitive actions
      </p>
      <ul className="mt-2 space-y-1.5">
        {entries.slice(0, 4).map((e) => (
          <li key={e.id} className="flex flex-wrap items-baseline gap-x-2 text-[13px]">
            <span className="font-medium text-[#111827]">{e.action}</span>
            <span className="text-[#6B7280]">
              {e.actor} · {new Date(e.at).toLocaleString()}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
