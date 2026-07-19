import Link from "next/link";
import type { ReactNode } from "react";
import TrailerStatusBadge from "@/components/fleet/TrailerStatusBadge";
import TrailerTypeBadge from "@/components/fleet/trailers/TrailerTypeBadge";
import TrailerAlphAlertsStrip from "@/components/fleet/trailers/TrailerAlphAlertsStrip";
import TrailerQuickActions from "@/components/fleet/trailers/TrailerQuickActions";
import TrailerDetailTabs, {
  type TrailerDetailTab,
} from "@/components/fleet/trailers/TrailerDetailTabs";
import FadeIn from "@/components/ui/FadeIn";
import type { TrailerAlphAlert } from "@/lib/fleet/trailer-alph-alerts";
import type { Load, Trailer, TrailerStatus } from "@/lib/types";
import { isReeferTrailer } from "@/lib/types";

type TrailerDetailShellProps = {
  trailer: Trailer;
  loads: Load[];
  operationalStatus: TrailerStatus;
  activeTab: TrailerDetailTab;
  alerts: TrailerAlphAlert[];
  truckLabel?: string;
  children: ReactNode;
};

function TrailerPhoto({ trailer }: { trailer: Trailer }) {
  if (trailer.photoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={trailer.photoUrl}
        alt=""
        className="h-16 w-16 rounded-[14px] object-cover ring-1 ring-[#EAEAEA]"
      />
    );
  }

  return (
    <div
      className="flex h-16 w-16 items-center justify-center rounded-[14px] bg-gradient-to-br from-[#EFF6FF] via-[#F8FAFC] to-[#EEF2FF] text-[16px] font-bold text-[#2563EB] ring-1 ring-[#EAEAEA]"
      aria-hidden
    >
      {trailer.unitNumber}
    </div>
  );
}

export default function TrailerDetailShell({
  trailer,
  loads,
  operationalStatus,
  activeTab,
  alerts,
  truckLabel,
  children,
}: TrailerDetailShellProps) {
  const showReefer = isReeferTrailer(trailer);

  return (
    <div className="min-h-full space-y-5 p-4 lg:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/fleet/trailers"
          className="text-[14px] font-medium text-[#2563EB] transition hover:text-[#1D4ED8]"
        >
          ← Back to Trailers
        </Link>
      </div>

      <header className="flex flex-col gap-4 rounded-[16px] bg-white p-5 ring-1 ring-[#EAEAEA] lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-4">
          <TrailerPhoto trailer={trailer} />
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-[24px] font-bold tracking-tight text-slate-950">
                Trailer {trailer.unitNumber}
              </h1>
              <TrailerStatusBadge status={operationalStatus} />
              <TrailerTypeBadge type={trailer.type} />
            </div>
            <p className="mt-1 text-[14px] text-slate-500">
              {trailer.year ? `${trailer.year} ` : ""}
              {trailer.make ?? "Trailer"}
              {truckLabel ? ` · ${truckLabel}` : " · Unassigned"}
              {trailer.location ? ` · ${trailer.location}` : ""}
            </p>
          </div>
        </div>
        <TrailerQuickActions trailer={trailer} loads={loads} />
      </header>

      <TrailerAlphAlertsStrip alerts={alerts} trailer={trailer} />

      <TrailerDetailTabs
        trailerId={trailer.id}
        activeTab={activeTab}
        showReefer={showReefer}
      />

      <FadeIn key={activeTab}>{children}</FadeIn>
    </div>
  );
}
