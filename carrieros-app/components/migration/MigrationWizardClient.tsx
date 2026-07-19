"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import AiConfidenceBadge from "@/components/ai-safety/AiConfidenceBadge";
import AiConfirmationModal, {
  type AiConfirmationModalPayload,
} from "@/components/ai-safety/AiConfirmationModal";
import AiPolicyNotice from "@/components/ai-safety/AiPolicyNotice";
import WizardProgress from "@/components/migration/WizardProgress";
import {
  MIGRATION_CATEGORIES,
  MIGRATION_CATEGORY_DESCRIPTIONS,
  MIGRATION_CATEGORY_LABELS,
  MIGRATION_YEARS,
  CATEGORY_TARGET_FIELDS,
} from "@/lib/migration/categories";
import { mappingConfidenceLabel, applyManualMapping } from "@/lib/migration/mapping";
import {
  parseGoogleSheetsReference,
  parseMigrationFile,
  validateMigrationFile,
} from "@/lib/migration/parsers";
import { MIGRATION_SAMPLE_FILES, sampleFileToFile } from "@/lib/migration/seed";
import {
  advanceToPreview,
  attachParsedSheet,
  createMigrationRun,
  executeImport,
  getMigrationRun,
  resolveAllIssues,
  resolveIssue,
  runCleaningPass,
  setConfirmOptions,
  setPreviewSelection,
  setRunStep,
  subscribeMigrationStore,
  updateRunCategories,
  updateRunMappings,
} from "@/lib/migration/store";
import type {
  ImportedFileMeta,
  MigrationCategory,
  MigrationRun,
  MigrationYear,
  OverwritePolicy,
} from "@/lib/migration/types";

export default function MigrationWizardClient({
  initialRunId,
}: {
  initialRunId?: string;
}) {
  const router = useRouter();
  const [runId, setRunId] = useState<string | null>(initialRunId ?? null);
  const [run, setRun] = useState<MigrationRun | null>(null);
  const [selectedCats, setSelectedCats] = useState<MigrationCategory[]>([]);
  const [year, setYear] = useState<MigrationYear | null>(2025);
  const [sheetsUrl, setSheetsUrl] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmPayload, setConfirmPayload] =
    useState<AiConfirmationModalPayload | null>(null);

  const sync = useCallback(() => {
    if (!runId) return;
    setRun(getMigrationRun(runId) ?? null);
  }, [runId]);

  useEffect(() => {
    if (!runId) {
      const created = createMigrationRun({ year: 2025 });
      setRunId(created.id);
      setRun(created);
      return;
    }
    sync();
    return subscribeMigrationStore(sync);
  }, [runId, sync]);

  useEffect(() => {
    if (run) {
      setSelectedCats(run.categories);
      setYear(run.year);
    }
  }, [run?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const targetFields = useMemo(() => {
    const cats = run?.categories ?? selectedCats;
    const set = new Set<string>();
    for (const c of cats) {
      for (const f of CATEGORY_TARGET_FIELDS[c]) set.add(f);
    }
    return [...set];
  }, [run?.categories, selectedCats]);

  function toggleCat(cat: MigrationCategory) {
    setSelectedCats((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
    );
  }

  async function handleFiles(fileList: FileList | File[]) {
    if (!runId) return;
    setUploadError(null);
    const files = Array.from(fileList);
    const metas: ImportedFileMeta[] = [];
    let sheet = null as Awaited<ReturnType<typeof parseMigrationFile>> | null;

    for (const file of files) {
      const validation = validateMigrationFile(file.name, file.type, file.size);
      if (!validation.ok) {
        setUploadError(validation.reason);
        metas.push({
          id: `rej-${file.name}`,
          name: file.name,
          size: file.size,
          mimeType: file.type,
          kind: "other",
          validated: false,
          rejectedReason: validation.reason,
        });
        continue;
      }
      metas.push({
        id: `file-${file.name}-${file.size}`,
        name: file.name,
        size: file.size,
        mimeType: file.type || "application/octet-stream",
        kind: validation.kind,
        validated: true,
      });
      try {
        const parsed = await parseMigrationFile(file);
        if (!sheet || (!sheet.stubParse && parsed.headers.length > 0)) {
          sheet = parsed;
        } else if (sheet.stubParse && !parsed.stubParse) {
          sheet = parsed;
        }
      } catch (e) {
        setUploadError(e instanceof Error ? e.message : "Could not read file.");
      }
    }

    if (!sheet) {
      setUploadError((prev) => prev ?? "No usable spreadsheet found.");
      return;
    }

    attachParsedSheet(runId, sheet, metas.filter((m) => m.validated));
    sync();
  }

  async function loadSample(sampleId: string) {
    const sample = MIGRATION_SAMPLE_FILES.find((s) => s.id === sampleId);
    if (!sample) return;
    const file = sampleFileToFile(sample);
    await handleFiles([file]);
  }

  function onCategoriesContinue() {
    if (!runId || selectedCats.length === 0) return;
    updateRunCategories(runId, selectedCats, year);
    sync();
  }

  function onMappingContinue() {
    if (!runId) return;
    runCleaningPass(runId);
    sync();
  }

  function onCleaningContinue() {
    if (!runId) return;
    advanceToPreview(runId);
    sync();
  }

  function onPreviewContinue() {
    if (!runId) return;
    setRunStep(runId, "confirm");
    sync();
  }

  function requestImport() {
    if (!run) return;
    setConfirmPayload({
      kind: "other",
      suggestion: `Import ${run.counts.ready} selected records into the migration sandbox${
        run.categories.includes("drivers") || run.categories.includes("trucks")
          ? " and soft-link Drivers / Fleet where applicable"
          : ""
      }.`,
      confidence: "review_recommended",
      reason:
        "Alph prepared the mapping and cleaning suggestions. You already chose fixes. Import still needs your approval — financial and compliance rows are loaded as data, not certified as correct.",
      dataUsed: [
        run.files.map((f) => f.name).join(", ") || "Uploaded files",
        `Overwrite policy: ${run.overwritePolicy}`,
        run.backupAcknowledged ? "Backup acknowledged" : "Backup not acknowledged",
      ],
    });
    setConfirmOpen(true);
  }

  async function onApproveImport() {
    if (!runId || !run) return;
    setConfirmOpen(false);
    if (!run.backupAcknowledged) {
      setUploadError("Check the backup acknowledgment before importing.");
      return;
    }
    setBusy(true);
    setRunStep(runId, "importing");
    setImportProgress(12);
    const timers = [30, 55, 78, 92].map((p, i) =>
      window.setTimeout(() => setImportProgress(p), 200 * (i + 1)),
    );
    await new Promise((r) => setTimeout(r, 900));
    const completed = executeImport(runId);
    timers.forEach(clearTimeout);
    setImportProgress(100);
    setBusy(false);
    sync();
    if (completed?.summaryId) {
      router.push(`/platform/migration/summary/${completed.summaryId}`);
    }
  }

  if (!run) {
    return (
      <div className="rounded-[16px] bg-[#F8F9FB] p-8 text-[14px] text-[#6B7280]">
        Preparing migration…
      </div>
    );
  }

  const step = run.step;

  return (
    <div className="space-y-6">
      <AiPolicyNotice variant="assist" />
      <p className="text-[14px] leading-relaxed text-[#64748B]">
        Alph suggests mappings and cleanups. You decide what to import. Nothing overwrites
        existing records without your confirmation.
      </p>
      <WizardProgress current={step} />

      {uploadError ? (
        <div className="rounded-[12px] bg-[#FEF2F2] px-4 py-3 text-[14px] text-[#991B1B]">
          {uploadError}
        </div>
      ) : null}

      {step === "categories" ? (
        <section className="space-y-4">
          <div>
            <h2 className="text-[16px] font-semibold text-[#111827]">Choose what to bring over</h2>
            <p className="mt-1 text-[14px] text-[#6B7280]">
              Select one category or all. Tag the historical year for searchable history.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {MIGRATION_YEARS.map((y) => (
              <button
                key={y}
                type="button"
                onClick={() => setYear(y)}
                className={`rounded-full px-3 py-1.5 text-[13px] font-medium ${
                  year === y
                    ? "bg-[#2563EB] text-white"
                    : "bg-[#F3F4F6] text-[#6B7280] hover:text-[#111827]"
                }`}
              >
                {y}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="text-[13px] font-semibold text-[#2563EB]"
              onClick={() => setSelectedCats([...MIGRATION_CATEGORIES])}
            >
              Select all
            </button>
            <button
              type="button"
              className="text-[13px] font-semibold text-[#6B7280]"
              onClick={() => setSelectedCats([])}
            >
              Clear
            </button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {MIGRATION_CATEGORIES.map((cat) => {
              const on = selectedCats.includes(cat);
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => toggleCat(cat)}
                  className={`rounded-[16px] p-4 text-left transition ${
                    on
                      ? "bg-[#EFF6FF] shadow-[inset_0_0_0_2px_#2563EB]"
                      : "bg-[#F8F9FB] hover:bg-[#F3F4F6]"
                  }`}
                >
                  <p className="text-[14px] font-semibold text-[#111827]">
                    {MIGRATION_CATEGORY_LABELS[cat]}
                  </p>
                  <p className="mt-1 text-[13px] text-[#6B7280]">
                    {MIGRATION_CATEGORY_DESCRIPTIONS[cat]}
                  </p>
                </button>
              );
            })}
          </div>
          <button
            type="button"
            disabled={selectedCats.length === 0}
            onClick={onCategoriesContinue}
            className="transpo-btn-primary disabled:opacity-40"
          >
            Continue to upload
          </button>
        </section>
      ) : null}

      {step === "upload" ? (
        <section className="space-y-4">
          <div>
            <h2 className="text-[16px] font-semibold text-[#111827]">Upload your files</h2>
            <p className="mt-1 text-[14px] text-[#6B7280]">
              Excel, CSV, Google Sheets (CSV export or link), PDF reports, payroll/fuel/maintenance
              exports, load history, invoices, rate cons, PODs, expenses.
            </p>
          </div>
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              if (e.dataTransfer.files?.length) void handleFiles(e.dataTransfer.files);
            }}
            className={`flex min-h-[200px] flex-col items-center justify-center rounded-[20px] px-6 py-10 text-center transition ${
              dragOver ? "bg-[#DBEAFE]" : "bg-[#F8F9FB]"
            }`}
          >
            <p className="text-[16px] font-semibold text-[#111827]">Drop files here</p>
            <p className="mt-1 text-[14px] text-[#6B7280]">
              CSV is fully supported. Excel: export as CSV for column mapping. Unsafe file types are
              rejected during validation.
            </p>
            <label className="transpo-btn-primary mt-4 cursor-pointer">
              Choose files
              <input
                type="file"
                className="hidden"
                multiple
                accept=".csv,.tsv,.xlsx,.xls,.pdf,.txt,image/*"
                onChange={(e) => {
                  if (e.target.files?.length) void handleFiles(e.target.files);
                }}
              />
            </label>
          </div>
          <div className="rounded-[16px] bg-[#F8F9FB] p-4">
            <p className="text-[14px] font-semibold text-[#111827]">Google Sheets</p>
            <p className="mt-1 text-[13px] text-[#6B7280]">
              Paste a sheet link, or download CSV from Sheets and upload above.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <input
                value={sheetsUrl}
                onChange={(e) => setSheetsUrl(e.target.value)}
                placeholder="https://docs.google.com/spreadsheets/…"
                className="min-w-[240px] flex-1 rounded-[12px] bg-white px-3 py-2 text-[14px] text-[#111827] shadow-[inset_0_0_0_1px_#E5E7EB]"
              />
              <button
                type="button"
                className="transpo-btn-secondary"
                onClick={() => {
                  if (!runId) return;
                  const sheet = parseGoogleSheetsReference(sheetsUrl);
                  attachParsedSheet(runId, sheet, [
                    {
                      id: "gsheets",
                      name: sheet.fileName,
                      size: 0,
                      mimeType: "text/uri-list",
                      kind: "google_sheets",
                      validated: true,
                    },
                  ]);
                  sync();
                }}
              >
                Save link
              </button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {MIGRATION_SAMPLE_FILES.map((s) => (
              <button
                key={s.id}
                type="button"
                className="rounded-full bg-white px-3 py-1.5 text-[13px] font-medium text-[#2563EB] shadow-[inset_0_0_0_1px_#BFDBFE]"
                onClick={() => void loadSample(s.id)}
              >
                Use {s.categoryHint} sample
              </button>
            ))}
          </div>
          {run.sheet?.parseNote ? (
            <p className="text-[13px] text-[#92400E]">{run.sheet.parseNote}</p>
          ) : null}
          {run.sheet && run.sheet.headers.length > 0 ? (
            <p className="text-[14px] text-[#166534]">
              Ready: {run.sheet.fileName} · {run.sheet.rows.length} rows ·{" "}
              {run.sheet.headers.length} columns
            </p>
          ) : null}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="transpo-btn-secondary"
              onClick={() => {
                setRunStep(run.id, "categories");
                sync();
              }}
            >
              Back
            </button>
            {run.sheet && run.sheet.headers.length > 0 ? (
              <button
                type="button"
                className="transpo-btn-primary"
                onClick={() => {
                  setRunStep(run.id, "mapping");
                  sync();
                }}
              >
                Continue to mapping
              </button>
            ) : null}
          </div>
        </section>
      ) : null}

      {step === "mapping" && run.sheet ? (
        <section className="space-y-4">
          <div>
            <h2 className="text-[16px] font-semibold text-[#111827]">AI column mapping</h2>
            <p className="mt-1 text-[14px] text-[#6B7280]">
              Alph matched trucking synonyms. Correct anything before import — nothing is final yet.
            </p>
          </div>
          <div className="overflow-x-auto rounded-[16px] bg-[#F8F9FB]">
            <table className="min-w-full text-left text-[14px]">
              <thead>
                <tr className="text-[13px] font-medium text-[#6B7280]">
                  <th className="px-4 py-3">Your column</th>
                  <th className="px-4 py-3">Maps to</th>
                  <th className="px-4 py-3">Confidence</th>
                </tr>
              </thead>
              <tbody>
                {run.mappings.map((m) => (
                  <tr key={m.sourceColumn} className="border-t border-white/80">
                    <td className="px-4 py-3 font-medium text-[#111827]">{m.sourceColumn}</td>
                    <td className="px-4 py-3">
                      <select
                        value={m.targetField ?? ""}
                        onChange={(e) => {
                          const next = applyManualMapping(
                            run.mappings,
                            m.sourceColumn,
                            e.target.value || null,
                          );
                          updateRunMappings(run.id, next);
                          sync();
                        }}
                        className="w-full max-w-xs rounded-[10px] bg-white px-2 py-1.5 shadow-[inset_0_0_0_1px_#E5E7EB]"
                      >
                        <option value="">— Skip —</option>
                        {targetFields.map((f) => (
                          <option key={f} value={f}>
                            {f}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        <AiConfidenceBadge level={m.confidence} />
                        <span className="text-[12px] text-[#94A3B8]">
                          {mappingConfidenceLabel(m.confidence)}
                          {m.manual ? " · edited by you" : ""}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="transpo-btn-secondary"
              onClick={() => {
                setRunStep(run.id, "upload");
                sync();
              }}
            >
              Back
            </button>
            <button type="button" className="transpo-btn-primary" onClick={onMappingContinue}>
              Review data cleaning
            </button>
          </div>
        </section>
      ) : null}

      {step === "cleaning" ? (
        <section className="space-y-4">
          <div>
            <h2 className="text-[16px] font-semibold text-[#111827]">AI data cleaning</h2>
            <p className="mt-1 text-[14px] text-[#6B7280]">
              Issues are highlighted — Alph never silently changes your data. Choose fix, skip, or
              keep as-is.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="transpo-btn-secondary"
              onClick={() => {
                resolveAllIssues(run.id, "keep");
                sync();
              }}
            >
              Keep all as-is
            </button>
            <button
              type="button"
              className="transpo-btn-secondary"
              onClick={() => {
                resolveAllIssues(run.id, "fix");
                sync();
              }}
            >
              Apply suggested fixes
            </button>
          </div>
          {run.cleaningIssues.length === 0 ? (
            <p className="rounded-[16px] bg-[#ECFDF5] px-4 py-3 text-[14px] text-[#166534]">
              No issues detected in this pass. Still preview before import.
            </p>
          ) : (
            <ul className="max-h-[360px] space-y-2 overflow-y-auto">
              {run.cleaningIssues.map((issue) => (
                <li
                  key={issue.id}
                  className="flex flex-wrap items-start justify-between gap-3 rounded-[12px] bg-[#F8F9FB] px-4 py-3"
                >
                  <div>
                    <p className="text-[14px] font-medium text-[#111827]">
                      Row {issue.rowIndex + 1}
                      {issue.field ? ` · ${issue.field}` : ""}
                    </p>
                    <p className="mt-0.5 text-[13px] text-[#6B7280]">{issue.message}</p>
                    {issue.suggestedValue ? (
                      <p className="mt-1 text-[12px] text-[#2563EB]">
                        Suggested: {issue.suggestedValue}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {(["fix", "skip", "keep"] as const).map((res) => (
                      <button
                        key={res}
                        type="button"
                        onClick={() => {
                          resolveIssue(run.id, issue.id, res);
                          sync();
                        }}
                        className={`rounded-full px-2.5 py-1 text-[12px] font-semibold capitalize ${
                          issue.resolution === res
                            ? "bg-[#2563EB] text-white"
                            : "bg-white text-[#6B7280] shadow-[inset_0_0_0_1px_#E5E7EB]"
                        }`}
                      >
                        {res}
                      </button>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          )}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="transpo-btn-secondary"
              onClick={() => {
                setRunStep(run.id, "mapping");
                sync();
              }}
            >
              Back
            </button>
            <button type="button" className="transpo-btn-primary" onClick={onCleaningContinue}>
              Open preview
            </button>
          </div>
        </section>
      ) : null}

      {step === "preview" ? (
        <section className="space-y-4">
          <div>
            <h2 className="text-[16px] font-semibold text-[#111827]">Import preview</h2>
            <p className="mt-1 text-[14px] text-[#6B7280]">
              Select which records to import. ETA under a minute for this file size.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-6">
            {(
              [
                ["Found", run.counts.found],
                ["Ready", run.counts.ready],
                ["Warnings", run.counts.warnings],
                ["Errors", run.counts.errors],
                ["Duplicates", run.counts.duplicates],
                ["Skipped", run.counts.skipped],
              ] as const
            ).map(([label, value]) => (
              <div key={label} className="rounded-[16px] bg-[#F8F9FB] p-3">
                <p className="text-[12px] font-medium text-[#6B7280]">{label}</p>
                <p className="mt-1 text-[22px] font-bold text-[#111827]">{value}</p>
              </div>
            ))}
          </div>
          <ul className="max-h-[320px] space-y-2 overflow-y-auto">
            {run.previewRows.map((row) => (
              <li
                key={row.id}
                className="flex items-start gap-3 rounded-[12px] bg-[#F8F9FB] px-4 py-3"
              >
                <input
                  type="checkbox"
                  checked={row.selected}
                  disabled={row.status === "error"}
                  onChange={(e) => {
                    setPreviewSelection(run.id, row.id, e.target.checked);
                    sync();
                  }}
                  className="mt-1"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-medium text-[#111827]">
                    Row {row.rowIndex + 1} · {row.status}
                  </p>
                  <p className="mt-0.5 truncate text-[13px] text-[#6B7280]">
                    {Object.entries(row.data)
                      .slice(0, 4)
                      .map(([k, v]) => `${k}: ${v}`)
                      .join(" · ")}
                  </p>
                </div>
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="transpo-btn-secondary"
              onClick={() => {
                setRunStep(run.id, "cleaning");
                sync();
              }}
            >
              Back
            </button>
            <button type="button" className="transpo-btn-primary" onClick={onPreviewContinue}>
              Continue to confirm
            </button>
          </div>
        </section>
      ) : null}

      {step === "confirm" ? (
        <section className="space-y-4">
          <div>
            <h2 className="text-[16px] font-semibold text-[#111827]">Confirm import</h2>
            <p className="mt-1 text-[14px] text-[#6B7280]">
              Backup is required. Overwrite never happens without an explicit policy you choose.
            </p>
          </div>
          <label className="flex items-start gap-3 rounded-[16px] bg-[#EFF6FF] p-4">
            <input
              type="checkbox"
              checked={run.backupAcknowledged}
              onChange={(e) => {
                setConfirmOptions(run.id, {
                  overwritePolicy: run.overwritePolicy,
                  backupAcknowledged: e.target.checked,
                  auditNote: run.auditNote,
                });
                sync();
              }}
              className="mt-1"
            />
            <span className="text-[14px] text-[#1E3A8A]">
              I understand Transpo.ai will create a backup snapshot before importing, and I can
              roll back from Import history when a snapshot exists.
            </span>
          </label>
          <div className="space-y-2">
            <p className="text-[13px] font-medium text-[#6B7280]">If a record already exists</p>
            {(
              [
                ["never_overwrite", "Never overwrite — skip existing"],
                ["skip_existing", "Skip existing (same as never overwrite)"],
                ["update_with_confirm", "Update existing (I confirm this choice)"],
              ] as [OverwritePolicy, string][]
            ).map(([value, label]) => (
              <label
                key={value}
                className="flex items-center gap-2 rounded-[12px] bg-[#F8F9FB] px-4 py-3 text-[14px]"
              >
                <input
                  type="radio"
                  name="overwrite"
                  checked={run.overwritePolicy === value}
                  onChange={() => {
                    setConfirmOptions(run.id, {
                      overwritePolicy: value,
                      backupAcknowledged: run.backupAcknowledged,
                      auditNote: run.auditNote,
                    });
                    sync();
                  }}
                />
                {label}
              </label>
            ))}
          </div>
          <div>
            <label className="text-[13px] font-medium text-[#6B7280]">Audit note (optional)</label>
            <textarea
              value={run.auditNote}
              onChange={(e) => {
                setConfirmOptions(run.id, {
                  overwritePolicy: run.overwritePolicy,
                  backupAcknowledged: run.backupAcknowledged,
                  auditNote: e.target.value,
                });
                sync();
              }}
              rows={3}
              className="mt-1 w-full rounded-[12px] bg-[#F8F9FB] px-3 py-2 text-[14px]"
              placeholder="e.g. 2024 driver roster from QuickBooks export"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="transpo-btn-secondary"
              onClick={() => {
                setRunStep(run.id, "preview");
                sync();
              }}
            >
              Back
            </button>
            <button
              type="button"
              className="transpo-btn-primary disabled:opacity-40"
              disabled={!run.backupAcknowledged || busy}
              onClick={requestImport}
            >
              Import with confirmation
            </button>
          </div>
        </section>
      ) : null}

      {step === "importing" ? (
        <section className="space-y-4">
          <h2 className="text-[16px] font-semibold text-[#111827]">Importing…</h2>
          <div className="h-2 overflow-hidden rounded-full bg-[#E5E7EB]">
            <div
              className="h-full rounded-full bg-[#2563EB] transition-all"
              style={{ width: `${importProgress}%` }}
            />
          </div>
          <p className="text-[14px] text-[#6B7280]">
            Writing to the migration sandbox and soft-linking Drivers / Fleet when selected.
          </p>
        </section>
      ) : null}

      {step === "summary" && run.summaryId ? (
        <section className="space-y-4">
          <h2 className="text-[16px] font-semibold text-[#111827]">Import complete</h2>
          <p className="text-[14px] text-[#6B7280]">
            {run.counts.imported} records imported. Review Alph&apos;s post-import summary.
          </p>
          <Link
            href={`/platform/migration/summary/${run.summaryId}`}
            className="transpo-btn-primary inline-flex"
          >
            Open Alph summary
          </Link>
        </section>
      ) : null}

      <AiConfirmationModal
        open={confirmOpen}
        payload={confirmPayload}
        onCancel={() => setConfirmOpen(false)}
        onApprove={() => void onApproveImport()}
      />
    </div>
  );
}
