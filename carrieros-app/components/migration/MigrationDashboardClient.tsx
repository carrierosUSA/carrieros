"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  FileStack,
  History,
  Plug,
  Sparkles,
  Upload,
} from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";
import { MIGRATION_CONNECTORS } from "@/lib/migration/connectors";
import { MIGRATION_CATEGORY_LABELS } from "@/lib/migration/categories";
import { MIGRATION_SAMPLE_FILES } from "@/lib/migration/seed";
import {
  listMigrationRuns,
  subscribeMigrationStore,
} from "@/lib/migration/store";
import type { MigrationRun } from "@/lib/migration/types";

function statusLabel(status: MigrationRun["status"]): string {
  switch (status) {
    case "completed":
      return "Completed";
    case "failed":
      return "Needs attention";
    case "rolled_back":
      return "Rolled back";
    case "importing":
      return "Importing";
    default:
      return "In progress";
  }
}

export default function MigrationDashboardClient() {
  const [runs, setRuns] = useState<MigrationRun[]>([]);

  useEffect(() => {
    const sync = () => setRuns(listMigrationRuns());
    sync();
    return subscribeMigrationStore(sync);
  }, []);

  const recent = runs.slice(0, 5);

  return (
    <div className="space-y-8">
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Link
          href="/platform/migration/new"
          className="rounded-[16px] bg-[#EFF6FF] p-5 transition hover:bg-[#DBEAFE]"
        >
          <Upload className="h-5 w-5 text-[#2563EB]" />
          <p className="mt-3 text-[16px] font-semibold text-[#111827]">Start migration</p>
          <p className="mt-1 text-[14px] text-[#6B7280]">
            Bring years of data into Transpo.ai — you approve every step.
          </p>
          <span className="mt-4 inline-flex items-center gap-1 text-[13px] font-semibold text-[#2563EB]">
            Open wizard <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </Link>
        <Link
          href="/platform/migration/history"
          className="rounded-[16px] bg-[#F8F9FB] p-5 transition hover:bg-[#F3F4F6]"
        >
          <History className="h-5 w-5 text-[#6B7280]" />
          <p className="mt-3 text-[16px] font-semibold text-[#111827]">Import history</p>
          <p className="mt-1 text-[14px] text-[#6B7280]">
            {runs.length} run{runs.length === 1 ? "" : "s"} · search by year or file
          </p>
        </Link>
        <Link
          href="/platform/migration/documents"
          className="rounded-[16px] bg-[#F8F9FB] p-5 transition hover:bg-[#F3F4F6]"
        >
          <FileStack className="h-5 w-5 text-[#6B7280]" />
          <p className="mt-3 text-[16px] font-semibold text-[#111827]">Document import</p>
          <p className="mt-1 text-[14px] text-[#6B7280]">
            Alph classifies PODs, rate cons, and more — you confirm filing.
          </p>
        </Link>
        <div className="rounded-[16px] bg-[#F8F9FB] p-5">
          <Sparkles className="h-5 w-5 text-[#6B7280]" />
          <p className="mt-3 text-[16px] font-semibold text-[#111827]">Safe by design</p>
          <p className="mt-1 text-[14px] text-[#6B7280]">
            Backup before import · no silent overwrites · audit every step
          </p>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="text-[16px] font-semibold text-[#111827]">Recent imports</h2>
            <p className="mt-1 text-[14px] text-[#6B7280]">
              Transparent history — rollback when a backup exists.
            </p>
          </div>
          <Link href="/platform/migration/history" className="text-[13px] font-semibold text-[#2563EB]">
            View all
          </Link>
        </div>
        {recent.length === 0 ? (
          <EmptyState
            title="No imports yet"
            description="Start a migration or try a sample CSV. Your history will appear here."
            actionLabel="Start migration"
            actionHref="/platform/migration/new"
          />
        ) : (
          <ul className="divide-y divide-[#F3F4F6] rounded-[16px] bg-[#F8F9FB]">
            {recent.map((run) => (
              <li key={run.id}>
                <Link
                  href={`/platform/migration/${run.id}`}
                  className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 transition hover:bg-white/80"
                >
                  <div>
                    <p className="text-[14px] font-semibold text-[#111827]">
                      {run.categories.map((c) => MIGRATION_CATEGORY_LABELS[c]).join(", ") ||
                        "Draft"}
                      {run.year ? ` · ${run.year}` : ""}
                    </p>
                    <p className="mt-0.5 text-[13px] text-[#6B7280]">
                      {new Date(run.createdAt).toLocaleString()} · {run.counts.imported} imported ·{" "}
                      {run.files[0]?.name ?? "No file yet"}
                    </p>
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 text-[12px] font-semibold text-[#334155]">
                    {statusLabel(run.status)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-[16px] font-semibold text-[#111827]">Sample files</h2>
        <p className="text-[14px] text-[#6B7280]">
          Try the wizard with demo CSVs — nothing is written until you confirm.
        </p>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {MIGRATION_SAMPLE_FILES.map((sample) => (
            <a
              key={sample.id}
              href={`/migration/samples/${sample.name}`}
              download
              className="rounded-[16px] bg-[#F8F9FB] p-4 transition hover:bg-[#F3F4F6]"
            >
              <p className="text-[14px] font-semibold text-[#111827]">{sample.name}</p>
              <p className="mt-1 text-[13px] text-[#6B7280]">{sample.description}</p>
              <p className="mt-2 text-[12px] font-medium text-[#2563EB]">{sample.categoryHint}</p>
            </a>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Plug className="h-4 w-4 text-[#6B7280]" />
          <h2 className="text-[16px] font-semibold text-[#111827]">Connectors</h2>
        </div>
        <p className="text-[14px] text-[#6B7280]">
          Direct TMS links are coming soon. Today, export CSV and import safely here.
        </p>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {MIGRATION_CONNECTORS.map((c) => (
            <div key={c.id} className="rounded-[16px] bg-[#F8F9FB] p-4">
              <div className="flex items-start justify-between gap-2">
                <p className="text-[14px] font-semibold text-[#111827]">{c.name}</p>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                    c.status === "available"
                      ? "bg-[#DCFCE7] text-[#166534]"
                      : "bg-[#F3F4F6] text-[#6B7280]"
                  }`}
                >
                  {c.status === "available" ? "Ready" : "Coming soon"}
                </span>
              </div>
              <p className="mt-1 text-[13px] text-[#6B7280]">{c.description}</p>
              {c.exportHint ? (
                <p className="mt-2 text-[12px] text-[#64748B]">{c.exportHint}</p>
              ) : null}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
