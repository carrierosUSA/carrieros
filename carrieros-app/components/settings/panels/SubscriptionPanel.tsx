"use client";

import ActionTooltip from "@/components/ui/ActionTooltip";
import {
  SettingsPanelFrame,
  SettingsSaveButton,
} from "@/components/settings/SettingsField";
import type {
  CarrierSettingsState,
  SubscriptionPlanId,
  SubscriptionSettings,
} from "@/lib/settings/types";

const PLANS: {
  id: SubscriptionPlanId;
  name: string;
  price: string;
  blurb: string;
}[] = [
  {
    id: "starter",
    name: "Starter",
    price: "$299/mo",
    blurb: "Dispatch, documents, and core fleet for small carriers.",
  },
  {
    id: "growth",
    name: "Growth",
    price: "$499/mo",
    blurb: "Finance, workflows, portal, and advanced compliance.",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "Custom",
    blurb: "SSO, audit, dedicated support, and unlimited seats.",
  },
];

type SubscriptionPanelProps = {
  settings: CarrierSettingsState;
  dirty: boolean;
  saving: boolean;
  savedFlash: boolean;
  onChange: (patch: Partial<SubscriptionSettings>) => void;
  onSave: () => void;
};

export default function SubscriptionPanel({
  settings,
  dirty,
  saving,
  savedFlash,
  onChange,
  onSave,
}: SubscriptionPanelProps) {
  const sub = settings.subscription;
  const current = PLANS.find((p) => p.id === sub.plan) ?? PLANS[1];
  const isEnterprise = sub.plan === "enterprise";

  return (
    <SettingsPanelFrame
      title="Subscription"
      description="Your Transpo.ai plan, seats, and included capabilities."
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
      <div className="rounded-[16px] bg-[#EFF6FF] px-5 py-5">
        <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#1D4ED8]">
          Current plan
        </p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h3 className="text-[28px] font-bold tracking-tight text-slate-950">
              {current.name}
            </h3>
            <p className="mt-1 text-[15px] text-slate-600">{current.blurb}</p>
          </div>
          <p className="text-[22px] font-bold text-[#2563EB]">{current.price}</p>
        </div>
        <div className="mt-4 flex flex-wrap gap-4 text-[14px] text-slate-700">
          <span>
            Seats{" "}
            <strong className="text-slate-950">
              {sub.seatsUsed}/{sub.seats}
            </strong>
          </span>
          <span>
            Renews{" "}
            <strong className="text-slate-950">{sub.renewsAt}</strong>
          </span>
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        {PLANS.map((plan) => {
          const active = plan.id === sub.plan;
          return (
            <button
              key={plan.id}
              type="button"
              onClick={() => onChange({ plan: plan.id })}
              className={`rounded-[16px] p-4 text-left transition ring-1 ${
                active
                  ? "bg-white ring-[#2563EB] shadow-sm"
                  : "bg-[#F8FAFC] ring-[#EAEAEA] hover:bg-white"
              }`}
            >
              <p className="text-[15px] font-semibold text-slate-950">
                {plan.name}
              </p>
              <p className="mt-1 text-[18px] font-bold text-slate-900">
                {plan.price}
              </p>
              <p className="mt-2 text-[13px] leading-snug text-slate-500">
                {plan.blurb}
              </p>
              {active ? (
                <p className="mt-3 text-[12px] font-semibold text-[#15803D]">
                  Selected
                </p>
              ) : null}
            </button>
          );
        })}
      </div>

      <div>
        <p className="text-[15px] font-semibold text-slate-950">Included features</p>
        <ul className="mt-2 grid gap-2 sm:grid-cols-2">
          {sub.features.map((feature) => (
            <li
              key={feature}
              className="rounded-[12px] bg-[#F8FAFC] px-3 py-2.5 text-[14px] text-slate-700 ring-1 ring-[#EAEAEA]"
            >
              {feature}
            </li>
          ))}
        </ul>
      </div>

      <ActionTooltip
        label="Upgrade"
        disabled={isEnterprise}
        reason="You are already on Enterprise — contact sales for custom terms."
      >
        <button
          type="button"
          disabled={isEnterprise}
          onClick={() => onChange({ plan: "enterprise" })}
          className="inline-flex h-10 items-center rounded-[12px] bg-[#2563EB] px-4 text-[14px] font-semibold text-white transition hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          Upgrade to Enterprise
        </button>
      </ActionTooltip>
    </SettingsPanelFrame>
  );
}
