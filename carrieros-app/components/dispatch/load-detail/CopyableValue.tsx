"use client";

import { Copy } from "lucide-react";
import type { ReactNode } from "react";
import { copyToClipboard } from "@/components/dispatch/load-detail/copy-to-clipboard";
import { useCopyToast } from "@/components/dispatch/load-detail/CopyToastProvider";

type CopyableValueProps = {
  value: string;
  children?: ReactNode;
  className?: string;
  copyValue?: string;
  label?: string;
};

function isCopyable(value: string): boolean {
  const trimmed = value.trim();
  return trimmed.length > 0 && trimmed !== "—";
}

export default function CopyableValue({
  value,
  children,
  className = "",
  copyValue,
  label = "Copy",
}: CopyableValueProps) {
  const { showCopied } = useCopyToast();

  if (!isCopyable(value)) {
    return <span className={className}>{children ?? value}</span>;
  }

  async function handleCopy(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();

    const text = (copyValue ?? value).trim();
    const copied = await copyToClipboard(text);
    if (copied) {
      showCopied();
    }
  }

  return (
    <span
      className={`group/copy inline-flex min-w-0 max-w-full items-center gap-1 ${className}`.trim()}
    >
      <span className="min-w-0">{children ?? value}</span>
      <button
        type="button"
        onClick={handleCopy}
        aria-label={`${label} to clipboard`}
        className="shrink-0 rounded p-0.5 text-slate-400 opacity-0 transition-opacity group-hover/copy:opacity-60 hover:!opacity-100 focus-visible:opacity-100"
      >
        <Copy className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />
      </button>
    </span>
  );
}
