"use client";

import { useState } from "react";
import { NetworkStatusBadge } from "@/components/network/NetworkStatusBadge";
import EmptyState from "@/components/ui/EmptyState";
import {
  getMember,
  listConnections,
  respondToConnection,
} from "@/lib/network/store";
import {
  CONNECTION_TYPE_LABELS,
  type NetworkConnection,
} from "@/lib/network/types";
import { NETWORK_OWNER_MEMBER_ID } from "@/lib/network/seed";

export default function ConnectionsClient({
  initial,
}: {
  initial: NetworkConnection[];
}) {
  const [rows, setRows] = useState(initial);

  function refresh() {
    setRows([...listConnections()]);
  }

  function act(
    id: string,
    status: "accepted" | "declined" | "revoked",
  ) {
    respondToConnection(id, status);
    refresh();
  }

  if (!rows.length) {
    return (
      <EmptyState
        title="No connections yet"
        description="Request typed, consent-based connections with carriers, drivers, mechanics, insurers, and more."
        actionLabel="Browse directory"
        actionHref="/network/directory"
      />
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-[14px] text-[#6B7280]">
        Connections are typed and consent-based. Accepting grants mutual visibility for
        reputation and experience verification — you can revoke anytime.
      </p>
      <div className="space-y-3">
        {rows.map((c) => {
          const from = getMember(c.fromMemberId);
          const to = getMember(c.toMemberId);
          const other =
            c.fromMemberId === NETWORK_OWNER_MEMBER_ID
              ? to
              : c.toMemberId === NETWORK_OWNER_MEMBER_ID
                ? from
                : null;
          const involvesOwner =
            c.fromMemberId === NETWORK_OWNER_MEMBER_ID ||
            c.toMemberId === NETWORK_OWNER_MEMBER_ID;

          return (
            <article key={c.id} className="rounded-[16px] bg-[#F8F9FB] p-4 sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-[15px] font-semibold text-[#111827]">
                      {from?.displayName ?? c.fromMemberId} →{" "}
                      {to?.displayName ?? c.toMemberId}
                    </h3>
                    <NetworkStatusBadge status={c.status} />
                  </div>
                  <p className="mt-1 text-[13px] text-[#6B7280]">
                    {CONNECTION_TYPE_LABELS[c.type]}
                    {c.consentGranted ? " · Consent granted" : " · Awaiting consent"}
                  </p>
                  {c.message ? (
                    <p className="mt-2 text-[14px] text-[#334155]">{c.message}</p>
                  ) : null}
                  {other ? (
                    <p className="mt-2 text-[12px] text-[#64748B]">
                      Counterparty: {other.headline}
                    </p>
                  ) : null}
                </div>
                {involvesOwner && c.status === "pending" ? (
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => act(c.id, "accepted")}
                      className="transpo-btn-primary text-[13px]"
                    >
                      Accept
                    </button>
                    <button
                      type="button"
                      onClick={() => act(c.id, "declined")}
                      className="rounded-full px-4 py-2 text-[13px] font-medium text-[#DC2626] hover:bg-white"
                    >
                      Decline
                    </button>
                  </div>
                ) : null}
                {involvesOwner && c.status === "accepted" ? (
                  <button
                    type="button"
                    onClick={() => act(c.id, "revoked")}
                    className="rounded-full px-4 py-2 text-[13px] font-medium text-[#EA580C] hover:bg-white"
                    title="Revoke consent and connection"
                  >
                    Revoke
                  </button>
                ) : null}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
