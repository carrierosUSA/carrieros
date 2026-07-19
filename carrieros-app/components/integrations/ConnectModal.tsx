"use client";

import { useState } from "react";
import ConnectModalShell from "@/components/integrations/ConnectModalShell";
import {
  connectIntegration,
  disconnectIntegration,
  testConnection,
} from "@/lib/integrations/adapters";
import {
  applyConnectionResult,
  applyDisconnect,
  applyTestResult,
} from "@/lib/integrations/store";
import type {
  IntegrationCatalogItem,
  IntegrationRuntimeState,
} from "@/lib/integrations/types";

type ConnectModalProps = {
  open: boolean;
  item: IntegrationCatalogItem | null;
  connection: IntegrationRuntimeState | null;
  onClose: () => void;
};

export default function ConnectModal({
  open,
  item,
  connection,
  onClose,
}: ConnectModalProps) {
  const [apiKey, setApiKey] = useState("");
  const [accountLabel, setAccountLabel] = useState("");
  const [busy, setBusy] = useState<"connect" | "disconnect" | "test" | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  if (!item) return null;

  const isConnected = connection?.status === "connected";
  const isComingSoon = item.comingSoon || connection?.comingSoon;

  async function handleConnect() {
    if (!item || isComingSoon) return;
    const provider = item;
    setBusy("connect");
    setError(null);
    setInfo(null);
    try {
      const result = await connectIntegration({
        providerId: provider.id,
        mode: provider.authMode,
        apiKey: provider.authMode === "api_key" ? apiKey : undefined,
        accountLabel: accountLabel || undefined,
      });
      applyConnectionResult(provider.id, {
        status: result.status,
        apiKeyMasked: result.apiKeyMasked,
        accountLabel: result.accountLabel,
        message: result.message,
        latencyMs: 110,
      });
      if (!result.ok) {
        setError(result.message);
      } else {
        setInfo(result.message);
        setApiKey("");
      }
    } finally {
      setBusy(null);
    }
  }

  async function handleDisconnect() {
    if (!item) return;
    const provider = item;
    setBusy("disconnect");
    setError(null);
    setInfo(null);
    try {
      await disconnectIntegration(provider.id);
      applyDisconnect(provider.id);
      setInfo("Disconnected.");
      setApiKey("");
      setAccountLabel("");
    } finally {
      setBusy(null);
    }
  }

  async function handleTest() {
    if (!item) return;
    const provider = item;
    setBusy("test");
    setError(null);
    setInfo(null);
    try {
      const result = await testConnection(provider.id);
      applyTestResult(provider.id, result);
      if (result.ok) setInfo(result.message);
      else setError(result.message);
    } finally {
      setBusy(null);
    }
  }

  return (
    <ConnectModalShell
      open={open}
      onClose={onClose}
      title={isConnected ? `Manage ${item.name}` : `Connect ${item.name}`}
      subtitle={
        isComingSoon
          ? "This partner is on the roadmap — connection will open here soon."
          : item.authMode === "oauth"
            ? "Simulate OAuth authorization. No real credentials leave this browser."
            : "Paste a demo API key. Keys are masked in localStorage — never committed to git."
      }
    >
      <div className="space-y-4 px-5 pb-5">
        {isComingSoon ? (
          <p className="rounded-[12px] bg-[#FFF7ED] px-3 py-2.5 text-[13px] font-medium text-[#EA580C] ring-1 ring-[#FED7AA]">
            Coming soon — Omnitracs and other partners will connect from this
            same flow.
          </p>
        ) : (
          <>
            {item.authMode === "api_key" ? (
              <label className="block">
                <span className="mb-1.5 block text-[13px] font-medium text-slate-700">
                  API key
                </span>
                <input
                  type="password"
                  autoComplete="off"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={
                    connection?.credentials?.apiKeyMasked
                      ? `Current: ${connection.credentials.apiKeyMasked}`
                      : "sk_demo_••••••••"
                  }
                  disabled={!!busy}
                  className="h-11 w-full rounded-xl bg-[#F8FAFC] px-3.5 text-[14px] text-slate-900 outline-none ring-1 ring-[#E2E8F0] transition focus:bg-white focus:ring-2 focus:ring-[#93C5FD]"
                />
              </label>
            ) : (
              <div className="rounded-[12px] bg-[#EFF6FF] px-3.5 py-3 text-[13px] leading-5 text-[#2563EB] ring-1 ring-[#BFDBFE]">
                You will be redirected to {item.name} to authorize Transpo.ai
                (demo — no redirect in this build).
              </div>
            )}

            <label className="block">
              <span className="mb-1.5 block text-[13px] font-medium text-slate-700">
                Account label{" "}
                <span className="font-normal text-slate-400">(optional)</span>
              </span>
              <input
                type="text"
                value={accountLabel}
                onChange={(e) => setAccountLabel(e.target.value)}
                placeholder={
                  connection?.credentials?.connectedAccountLabel ??
                  "e.g. Production fleet"
                }
                disabled={!!busy}
                className="h-11 w-full rounded-xl bg-[#F8FAFC] px-3.5 text-[14px] text-slate-900 outline-none ring-1 ring-[#E2E8F0] transition focus:bg-white focus:ring-2 focus:ring-[#93C5FD]"
              />
            </label>

            {connection?.errorMessage ? (
              <p className="rounded-[12px] bg-[#FEF2F2] px-3 py-2 text-[13px] font-medium text-[#DC2626] ring-1 ring-[#FECACA]">
                {connection.errorMessage}
              </p>
            ) : null}

            {error ? (
              <p className="text-[13px] font-medium text-[#DC2626]">{error}</p>
            ) : null}
            {info ? (
              <p className="text-[13px] font-medium text-[#16A34A]">{info}</p>
            ) : null}

            <div className="flex flex-wrap gap-2 pt-1">
              {!isConnected ? (
                <button
                  type="button"
                  disabled={!!busy}
                  onClick={handleConnect}
                  className="inline-flex h-10 flex-1 items-center justify-center rounded-full bg-[#2563EB] px-5 text-[13px] font-semibold text-white transition hover:bg-[#1D4ED8] disabled:opacity-60"
                >
                  {busy === "connect"
                    ? "Connecting…"
                    : item.authMode === "oauth"
                      ? "Authorize with OAuth"
                      : "Connect"}
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    disabled={!!busy}
                    onClick={handleTest}
                    className="inline-flex h-10 flex-1 items-center justify-center rounded-full bg-[#2563EB] px-5 text-[13px] font-semibold text-white transition hover:bg-[#1D4ED8] disabled:opacity-60"
                  >
                    {busy === "test" ? "Testing…" : "Test connection"}
                  </button>
                  <button
                    type="button"
                    disabled={!!busy}
                    onClick={handleDisconnect}
                    className="inline-flex h-10 items-center justify-center rounded-full bg-[#F8FAFC] px-5 text-[13px] font-semibold text-slate-700 ring-1 ring-[#E2E8F0] transition hover:bg-[#F1F5F9] disabled:opacity-60"
                  >
                    {busy === "disconnect" ? "Disconnecting…" : "Disconnect"}
                  </button>
                </>
              )}
              <button
                type="button"
                disabled={!!busy}
                onClick={onClose}
                className="inline-flex h-10 items-center justify-center rounded-full px-4 text-[13px] font-semibold text-slate-500 transition hover:text-slate-800"
              >
                Close
              </button>
            </div>

            <p className="text-[12px] leading-4 text-slate-400">
              Docs:{" "}
              <a
                href={item.docsUrl}
                target="_blank"
                rel="noreferrer"
                className="font-medium text-[#2563EB] hover:underline"
              >
                {item.name} documentation
              </a>
            </p>
          </>
        )}
      </div>
    </ConnectModalShell>
  );
}
