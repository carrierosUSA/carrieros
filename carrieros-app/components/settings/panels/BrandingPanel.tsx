"use client";

import {
  SettingsField,
  SettingsPanelFrame,
  SettingsSaveButton,
  settingsTextareaClass,
} from "@/components/settings/SettingsField";
import type { BrandingSettings, CarrierSettingsState } from "@/lib/settings/types";
import { SEMANTIC_BLUE_PALETTE } from "@/lib/settings/types";

type BrandingPanelProps = {
  settings: CarrierSettingsState;
  dirty: boolean;
  saving: boolean;
  savedFlash: boolean;
  onChange: (patch: Partial<BrandingSettings>) => void;
  onSave: () => void;
};

export default function BrandingPanel({
  settings,
  dirty,
  saving,
  savedFlash,
  onChange,
  onSave,
}: BrandingPanelProps) {
  const b = settings.branding;

  function onLogo(file: File | null) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      onChange({
        logoDataUrl: typeof reader.result === "string" ? reader.result : null,
      });
    };
    reader.readAsDataURL(file);
  }

  return (
    <SettingsPanelFrame
      title="Branding"
      description="Logo, primary blue, and email footer shown on customer-facing messages."
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
      <div className="rounded-[16px] bg-[#F8FAFC] p-4 ring-1 ring-[#EAEAEA]">
        <p className="text-[13px] font-medium text-slate-700">Brand logo</p>
        <div className="mt-3 flex flex-wrap items-center gap-4">
          <div
            className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-[14px] bg-white ring-1 ring-[#EAEAEA]"
            style={{ color: b.primaryColor }}
          >
            {b.logoDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={b.logoDataUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="text-[18px] font-bold">LS</span>
            )}
          </div>
          <label className="inline-flex h-9 cursor-pointer items-center rounded-[10px] bg-white px-3 text-[13px] font-semibold text-slate-700 ring-1 ring-[#EAEAEA]">
            Upload logo
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => onLogo(e.target.files?.[0] ?? null)}
            />
          </label>
        </div>
      </div>

      <div>
        <p className="text-[13px] font-medium text-slate-700">Primary color</p>
        <p className="mt-1 text-[13px] text-slate-500">
          Constrained to semantic blues used across Transpo.ai.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {SEMANTIC_BLUE_PALETTE.map((swatch) => {
            const active = b.primaryColor === swatch.value;
            return (
              <button
                key={swatch.id}
                type="button"
                title={swatch.label}
                onClick={() => onChange({ primaryColor: swatch.value })}
                className={`flex h-11 w-11 items-center justify-center rounded-full transition ${
                  active ? "ring-2 ring-offset-2 ring-slate-900" : ""
                }`}
                style={{ backgroundColor: swatch.value }}
              >
                {active ? (
                  <span className="text-[14px] font-bold text-white">✓</span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      <SettingsField label="Email footer">
        <textarea
          className={settingsTextareaClass}
          value={b.emailFooter}
          onChange={(e) => onChange({ emailFooter: e.target.value })}
        />
      </SettingsField>

      <div
        className="rounded-[16px] px-4 py-4 text-white"
        style={{ backgroundColor: b.primaryColor }}
      >
        <p className="text-[12px] font-semibold uppercase tracking-[0.14em] opacity-80">
          Preview
        </p>
        <p className="mt-2 text-[15px] font-semibold">Rate confirmation ready</p>
        <p className="mt-2 text-[13px] leading-relaxed opacity-90">
          {b.emailFooter}
        </p>
      </div>
    </SettingsPanelFrame>
  );
}
