"use client";

import Link from "next/link";
import { useLoadDetailCommunication } from "@/components/dispatch/load-detail/communication/LoadDetailCommunicationProvider";

type LoadDetailQuickActionsProps = {
  loadId: string;
  brokerPhone?: string;
  driverPhone?: string;
  trackingEnabled: boolean;
  hasDriver: boolean;
};

function QuickAction({
  label,
  href,
  onClick,
}: {
  label: string;
  href?: string;
  onClick?: () => void;
}) {
  const className =
    "inline-flex h-6 items-center rounded border border-[#E2E8F0] bg-white px-2 text-[10px] font-medium text-[#1E3A8A] shadow-sm shadow-slate-200/40 hover:border-[#93C5FD] hover:bg-[#F8FBFF]";

  if (href) {
    return (
      <Link href={href} className={className}>
        {label}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={className}>
      {label}
    </button>
  );
}

export default function LoadDetailQuickActions({
  loadId,
  brokerPhone,
  driverPhone,
  trackingEnabled,
  hasDriver,
}: LoadDetailQuickActionsProps) {
  const trackingHref = `/loads/${loadId}/tracking`;
  const { call, message } = useLoadDetailCommunication();

  function scrollToAlph() {
    document.getElementById("load-alph")?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function unavailable() {
    // Stay on load detail when contact info is missing.
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      {brokerPhone ? (
        <QuickAction label="Call Broker" onClick={() => call(brokerPhone)} />
      ) : (
        <QuickAction label="Call Broker" onClick={unavailable} />
      )}
      {driverPhone ? (
        <QuickAction label="Message Driver" onClick={() => message(driverPhone)} />
      ) : (
        <QuickAction label="Message Driver" onClick={unavailable} />
      )}
      {trackingEnabled && hasDriver ? (
        <>
          <QuickAction label="Live GPS" href={trackingHref} />
          <QuickAction label="Camera" href={`${trackingHref}?view=cameras`} />
        </>
      ) : (
        <>
          <QuickAction label="Live GPS" onClick={unavailable} />
          <QuickAction label="Camera" onClick={unavailable} />
        </>
      )}
      <QuickAction label="Rate Con" href={`/loads/${loadId}/documents`} />
      <QuickAction label="POD" href={`/loads/${loadId}/documents`} />
      <QuickAction label="Ask Alph" onClick={scrollToAlph} />
    </div>
  );
}
