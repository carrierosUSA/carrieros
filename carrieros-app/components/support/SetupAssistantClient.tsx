"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import FadeIn from "@/components/ui/FadeIn";
import {
  getSupportStore,
  markSetupStep,
  setupStatusLabel,
  subscribeSupportStore,
  type SetupStep,
} from "@/lib/support";
import { CARRIEROS_COLORS } from "@/lib/design-system/colors";

function statusTone(status: SetupStep["status"]) {
  switch (status) {
    case "completed":
      return CARRIEROS_COLORS.success;
    case "missing":
    case "required":
      return CARRIEROS_COLORS.critical;
    case "needs_review":
      return CARRIEROS_COLORS.warning;
    case "recommended":
      return CARRIEROS_COLORS.info;
    default:
      return CARRIEROS_COLORS.disabled;
  }
}

export default function SetupAssistantClient() {
  const store = useSyncExternalStore(
    subscribeSupportStore,
    getSupportStore,
    getSupportStore,
  );
  const [activeId, setActiveId] = useState(store.setup.steps[0]?.id);
  const [askOpen, setAskOpen] = useState(false);
  const active =
    store.setup.steps.find((s) => s.id === activeId) ?? store.setup.steps[0];

  return (
    <FadeIn className="space-y-5">
      <header className="rounded-[16px] border border-[#EAEAEA] bg-white p-5 shadow-sm">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
          Alph Onboarding
        </p>
        <h1 className="mt-1 text-[28px] font-bold tracking-[-0.03em] text-slate-950">
          Company Setup
        </h1>
        <p className="mt-1 text-[14px] text-slate-600">
          Alph guides you through everything needed to run Transpo.ai safely —
          in plain language, one step at a time.
        </p>

        <div className="mt-5">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-[13px] font-medium text-slate-500">
                Company Setup
              </p>
              <p className="text-[32px] font-bold tabular-nums tracking-tight text-slate-950">
                {store.setup.percent}%{" "}
                <span className="text-[16px] font-semibold text-slate-500">
                  Complete
                </span>
              </p>
            </div>
            {store.setup.requiredMissing > 0 ? (
              <p className="rounded-full bg-[#FEF2F2] px-3 py-1 text-[12px] font-semibold text-[#DC2626]">
                {store.setup.requiredMissing} critical still missing
              </p>
            ) : (
              <p className="rounded-full bg-[#ECFDF3] px-3 py-1 text-[12px] font-semibold text-[#166534]">
                Critical steps complete
              </p>
            )}
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#E2E8F0]">
            <div
              className="h-full rounded-full bg-[#2563EB] transition-all duration-500"
              style={{ width: `${store.setup.percent}%` }}
            />
          </div>
          <p className="mt-2 text-[13px] text-slate-500">
            {store.setup.completed} of {store.setup.total} steps completed
          </p>
        </div>
      </header>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.15fr)]">
        <aside className="space-y-2">
          {store.setup.steps.map((step) => {
            const tone = statusTone(step.status);
            const selected = step.id === active?.id;
            return (
              <button
                key={step.id}
                type="button"
                onClick={() => setActiveId(step.id)}
                className={`flex w-full items-center justify-between gap-3 rounded-[14px] border px-4 py-3 text-left transition ${
                  selected
                    ? "border-[#BFDBFE] bg-[#F8FBFF]"
                    : "border-[#EAEAEA] bg-white hover:bg-slate-50"
                }`}
              >
                <div>
                  <p className="text-[14px] font-semibold text-slate-900">
                    {step.title}
                  </p>
                  {step.critical ? (
                    <p className="text-[11px] font-medium text-slate-500">
                      Required
                    </p>
                  ) : null}
                </div>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${tone.bg} ${tone.text}`}
                >
                  {setupStatusLabel(step.status)}
                </span>
              </button>
            );
          })}
        </aside>

        {active ? (
          <section className="rounded-[16px] border border-[#EAEAEA] bg-white p-5 shadow-sm">
            <h2 className="text-[20px] font-bold text-slate-950">{active.title}</h2>
            <p className="mt-2 text-[14px] text-slate-600">{active.description}</p>

            <div className="mt-5 space-y-4">
              <Explain label="Why this is needed" body={active.whyNeeded} />
              <Explain label="Where you can find it" body={active.whereToFind} />
              <Explain label="Example" body={active.example} />
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              <Link
                href={active.href}
                className="rounded-full bg-[#2563EB] px-3.5 py-2 text-[12px] font-semibold text-white"
              >
                Open Step
              </Link>
              <label className="inline-flex cursor-pointer items-center rounded-full border border-[#EAEAEA] px-3.5 py-2 text-[12px] font-semibold text-slate-800">
                Upload
                <input type="file" className="hidden" />
              </label>
              <button
                type="button"
                className="rounded-full border border-[#EAEAEA] px-3.5 py-2 text-[12px] font-semibold text-slate-800"
                onClick={() => {
                  markSetupStep(active.id, "completed");
                }}
              >
                Mark Complete
              </button>
              {!active.critical ? (
                <button
                  type="button"
                  className="rounded-full border border-[#EAEAEA] px-3.5 py-2 text-[12px] font-semibold text-slate-600"
                  onClick={() => markSetupStep(active.id, "recommended", true)}
                >
                  Skip for Later
                </button>
              ) : (
                <button
                  type="button"
                  disabled
                  title="Critical steps cannot be skipped without completing them"
                  className="cursor-not-allowed rounded-full border border-[#EAEAEA] px-3.5 py-2 text-[12px] font-semibold text-slate-400"
                >
                  Skip for Later
                </button>
              )}
              <button
                type="button"
                className="rounded-full border border-[#EAEAEA] px-3.5 py-2 text-[12px] font-semibold text-[#2563EB]"
                onClick={() => setAskOpen((v) => !v)}
              >
                Ask Alph
              </button>
            </div>

            {askOpen ? (
              <div className="mt-4 rounded-[14px] bg-[#F8FBFF] p-4 ring-1 ring-[#BFDBFE]">
                <p className="text-[14px] font-semibold text-slate-900">
                  Alph explains
                </p>
                <p className="mt-1 text-[13px] leading-relaxed text-slate-600">
                  {active.whyNeeded} Start from {active.whereToFind}. A typical
                  value looks like “{active.example}”. When you are done, return
                  here and mark the step complete so your setup score stays
                  accurate.
                </p>
              </div>
            ) : null}

            {active.critical && active.status !== "completed" ? (
              <p className="mt-4 rounded-[12px] bg-[#FFF7ED] px-3 py-2 text-[13px] font-medium text-[#9A3412]">
                This is a critical step. You can continue exploring Transpo.ai,
                but Alph will keep reminding you until it is complete.
              </p>
            ) : null}
          </section>
        ) : null}
      </div>
    </FadeIn>
  );
}

function Explain({ label, body }: { label: string; body: string }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-[14px] text-slate-700">{body}</p>
    </div>
  );
}
