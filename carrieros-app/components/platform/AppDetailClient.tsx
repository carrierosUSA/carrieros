"use client";

import Link from "next/link";
import { useState } from "react";
import { TRANSPO_COLORS } from "@/lib/design-system/colors";
import {
  APP_CATEGORY_LABELS,
  PERMISSION_SCOPE_LABELS,
  type AppPermissionScope,
  type PlatformApp,
} from "@/lib/platform/types";
import {
  getInstalledApp,
  installApp,
  isAppInstalled,
  uninstallApp,
  updateAppScopes,
} from "@/lib/platform/store";

export default function AppDetailClient({ app }: { app: PlatformApp }) {
  const [installed, setInstalled] = useState(() => isAppInstalled(app.id));
  const [scopes, setScopes] = useState<AppPermissionScope[]>(() => {
    const record = getInstalledApp(app.id);
    return record?.enabledScopes ?? [...app.permissions];
  });

  function toggleInstall() {
    if (installed) {
      uninstallApp(app.id);
      setInstalled(false);
    } else {
      installApp(app.id, scopes);
      setInstalled(true);
    }
  }

  function toggleScope(scope: AppPermissionScope) {
    const next = scopes.includes(scope)
      ? scopes.filter((s) => s !== scope)
      : [...scopes, scope];
    setScopes(next);
    if (isAppInstalled(app.id)) {
      updateAppScopes(app.id, next);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[16px] bg-[#F8F9FB] p-5">
        <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#94A3B8]">
          {APP_CATEGORY_LABELS[app.category]} · {app.developer}
        </p>
        <h2 className="mt-2 text-[20px] font-bold text-[#111827]">{app.name}</h2>
        <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-[#475569]">
          {app.description}
        </p>
        <p className="mt-3 text-[13px] text-[#64748B]">{app.revenueShareNote}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={toggleInstall}
            className={installed ? "transpo-btn-secondary" : "transpo-btn-primary"}
          >
            {installed ? "Remove app" : "Install app"}
          </button>
          <Link href="/platform/developers" className="transpo-btn-secondary">
            Developer Portal
          </Link>
          <Link href="/platform/apps" className="transpo-btn-secondary">
            Back to catalog
          </Link>
        </div>
      </div>

      <section>
        <h3 className="text-[15px] font-semibold text-[#111827]">Secure permissions</h3>
        <p className="mt-1 text-[14px] text-[#6B7280]">
          Grant only the scopes this app needs. Changes apply immediately in your local store.
        </p>
        <ul className="mt-4 space-y-2">
          {app.permissions.map((scope) => {
            const on = scopes.includes(scope);
            return (
              <li
                key={scope}
                className="flex items-center justify-between gap-3 rounded-[12px] bg-white px-4 py-3 shadow-[inset_0_0_0_1px_#EEF2F7]"
              >
                <div>
                  <p className="text-[14px] font-medium text-[#111827]">
                    {PERMISSION_SCOPE_LABELS[scope]}
                  </p>
                  <p className="text-[12px] text-[#94A3B8]">{scope}</p>
                </div>
                <button
                  type="button"
                  onClick={() => toggleScope(scope)}
                  className={`rounded-full px-3 py-1.5 text-[13px] font-semibold ${
                    on
                      ? `${TRANSPO_COLORS.success.bg} ${TRANSPO_COLORS.success.text}`
                      : `${TRANSPO_COLORS.disabled.bg} ${TRANSPO_COLORS.disabled.text}`
                  }`}
                >
                  {on ? "Granted" : "Off"}
                </button>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
