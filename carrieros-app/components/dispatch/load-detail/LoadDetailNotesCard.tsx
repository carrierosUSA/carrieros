"use client";

import LoadDetailCard from "@/components/dispatch/load-detail/LoadDetailCard";
import LoadDetailExpandableText from "@/components/dispatch/load-detail/LoadDetailExpandableText";

type LoadDetailNotesCardProps = {
  note: string;
};

export default function LoadDetailNotesCard({ note }: LoadDetailNotesCardProps) {
  return (
    <LoadDetailCard title="Notes">
      <p className="text-[10px] leading-snug text-slate-600">
        <LoadDetailExpandableText text={note} maxChars={110} clampLines={2} />
      </p>
      <button
        type="button"
        className="mt-1 text-[10px] font-semibold text-[#1E3A8A] hover:underline"
      >
        Add Note +
      </button>
    </LoadDetailCard>
  );
}
