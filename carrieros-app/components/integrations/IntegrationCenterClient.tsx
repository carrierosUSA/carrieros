"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import CategoryFilter from "@/components/integrations/CategoryFilter";
import ConnectModal from "@/components/integrations/ConnectModal";
import HealthPanel from "@/components/integrations/HealthPanel";
import IntegrationCard from "@/components/integrations/IntegrationCard";
import IntegrationLogs from "@/components/integrations/IntegrationLogs";
import MarketplaceTeaser from "@/components/integrations/MarketplaceTeaser";
import FadeIn from "@/components/ui/FadeIn";
import {
  INTEGRATION_CATALOG,
  INTEGRATION_CATEGORY_LABELS,
  INTEGRATION_CATEGORY_ORDER,
  computeHealthSummary,
  getCatalogItem,
  getIntegrationsStore,
  setIntegrationEnabled,
  subscribeIntegrationsStore,
  type IntegrationCategory,
  type IntegrationProviderId,
} from "@/lib/integrations";

function useIntegrationsStore() {
  return useSyncExternalStore(
    subscribeIntegrationsStore,
    getIntegrationsStore,
    getIntegrationsStore,
  );
}

function parseCategoryParam(
  value: string | null,
): IntegrationCategory | "all" {
  if (!value) return "all";
  if (value === "all" || value === "marketplace") return value;
  if (
    (INTEGRATION_CATEGORY_ORDER as string[]).includes(value)
  ) {
    return value as Exclude<IntegrationCategory, "marketplace">;
  }
  return "all";
}

export default function IntegrationCenterClient() {
  const store = useIntegrationsStore();
  const searchParams = useSearchParams();
  const [category, setCategory] = useState<IntegrationCategory | "all">(() =>
    parseCategoryParam(searchParams.get("category")),
  );
  const [modalProviderId, setModalProviderId] =
    useState<IntegrationProviderId | null>(null);

  const summary = useMemo(
    () => computeHealthSummary(store.connections),
    [store.connections],
  );

  const counts = useMemo(() => {
    const result: Partial<Record<IntegrationCategory | "all", number>> = {
      all: INTEGRATION_CATALOG.length,
      marketplace: 3,
    };
    for (const cat of INTEGRATION_CATEGORY_ORDER) {
      result[cat] = INTEGRATION_CATALOG.filter((i) => i.category === cat).length;
    }
    return result;
  }, []);

  const grouped = useMemo(() => {
    const cats =
      category === "all" || category === "marketplace"
        ? INTEGRATION_CATEGORY_ORDER
        : [category];

    return cats.map((cat) => ({
      category: cat,
      items: INTEGRATION_CATALOG.filter((item) => item.category === cat),
    }));
  }, [category]);

  const modalItem = modalProviderId
    ? (getCatalogItem(modalProviderId) ?? null)
    : null;
  const modalConnection = modalProviderId
    ? store.connections[modalProviderId]
    : null;

  return (
    <FadeIn className="space-y-6">
      <HealthPanel summary={summary} />

      <Link
        href="/integrations/eld"
        className="flex flex-wrap items-center justify-between gap-3 rounded-[16px] bg-[#EFF6FF] px-5 py-4 transition hover:bg-[#DBEAFE]"
      >
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#2563EB]">
            Universal ELD Directory
          </p>
          <p className="mt-1 text-[14px] font-semibold text-slate-900">
            Find your ELD, request a connection, or use fallbacks
          </p>
          <p className="mt-0.5 text-[13px] text-slate-600">
            Technically supported · Waiting for ELD approval · No public API ·
            Requested by carriers — never a dead end.
          </p>
        </div>
        <span className="inline-flex h-10 items-center rounded-xl bg-[#2563EB] px-4 text-[13px] font-semibold text-white">
          Open ELD Directory
        </span>
      </Link>

      <CategoryFilter
        value={category}
        onChange={setCategory}
        counts={counts}
      />

      {category === "marketplace" ? (
        <MarketplaceTeaser />
      ) : (
        <>
          {grouped.map((group) => (
            <section key={group.category} className="space-y-3">
              <div>
                <h2 className="text-[15px] font-semibold text-slate-900">
                  {INTEGRATION_CATEGORY_LABELS[group.category]}
                </h2>
                <p className="mt-0.5 text-[13px] text-slate-500">
                  {group.items.length}{" "}
                  {group.items.length === 1 ? "provider" : "providers"}
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {group.items.map((item) => (
                  <IntegrationCard
                    key={item.id}
                    item={item}
                    connection={store.connections[item.id]}
                    onToggle={(enabled) =>
                      setIntegrationEnabled(item.id, enabled)
                    }
                    onConfigure={() => setModalProviderId(item.id)}
                  />
                ))}
              </div>
            </section>
          ))}

          {category === "all" ? <MarketplaceTeaser /> : null}
        </>
      )}

      <IntegrationLogs logs={store.logs} />

      <ConnectModal
        open={!!modalProviderId}
        item={modalItem}
        connection={modalConnection}
        onClose={() => setModalProviderId(null)}
      />
    </FadeIn>
  );
}
