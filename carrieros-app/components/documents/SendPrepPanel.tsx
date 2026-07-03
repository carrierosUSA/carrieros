import Link from "next/link";
import type { DocumentPacketSummary } from "@/lib/services/documents";
import type { Load } from "@/lib/types";
import { formatLoadLane } from "@/lib/services/loads/load-helpers";

type SendPrepPanelProps = {
  load: Load;
  summary: DocumentPacketSummary;
  billTo: string;
};

export default function SendPrepPanel({ load, summary, billTo }: SendPrepPanelProps) {
  return (
    <section className="rounded-2xl border border-green-900/50 bg-green-950/30 p-6">
      <p className="text-sm font-semibold text-green-300">
        Ready to Send / Upload
      </p>
      <h2 className="mt-2 text-2xl font-semibold text-zinc-100">
        {summary.packet?.generatedPdfName ?? `${load.id}-invoice-packet.pdf`}
      </h2>
      <p className="mt-2 text-sm text-green-200/80">
        Packet prepared for broker/accounting/factory handoff. Email and upload
        are mocked for alpha.
      </p>

      <div className="mt-6 grid gap-4 text-sm text-zinc-300 sm:grid-cols-2">
        <p>
          <strong className="text-zinc-100">Load:</strong> {load.reference}
        </p>
        <p>
          <strong className="text-zinc-100">Lane:</strong> {formatLoadLane(load)}
        </p>
        <p>
          <strong className="text-zinc-100">Bill To:</strong> {billTo}
        </p>
        <p>
          <strong className="text-zinc-100">Attachments:</strong>{" "}
          {summary.checklist.filter((item) => item.status !== "missing").length}
        </p>
      </div>

      <div className="mt-6 rounded-xl border border-green-900/50 bg-zinc-950/70 p-4">
        <p className="text-sm font-semibold text-zinc-100">
          Draft email/upload message
        </p>
        <p className="mt-2 text-sm text-zinc-400">
          Attached is the complete invoice packet for {load.reference}. It
          includes rate confirmation, BOL, final POD, invoice, and supporting
          receipts/checks where required.
        </p>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Link
          href={`/documents/packets/${load.id}`}
          className="rounded-xl border border-green-800 px-5 py-3 text-center text-sm font-semibold text-green-300 transition hover:bg-green-950"
        >
          Back to Packet
        </Link>
        <Link
          href={`/loads/${load.id}`}
          className="rounded-xl border border-zinc-700 px-5 py-3 text-center text-sm font-semibold text-zinc-100 transition hover:bg-zinc-800"
        >
          Back to Load
        </Link>
      </div>
    </section>
  );
}
