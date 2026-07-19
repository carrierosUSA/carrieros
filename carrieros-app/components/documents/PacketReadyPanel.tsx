import Link from "next/link";
import { preparePacketAction } from "@/app/documents/actions";
import type { DocumentPacketSummary } from "@/lib/services/documents";

type PacketReadyPanelProps = {
  loadId: string;
  summary: DocumentPacketSummary;
};

export default function PacketReadyPanel({ loadId, summary }: PacketReadyPanelProps) {
  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
      <p className="text-sm font-semibold text-blue-400">Generated Packet Mock</p>
      <h2 className="mt-1 text-lg font-semibold text-zinc-100">
        {summary.readyToSend
          ? "Ready to send/upload to factory/accounting/broker"
          : "Packet needs required documents"}
      </h2>
      <p className="mt-2 text-sm text-zinc-400">
        PDF generation is mocked for alpha. Transpo.ai validates packet sequence
        before enabling send/upload preparation.
      </p>

      <div className="mt-5 rounded-xl border border-zinc-800 bg-zinc-950 p-4">
        <p className="text-sm text-zinc-500">Mock PDF Packet</p>
        <p className="mt-1 font-semibold text-zinc-100">
          {summary.packet?.generatedPdfName ?? `${loadId}-invoice-packet.pdf`}
        </p>
      </div>

      {summary.readyToSend ? (
        <form action={preparePacketAction.bind(null, loadId)} className="mt-5 grid gap-3">
          <label className="block space-y-2">
            <span className="text-sm font-medium text-zinc-300">
              Prepare Destination
            </span>
            <select
              name="destination"
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-zinc-100 outline-none focus:border-blue-500"
              defaultValue="broker"
            >
              <option value="broker">Broker</option>
              <option value="accounting">Accounting</option>
              <option value="factory">Factory</option>
            </select>
          </label>
          <button
            type="submit"
            className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
          >
            Prepare Email / Upload
          </button>
        </form>
      ) : (
        <Link
          href={`/loads/${loadId}/documents`}
          className="mt-5 inline-block rounded-xl border border-blue-800 px-5 py-3 text-sm font-semibold text-blue-300 transition hover:bg-blue-950"
        >
          Capture Missing Documents
        </Link>
      )}
    </section>
  );
}
