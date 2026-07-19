"use client";

import {
  SettingsField,
  SettingsPanelFrame,
  SettingsSaveButton,
  settingsInputClass,
} from "@/components/settings/SettingsField";
import type { BillingSettings, CarrierSettingsState } from "@/lib/settings/types";

type BillingPanelProps = {
  settings: CarrierSettingsState;
  dirty: boolean;
  saving: boolean;
  savedFlash: boolean;
  onChange: (patch: Partial<BillingSettings>) => void;
  onSave: () => void;
};

export default function BillingPanel({
  settings,
  dirty,
  saving,
  savedFlash,
  onChange,
  onSave,
}: BillingPanelProps) {
  const b = settings.billing;

  return (
    <SettingsPanelFrame
      title="Billing"
      description="Payment method, billing email, and recent Transpo.ai invoices."
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
        <p className="text-[13px] font-medium text-slate-500">Payment method</p>
        <p className="mt-1 text-[18px] font-bold text-slate-950">
          {b.cardBrand} ···· {b.cardLast4}
        </p>
        <p className="mt-1 text-[14px] text-slate-500">
          Expires {String(b.cardExpMonth).padStart(2, "0")}/{b.cardExpYear}
        </p>
        <button
          type="button"
          title="Card updates will connect to Stripe in a future release."
          disabled
          className="mt-3 inline-flex h-9 cursor-not-allowed items-center rounded-[10px] bg-white px-3 text-[13px] font-semibold text-slate-400 ring-1 ring-[#EAEAEA]"
        >
          Update card
        </button>
      </div>

      <SettingsField label="Billing email">
        <input
          className={settingsInputClass}
          value={b.billingEmail}
          onChange={(e) => onChange({ billingEmail: e.target.value })}
        />
      </SettingsField>

      <div className="space-y-2">
        <p className="text-[15px] font-semibold text-slate-950">Invoices</p>
        {b.invoices.map((invoice) => (
          <div
            key={invoice.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-[14px] bg-white px-4 py-3 ring-1 ring-[#EAEAEA]"
          >
            <div>
              <p className="text-[15px] font-semibold text-slate-950">
                {invoice.description}
              </p>
              <p className="text-[13px] text-slate-500">{invoice.date}</p>
            </div>
            <div className="text-right">
              <p className="text-[16px] font-bold tabular-nums text-slate-950">
                ${invoice.amount.toFixed(2)}
              </p>
              <p
                className={`text-[12px] font-semibold ${
                  invoice.status === "paid"
                    ? "text-[#15803D]"
                    : invoice.status === "failed"
                      ? "text-[#B91C1C]"
                      : "text-[#C2410C]"
                }`}
              >
                {invoice.status === "paid"
                  ? "Paid"
                  : invoice.status === "failed"
                    ? "Failed"
                    : "Open"}
              </p>
            </div>
          </div>
        ))}
      </div>
    </SettingsPanelFrame>
  );
}
