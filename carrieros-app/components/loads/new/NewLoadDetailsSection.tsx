"use client";

import { SmartFormField } from "@/components/forms/SmartFormField";
import SearchCombobox from "@/components/ui/SearchCombobox";
import NewLoadSectionCard from "@/components/loads/new/NewLoadSectionCard";
import type { SmartLoadFormDefaults } from "@/lib/forms/smart-load-intelligence";

const EQUIPMENT_OPTIONS = [
  { value: "Dry Van", label: "Dry Van" },
  { value: "Reefer", label: "Reefer" },
  { value: "Flatbed", label: "Flatbed" },
  { value: "Step Deck", label: "Step Deck" },
];

type NewLoadDetailsSectionProps = {
  values: SmartLoadFormDefaults;
  autoFilled: Set<string>;
  onFieldChange: (field: keyof SmartLoadFormDefaults, value: string) => void;
  onEquipmentChange: (equipmentType: string) => void;
};

export default function NewLoadDetailsSection({
  values,
  autoFilled,
  onFieldChange,
  onEquipmentChange,
}: NewLoadDetailsSectionProps) {
  return (
    <NewLoadSectionCard title="Load details" description="Reference, freight, and rate.">
      <SmartFormField
        label="Load number"
        name="loadNumber"
        value={values.loadNumber}
        onChange={(value) => onFieldChange("loadNumber", value)}
        placeholder="Auto-generated if blank"
        autoFilled={autoFilled.has("loadNumber")}
      />
      <SmartFormField
        label="Broker load ID"
        name="brokerLoadId"
        value={values.brokerLoadId}
        onChange={(value) => onFieldChange("brokerLoadId", value)}
        autoFilled={autoFilled.has("brokerLoadId")}
      />
      <SmartFormField
        label="PO (optional)"
        name="poNumber"
        value={values.poNumber}
        onChange={(value) => onFieldChange("poNumber", value)}
        autoFilled={autoFilled.has("poNumber")}
      />
      <SmartFormField
        label="Commodity"
        name="commodity"
        value={values.commodity}
        onChange={(value) => onFieldChange("commodity", value)}
        autoFilled={autoFilled.has("commodity")}
      />
      <SmartFormField
        label="Weight (lbs)"
        name="weight"
        type="number"
        min="0"
        value={values.weight}
        onChange={(value) => onFieldChange("weight", value)}
        autoFilled={autoFilled.has("weight")}
      />
      <SmartFormField
        label="Pieces"
        name="pieces"
        type="number"
        min="0"
        value={values.pieces}
        onChange={(value) => onFieldChange("pieces", value)}
        autoFilled={autoFilled.has("pieces")}
      />
      <SearchCombobox
        label="Equipment type"
        name="equipmentType"
        value={values.equipmentType}
        onChange={onEquipmentChange}
        options={EQUIPMENT_OPTIONS}
        allowClear={false}
        autoFilled={autoFilled.has("equipmentType")}
      />
      <SmartFormField
        label="Temperature"
        name="temperature"
        value={values.temperature}
        onChange={(value) => onFieldChange("temperature", value)}
        placeholder="Auto from equipment"
        autoFilled={autoFilled.has("temperature")}
      />
      <SmartFormField
        label="Miles"
        name="miles"
        type="number"
        min="0"
        step="1"
        value={values.miles}
        onChange={(value) => onFieldChange("miles", value)}
        required
        autoFilled={autoFilled.has("miles")}
      />
      <SmartFormField
        label="Rate (USD)"
        name="rate"
        type="number"
        min="0"
        step="1"
        value={values.rate}
        onChange={(value) => onFieldChange("rate", value)}
        required
        autoFilled={autoFilled.has("rate")}
      />
      <div className="sm:col-span-2">
        <label className="block space-y-1.5">
          <span className="text-[13px] font-medium text-slate-700">Notes</span>
          <textarea
            name="notes"
            value={values.notes}
            onChange={(event) => onFieldChange("notes", event.target.value)}
            rows={3}
            placeholder="Special instructions, detention, lumper…"
            className={`w-full resize-none rounded-xl border px-3.5 py-2.5 text-[14px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#2563EB] focus:ring-2 focus:ring-[#BFDBFE] ${
              autoFilled.has("notes")
                ? "border-[#BFDBFE] bg-[#F8FBFF]"
                : "border-[#EAEAEA] bg-white"
            }`}
          />
        </label>
      </div>
    </NewLoadSectionCard>
  );
}
