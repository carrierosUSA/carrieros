"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import EmptyState from "@/components/ui/EmptyState";
import { MIGRATION_CATEGORY_LABELS } from "@/lib/migration/categories";
import {
  rollbackMigration,
  searchMigrationHistory,
  subscribeMigrationStore,
} from "@/lib/migration/store";
import type { MigrationRun } from "@/lib/migration/types";

export default function MigrationHistoryClient() {
  const [query, setQuery] = useState("");
  const [runs, setRuns] = useState<MigrationRun[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const sync = () => setRuns(searchMigrationHistory(query));
    sync();
    return subscribeMigrationStore(sync);
  }, [query]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by year, file, category…"
          className="min-w-[240px] flex-1 rounded-[12px] bg-[#F8F9FB] px-3 py-2 text-[14px]"
        />
      </div>
      {message ? (
        <p className="rounded-[12px] bg-[#ECFDF5] px-4 py-3 text-[14px] text-[#166534]">
          {message}
        </p>
      ) : null}
      {runs.length === 0 ? (
        <EmptyState
          title="No matching imports"
          description="Try another year or start a new migration."
          actionLabel="Start migration"
          actionHref="/platform/migration/new"
        />
      ) : (
        <ul className="space-y-2">
          {runs.map((run) => (
            <li
              key={run.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-[16px] bg-[#F8F9FB] px-4 py-3"
            >
              <div>
                <Link
                  href={`/platform/migration/${run.id}`}
                  className="text-[14px] font-semibold text-[#2563EB]"
                >
                  {run.categories.map((c) => MIGRATION_CATEGORY_LABELS[c]).join(", ") ||
                    "Draft"}
                  {run.year ? ` · ${run.year}` : ""}
                </Link>
                <p className="mt-0.5 text-[13px] text-[#6B7280]">
                  {new Date(run.createdAt).toLocaleString()} · by {run.createdBy} ·{" "}
                  {run.files.map((f) => f.name).join(", ") || "No file"} ·{" "}
                  {run.counts.imported} imported · {run.counts.skipped} skipped ·{" "}
                  {run.counts.warnings} warnings · {run.counts.errors} errors
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {run.summaryId ? (
                  <Link
                    href={`/platform/migration/summary/${run.summaryId}`}
                    className="transpo-btn-secondary text-[13px]"
                  >
                    Summary
                  </Link>
                ) : null}
                {run.snapshotId && run.status === "completed" ? (
                  <button
                    type="button"
                    className="transpo-btn-secondary text-[13px]"
                    onClick={() => {
                      const result = rollbackMigration(run.id);
                      setMessage(result.message);
                      setRuns(searchMigrationHistory(query));
                    }}
                  >
                    Roll back
                  </button>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
