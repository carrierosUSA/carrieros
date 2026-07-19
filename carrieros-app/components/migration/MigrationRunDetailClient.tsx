"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import EmptyState from "@/components/ui/EmptyState";
import { MIGRATION_CATEGORY_LABELS } from "@/lib/migration/categories";
import {
  getMigrationRun,
  listSandboxRecords,
  rollbackMigration,
  subscribeMigrationStore,
} from "@/lib/migration/store";
import type { MigrationRun, MigrationSandboxRecord } from "@/lib/migration/types";

export default function MigrationRunDetailClient({ runId }: { runId: string }) {
  const [run, setRun] = useState<MigrationRun | null>(null);
  const [sandbox, setSandbox] = useState<MigrationSandboxRecord[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const sync = () => {
      setRun(getMigrationRun(runId) ?? null);
      setSandbox(listSandboxRecords(runId));
    };
    sync();
    return subscribeMigrationStore(sync);
  }, [runId]);

  if (!run) {
    return (
      <EmptyState
        title="Import not found"
        description="This migration run is not in local history."
        actionLabel="Back to Migration Center"
        actionHref="/platform/migration"
      />
    );
  }

  return (
    <div className="space-y-6">
      {message ? (
        <p className="rounded-[12px] bg-[#ECFDF5] px-4 py-3 text-[14px] text-[#166534]">
          {message}
        </p>
      ) : null}

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-[16px] bg-[#F8F9FB] p-4">
          <p className="text-[12px] font-medium text-[#6B7280]">Status</p>
          <p className="mt-1 text-[18px] font-semibold capitalize text-[#111827]">
            {run.status.replace("_", " ")}
          </p>
        </div>
        <div className="rounded-[16px] bg-[#F8F9FB] p-4">
          <p className="text-[12px] font-medium text-[#6B7280]">Year</p>
          <p className="mt-1 text-[18px] font-semibold text-[#111827]">
            {run.year ?? "—"}
          </p>
        </div>
        <div className="rounded-[16px] bg-[#F8F9FB] p-4">
          <p className="text-[12px] font-medium text-[#6B7280]">Imported</p>
          <p className="mt-1 text-[18px] font-bold text-[#111827]">{run.counts.imported}</p>
        </div>
        <div className="rounded-[16px] bg-[#F8F9FB] p-4">
          <p className="text-[12px] font-medium text-[#6B7280]">By</p>
          <p className="mt-1 text-[18px] font-semibold text-[#111827]">{run.createdBy}</p>
        </div>
      </section>

      <section>
        <h2 className="text-[16px] font-semibold text-[#111827]">Categories & files</h2>
        <p className="mt-1 text-[14px] text-[#6B7280]">
          {run.categories.map((c) => MIGRATION_CATEGORY_LABELS[c]).join(", ") || "None"}
        </p>
        <ul className="mt-3 space-y-1">
          {run.files.map((f) => (
            <li key={f.id} className="text-[14px] text-[#334155]">
              {f.name} · {(f.size / 1024).toFixed(1)} KB · {f.kind}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-[16px] font-semibold text-[#111827]">Audit log</h2>
        <ul className="mt-3 max-h-[280px] space-y-2 overflow-y-auto">
          {run.auditLog.map((e) => (
            <li key={e.id} className="rounded-[12px] bg-[#F8F9FB] px-3 py-2 text-[13px]">
              <span className="font-medium text-[#111827]">{e.action}</span>
              <span className="text-[#6B7280]">
                {" "}
                · {new Date(e.at).toLocaleString()} · {e.actor}
              </span>
              {e.detail ? <p className="mt-0.5 text-[#64748B]">{e.detail}</p> : null}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-[16px] font-semibold text-[#111827]">Sandbox records</h2>
        <p className="mt-1 text-[14px] text-[#6B7280]">
          {sandbox.length} records from this import (also soft-linked when Drivers/Fleet selected).
        </p>
        <ul className="mt-3 max-h-[240px] space-y-2 overflow-y-auto">
          {sandbox.slice(0, 40).map((r) => (
            <li key={r.id} className="rounded-[12px] bg-[#F8F9FB] px-3 py-2 text-[13px] text-[#334155]">
              {MIGRATION_CATEGORY_LABELS[r.category]} ·{" "}
              {Object.values(r.data).slice(0, 3).join(" · ")}
            </li>
          ))}
        </ul>
      </section>

      <div className="flex flex-wrap gap-2">
        {run.summaryId ? (
          <Link
            href={`/platform/migration/summary/${run.summaryId}`}
            className="transpo-btn-primary"
          >
            Alph summary
          </Link>
        ) : null}
        {run.status !== "completed" && run.status !== "rolled_back" ? (
          <Link href="/platform/migration/new" className="transpo-btn-secondary">
            Continue in wizard
          </Link>
        ) : null}
        {run.snapshotId && run.status === "completed" ? (
          <button
            type="button"
            className="transpo-btn-secondary"
            onClick={() => {
              const result = rollbackMigration(run.id);
              setMessage(result.message);
            }}
          >
            Roll back import
          </button>
        ) : null}
        <Link href="/drivers" className="transpo-btn-secondary">
          Open Drivers
        </Link>
        <Link href="/fleet" className="transpo-btn-secondary">
          Open Fleet
        </Link>
      </div>
    </div>
  );
}
