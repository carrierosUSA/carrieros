"use client";

import { useState } from "react";
import { REJECT_REASONS } from "@/lib/driver-mobile/constants";
import { BottomSheet, DmPrimaryButton } from "@/components/driver-mobile/ui";

export default function RejectReasonModal({
  onClose,
  onConfirm,
}: {
  onClose: () => void;
  onConfirm: (reason: string) => void;
}) {
  const [reason, setReason] = useState<string>(REJECT_REASONS[0]);
  const [other, setOther] = useState("");

  return (
    <BottomSheet title="Reject load" onClose={onClose}>
      <p className="mb-3 text-[14px] text-[var(--dm-muted)]">
        Tell dispatch why you can&apos;t take this load.
      </p>
      <div className="space-y-2">
        {REJECT_REASONS.map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setReason(r)}
            className={`flex min-h-12 w-full items-center rounded-2xl px-4 text-left text-[15px] font-medium ${
              reason === r
                ? "bg-blue-500/15 text-[var(--color-info)]"
                : "bg-[var(--dm-elevated)]"
            }`}
          >
            {r}
          </button>
        ))}
      </div>
      {reason === "Other" && (
        <textarea
          value={other}
          onChange={(e) => setOther(e.target.value)}
          placeholder="Add a short reason"
          className="mt-3 min-h-24 w-full rounded-2xl bg-[var(--dm-elevated)] px-4 py-3 text-[15px] outline-none"
        />
      )}
      <div className="mt-4">
        <DmPrimaryButton
          tone="danger"
          disabled={reason === "Other" && !other.trim()}
          onClick={() =>
            onConfirm(reason === "Other" ? other.trim() : reason)
          }
        >
          Confirm reject
        </DmPrimaryButton>
      </div>
    </BottomSheet>
  );
}
