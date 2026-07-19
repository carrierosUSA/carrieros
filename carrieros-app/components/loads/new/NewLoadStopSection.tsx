"use client";

import { SmartFormField } from "@/components/forms/SmartFormField";
import NewLoadSectionCard from "@/components/loads/new/NewLoadSectionCard";
import { parseAddressToCityState } from "@/lib/forms/smart-load-intelligence";
import type { SmartLoadFormDefaults } from "@/lib/forms/smart-load-intelligence";

type StopPrefix = "origin" | "destination";

type NewLoadStopSectionProps = {
  title: string;
  prefix: StopPrefix;
  values: SmartLoadFormDefaults;
  autoFilled: Set<string>;
  onFieldChange: (field: keyof SmartLoadFormDefaults, value: string) => void;
  onApplyAutofill: (
    patch: Partial<SmartLoadFormDefaults>,
    fields: Set<string>,
  ) => void;
};

function fieldKey(prefix: StopPrefix, suffix: string): keyof SmartLoadFormDefaults {
  return `${prefix}${suffix}` as keyof SmartLoadFormDefaults;
}

export default function NewLoadStopSection({
  title,
  prefix,
  values,
  autoFilled,
  onFieldChange,
  onApplyAutofill,
}: NewLoadStopSectionProps) {
  const companyKey = fieldKey(prefix, "Company");
  const addressKey = fieldKey(prefix, "Address");
  const contactKey = fieldKey(prefix, "ContactName");
  const phoneKey = fieldKey(prefix, "Phone");
  const dateKey = fieldKey(prefix, "Date");
  const timeKey = fieldKey(prefix, "Time");
  const appointmentKey = fieldKey(prefix, "AppointmentType");
  const cityKey = fieldKey(prefix, "City");
  const stateKey = fieldKey(prefix, "State");

  const appointmentValue = values[appointmentKey] || (prefix === "origin" ? "apt" : "fcfs");

  function handleAddressChange(address: string) {
    onFieldChange(addressKey, address);

    const parsed = parseAddressToCityState(address);
    if (parsed.city && parsed.state) {
      onApplyAutofill(
        {
          [addressKey]: address,
          [cityKey]: parsed.city,
          [stateKey]: parsed.state,
        } as Partial<SmartLoadFormDefaults>,
        new Set([addressKey, cityKey, stateKey]),
      );
    }
  }

  return (
    <NewLoadSectionCard title={title} description="Location, contact, and appointment.">
      <SmartFormField
        label="Company"
        name={companyKey}
        value={String(values[companyKey] ?? "")}
        onChange={(value) => onFieldChange(companyKey, value)}
        autoFilled={autoFilled.has(companyKey)}
      />
      <div className="sm:col-span-2">
        <SmartFormField
          label="Address"
          name={addressKey}
          value={String(values[addressKey] ?? "")}
          onChange={handleAddressChange}
          placeholder="Street, City, ST ZIP"
          autoFilled={autoFilled.has(addressKey)}
        />
      </div>
      <input type="hidden" name={`${prefix}City`} value={String(values[cityKey] ?? "")} />
      <input type="hidden" name={`${prefix}State`} value={String(values[stateKey] ?? "")} />
      <SmartFormField
        label="Contact"
        name={fieldKey(prefix, "ContactName")}
        value={String(values[contactKey] ?? "")}
        onChange={(value) => onFieldChange(contactKey, value)}
        autoFilled={autoFilled.has(contactKey)}
      />
      <SmartFormField
        label="Phone"
        name={fieldKey(prefix, "Phone")}
        value={String(values[phoneKey] ?? "")}
        onChange={(value) => onFieldChange(phoneKey, value)}
        autoFilled={autoFilled.has(phoneKey)}
      />
      <SmartFormField
        label="Date"
        name={fieldKey(prefix, "Date")}
        type="date"
        value={String(values[dateKey] ?? "")}
        onChange={(value) => {
          onFieldChange(dateKey, value);
          if (prefix === "origin") {
            onFieldChange("pickupDate", value);
          } else {
            onFieldChange("deliveryDate", value);
          }
        }}
        required
        autoFilled={autoFilled.has(dateKey)}
      />
      <SmartFormField
        label="Time"
        name={fieldKey(prefix, "Time")}
        type="time"
        value={String(values[timeKey] ?? "")}
        onChange={(value) => onFieldChange(timeKey, value)}
        autoFilled={autoFilled.has(timeKey)}
      />
      <label className="block space-y-1.5 sm:col-span-2">
        <span className="text-[13px] font-medium text-slate-700">Appointment</span>
        <div className="flex gap-2">
          {(["apt", "fcfs"] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => onFieldChange(appointmentKey, type)}
              className={`flex-1 rounded-xl border px-3 py-2.5 text-[14px] font-medium transition ${
                appointmentValue === type
                  ? "border-[#2563EB] bg-[#EFF6FF] text-[#1D4ED8]"
                  : "border-[#EAEAEA] bg-white text-slate-700 hover:border-slate-300"
              }`}
            >
              {type === "apt" ? "Appointment (APT)" : "First come (FCFS)"}
            </button>
          ))}
        </div>
        <input type="hidden" name={fieldKey(prefix, "AppointmentType")} value={appointmentValue} />
      </label>
    </NewLoadSectionCard>
  );
}
