"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import EldAlphAnswers from "@/components/eld/EldAlphAnswers";
import EldContactProviderPanel from "@/components/eld/EldContactProviderPanel";
import EldFallbackOptions from "@/components/eld/EldFallbackOptions";
import EldProviderCard from "@/components/eld/EldProviderCard";
import EldRequestForm from "@/components/eld/EldRequestForm";
import EldRequestStatusTimeline from "@/components/eld/EldRequestStatusTimeline";
import EldStatusBadge from "@/components/eld/EldStatusBadge";
import EldUnsupportedPanel from "@/components/eld/EldUnsupportedPanel";
import FadeIn from "@/components/ui/FadeIn";
import {
  ALL_ELD_DATA_TYPES,
  ELD_CATALOG,
  ELD_DATA_TYPE_LABELS,
  ELD_STATUS_LABELS,
  ELD_SUPPORT_CATEGORY_LABELS,
  addEldRequestDocument,
  buildEldIntegrationRequestCopy,
  getEldCatalogProvider,
  getEldStore,
  listEldRequests,
  subscribeEldStore,
  type EldConnectionStatus,
  type EldDataType,
  type EldSupportCategory,
} from "@/lib/eld";
import { loadSettings } from "@/lib/settings/settings-store";

type PanelMode =
  | "directory"
  | "detail"
  | "unsupported"
  | "request"
  | "contact"
  | "upload";

const STATUS_FILTERS: Array<EldConnectionStatus | "all"> = [
  "all",
  "connected",
  "available",
  "partnership_required",
  "api_restricted",
  "no_public_api",
  "under_review",
  "not_yet_supported",
];

const CATEGORY_FILTERS: Array<EldSupportCategory | "all"> = [
  "all",
  "technically_supported",
  "waiting_eld_approval",
  "unsupported_no_api",
  "requested_by_carriers",
];

function useEldStore() {
  return useSyncExternalStore(subscribeEldStore, getEldStore, getEldStore);
}

function companyDefaults() {
  const settings = loadSettings();
  const user = settings.users[0];
  return {
    carrierCompany: settings.company.name,
    mcNumber: settings.company.mcNumber,
    dotNumber: settings.company.dotNumber,
    contactName: user?.name ?? "Ops",
    contactEmail: user?.email ?? "ops@carrier.example",
    contactPhone: "(210) 555-0180",
  };
}

export default function EldDirectoryClient() {
  const store = useEldStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const company = useMemo(() => companyDefaults(), []);

  const initialProvider = searchParams.get("provider");
  const initialPanel = searchParams.get("panel");
  const initialData = searchParams.get("data") as EldDataType | null;

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<EldConnectionStatus | "all">(
    "all",
  );
  const [categoryFilter, setCategoryFilter] = useState<
    EldSupportCategory | "all"
  >("all");
  const [dataFilter, setDataFilter] = useState<EldDataType | "all">(
    initialData && ALL_ELD_DATA_TYPES.includes(initialData)
      ? initialData
      : "all",
  );
  const [selectedId, setSelectedId] = useState<string | null>(
    initialProvider && getEldCatalogProvider(initialProvider)
      ? initialProvider
      : null,
  );
  const [panel, setPanel] = useState<PanelMode>(() => {
    if (initialPanel === "contact") return "contact";
    if (initialProvider) {
      const p = getEldCatalogProvider(initialProvider);
      const st =
        store.connections[initialProvider]?.status ?? p?.status ?? "not_yet_supported";
      if (st === "connected" || st === "available") return "detail";
      return "unsupported";
    }
    return "directory";
  });
  const [feedback, setFeedback] = useState<string | null>(null);
  const [submittedRequestId, setSubmittedRequestId] = useState<string | null>(
    null,
  );

  const selected = selectedId ? getEldCatalogProvider(selectedId) : null;
  const selectedStatus: EldConnectionStatus | null = selectedId
    ? store.connections[selectedId]?.status ??
      selected?.status ??
      "not_yet_supported"
    : null;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ELD_CATALOG.filter((p) => {
      const status = store.connections[p.id]?.status ?? p.status;
      if (statusFilter !== "all" && status !== statusFilter) return false;
      if (categoryFilter !== "all" && p.supportCategory !== categoryFilter)
        return false;
      if (dataFilter !== "all" && !p.dataTypes.includes(dataFilter)) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      );
    });
  }, [query, statusFilter, categoryFilter, dataFilter, store.connections]);

  const counts = useMemo(() => {
    const byStatus: Partial<Record<EldConnectionStatus, number>> = {};
    for (const p of ELD_CATALOG) {
      const st = store.connections[p.id]?.status ?? p.status;
      byStatus[st] = (byStatus[st] ?? 0) + 1;
    }
    return byStatus;
  }, [store.connections]);

  function openProvider(id: string, mode?: PanelMode) {
    const p = getEldCatalogProvider(id);
    if (!p) return;
    const st = store.connections[id]?.status ?? p.status;
    setSelectedId(id);
    setFeedback(null);
    if (mode) {
      setPanel(mode);
      return;
    }
    if (st === "connected" || st === "available") {
      setPanel("detail");
    } else {
      setPanel("unsupported");
    }
  }

  function handlePrimaryAction(id: string) {
    const p = getEldCatalogProvider(id);
    if (!p) return;
    const st = store.connections[id]?.status ?? p.status;
    setSelectedId(id);
    setFeedback(null);
    if (st === "connected") {
      router.push("/integrations?category=eld_telematics");
      return;
    }
    if (st === "available") {
      router.push("/integrations?category=eld_telematics");
      return;
    }
    setPanel("request");
  }

  async function copyIntegrationRequest() {
    if (!selected) return;
    const text = buildEldIntegrationRequestCopy({
      carrierCompany: company.carrierCompany,
      mcNumber: company.mcNumber,
      dotNumber: company.dotNumber,
      eldProviderName: selected.name,
      features: selected.dataTypes.map((d) => ELD_DATA_TYPE_LABELS[d]),
      truckCount: 12,
    });
    try {
      await navigator.clipboard.writeText(text);
      setFeedback("Integration request copied.");
    } catch {
      setFeedback("Could not copy — try again.");
    }
  }

  const recentForProvider = selectedId
    ? store.fallbackImports.filter((i) => i.providerId === selectedId)
    : store.fallbackImports;

  const providerRequests = selectedId ? listEldRequests(selectedId) : [];
  const activeRequest =
    (submittedRequestId
      ? store.requests.find((r) => r.id === submittedRequestId)
      : null) ?? providerRequests[0];

  return (
    <FadeIn className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <Link
            href="/integrations"
            className="inline-flex h-9 items-center rounded-xl bg-[#F5F7FA] px-3 text-[13px] font-semibold text-slate-700 hover:bg-[#E8EDF5]"
          >
            Integration Center
          </Link>
          <Link
            href="/integrations/eld/requests"
            className="inline-flex h-9 items-center rounded-xl bg-[#EFF6FF] px-3 text-[13px] font-semibold text-[#2563EB] hover:bg-[#DBEAFE]"
          >
            My requests
          </Link>
          <Link
            href="/admin?tab=eld"
            className="inline-flex h-9 items-center rounded-xl bg-[#F5F7FA] px-3 text-[13px] font-semibold text-slate-700 hover:bg-[#E8EDF5]"
          >
            Integration Team queue
          </Link>
        </div>
        <p className="text-[13px] text-slate-500">
          {ELD_CATALOG.length} providers ·{" "}
          {counts.connected ?? 0} connected · {counts.available ?? 0} ready
        </p>
      </div>

      <section className="rounded-[16px] bg-[#F5F7FA] px-4 py-4 sm:px-5">
        <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-slate-400">
          Support categories
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {CATEGORY_FILTERS.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => {
                setCategoryFilter(cat);
                setPanel("directory");
              }}
              className={`rounded-xl px-3 py-1.5 text-[12px] font-semibold transition ${
                categoryFilter === cat
                  ? "bg-[#2563EB] text-white"
                  : "bg-white text-slate-600 hover:bg-[#EFF6FF]"
              }`}
            >
              {cat === "all"
                ? "All"
                : ELD_SUPPORT_CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>
        <p className="mt-3 text-[13px] leading-5 text-slate-500">
          We do not promise every ELD can connect. Cards separate technically
          supported, waiting for ELD approval, unsupported (no API), and
          requested by carriers — with a clear next step each time.
        </p>
      </section>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search ELD providers…"
          className="h-11 flex-1 rounded-xl bg-white px-4 text-[14px] text-slate-900 outline-none ring-1 ring-[#EAEAEA] focus:ring-[#93C5FD]"
        />
        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value as EldConnectionStatus | "all")
          }
          className="h-11 rounded-xl bg-white px-3 text-[13px] font-medium text-slate-700 ring-1 ring-[#EAEAEA]"
        >
          {STATUS_FILTERS.map((s) => (
            <option key={s} value={s}>
              {s === "all" ? "All statuses" : ELD_STATUS_LABELS[s]}
            </option>
          ))}
        </select>
        <select
          value={dataFilter}
          onChange={(e) =>
            setDataFilter(e.target.value as EldDataType | "all")
          }
          className="h-11 rounded-xl bg-white px-3 text-[13px] font-medium text-slate-700 ring-1 ring-[#EAEAEA]"
        >
          <option value="all">All data types</option>
          {ALL_ELD_DATA_TYPES.map((dt) => (
            <option key={dt} value={dt}>
              {ELD_DATA_TYPE_LABELS[dt]}
            </option>
          ))}
        </select>
      </div>

      {panel !== "directory" && selected && selectedStatus ? (
        <div className="space-y-4">
          <button
            type="button"
            onClick={() => {
              setPanel("directory");
              setSelectedId(null);
              setSubmittedRequestId(null);
            }}
            className="text-[13px] font-semibold text-[#2563EB] hover:underline"
          >
            ← Back to directory
          </button>

          {panel === "detail" ? (
            <div className="space-y-4 rounded-[16px] bg-white p-5 ring-1 ring-[#EAEAEA] sm:p-6">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-semibold text-slate-900">
                  {selected.name}
                </h2>
                <EldStatusBadge status={selectedStatus} />
              </div>
              <p className="text-[14px] text-slate-600">{selected.description}</p>
              {selectedStatus === "connected" ? (
                <p className="rounded-[12px] bg-[#ECFDF3] px-3 py-2 text-[13px] text-[#166534]">
                  Connected and synced with Integration Center
                  {store.connections[selected.id]?.lastSyncAt
                    ? ` · last sync ${new Date(
                        store.connections[selected.id].lastSyncAt!,
                      ).toLocaleString()}`
                    : ""}
                  .
                </p>
              ) : (
                <p className="rounded-[12px] bg-[#EFF6FF] px-3 py-2 text-[13px] text-[#1D4ED8]">
                  Technically supported — connect from Integration Center when
                  you are ready.
                </p>
              )}
              <div className="flex flex-wrap gap-2">
                <Link
                  href="/integrations?category=eld_telematics"
                  className="inline-flex h-10 items-center rounded-xl bg-[#2563EB] px-4 text-[13px] font-semibold text-white hover:bg-[#1D4ED8]"
                >
                  {selectedStatus === "connected"
                    ? "Open Integration Center"
                    : "Connect in Integration Center"}
                </Link>
                <button
                  type="button"
                  onClick={() => setPanel("contact")}
                  className="inline-flex h-10 items-center rounded-xl bg-[#F5F7FA] px-4 text-[13px] font-semibold text-slate-700"
                >
                  Contact ELD Provider
                </button>
              </div>
            </div>
          ) : null}

          {panel === "unsupported" ? (
            <EldUnsupportedPanel
              provider={selected}
              status={selectedStatus}
              feedback={feedback}
              onRequestIntegration={() => setPanel("request")}
              onContactProvider={() => setPanel("contact")}
              onCopyRequest={copyIntegrationRequest}
              onUploadDocs={() => setPanel("upload")}
              onChooseAnother={() => {
                setPanel("directory");
                setSelectedId(null);
              }}
            />
          ) : null}

          {panel === "request" ? (
            <EldRequestForm
              provider={selected}
              company={company}
              onCancel={() =>
                setPanel(
                  selectedStatus === "available" ||
                    selectedStatus === "connected"
                    ? "detail"
                    : "unsupported",
                )
              }
              onSubmitted={(id) => {
                setSubmittedRequestId(id);
                setPanel("unsupported");
                setFeedback("Request submitted — tracking below.");
              }}
            />
          ) : null}

          {panel === "contact" ? (
            <EldContactProviderPanel
              provider={selected}
              company={company}
              requestId={activeRequest?.id}
              onClose={() =>
                setPanel(
                  selectedStatus === "available" ||
                    selectedStatus === "connected"
                    ? "detail"
                    : "unsupported",
                )
              }
            />
          ) : null}

          {panel === "upload" ? (
            <div className="space-y-4 rounded-[16px] bg-white p-5 ring-1 ring-[#EAEAEA]">
              <h2 className="text-lg font-semibold text-slate-900">
                Upload API documents
              </h2>
              <p className="text-[13px] text-slate-500">
                Attach partner docs to your latest request for {selected.name}.
                {!activeRequest
                  ? " Submit a request first if you have not already."
                  : ""}
              </p>
              {activeRequest ? (
                <label className="flex cursor-pointer flex-col gap-2 rounded-[12px] bg-[#F5F7FA] px-4 py-3">
                  <span className="text-[13px] font-semibold text-slate-700">
                    Choose files
                  </span>
                  <input
                    type="file"
                    multiple
                    onChange={(e) => {
                      const files = Array.from(e.target.files ?? []);
                      for (const f of files) {
                        addEldRequestDocument(activeRequest.id, f.name);
                      }
                      if (files.length) {
                        setFeedback(`${files.length} document(s) attached.`);
                      }
                      e.target.value = "";
                    }}
                  />
                </label>
              ) : (
                <button
                  type="button"
                  onClick={() => setPanel("request")}
                  className="inline-flex h-10 items-center rounded-xl bg-[#2563EB] px-4 text-[13px] font-semibold text-white"
                >
                  Submit a request first
                </button>
              )}
              <button
                type="button"
                onClick={() => setPanel("unsupported")}
                className="text-[13px] font-semibold text-[#2563EB]"
              >
                Back
              </button>
            </div>
          ) : null}

          {activeRequest && panel !== "request" ? (
            <div className="rounded-[16px] bg-white p-5 ring-1 ring-[#EAEAEA] sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-[15px] font-semibold text-slate-900">
                  Request status
                </h3>
                <Link
                  href={`/integrations/eld/requests?id=${activeRequest.id}`}
                  className="text-[13px] font-semibold text-[#2563EB]"
                >
                  Full history
                </Link>
              </div>
              <div className="mt-4">
                <EldRequestStatusTimeline request={activeRequest} />
              </div>
            </div>
          ) : null}

          {selectedStatus !== "connected" ? (
            <EldFallbackOptions
              providerId={selected.id}
              providerName={selected.name}
              recentImports={recentForProvider}
            />
          ) : null}
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((provider) => {
              const status =
                store.connections[provider.id]?.status ?? provider.status;
              return (
                <EldProviderCard
                  key={provider.id}
                  provider={provider}
                  status={status}
                  onSelect={() => openProvider(provider.id)}
                  onRequest={() => handlePrimaryAction(provider.id)}
                />
              );
            })}
          </div>
          {filtered.length === 0 ? (
            <p className="rounded-[16px] bg-[#F5F7FA] px-5 py-10 text-center text-[14px] text-slate-500">
              No ELDs match these filters. Clear filters or request a niche
              provider from Alph.
            </p>
          ) : null}

          <EldFallbackOptions recentImports={store.fallbackImports} />
          <EldAlphAnswers />
        </>
      )}
    </FadeIn>
  );
}
