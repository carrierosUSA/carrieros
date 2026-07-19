"use client";

import Link from "next/link";
import {
  Camera,
  FileText,
  MapPin,
  MessageCircle,
  Phone,
  Sparkles,
} from "lucide-react";
import { useLoadDetailQuickTasks } from "@/components/dispatch/load-detail/LoadDetailQuickTasksProvider";
import { useLoadDetailCommunication } from "@/components/dispatch/load-detail/communication/LoadDetailCommunicationProvider";

type LoadDetailStickyActionBarProps = {
  loadId: string;
  brokerPhone?: string;
  driverPhone?: string;
  trackingEnabled: boolean;
  hasDriver: boolean;
};

type ActionVariant = "call" | "message" | "tracking" | "document" | "alph";

const VARIANT_STYLES: Record<
  ActionVariant,
  {
    bg: string;
    hoverBg: string;
    color: string;
  }
> = {
  call: {
    bg: "bg-[#ECFDF3]",
    hoverBg: "hover:bg-[#D1FAE5]",
    color: "text-[#16A34A]",
  },
  message: {
    bg: "bg-[#EFF6FF]",
    hoverBg: "hover:bg-[#DBEAFE]",
    color: "text-[#2563EB]",
  },
  tracking: {
    bg: "bg-slate-100",
    hoverBg: "hover:bg-slate-200",
    color: "text-slate-700",
  },
  document: {
    bg: "bg-slate-100",
    hoverBg: "hover:bg-slate-200",
    color: "text-slate-700",
  },
  alph: {
    bg: "bg-[#F5F3FF]",
    hoverBg: "hover:bg-[#EDE9FE]",
    color: "text-[#7C3AED]",
  },
};

function StickyActionPill({
  variant,
  label,
  icon: Icon,
  href,
  onClick,
  disabled,
}: {
  variant: ActionVariant;
  label: string;
  icon: typeof Phone;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
}) {
  const { bg, hoverBg, color } = VARIANT_STYLES[variant];
  const className = `inline-flex h-9 shrink-0 items-center gap-2 rounded-full px-3.5 text-[13px] font-medium transition-[background-color,box-shadow] ${bg} ${color} ${hoverBg} hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-45 disabled:shadow-none disabled:hover:bg-inherit`;

  if (!disabled && href) {
    return (
      <Link href={href} className={className}>
        <Icon className="h-4 w-4 shrink-0" strokeWidth={2.25} aria-hidden="true" />
        <span>{label}</span>
      </Link>
    );
  }

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={className}
    >
      <Icon className="h-4 w-4 shrink-0" strokeWidth={2.25} aria-hidden="true" />
      <span>{label}</span>
    </button>
  );
}

export default function LoadDetailStickyActionBar({
  loadId,
  brokerPhone,
  driverPhone,
  trackingEnabled,
  hasDriver,
}: LoadDetailStickyActionBarProps) {
  const { call, message } = useLoadDetailCommunication();
  const { openTask } = useLoadDetailQuickTasks();
  const trackingHref = `/loads/${loadId}/tracking`;
  const trackingAvailable = trackingEnabled && hasDriver;
  const hasBrokerPhone = Boolean(brokerPhone && brokerPhone !== "—");
  const hasDriverPhone = Boolean(driverPhone && driverPhone !== "—");

  function scrollToAlph() {
    document.getElementById("load-alph")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  return (
    <nav
      aria-label="Load quick actions"
      className="sticky top-[88px] z-10 -mx-3 mb-3 border-b border-[#EAEAEA] bg-white/95 px-3 py-2.5 shadow-[0_1px_3px_rgba(15,23,42,0.05)] backdrop-blur-sm sm:-mx-4 lg:-mx-6"
    >
      <div className="flex flex-nowrap items-center gap-2 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <StickyActionPill
          variant="call"
          label="Call Broker"
          icon={Phone}
          disabled={!hasBrokerPhone}
          onClick={() => {
            if (brokerPhone) {
              call(brokerPhone);
            }
          }}
        />
        <StickyActionPill
          variant="message"
          label="Message Driver"
          icon={MessageCircle}
          disabled={!hasDriverPhone}
          onClick={() => {
            if (driverPhone) {
              message(driverPhone);
            }
          }}
        />
        <StickyActionPill
          variant="tracking"
          label="Live GPS"
          icon={MapPin}
          href={trackingHref}
          disabled={!trackingAvailable}
        />
        <StickyActionPill
          variant="tracking"
          label="Cameras"
          icon={Camera}
          href={`${trackingHref}?view=cameras`}
          disabled={!trackingAvailable}
        />
        <StickyActionPill
          variant="document"
          label="Rate Con"
          icon={FileText}
          onClick={() => openTask("rateCon")}
        />
        <StickyActionPill
          variant="document"
          label="POD"
          icon={FileText}
          onClick={() => openTask("requestPod")}
        />
        <StickyActionPill
          variant="alph"
          label="Ask Alph"
          icon={Sparkles}
          onClick={scrollToAlph}
        />
      </div>
    </nav>
  );
}
