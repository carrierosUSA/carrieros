"use client";

import { useState } from "react";
import {
  COMPLIANCE_PROVIDERS,
  listComplianceConnections,
  type ComplianceConnection,
  type ComplianceProviderId,
  getComplianceProvider,
} from "@/lib/compliance/compliance-integrations";
import { CARRIEROS_COLORS } from "@/lib/design-system/colors";

type ComplianceIntegrationsStripProps = {
  tenantId: string;
};

export default function ComplianceIntegrationsStrip({
  tenantId,
}: ComplianceIntegrationsStripProps) {
  const [connections, setConnections] = useState<ComplianceConnection[]>(() =>
    listComplianceConnections(tenantId),
  );
  const [message, setMessage] = useState<string | null>(null);

  async function handleConnect(id: ComplianceProviderId) {
    const provider = getComplianceProvider(id);
    const result = await provider.connect(tenantId);
    setConnections(listComplianceConnections(tenantId));
    setMessage(result.errorMessage ?? `${id} connection attempted`);
    window.setTimeout(() => setMessage(null), 2800);
  }

  return (
    <section className="rounded-[16px] bg-[#F8FAFC] p-4 ring-1 ring-[#EAEAEA]">
      <div className="mb-3">
        <p className="text-[15px] font-semibold text-slate-900">
          Integrations
        </p>
        <p className="text-[13px] text-slate-500">
          FMCSA, Clearinghouse, ELD, and insurance — ready when you connect.
        </p>
      </div>

      {message ? (
        <p
          className={`mb-3 rounded-[12px] px-3 py-2 text-[13px] font-medium ${CARRIEROS_COLORS.info.bg} ${CARRIEROS_COLORS.info.text}`}
        >
          {message}
        </p>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {COMPLIANCE_PROVIDERS.map((meta) => {
          const connection = connections.find((c) => c.providerId === meta.id);
          const connected = connection?.status === "connected";

          return (
            <div
              key={meta.id}
              className="rounded-[14px] bg-white p-4 ring-1 ring-[#EAEAEA]"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-[14px] font-semibold text-slate-900">
                  {meta.name}
                </p>
                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ${
                    connected
                      ? `${CARRIEROS_COLORS.success.bg} ${CARRIEROS_COLORS.success.text} ${CARRIEROS_COLORS.success.border}`
                      : `${CARRIEROS_COLORS.disabled.bg} ${CARRIEROS_COLORS.disabled.text} ${CARRIEROS_COLORS.disabled.border}`
                  }`}
                >
                  {connected ? "Connected" : "Not connected"}
                </span>
              </div>
              <p className="mt-2 text-[13px] leading-5 text-slate-600">
                {meta.description}
              </p>
              <button
                type="button"
                onClick={() => handleConnect(meta.id)}
                className="mt-3 inline-flex h-9 items-center justify-center rounded-full bg-[#F8FAFC] px-4 text-[13px] font-semibold text-slate-700 ring-1 ring-[#EAEAEA] transition hover:bg-white"
              >
                Connect
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
