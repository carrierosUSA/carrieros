"use client";

import { useEffect } from "react";

type IftaFeedbackToastProps = {
  message: string | null;
  onDismiss: () => void;
};

export default function IftaFeedbackToast({
  message,
  onDismiss,
}: IftaFeedbackToastProps) {
  useEffect(() => {
    if (!message) return;
    const t = window.setTimeout(onDismiss, 3200);
    return () => window.clearTimeout(t);
  }, [message, onDismiss]);

  if (!message) return null;

  return (
    <div
      role="status"
      className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-slate-950 px-5 py-3 text-[13px] font-semibold text-white shadow-lg"
    >
      {message}
    </div>
  );
}
