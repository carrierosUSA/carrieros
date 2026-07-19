"use client";

import { useEffect, useState } from "react";
import AiConfidenceBadge from "@/components/ai-safety/AiConfidenceBadge";
import AiPolicyNotice from "@/components/ai-safety/AiPolicyNotice";
import EmptyState from "@/components/ui/EmptyState";
import {
  DOCUMENT_CLASS_LABELS,
  classifyDocumentFile,
  confirmDocumentClassification,
} from "@/lib/migration/documents";
import { validateMigrationFile } from "@/lib/migration/parsers";
import {
  addClassifiedDocuments,
  fileConfirmedDocuments,
  listClassifiedDocuments,
  subscribeMigrationStore,
  updateClassifiedDocument,
} from "@/lib/migration/store";
import type { ClassifiedDocument, DocumentClass } from "@/lib/migration/types";

const CLASSES = Object.keys(DOCUMENT_CLASS_LABELS) as DocumentClass[];

export default function MigrationDocumentsClient() {
  const [docs, setDocs] = useState<ClassifiedDocument[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [filedMsg, setFiledMsg] = useState<string | null>(null);

  useEffect(() => {
    const sync = () => setDocs(listClassifiedDocuments());
    sync();
    return subscribeMigrationStore(sync);
  }, []);

  async function onFiles(fileList: FileList | null) {
    if (!fileList?.length) return;
    setError(null);
    const next: ClassifiedDocument[] = [];
    for (const file of Array.from(fileList)) {
      const validation = validateMigrationFile(file.name, file.type, file.size);
      if (!validation.ok) {
        setError(validation.reason);
        continue;
      }
      next.push(classifyDocumentFile(file.name, file.type, file.size));
    }
    if (next.length) addClassifiedDocuments(next);
  }

  return (
    <div className="space-y-6">
      <AiPolicyNotice variant="compact" />
      <p className="text-[14px] text-[#64748B]">
        Alph suggests a document type. Confirm before filing — nothing is auto-filed.
      </p>

      <label className="flex min-h-[160px] cursor-pointer flex-col items-center justify-center rounded-[20px] bg-[#F8F9FB] px-6 py-8 text-center transition hover:bg-[#F3F4F6]">
        <p className="text-[16px] font-semibold text-[#111827]">Drop documents here</p>
        <p className="mt-1 text-[14px] text-[#6B7280]">
          PDF, images, or named exports (POD, rate con, invoice…)
        </p>
        <span className="transpo-btn-primary mt-4">Choose files</span>
        <input
          type="file"
          multiple
          className="hidden"
          accept=".pdf,.png,.jpg,.jpeg,.webp,.csv"
          onChange={(e) => void onFiles(e.target.files)}
        />
      </label>

      {error ? (
        <p className="rounded-[12px] bg-[#FEF2F2] px-4 py-3 text-[14px] text-[#991B1B]">
          {error}
        </p>
      ) : null}
      {filedMsg ? (
        <p className="rounded-[12px] bg-[#ECFDF5] px-4 py-3 text-[14px] text-[#166534]">
          {filedMsg}
        </p>
      ) : null}

      {docs.length === 0 ? (
        <EmptyState
          title="No documents yet"
          description="Upload a folder of PODs, rate cons, invoices, fuel receipts, and more."
        />
      ) : (
        <>
          <ul className="space-y-2">
            {docs.map((doc) => (
              <li
                key={doc.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-[16px] bg-[#F8F9FB] px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-[14px] font-semibold text-[#111827]">
                    {doc.fileName}
                  </p>
                  <p className="mt-0.5 text-[13px] text-[#6B7280]">{doc.notes}</p>
                  <div className="mt-2">
                    <AiConfidenceBadge level={doc.confidence} />
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={doc.classification}
                    onChange={(e) => {
                      const updated = confirmDocumentClassification(
                        doc,
                        e.target.value as DocumentClass,
                      );
                      updateClassifiedDocument(updated);
                    }}
                    className="rounded-[10px] bg-white px-2 py-1.5 text-[13px] shadow-[inset_0_0_0_1px_#E5E7EB]"
                  >
                    {CLASSES.map((c) => (
                      <option key={c} value={c}>
                        {DOCUMENT_CLASS_LABELS[c]}
                      </option>
                    ))}
                  </select>
                  <span className="text-[12px] font-medium text-[#6B7280]">
                    {doc.filed ? "Filed" : doc.confirmed ? "Confirmed" : "Needs confirm"}
                  </span>
                </div>
              </li>
            ))}
          </ul>
          <button
            type="button"
            className="transpo-btn-primary"
            onClick={() => {
              const n = fileConfirmedDocuments();
              setFiledMsg(
                n > 0
                  ? `Filed ${n} confirmed document${n === 1 ? "" : "s"} into the migration document folder.`
                  : "Confirm at least one document type before filing.",
              );
            }}
          >
            File confirmed documents
          </button>
        </>
      )}
    </div>
  );
}
