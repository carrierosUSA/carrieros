"use client";

import { useEffect } from "react";

type FinanceFeedbackToastProps = {
  message: string | null;
  onDismiss: () => void;
};

export default function FinanceFeedbackToast({
  message,
  onDismiss,
}: FinanceFeedbackToastProps) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(onDismiss, 2800);
    return () => clearTimeout(timer);
  }, [message, onDismiss]);

  if (!message) return null;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-5 z-50 flex justify-center"
      role="status"
      aria-live="polite"
    >
      <div className="rounded-full bg-slate-900/92 px-4 py-2 text-[13px] font-medium tracking-[-0.01em] text-white shadow-[0_4px_20px_rgba(15,23,42,0.18)] backdrop-blur-sm">
        {message}
      </div>
    </div>
  );
}
