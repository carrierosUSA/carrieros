"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import EmptyState from "@/components/ui/EmptyState";
import { TRANSPO_COLORS } from "@/lib/design-system/colors";
import {
  APP_CATEGORY_LABELS,
  type AppStoreCategory,
  type PlatformApp,
} from "@/lib/platform/types";
import {
  installApp,
  isAppInstalled,
  listInstalledApps,
  uninstallApp,
} from "@/lib/platform/store";

const CATEGORIES: Array<AppStoreCategory | "all" | "installed"> = [
  "all",
  "installed",
  "eld",
  "fuel",
  "insurance",
  "accounting",
  "ocr",
  "ai",
  "maintenance",
  "cameras",
  "gps",
  "payroll",
  "hr",
  "compliance",
  "telematics",
  "apis",
  "enterprise",
];

export default function AppStoreClient({ apps }: { apps: PlatformApp[] }) {
  const [filter, setFilter] = useState<(typeof CATEGORIES)[number]>("all");
  const [tick, setTick] = useState(0);

  const installedIds = useMemo(() => {
    void tick;
    return new Set(listInstalledApps().map((i) => i.appId));
  }, [tick]);

  const visible = apps.filter((app) => {
    if (filter === "all") return true;
    if (filter === "installed") return installedIds.has(app.id);
    return app.category === filter;
  });

  function toggle(app: PlatformApp) {
    if (isAppInstalled(app.id)) {
      uninstallApp(app.id);
    } else {
      installApp(app.id);
    }
    setTick((n) => n + 1);
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[14px] text-[#6B7280]">
          One-click install with scoped permissions. Revenue share and developer attribution stay
          visible on every app.
        </p>
        <Link href="/platform/developers" className="transpo-btn-secondary">
          Developer Portal
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setFilter(cat)}
            className={`rounded-full px-3 py-1.5 text-[13px] font-medium transition ${
              filter === cat
                ? "bg-[#2563EB] text-white"
                : "bg-[#F8F9FB] text-[#64748B] hover:text-[#111827]"
            }`}
          >
            {cat === "all"
              ? "All"
              : cat === "installed"
                ? "Installed"
                : APP_CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <EmptyState
          title="No apps in this view"
          description="Try another category, or install from All."
          actionLabel="Show all apps"
          onAction={() => setFilter("all")}
        />
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {visible.map((app) => {
            const installed = installedIds.has(app.id);
            return (
              <article
                key={app.id}
                className="flex flex-col rounded-[16px] bg-[#F8F9FB] p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#94A3B8]">
                      {APP_CATEGORY_LABELS[app.category]}
                    </p>
                    <h3 className="mt-1 text-[15px] font-semibold text-[#111827]">{app.name}</h3>
                    <p className="mt-0.5 text-[13px] text-[#6B7280]">{app.developer}</p>
                  </div>
                  {app.featured ? (
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${TRANSPO_COLORS.info.bg} ${TRANSPO_COLORS.info.text}`}>
                      Featured
                    </span>
                  ) : null}
                </div>
                <p className="mt-3 flex-1 text-[14px] leading-relaxed text-[#475569]">
                  {app.tagline}
                </p>
                <p className="mt-2 text-[12px] text-[#94A3B8]">
                  ★ {app.rating.toFixed(1)} · {app.installsLabel}
                </p>
                <p className="mt-2 text-[12px] leading-snug text-[#64748B]">
                  {app.revenueShareNote}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => toggle(app)}
                    className={installed ? "transpo-btn-secondary" : "transpo-btn-primary"}
                  >
                    {installed ? "Remove" : "Install"}
                  </button>
                  <Link href={`/platform/apps/${app.id}`} className="transpo-btn-secondary">
                    Details
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
