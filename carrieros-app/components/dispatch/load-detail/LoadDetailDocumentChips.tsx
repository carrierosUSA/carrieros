"use client";

import type { LoadDocumentType } from "@/lib/types";
import { useLoadDetailQuickTasks } from "@/components/dispatch/load-detail/LoadDetailQuickTasksProvider";

type DocumentChipItem = {
  type: LoadDocumentType;
  label: string;
  onFile: boolean;
};

type LoadDetailDocumentChipsProps = {
  docs: DocumentChipItem[];
};

const DOC_SHORT_LABELS: Partial<Record<LoadDocumentType, string>> = {
  rate_confirmation: "Rate Con",
  bol: "BOL",
  final_pod: "POD",
  lumper_receipt: "Lumper",
  invoice: "Invoice",
  void_check: "Void Check",
};

function chipTask(type: LoadDocumentType): "rateCon" | "requestPod" | "createInvoice" | null {
  if (type === "rate_confirmation") {
    return "rateCon";
  }

  if (type === "final_pod") {
    return "requestPod";
  }

  if (type === "invoice") {
    return "createInvoice";
  }

  return null;
}

function DocumentChip({
  label,
  type,
  onFile,
  onAction,
}: {
  label: string;
  type: LoadDocumentType;
  onFile: boolean;
  onAction?: () => void;
}) {
  const shortLabel = DOC_SHORT_LABELS[type] ?? label;

  if (onFile) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200/80 bg-emerald-50/60 px-2 py-0.5 text-[10px] font-medium text-slate-800">
        ✅ {shortLabel}
      </span>
    );
  }

  if (onAction) {
    return (
      <button
        type="button"
        onClick={onAction}
        className="inline-flex items-center gap-1 rounded-full border border-dashed border-slate-300 bg-slate-50 px-2 py-0.5 text-[10px] font-medium text-[#1E3A8A] hover:border-[#93C5FD] hover:bg-[#F8FBFF]"
      >
        ⭕ {shortLabel} Missing
      </button>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-dashed border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] text-slate-400">
      ⭕ {shortLabel} Missing
    </span>
  );
}

export default function LoadDetailDocumentChips({ docs }: LoadDetailDocumentChipsProps) {
  const { openTask } = useLoadDetailQuickTasks();

  return (
    <div className="flex flex-wrap gap-2">
      {docs.map((doc) => {
        const task = chipTask(doc.type);

        return (
          <DocumentChip
            key={doc.type}
            type={doc.type}
            label={doc.label}
            onFile={doc.onFile}
            onAction={
              task && !doc.onFile
                ? () => {
                    openTask(task);
                  }
                : undefined
            }
          />
        );
      })}
    </div>
  );
}
