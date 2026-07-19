import EmptyState from "@/components/ui/EmptyState";
import type { WalletAuditEntry } from "@/lib/wallet/types";
import { ScrollText } from "lucide-react";

export default function AuditLogClient({ entries }: { entries: WalletAuditEntry[] }) {
  if (entries.length === 0) {
    return (
      <EmptyState
        icon={ScrollText}
        title="No audit events yet"
        description="Shares, consents, and enterprise decisions are logged here."
      />
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-[14px] text-[#6B7280]">
        Access-controlled actions are audit logged. Use this trail for privacy reviews and
        dispute support.
      </p>
      {entries.map((entry) => (
        <div key={entry.id} className="rounded-[12px] bg-[#F8F9FB] px-4 py-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-[14px] font-semibold text-[#111827]">{entry.summary}</p>
            <span className="text-[12px] font-medium uppercase tracking-wide text-[#6B7280]">
              {entry.action.replace(/_/g, " ")}
            </span>
          </div>
          <p className="mt-1 text-[13px] text-[#6B7280]">
            {entry.actor} · {new Date(entry.at).toLocaleString()}
            {entry.entityType ? ` · ${entry.entityType}` : ""}
          </p>
        </div>
      ))}
    </div>
  );
}
