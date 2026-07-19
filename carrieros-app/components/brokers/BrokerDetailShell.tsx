import Link from "next/link";
import BrokerAlphAlertsStrip from "@/components/brokers/BrokerAlphAlertsStrip";
import BrokerDetailTabs, {
  type BrokerDetailTab,
} from "@/components/brokers/BrokerDetailTabs";
import BrokerQuickActions from "@/components/brokers/BrokerQuickActions";
import BrokerStatusBadge from "@/components/brokers/BrokerStatusBadge";
import BrokerTabPanels from "@/components/brokers/BrokerTabPanels";
import FadeIn from "@/components/ui/FadeIn";
import type { BrokerAlphAlert } from "@/lib/brokers/broker-alph-alerts";
import {
  formatBrokerMoney,
  formatBrokerRating,
  formatPerformanceScore,
} from "@/lib/brokers/broker-board";
import type { Broker, Load } from "@/lib/types";

type BrokerDetailShellProps = {
  broker: Broker;
  loads: Load[];
  activeTab: BrokerDetailTab;
  alphAlerts: BrokerAlphAlert[];
};

export default function BrokerDetailShell({
  broker,
  loads,
  activeTab,
  alphAlerts,
}: BrokerDetailShellProps) {
  return (
    <FadeIn className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/brokers"
          className="text-[14px] font-medium text-[#2563EB] transition hover:text-[#1D4ED8]"
        >
          ← All brokers
        </Link>
      </div>

      <header className="rounded-[16px] border border-[#EAEAEA] bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[16px] bg-[#EFF6FF] text-[18px] font-bold text-[#2563EB]">
              {broker.name
                .split(" ")
                .map((part) => part[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-[24px] font-bold tracking-tight text-slate-950">
                  {broker.name}
                </h1>
                <BrokerStatusBadge status={broker.status} />
              </div>
              <p className="mt-1 text-[14px] text-slate-500">
                {[broker.mcNumber, broker.dotNumber, broker.homeBase]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-slate-600">
                <span>
                  Rating{" "}
                  <strong className="text-slate-900">
                    {formatBrokerRating(broker.rating)}
                  </strong>
                </span>
                <span>
                  Score{" "}
                  <strong className="text-slate-900">
                    {formatPerformanceScore(broker.performanceScore)}
                  </strong>
                </span>
                <span>
                  Outstanding{" "}
                  <strong className="text-slate-900">
                    {formatBrokerMoney(broker.outstandingBalance)}
                  </strong>
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5">
          <BrokerQuickActions broker={broker} />
        </div>
      </header>

      <BrokerAlphAlertsStrip alerts={alphAlerts} broker={broker} />

      <BrokerDetailTabs activeTab={activeTab} />

      <BrokerTabPanels broker={broker} loads={loads} activeTab={activeTab} />
    </FadeIn>
  );
}
