"use client";

import { SmartFormField } from "@/components/forms/SmartFormField";
import SearchCombobox from "@/components/ui/SearchCombobox";
import NewLoadSectionCard from "@/components/loads/new/NewLoadSectionCard";
import type { SmartLoadFormDefaults } from "@/lib/forms/smart-load-intelligence";
import type { Broker } from "@/lib/types";

type NewLoadBrokerSectionProps = {
  values: SmartLoadFormDefaults;
  brokers: Broker[];
  autoFilled: Set<string>;
  onBrokerChange: (brokerId: string) => void;
  onFieldChange: (field: keyof SmartLoadFormDefaults, value: string) => void;
};

export default function NewLoadBrokerSection({
  values,
  brokers,
  autoFilled,
  onBrokerChange,
  onFieldChange,
}: NewLoadBrokerSectionProps) {
  const brokerOptions = [
    { value: "", label: "Direct (no broker)" },
    ...brokers.map((broker) => ({
      value: broker.id,
      label: broker.name,
      description: broker.mcNumber ? `MC ${broker.mcNumber}` : undefined,
    })),
  ];

  return (
    <NewLoadSectionCard
      title="Broker"
      description="Search a broker — contact details fill automatically."
      action={
        <button
          type="button"
          onClick={() => window.alert("New broker flow coming soon.")}
          className="shrink-0 text-[13px] font-semibold text-[#2563EB] transition hover:text-[#1D4ED8]"
        >
          + New Broker
        </button>
      }
    >
      <div className="sm:col-span-2">
        <SearchCombobox
          label="Search broker"
          name="brokerId"
          value={values.brokerId}
          onChange={onBrokerChange}
          options={brokerOptions}
          placeholder="Type to search brokers…"
          autoFilled={autoFilled.has("brokerId")}
          onCreateNew={() => window.alert("New broker flow coming soon.")}
          createNewLabel="+ New Broker"
        />
      </div>
      <SmartFormField
        label="Dispatcher"
        name="brokerContactName"
        value={values.brokerContactName}
        onChange={(value) => onFieldChange("brokerContactName", value)}
        autoFilled={autoFilled.has("brokerContactName")}
      />
      <SmartFormField
        label="Phone"
        name="brokerPhone"
        value={values.brokerPhone}
        onChange={(value) => onFieldChange("brokerPhone", value)}
        autoFilled={autoFilled.has("brokerPhone")}
      />
      <SmartFormField
        label="Email"
        name="brokerEmail"
        type="email"
        value={values.brokerEmail}
        onChange={(value) => onFieldChange("brokerEmail", value)}
        autoFilled={autoFilled.has("brokerEmail")}
      />
      <SmartFormField
        label="Payment terms"
        name="paymentTerms"
        value={values.paymentTerms}
        onChange={(value) => onFieldChange("paymentTerms", value)}
        placeholder="Net 30, Quick Pay…"
        autoFilled={autoFilled.has("paymentTerms")}
      />
    </NewLoadSectionCard>
  );
}
