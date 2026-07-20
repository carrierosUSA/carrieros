"use client";

import { useEffect, useState, useTransition } from "react";
import { listAlphActionHistoryAction } from "@/app/actions/alph-autopilot";
import type { AlphAuditEntry } from "@/lib/alph/audit";

export default function AlphActionHistoryClient({
  initialEntries,
}: {
  initialEntries: AlphAuditEntry[];
}) {
  const [entries, setEntries] = useState(initialEntries);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      const next = await listAlphActionHistoryAction(80);
      setEntries(next);
    });
  }, []);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-[14px] text-slate-600">
          {entries.length} event{entries.length === 1 ? "" : "s"}
          {pending ? " · refreshing…" : ""}
        </p>
      </div>
      {entries.length === 0 ? (
        <p className="rounded-[16px] bg-[#F8FAFC] px-5 py-8 text-[14px] text-slate-500">
          No Alph actions logged yet for this company. Upload a document or run
          an Alph command to populate history.
        </p>
      ) : (
        entries.map((entry) => (
          <article
            key={entry.id}
            className="rounded-[14px] bg-white px-4 py-3 ring-1 ring-[#EAEAEA]"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-[14px] font-semibold text-slate-950">
                {entry.event.replace(/_/g, " ")}
              </p>
              <time className="text-[12px] text-slate-400">
                {new Date(entry.at).toLocaleString()}
              </time>
            </div>
            {entry.details ? (
              <p className="mt-1 text-[13px] text-slate-600">{entry.details}</p>
            ) : null}
            <p className="mt-1 text-[12px] text-slate-400">
              request {entry.requestId}
              {entry.toolId ? ` · tool ${entry.toolId}` : ""}
            </p>
          </article>
        ))
      )}
    </div>
  );
}
