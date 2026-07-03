import type { DocumentPacketChecklistItem } from "@/lib/services/documents";
import DocumentStatusBadge from "@/components/documents/DocumentStatusBadge";

type PacketChecklistProps = {
  checklist: DocumentPacketChecklistItem[];
};

export default function PacketChecklist({ checklist }: PacketChecklistProps) {
  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
      <h2 className="font-semibold text-zinc-100">Invoice Packet Sequence</h2>
      <p className="mt-2 text-sm text-zinc-400">
        Required documents must be in sequence before the packet can be marked
        ready to send/upload.
      </p>

      <div className="mt-6 space-y-3">
        {checklist.map((item) => (
          <div
            key={item.type}
            className="rounded-xl border border-zinc-800 bg-zinc-950 p-4"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-zinc-500">Step {item.sequence}</p>
                <h3 className="font-semibold text-zinc-100">{item.label}</h3>
                <p className="mt-1 text-sm text-zinc-400">
                  {item.required ? "Required" : "Optional"}
                  {item.document?.fileName ? ` · ${item.document.fileName}` : ""}
                </p>
              </div>
              <DocumentStatusBadge status={item.status} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
