import type { DriverDocument } from "@/lib/types";

type DocumentRecordCardProps = {
  document: DriverDocument;
  driverName: string;
};

export default function DocumentRecordCard({
  document,
  driverName,
}: DocumentRecordCardProps) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-blue-400">{document.type}</p>
          <h2 className="mt-1 text-lg font-semibold text-zinc-100">{document.name}</h2>
          <p className="mt-1 text-sm text-zinc-400">{driverName}</p>
        </div>
        <span className="rounded-full border border-zinc-700 px-3 py-1 text-xs font-semibold capitalize text-zinc-300">
          {document.status}
        </span>
      </div>
      <p className="mt-4 text-sm text-zinc-400">
        Uploaded {new Date(document.uploadedAt).toLocaleDateString()}
      </p>
    </div>
  );
}
