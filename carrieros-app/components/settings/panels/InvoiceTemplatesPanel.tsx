"use client";

import {
  SettingsField,
  SettingsPanelFrame,
  SettingsSaveButton,
  settingsSelectClass,
  settingsTextareaClass,
} from "@/components/settings/SettingsField";
import type {
  CarrierSettingsState,
  InvoiceTemplateSettings,
} from "@/lib/settings/types";

type InvoiceTemplatesPanelProps = {
  settings: CarrierSettingsState;
  dirty: boolean;
  saving: boolean;
  savedFlash: boolean;
  onChange: (patch: Partial<InvoiceTemplateSettings>) => void;
  onSave: () => void;
};

export default function InvoiceTemplatesPanel({
  settings,
  dirty,
  saving,
  savedFlash,
  onChange,
  onSave,
}: InvoiceTemplatesPanelProps) {
  const t = settings.invoiceTemplate;

  function Toggle({
    label,
    checked,
    onToggle,
  }: {
    label: string;
    checked: boolean;
    onToggle: () => void;
  }) {
    return (
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between rounded-[14px] bg-[#F8FAFC] px-4 py-3 text-left ring-1 ring-[#EAEAEA]"
      >
        <span className="text-[14px] font-medium text-slate-800">{label}</span>
        <span
          className={`relative inline-flex h-7 w-12 items-center rounded-full ${
            checked ? "bg-[#2563EB]" : "bg-slate-300"
          }`}
        >
          <span
            className={`inline-block h-5 w-5 rounded-full bg-white shadow transition ${
              checked ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </span>
      </button>
    );
  }

  return (
    <SettingsPanelFrame
      title="Invoice templates"
      description="Layout fields, logo placement, and payment terms on customer invoices."
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
      <SettingsField label="Layout">
        <select
          className={settingsSelectClass}
          value={t.layout}
          onChange={(e) =>
            onChange({
              layout: e.target.value as InvoiceTemplateSettings["layout"],
            })
          }
        >
          <option value="modern">Modern</option>
          <option value="classic">Classic</option>
          <option value="compact">Compact</option>
        </select>
      </SettingsField>

      <div className="space-y-2">
        <Toggle
          label="Show company logo"
          checked={t.showLogo}
          onToggle={() => onChange({ showLogo: !t.showLogo })}
        />
        <Toggle
          label="Show company address"
          checked={t.showCompanyAddress}
          onToggle={() => onChange({ showCompanyAddress: !t.showCompanyAddress })}
        />
        <Toggle
          label="Show payment terms"
          checked={t.showPaymentTerms}
          onToggle={() => onChange({ showPaymentTerms: !t.showPaymentTerms })}
        />
        <Toggle
          label="Show bank details"
          checked={t.showBankDetails}
          onToggle={() => onChange({ showBankDetails: !t.showBankDetails })}
        />
      </div>

      <SettingsField label="Payment terms">
        <textarea
          className={settingsTextareaClass}
          value={t.terms}
          onChange={(e) => onChange({ terms: e.target.value })}
        />
      </SettingsField>
      <SettingsField label="Footer note">
        <textarea
          className={settingsTextareaClass}
          value={t.footerNote}
          onChange={(e) => onChange({ footerNote: e.target.value })}
        />
      </SettingsField>
    </SettingsPanelFrame>
  );
}
