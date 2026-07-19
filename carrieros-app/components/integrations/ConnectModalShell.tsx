"use client";

import { useEffect, useSyncExternalStore, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

function useIsClient() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

type ConnectModalShellProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
};

export default function ConnectModalShell({
  open,
  onClose,
  title,
  subtitle,
  children,
}: ConnectModalShellProps) {
  const isClient = useIsClient();

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open || !isClient) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/30 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="w-full max-w-md rounded-[16px] bg-white shadow-2xl shadow-slate-400/20 ring-1 ring-[#EAEAEA]"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="connect-modal-title"
      >
        <div className="flex items-start justify-between gap-3 px-5 py-4">
          <div>
            <h2
              id="connect-modal-title"
              className="text-[16px] font-semibold text-slate-900"
            >
              {title}
            </h2>
            {subtitle ? (
              <p className="mt-1 text-[13px] leading-5 text-slate-500">
                {subtitle}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-slate-400 transition hover:bg-[#F5F7FA] hover:text-slate-700"
            aria-label="Close"
          >
            <X className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  );
}
