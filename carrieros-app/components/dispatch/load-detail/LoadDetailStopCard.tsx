"use client";

import CommunicationActionButtons from "@/components/dispatch/load-detail/communication/CommunicationActionButtons";
import CopyableValue from "@/components/dispatch/load-detail/CopyableValue";
import LoadDetailCard from "@/components/dispatch/load-detail/LoadDetailCard";
import LoadDetailExpandableText from "@/components/dispatch/load-detail/LoadDetailExpandableText";
import { formatStopAppointment, type StopDetail } from "@/lib/dispatch/load-detail-meta";

type LoadDetailStopCardProps = {
  title: "Pickup" | "Delivery";
  detail: StopDetail;
};

function StopDetailRow({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`text-[12px] leading-snug text-slate-700 ${className}`.trim()}>
      {children}
    </div>
  );
}

export default function LoadDetailStopCard({ title, detail }: LoadDetailStopCardProps) {
  const partyLabel = title === "Pickup" ? "Shipper" : "Receiver";
  const cardTitle = title === "Pickup" ? "📍 Pickup" : "📍 Delivery";

  return (
    <LoadDetailCard
      title={cardTitle}
      action={
        <CommunicationActionButtons
          phone={detail.phone}
          email={detail.email}
          partyLabel={partyLabel}
        />
      }
    >
      <div className="space-y-2">
        <StopDetailRow className="font-semibold text-slate-950">
          {detail.companyName}
        </StopDetailRow>
        <StopDetailRow>
          <CopyableValue value={detail.address} label={`Copy ${title.toLowerCase()} address`}>
            <LoadDetailExpandableText text={detail.address} maxChars={68} clampLines={2} />
          </CopyableValue>
        </StopDetailRow>
        <StopDetailRow>{detail.contactName}</StopDetailRow>
        <StopDetailRow>
          <CopyableValue
            value={detail.phone}
            label={`Copy ${partyLabel.toLowerCase()} phone`}
          />
        </StopDetailRow>
        <StopDetailRow>{formatStopAppointment(detail)}</StopDetailRow>
      </div>
    </LoadDetailCard>
  );
}
