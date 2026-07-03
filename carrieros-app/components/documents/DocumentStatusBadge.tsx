import type { LoadDocumentStatus } from "@/lib/types";

type DocumentStatusBadgeProps = {
  status: LoadDocumentStatus | "ready_to_send" | "missing_documents";
};

const statusStyles: Record<DocumentStatusBadgeProps["status"], string> = {
  missing: "border-red-800 bg-red-950 text-red-400",
  captured: "border-amber-800 bg-amber-950 text-amber-400",
  scanned: "border-blue-800 bg-blue-950 text-blue-400",
  approved: "border-green-800 bg-green-950 text-green-400",
  ready_to_send: "border-green-800 bg-green-950 text-green-400",
  missing_documents: "border-amber-800 bg-amber-950 text-amber-400",
};

const labels: Record<DocumentStatusBadgeProps["status"], string> = {
  missing: "Missing",
  captured: "Captured",
  scanned: "Scanned",
  approved: "Approved",
  ready_to_send: "Ready",
  missing_documents: "Needs Docs",
};

export default function DocumentStatusBadge({ status }: DocumentStatusBadgeProps) {
  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${statusStyles[status]}`}
    >
      {labels[status]}
    </span>
  );
}
