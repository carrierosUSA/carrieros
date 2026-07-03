import Link from "next/link";
import type { DocumentPacketSummary } from "@/lib/services/documents";
import type { Load } from "@/lib/types";
import DocumentStatusBadge from "@/components/documents/DocumentStatusBadge";
import { formatLoadLane } from "@/lib/services/loads/load-helpers";

type DocumentPacketCardProps = {
  load: Load;
  summary: DocumentPacketSummary;
};

export default function DocumentPacketCard({
  load,
  summary,
}: DocumentPacketCardProps) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-medium text-blue-400">{load.reference}</p>
          <h2 className="mt-1 text-lg font-semibold text-zinc-100">
            {formatLoadLane(load)}
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            {summary.missingRequired.length > 0
              ? `Missing ${summary.missingRequired
                  .map((item) => item.label)
                  .join(", ")}`
              : "Ready to send/upload to factory/accounting/broker."}
          </p>
        </div>
        <DocumentStatusBadge
          status={summary.readyToSend ? "ready_to_send" : "missing_documents"}
        />
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <Link
          href={`/documents/packets/${load.id}`}
          className="rounded-xl border border-zinc-700 px-4 py-3 text-center text-sm font-semibold text-zinc-100 transition hover:border-zinc-600 hover:bg-zinc-800"
        >
          Open Packet
        </Link>
        <Link
          href={`/loads/${load.id}/documents`}
          className="rounded-xl border border-zinc-700 px-4 py-3 text-center text-sm font-semibold text-zinc-100 transition hover:border-zinc-600 hover:bg-zinc-800"
        >
          Capture Docs
        </Link>
      </div>
    </div>
  );
}
