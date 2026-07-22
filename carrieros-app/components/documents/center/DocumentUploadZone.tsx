"use client";

import { useRef, useState } from "react";

type DocumentUploadZoneProps = {
  disabled?: boolean;
  disabledReason?: string;
  uploading?: boolean;
  onFilesSelected: (files: File[]) => void;
};

const ACCEPT =
  ".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg";

export default function DocumentUploadZone({
  disabled,
  disabledReason,
  uploading,
  onFilesSelected,
}: DocumentUploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0 || disabled) {
      return;
    }

    onFilesSelected(Array.from(fileList));
  }

  return (
    <div className="space-y-3">
      <div
        onDragEnter={(event) => {
          event.preventDefault();
          if (!disabled) setDragging(true);
        }}
        onDragOver={(event) => {
          event.preventDefault();
          if (!disabled) setDragging(true);
        }}
        onDragLeave={(event) => {
          event.preventDefault();
          setDragging(false);
        }}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          handleFiles(event.dataTransfer.files);
        }}
        className={`rounded-[16px] border-2 border-dashed px-6 py-8 text-center transition ${
          dragging
            ? "border-[#2563EB] bg-[#EFF6FF]"
            : "border-[#D5DBE5] bg-[#FAFBFC]"
        } ${disabled ? "opacity-60" : ""}`}
      >
        <p className="text-[15px] font-semibold text-slate-900">
          {uploading ? "Alph is reading your files…" : "Drop documents here"}
        </p>
        <p className="mt-1 text-[13px] text-slate-500">
          PDF or images · multiple files · Alph OCR reviews before linking
        </p>

        {uploading ? (
          <div className="mx-auto mt-5 max-w-md space-y-2">
            {[1, 2, 3].map((row) => (
              <div
                key={row}
                className="h-9 animate-[carrieros-shimmer_1.4s_ease-in-out_infinite] rounded-xl bg-gradient-to-r from-[#EEF2F6] via-[#F8FAFC] to-[#EEF2F6] bg-[length:200%_100%]"
              />
            ))}
          </div>
        ) : (
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              disabled={disabled}
              title={disabled ? disabledReason : "Choose files from device"}
              onClick={() => inputRef.current?.click()}
              className="inline-flex h-10 items-center rounded-full bg-[#2563EB] px-5 text-[13px] font-semibold text-white transition hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Choose files
            </button>
            <button
              type="button"
              disabled={disabled}
              title={disabled ? disabledReason : "Capture with camera"}
              onClick={() => cameraRef.current?.click()}
              className="inline-flex h-10 items-center rounded-full bg-[#F8FAFC] px-4 text-[13px] font-semibold text-slate-700 ring-1 ring-[#EAEAEA] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              Camera
            </button>
            <button
              type="button"
              disabled={disabled}
              title={
                disabled
                  ? disabledReason
                  : "Choose files from this device"
              }
              onClick={() => inputRef.current?.click()}
              className="inline-flex h-10 items-center rounded-full bg-[#F8FAFC] px-4 text-[13px] font-semibold text-slate-700 ring-1 ring-[#EAEAEA] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              Mobile upload
            </button>
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          multiple
          className="hidden"
          onChange={(event) => {
            handleFiles(event.target.files);
            event.target.value = "";
          }}
        />
        <input
          ref={cameraRef}
          type="file"
          accept="image/jpeg,image/png"
          capture="environment"
          className="hidden"
          onChange={(event) => {
            handleFiles(event.target.files);
            event.target.value = "";
          }}
        />
      </div>
    </div>
  );
}
