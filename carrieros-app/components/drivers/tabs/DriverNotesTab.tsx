import type { DriverNote } from "@/lib/types";

type DriverNotesTabProps = {
  notes: DriverNote[];
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function DriverNotesTab({ notes }: DriverNotesTabProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          type="button"
          className="inline-flex h-9 items-center rounded-full bg-[#2563EB] px-4 text-[13px] font-semibold text-white"
          title="Note creation will sync to your HR system"
        >
          + Add Note
        </button>
      </div>

      {notes.length === 0 ? (
        <section className="rounded-[16px] bg-white p-8 text-center ring-1 ring-[#E5E7EB]">
          <p className="text-[15px] font-semibold text-slate-900">No notes yet</p>
          <p className="mt-1 text-[14px] text-slate-500">
            Add internal notes for dispatch and safety teams.
          </p>
        </section>
      ) : (
        <section className="space-y-3">
          {notes.map((note) => (
            <article
              key={note.id}
              className="rounded-[16px] bg-white p-4 ring-1 ring-[#E5E7EB]"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-[14px] font-semibold text-slate-950">{note.author}</p>
                <p className="text-[12px] text-slate-500">{formatDate(note.createdAt)}</p>
              </div>
              <p className="mt-2 text-[14px] leading-6 text-slate-700">{note.body}</p>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
