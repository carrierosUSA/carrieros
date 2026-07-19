"use client";

import CommunicationActionButtons from "@/components/dispatch/load-detail/communication/CommunicationActionButtons";
import CopyableValue from "@/components/dispatch/load-detail/CopyableValue";
import EntityHoverPopover from "@/components/dispatch/load-detail/EntityHoverPopover";
import LoadDetailCard from "@/components/dispatch/load-detail/LoadDetailCard";
import {
  getBrokerCreditStatus,
  type BrokerDetail,
} from "@/lib/dispatch/load-detail-meta";

type LoadDetailBrokerCardProps = {
  detail: BrokerDetail;
  brokerId?: string;
};

function BrokerDetailRow({
  label,
  value,
  copyable = false,
}: {
  label: string;
  value: string;
  copyable?: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-x-1.5 text-[12px] leading-snug">
      <span className="shrink-0 text-slate-500">{label}</span>
      {copyable ? (
        <CopyableValue
          value={value}
          label={`Copy ${label.toLowerCase()}`}
          className="min-w-0 text-slate-700"
        />
      ) : (
        <span className="min-w-0 text-slate-700">{value}</span>
      )}
    </div>
  );
}

export default function LoadDetailBrokerCard({
  detail,
  brokerId,
}: LoadDetailBrokerCardProps) {
  const creditStatus = getBrokerCreditStatus(brokerId);

  return (
    <LoadDetailCard
      title={
        <EntityHoverPopover
          heading="Broker"
          status={creditStatus}
          statusTone="active"
          rows={[
            { label: "Company", value: detail.company },
            { label: "Contact", value: detail.dispatcherName },
            { label: "Phone", value: detail.phone },
            { label: "MC", value: detail.mcNumber },
            { label: "DOT", value: detail.dotNumber },
          ]}
        >
          <span className="cursor-default">{detail.company}</span>
        </EntityHoverPopover>
      }
      action={
        <CommunicationActionButtons
          phone={detail.phone}
          email={detail.email}
          partyLabel="Broker"
        />
      }
    >
      <div className="space-y-2">
        <BrokerDetailRow label="Broker Contact" value={detail.dispatcherName} />
        <BrokerDetailRow label="Phone" value={detail.phone} copyable />
        <BrokerDetailRow label="Email" value={detail.email} copyable />
        <BrokerDetailRow label="MC" value={detail.mcNumber} copyable />
        <BrokerDetailRow label="DOT" value={detail.dotNumber} copyable />
      </div>
    </LoadDetailCard>
  );
}
