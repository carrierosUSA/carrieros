"use client";

import { useEffect, useId, useState } from "react";

const BROKER_UPLOAD_TYPES = [
  "Rate Confirmation",
  "BOL",
  "Revised Rate Con",
  "Delivery Documents",
] as const;

type BrokerUploadStubModalProps = {
  open: boolean;
  onClose: () => void;
};

export default function BrokerUploadStubModal({
  open,
  onClose,
}: BrokerUploadStubModalProps) {
  const titleId = useId();
  const [selected, setSelected] = useState<(typeof BROKER_UPLOAD_TYPES)[number]>(
    "Rate Confirmation",
  );
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (!open) {
      setSent(false);
      setSelected("Rate Confirmation");
    }
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close overlay"
        className="absolute inset-0 bg-slate-900/30"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative w-full max-w-md rounded-[18px] bg-white p-5 shadow-[0_24px_64px_rgba(15,23,42,0.18)]"
      >
        <h2 id={titleId} className="text-[18px] font-semibold text-slate-950">
          Broker portal upload
        </h2>
        <p className="mt-1 text-[14px] text-slate-500">
          Stub for the broker-facing upload experience. Files are not stored yet.
        </p>

        {sent ? (
          <div className="mt-5 rounded-[14px] bg-[#ECFDF3] px-4 py-4">
            <p className="text-[14px] font-semibold text-[#166534]">
              Upload received (mock)
            </p>
            <p className="mt-1 text-[13px] text-[#15803D]">
              {selected} would be attached to the load and scanned by Alph.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-4 inline-flex h-10 items-center justify-center rounded-full bg-[#16A34A] px-5 text-[13px] font-semibold text-white"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <div className="mt-5 space-y-2">
              {BROKER_UPLOAD_TYPES.map((type) => (
                <label
                  key={type}
                  className={`flex cursor-pointer items-center gap-3 rounded-[12px] px-3 py-3 transition ${
                    selected === type
                      ? "bg-[#EFF6FF] ring-1 ring-[#BFDBFE]"
                      : "bg-[#F8FAFC] hover:bg-[#F1F5F9]"
                  }`}
                >
                  <input
                    type="radio"
                    name="broker-upload-type"
                    checked={selected === type}
                    onChange={() => setSelected(type)}
                    className="h-4 w-4 accent-[#2563EB]"
                  />
                  <span className="text-[14px] font-semibold text-slate-900">
                    {type}
                  </span>
                </label>
              ))}
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-10 items-center justify-center rounded-full px-4 text-[13px] font-medium text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => setSent(true)}
                className="inline-flex h-10 items-center justify-center rounded-full bg-[#2563EB] px-5 text-[13px] font-semibold text-white transition hover:bg-[#1D4ED8]"
              >
                Upload mock file
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
