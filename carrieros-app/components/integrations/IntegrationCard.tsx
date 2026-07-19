"use client";

import HealthSparkline from "@/components/integrations/HealthSparkline";
import IntegrationStatusPill from "@/components/integrations/IntegrationStatusPill";
import { formatRelativeSync } from "@/lib/integrations/health";
import type {
  IntegrationCatalogItem,
  IntegrationRuntimeState,
} from "@/lib/integrations/types";

type IntegrationCardProps = {
  item: IntegrationCatalogItem;
  connection: IntegrationRuntimeState;
  onToggle: (enabled: boolean) => void;
  onConfigure: () => void;
};

export default function IntegrationCard({
  item,
  connection,
  onToggle,
  onConfigure,
}: IntegrationCardProps) {
  const comingSoon = item.comingSoon || connection.comingSoon;
  const canToggle = !comingSoon;
  const toggleDisabledReason = comingSoon
    ? "Coming soon — not available yet"
    : undefined;

  const configureLabel =
    connection.status === "connected" || connection.status === "error"
      ? "Configure"
      : "Connect";

  return (
    <article className="flex flex-col rounded-[16px] bg-white p-5 ring-1 ring-[#EAEAEA] transition hover:ring-[#D0D7E2]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-[12px] bg-[#EFF6FF] text-[13px] font-bold tracking-wide text-[#2563EB]">
            {item.initials}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-[15px] font-semibold text-slate-900">
                {item.name}
              </h3>
              <IntegrationStatusPill
                status={connection.status}
                comingSoon={comingSoon}
              />
            </div>
            <p className="mt-1.5 text-[13px] leading-5 text-slate-500">
              {item.description}
            </p>
          </div>
        </div>

        <label
          className="relative inline-flex shrink-0 cursor-pointer items-center"
          title={toggleDisabledReason}
        >
          <span className="sr-only">
            {connection.enabled ? "Disable" : "Enable"} {item.name}
          </span>
          <input
            type="checkbox"
            className="peer sr-only"
            checked={connection.enabled && !comingSoon}
            disabled={!canToggle}
            onChange={(e) => onToggle(e.target.checked)}
          />
          <span
            className={`h-6 w-11 rounded-full transition ${
              comingSoon
                ? "bg-[#E2E8F0]"
                : "bg-[#CBD5E1] peer-checked:bg-[#16A34A] peer-focus-visible:ring-2 peer-focus-visible:ring-[#93C5FD] peer-disabled:opacity-50"
            }`}
          />
          <span
            className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition peer-checked:translate-x-5 ${
              comingSoon ? "opacity-70" : ""
            }`}
          />
        </label>
      </div>

      {!comingSoon &&
      (connection.status === "connected" ||
        connection.status === "error" ||
        connection.status === "pending") ? (
        <div className="mt-4 flex flex-wrap items-end justify-between gap-3 rounded-[12px] bg-[#F8FAFC] px-3.5 py-3">
          <div className="grid grid-cols-3 gap-4 text-[12px]">
            <div>
              <p className="font-medium text-slate-400">Last sync</p>
              <p className="mt-0.5 text-[13px] font-semibold text-slate-800">
                {formatRelativeSync(connection.health.lastSyncAt)}
              </p>
            </div>
            <div>
              <p className="font-medium text-slate-400">Latency</p>
              <p className="mt-0.5 text-[13px] font-semibold text-slate-800">
                {connection.health.latencyMs != null
                  ? `${connection.health.latencyMs}ms`
                  : "—"}
              </p>
            </div>
            <div>
              <p className="font-medium text-slate-400">Success</p>
              <p className="mt-0.5 text-[13px] font-semibold text-slate-800">
                {connection.health.successRate != null
                  ? `${connection.health.successRate}%`
                  : "—"}
              </p>
            </div>
          </div>
          <HealthSparkline values={connection.health.sparkline} />
        </div>
      ) : null}

      {connection.errorMessage && !comingSoon ? (
        <p className="mt-3 text-[13px] font-medium text-[#DC2626]">
          {connection.errorMessage}
        </p>
      ) : null}

      {connection.credentials?.apiKeyMasked ||
      connection.credentials?.connectedAccountLabel ? (
        <p className="mt-3 text-[12px] text-slate-400">
          {connection.credentials.connectedAccountLabel
            ? connection.credentials.connectedAccountLabel
            : null}
          {connection.credentials.connectedAccountLabel &&
          connection.credentials.apiKeyMasked
            ? " · "
            : null}
          {connection.credentials.apiKeyMasked
            ? `Key ${connection.credentials.apiKeyMasked}`
            : null}
        </p>
      ) : null}

      <div className="mt-auto flex items-center gap-2 pt-4">
        <button
          type="button"
          disabled={comingSoon}
          title={
            comingSoon
              ? "Coming soon — configure when available"
              : undefined
          }
          onClick={onConfigure}
          className="inline-flex h-10 flex-1 items-center justify-center rounded-full bg-[#2563EB] px-4 text-[13px] font-semibold text-white transition hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:bg-[#CBD5E1] disabled:text-white"
        >
          {comingSoon ? "Coming soon" : configureLabel}
        </button>
        <a
          href={item.docsUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-10 items-center justify-center rounded-full bg-[#F8FAFC] px-4 text-[13px] font-semibold text-slate-600 ring-1 ring-[#E2E8F0] transition hover:bg-[#F1F5F9] hover:text-slate-900"
        >
          Docs
        </a>
      </div>
    </article>
  );
}
