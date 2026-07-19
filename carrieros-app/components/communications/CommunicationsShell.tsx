"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { History, Plus } from "lucide-react";
import CallLogDetail from "@/components/communications/CallLogDetail";
import ChannelFilters from "@/components/communications/ChannelFilters";
import ChatThread from "@/components/communications/ChatThread";
import CommunicationCard from "@/components/communications/CommunicationCard";
import CommunicationsSearch from "@/components/communications/CommunicationsSearch";
import ComposeModal from "@/components/communications/ComposeModal";
import EmailDetail from "@/components/communications/EmailDetail";
import EntityFilter from "@/components/communications/EntityFilter";
import SmsThread from "@/components/communications/SmsThread";
import TimelinePanel from "@/components/communications/TimelinePanel";
import FadeIn from "@/components/ui/FadeIn";
import {
  appendMessageToThread,
  composeCommunication,
  countByChannel,
  countUnread,
  filterCommunications,
  filterTimelineEvents,
  getActiveProvider,
  listCommunications,
  listTimelineEvents,
  markCommunicationRead,
} from "@/lib/communications";
import type {
  CommunicationChannel,
  CommunicationRecord,
  ComposeInput,
  EntityType,
  LinkedEntities,
} from "@/lib/communications/types";
import { openCommunicationUrl } from "@/lib/dispatch/communication";

type CommunicationsShellProps = {
  initialRecords: CommunicationRecord[];
};

function parseComposeChannel(
  value: string | null,
): CommunicationChannel | undefined {
  if (
    value === "voice" ||
    value === "sms" ||
    value === "email" ||
    value === "chat"
  ) {
    return value;
  }
  return undefined;
}

export default function CommunicationsShell({
  initialRecords,
}: CommunicationsShellProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const [records, setRecords] = useState(initialRecords);
  const [timeline, setTimeline] = useState(() => listTimelineEvents());
  const [selectedId, setSelectedId] = useState<string | null>(
    initialRecords[0]?.id ?? null,
  );
  const [channel, setChannel] = useState<CommunicationChannel | "all">("all");
  const [entityType, setEntityType] = useState<EntityType | "all">("all");
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [dateFrom, setDateFrom] = useState("");
  const [query, setQuery] = useState("");
  const [viewMode, setViewMode] = useState<"conversation" | "timeline">(
    "conversation",
  );
  const [composeOpen, setComposeOpen] = useState(false);
  const [composeKey, setComposeKey] = useState(0);
  const [composeChannel, setComposeChannel] =
    useState<CommunicationChannel>("sms");
  const [composeLinkedTo, setComposeLinkedTo] = useState<LinkedEntities>({});
  const [composePhone, setComposePhone] = useState<string | undefined>();
  const [toast, setToast] = useState<string | null>(null);

  const provider = getActiveProvider();

  useEffect(() => {
    const loadId = searchParams.get("loadId") ?? undefined;
    const driverId = searchParams.get("driverId") ?? undefined;
    const compose = parseComposeChannel(searchParams.get("compose"));
    const phone = searchParams.get("phone") ?? undefined;

    if (loadId || driverId) {
      if (loadId) {
        // Prefer filtering inbox to this load
        setEntityType("load");
      }
    }

    if (compose) {
      setComposeChannel(compose);
      setComposeLinkedTo({
        ...(loadId ? { loadId } : {}),
        ...(driverId ? { driverId } : {}),
      });
      setComposePhone(phone);
      setComposeKey((k) => k + 1);
      setComposeOpen(true);
    }
  }, [searchParams]);

  const filter = useMemo(
    () => ({
      channel,
      entityType,
      unreadOnly,
      dateFrom: dateFrom || undefined,
      query,
      loadId: searchParams.get("loadId") ?? undefined,
      driverId: searchParams.get("driverId") ?? undefined,
    }),
    [channel, entityType, unreadOnly, dateFrom, query, searchParams],
  );

  const filtered = useMemo(
    () => filterCommunications(records, filter),
    [records, filter],
  );

  const filteredTimeline = useMemo(
    () => filterTimelineEvents(timeline, filter),
    [timeline, filter],
  );

  const channelCounts = useMemo(() => countByChannel(records), [records]);
  const unreadCount = useMemo(() => countUnread(records), [records]);

  const selected =
    filtered.find((r) => r.id === selectedId) ??
    filtered[0] ??
    records.find((r) => r.id === selectedId) ??
    null;

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(null), 2600);
  }

  function refreshFromStore() {
    setRecords(listCommunications());
    setTimeline(listTimelineEvents());
  }

  function handleSelect(id: string) {
    setSelectedId(id);
    setViewMode("conversation");
    startTransition(() => {
      markCommunicationRead(id);
      refreshFromStore();
    });
  }

  async function handleCompose(input: ComposeInput) {
    const { record, providerMessage, fallbackUrl } =
      await composeCommunication(input);
    refreshFromStore();
    setSelectedId(record.id);
    setViewMode("conversation");
    showToast(providerMessage);

    if (fallbackUrl) {
      openCommunicationUrl(fallbackUrl);
    }
  }

  function handleThreadSend(body: string) {
    if (!selected) return;
    const updated = appendMessageToThread(selected.id, body);
    refreshFromStore();
    if (updated) {
      setSelectedId(updated.id);
      showToast("Message sent · logged to timeline");
    }
  }

  function openCompose(channelHint: CommunicationChannel = "sms") {
    setComposeChannel(channelHint);
    setComposeLinkedTo({
      loadId: searchParams.get("loadId") ?? undefined,
      driverId: searchParams.get("driverId") ?? undefined,
    });
    setComposePhone(undefined);
    setComposeKey((k) => k + 1);
    setComposeOpen(true);
  }

  return (
    <FadeIn>
      <div className="space-y-4">
        <div className="flex flex-col gap-3 rounded-[16px] bg-[#F8F9FB] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-white px-3 py-1.5 text-[12px] font-semibold text-[#475569] shadow-[0_1px_0_rgba(15,23,42,0.04)]">
              {provider.statusLabel}
            </span>
            {unreadCount > 0 ? (
              <span className="rounded-full bg-[#EFF6FF] px-3 py-1.5 text-[12px] font-semibold text-[#2563EB]">
                {unreadCount} unread
              </span>
            ) : (
              <span className="rounded-full bg-[#ECFDF3] px-3 py-1.5 text-[12px] font-semibold text-[#16A34A]">
                Inbox clear
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                setViewMode((m) =>
                  m === "timeline" ? "conversation" : "timeline",
                )
              }
              className={`inline-flex h-10 items-center gap-2 rounded-xl px-3.5 text-[13px] font-semibold transition ${
                viewMode === "timeline"
                  ? "bg-[#111827] text-white"
                  : "bg-white text-[#475569] hover:bg-[#EFF6FF] hover:text-[#2563EB]"
              }`}
            >
              <History className="h-4 w-4" strokeWidth={2} />
              Timeline
            </button>
            <button
              type="button"
              onClick={() => openCompose("sms")}
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#2563EB] px-4 text-[13px] font-semibold text-white transition hover:bg-[#1D4ED8]"
            >
              <Plus className="h-4 w-4" strokeWidth={2} />
              Compose
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <CommunicationsSearch value={query} onChange={setQuery} />
          <ChannelFilters
            value={channel}
            counts={channelCounts}
            onChange={setChannel}
          />
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <EntityFilter value={entityType} onChange={setEntityType} />
            <div className="flex flex-wrap items-center gap-2">
              <label className="inline-flex items-center gap-2 rounded-xl bg-[#F5F7FA] px-3 py-2 text-[12px] font-semibold text-[#475569]">
                <input
                  type="checkbox"
                  checked={unreadOnly}
                  onChange={(e) => setUnreadOnly(e.target.checked)}
                  className="rounded border-[#CBD5E1] text-[#2563EB]"
                />
                Unread only
              </label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="h-9 rounded-xl bg-[#F5F7FA] px-3 text-[12px] font-medium text-[#475569] outline-none"
                aria-label="From date"
              />
            </div>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[360px_minmax(0,1fr)] xl:grid-cols-[380px_minmax(0,1fr)]">
          <div className="min-h-[520px] rounded-[20px] bg-[#F8F9FB] p-2">
            <div className="px-2.5 py-2">
              <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#94A3B8]">
                Inbox
              </p>
              <p className="mt-0.5 text-[13px] text-[#64748B]">
                {filtered.length} conversation
                {filtered.length === 1 ? "" : "s"}
              </p>
            </div>
            <div className="max-h-[68vh] space-y-0.5 overflow-y-auto">
              {filtered.length === 0 ? (
                <div className="px-4 py-12 text-center">
                  <p className="text-[14px] font-semibold text-[#111827]">
                    Nothing matches
                  </p>
                  <p className="mt-1 text-[13px] text-[#64748B]">
                    Try another channel or clear filters.
                  </p>
                </div>
              ) : (
                filtered.map((record) => (
                  <CommunicationCard
                    key={record.id}
                    record={record}
                    selected={selected?.id === record.id}
                    onSelect={handleSelect}
                  />
                ))
              )}
            </div>
          </div>

          <div className="min-h-[520px] rounded-[20px] bg-white px-5 py-5 shadow-[0_1px_0_rgba(15,23,42,0.04)] ring-1 ring-[#EEF2F7]">
            {viewMode === "timeline" ? (
              <div>
                <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#94A3B8]">
                  Communications timeline
                </p>
                <h2 className="mt-1 text-[18px] font-bold text-[#111827]">
                  Everything that happened
                </h2>
                <div className="mt-5">
                  <TimelinePanel
                    events={filteredTimeline}
                    onSelectCommunication={(id) => {
                      handleSelect(id);
                      setViewMode("conversation");
                    }}
                  />
                </div>
              </div>
            ) : selected ? (
              <>
                {selected.channel === "voice" ? (
                  <CallLogDetail record={selected} />
                ) : null}
                {selected.channel === "sms" ? (
                  <SmsThread record={selected} onSend={handleThreadSend} />
                ) : null}
                {selected.channel === "email" ? (
                  <EmailDetail record={selected} />
                ) : null}
                {selected.channel === "chat" ? (
                  <ChatThread record={selected} onSend={handleThreadSend} />
                ) : null}
              </>
            ) : (
              <div className="grid h-full min-h-[420px] place-items-center text-center">
                <div>
                  <p className="text-[16px] font-semibold text-[#111827]">
                    Select a conversation
                  </p>
                  <p className="mt-1 text-[14px] text-[#64748B]">
                    Or compose a new call, SMS, email, or team chat.
                  </p>
                  <button
                    type="button"
                    onClick={() => openCompose()}
                    className="mt-4 inline-flex h-10 items-center gap-2 rounded-xl bg-[#2563EB] px-4 text-[13px] font-semibold text-white"
                  >
                    <Plus className="h-4 w-4" />
                    Compose
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <ComposeModal
        key={composeKey}
        open={composeOpen}
        initialChannel={composeChannel}
        initialLinkedTo={composeLinkedTo}
        initialPhone={composePhone}
        onClose={() => {
          setComposeOpen(false);
          // Clear compose query params without losing loadId filter if desired
          const params = new URLSearchParams(searchParams.toString());
          if (params.has("compose")) {
            params.delete("compose");
            params.delete("phone");
            const qs = params.toString();
            router.replace(qs ? `/communications?${qs}` : "/communications");
          }
        }}
        onCompose={handleCompose}
      />

      {toast ? (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-[#111827] px-5 py-3 text-[13px] font-semibold text-white shadow-lg">
          {toast}
        </div>
      ) : null}
    </FadeIn>
  );
}
