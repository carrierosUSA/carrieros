"use client";

import { useRef } from "react";
import NewLoadSectionCard from "@/components/loads/new/NewLoadSectionCard";

type UploadedFile = {
  id: string;
  name: string;
  kind: "rate-con" | "bol" | "other";
};

type NewLoadDocumentsSectionProps = {
  files: UploadedFile[];
  onUpload: (file: File, kind: UploadedFile["kind"]) => void;
};

function UploadButton({
  label,
  accept,
  onSelect,
}: {
  label: string;
  accept: string;
  onSelect: (file: File) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) {
            onSelect(file);
          }
          event.target.value = "";
        }}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="flex w-full items-center justify-between rounded-xl border border-dashed border-[#D1D5DB] bg-[#FAFBFC] px-3.5 py-3 text-left transition hover:border-[#2563EB] hover:bg-[#EFF6FF]"
      >
        <span className="text-[14px] font-medium text-slate-800">{label}</span>
        <span className="text-[12px] font-semibold text-[#2563EB]">Upload</span>
      </button>
    </>
  );
}

export default function NewLoadDocumentsSection({
  files,
  onUpload,
}: NewLoadDocumentsSectionProps) {
  return (
    <NewLoadSectionCard title="Documents" description="Attach rate con, BOL, and supporting files.">
      <div className="space-y-2 sm:col-span-2">
        <UploadButton
          label="Upload rate confirmation"
          accept=".pdf,application/pdf"
          onSelect={(file) => onUpload(file, "rate-con")}
        />
        <UploadButton
          label="Upload BOL"
          accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/*"
          onSelect={(file) => onUpload(file, "bol")}
        />
        <UploadButton
          label="Other files"
          accept="*/*"
          onSelect={(file) => onUpload(file, "other")}
        />
      </div>

      {files.length > 0 ? (
        <ul className="space-y-1.5 sm:col-span-2">
          {files.map((file) => (
            <li
              key={file.id}
              className="flex items-center justify-between rounded-lg bg-[#F8FAFC] px-3 py-2 text-[13px]"
            >
              <span className="truncate font-medium text-slate-800">{file.name}</span>
              <span className="ml-2 shrink-0 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                {file.kind === "rate-con" ? "Rate con" : file.kind === "bol" ? "BOL" : "File"}
              </span>
            </li>
          ))}
        </ul>
      ) : null}
    </NewLoadSectionCard>
  );
}

export type { UploadedFile };
