"use client";

import { useMemo, useState } from "react";
import EmptyState from "@/components/ui/EmptyState";
import { TRANSPO_COLORS } from "@/lib/design-system/colors";
import type { DeveloperDocSection } from "@/lib/platform/types";
import {
  generateApiKey,
  getDeveloperAnalytics,
  listApiKeys,
  listSandboxLogs,
  revokeApiKey,
  runSandboxSample,
} from "@/lib/platform/store";

export default function DevelopersClient({ docs }: { docs: DeveloperDocSection[] }) {
  const [tick, setTick] = useState(0);
  const [keyName, setKeyName] = useState("Sandbox key");
  const [samplePath, setSamplePath] = useState("/v1/loads");

  const keys = useMemo(() => {
    void tick;
    return listApiKeys();
  }, [tick]);

  const logs = useMemo(() => {
    void tick;
    return listSandboxLogs();
  }, [tick]);

  const analytics = useMemo(() => {
    void tick;
    return getDeveloperAnalytics();
  }, [tick]);

  return (
    <div className="space-y-8">
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Active keys", value: String(analytics.activeKeys) },
          { label: "Sandbox calls (est.)", value: analytics.sandboxCalls30d.toLocaleString() },
          { label: "Error rate", value: `${analytics.errorRatePct}%` },
          { label: "p95 latency", value: `${analytics.p95LatencyMs} ms` },
        ].map((stat) => (
          <div key={stat.label} className="rounded-[16px] bg-[#F8F9FB] p-4">
            <p className="text-[13px] font-medium text-[#6B7280]">{stat.label}</p>
            <p className="mt-2 text-[22px] font-bold text-[#111827]">{stat.value}</p>
          </div>
        ))}
      </section>

      <section className="rounded-[16px] bg-[#F8F9FB] p-5">
        <h2 className="text-[16px] font-semibold text-[#111827]">Public API overview</h2>
        <p className="mt-2 text-[14px] leading-relaxed text-[#475569]">
          REST base path <code className="rounded bg-white px-1.5 py-0.5 text-[13px]">/v1</code> for
          loads, fleet, documents, and finance. Auth via Bearer keys. Webhooks and SDK notes are in
          Docs below. This console is a local sandbox — it does not call external networks.
        </p>
        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          {["Auth", "Webhooks", "SDK", "Rate limits", "Monitoring", "Sandbox"].map((item) => (
            <div key={item} className="rounded-[12px] bg-white px-3 py-2.5 text-[13px] font-medium text-[#334155]">
              {item}
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-[16px] font-semibold text-[#111827]">API keys</h2>
        <p className="mt-1 text-[14px] text-[#6B7280]">
          Generate or revoke keys in your local store. Secrets are masked — product-honest demo.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <input
            value={keyName}
            onChange={(e) => setKeyName(e.target.value)}
            className="h-10 min-w-[200px] rounded-[12px] bg-white px-3 text-[14px] shadow-[inset_0_0_0_1px_#E5E7EB] outline-none focus:shadow-[inset_0_0_0_1px_#93C5FD]"
            placeholder="Key name"
          />
          <button
            type="button"
            className="transpo-btn-primary"
            onClick={() => {
              generateApiKey(keyName, "sandbox");
              setTick((n) => n + 1);
            }}
          >
            Generate sandbox key
          </button>
        </div>
        <ul className="mt-4 space-y-2">
          {keys.map((key) => (
            <li
              key={key.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-[12px] bg-white px-4 py-3 shadow-[inset_0_0_0_1px_#EEF2F7]"
            >
              <div>
                <p className="text-[14px] font-semibold text-[#111827]">{key.name}</p>
                <p className="text-[13px] text-[#6B7280]">
                  {key.secretHint} · {key.environment}
                  {key.revokedAt ? " · revoked" : ""}
                </p>
              </div>
              {!key.revokedAt ? (
                <button
                  type="button"
                  className="transpo-btn-secondary"
                  onClick={() => {
                    revokeApiKey(key.id);
                    setTick((n) => n + 1);
                  }}
                >
                  Revoke
                </button>
              ) : (
                <span className={`text-[13px] font-semibold ${TRANSPO_COLORS.disabled.text}`}>
                  Revoked
                </span>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-[16px] font-semibold text-[#111827]">Sandbox console</h2>
        <p className="mt-1 text-[14px] text-[#6B7280]">
          Run a sample request and log it locally.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <input
            value={samplePath}
            onChange={(e) => setSamplePath(e.target.value)}
            className="h-10 min-w-[220px] flex-1 rounded-[12px] bg-white px-3 font-mono text-[13px] shadow-[inset_0_0_0_1px_#E5E7EB]"
          />
          <button
            type="button"
            className="transpo-btn-primary"
            onClick={() => {
              runSandboxSample(samplePath || "/v1/loads", "GET");
              setTick((n) => n + 1);
            }}
          >
            Run sample GET
          </button>
        </div>
        {logs.length === 0 ? (
          <EmptyState
            className="mt-4"
            title="No sandbox traffic yet"
            description="Run a sample request to populate the log."
          />
        ) : (
          <ul className="mt-4 space-y-2">
            {logs.slice(0, 12).map((log) => (
              <li
                key={log.id}
                className="rounded-[12px] bg-[#F8F9FB] px-4 py-3 text-[13px] text-[#334155]"
              >
                <span className="font-semibold">{log.method}</span> {log.path}{" "}
                <span className={log.status < 300 ? TRANSPO_COLORS.success.text : TRANSPO_COLORS.critical.text}>
                  {log.status}
                </span>{" "}
                · {log.latencyMs}ms · {log.note}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-[16px] font-semibold text-[#111827]">Docs</h2>
        {docs.map((doc) => (
          <article key={doc.id} className="rounded-[16px] bg-white p-4 shadow-[inset_0_0_0_1px_#EEF2F7]">
            <h3 className="text-[15px] font-semibold text-[#111827]">{doc.title}</h3>
            <pre className="mt-3 whitespace-pre-wrap font-sans text-[14px] leading-relaxed text-[#475569]">
              {doc.body}
            </pre>
          </article>
        ))}
      </section>
    </div>
  );
}
