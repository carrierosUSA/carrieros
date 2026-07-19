"use client";

import {
  SettingsField,
  SettingsPanelFrame,
  SettingsSaveButton,
  settingsInputClass,
  settingsSelectClass,
} from "@/components/settings/SettingsField";
import type { CarrierSettingsState, CompanySettings } from "@/lib/settings/types";

const TIMEZONES = [
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Phoenix",
];

type CompanyPanelProps = {
  settings: CarrierSettingsState;
  dirty: boolean;
  saving: boolean;
  savedFlash: boolean;
  onChange: (patch: Partial<CompanySettings>) => void;
  onSave: () => void;
};

export default function CompanyPanel({
  settings,
  dirty,
  saving,
  savedFlash,
  onChange,
  onSave,
}: CompanyPanelProps) {
  const c = settings.company;

  function onLogo(file: File | null) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      onChange({ logoDataUrl: typeof reader.result === "string" ? reader.result : null });
    };
    reader.readAsDataURL(file);
  }

  return (
    <SettingsPanelFrame
      title="Company"
      description="Legal identity, address, logo, and measurement units for your carrier."
      footer={
        <SettingsSaveButton
          onClick={onSave}
          disabled={!dirty}
          saving={saving}
          saved={savedFlash}
          disabledReason="No changes to save."
        />
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <SettingsField label="Company name" className="sm:col-span-2">
          <input
            className={settingsInputClass}
            value={c.name}
            onChange={(e) => onChange({ name: e.target.value })}
          />
        </SettingsField>
        <SettingsField label="MC number">
          <input
            className={settingsInputClass}
            value={c.mcNumber}
            onChange={(e) => onChange({ mcNumber: e.target.value })}
          />
        </SettingsField>
        <SettingsField label="DOT number">
          <input
            className={settingsInputClass}
            value={c.dotNumber}
            onChange={(e) => onChange({ dotNumber: e.target.value })}
          />
        </SettingsField>
        <SettingsField label="Address line 1" className="sm:col-span-2">
          <input
            className={settingsInputClass}
            value={c.addressLine1}
            onChange={(e) => onChange({ addressLine1: e.target.value })}
          />
        </SettingsField>
        <SettingsField label="Address line 2" className="sm:col-span-2">
          <input
            className={settingsInputClass}
            value={c.addressLine2}
            onChange={(e) => onChange({ addressLine2: e.target.value })}
          />
        </SettingsField>
        <SettingsField label="City">
          <input
            className={settingsInputClass}
            value={c.city}
            onChange={(e) => onChange({ city: e.target.value })}
          />
        </SettingsField>
        <SettingsField label="State">
          <input
            className={settingsInputClass}
            value={c.state}
            onChange={(e) => onChange({ state: e.target.value })}
          />
        </SettingsField>
        <SettingsField label="Postal code">
          <input
            className={settingsInputClass}
            value={c.postalCode}
            onChange={(e) => onChange({ postalCode: e.target.value })}
          />
        </SettingsField>
        <SettingsField label="Country">
          <input
            className={settingsInputClass}
            value={c.country}
            onChange={(e) => onChange({ country: e.target.value })}
          />
        </SettingsField>
        <SettingsField label="Timezone">
          <select
            className={settingsSelectClass}
            value={c.timezone}
            onChange={(e) => onChange({ timezone: e.target.value })}
          >
            {TIMEZONES.map((tz) => (
              <option key={tz} value={tz}>
                {tz}
              </option>
            ))}
          </select>
        </SettingsField>
        <SettingsField label="Distance">
          <select
            className={settingsSelectClass}
            value={c.distanceUnit}
            onChange={(e) =>
              onChange({ distanceUnit: e.target.value as CompanySettings["distanceUnit"] })
            }
          >
            <option value="miles">Miles</option>
            <option value="kilometers">Kilometers</option>
          </select>
        </SettingsField>
        <SettingsField label="Temperature">
          <select
            className={settingsSelectClass}
            value={c.temperatureUnit}
            onChange={(e) =>
              onChange({
                temperatureUnit: e.target.value as CompanySettings["temperatureUnit"],
              })
            }
          >
            <option value="f">Fahrenheit</option>
            <option value="c">Celsius</option>
          </select>
        </SettingsField>
        <SettingsField label="Weight">
          <select
            className={settingsSelectClass}
            value={c.weightUnit}
            onChange={(e) =>
              onChange({ weightUnit: e.target.value as CompanySettings["weightUnit"] })
            }
          >
            <option value="lb">Pounds (lb)</option>
            <option value="kg">Kilograms (kg)</option>
          </select>
        </SettingsField>
      </div>

      <div className="rounded-[16px] bg-[#F8FAFC] p-4 ring-1 ring-[#EAEAEA]">
        <p className="text-[13px] font-medium text-slate-700">Company logo</p>
        <div className="mt-3 flex flex-wrap items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-[14px] bg-white text-[18px] font-bold text-[#2563EB] ring-1 ring-[#EAEAEA]">
            {c.logoDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={c.logoDataUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              c.name
                .split(" ")
                .slice(0, 2)
                .map((w) => w[0])
                .join("")
                .toUpperCase()
            )}
          </div>
          <div>
            <label className="inline-flex h-9 cursor-pointer items-center rounded-[10px] bg-white px-3 text-[13px] font-semibold text-slate-700 ring-1 ring-[#EAEAEA] transition hover:bg-slate-50">
              Upload logo
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => onLogo(e.target.files?.[0] ?? null)}
              />
            </label>
            {c.logoDataUrl ? (
              <button
                type="button"
                onClick={() => onChange({ logoDataUrl: null })}
                className="ml-2 text-[13px] font-medium text-slate-500 hover:text-slate-800"
              >
                Remove
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </SettingsPanelFrame>
  );
}
