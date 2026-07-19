"use client";

import { useState } from "react";
import ReassignModalShell from "@/components/dispatch/load-detail/ReassignModalShell";
import {
  CALLING_METHOD_LABELS,
  CALLING_METHODS,
  clearPreferredCallingMethod,
  setPreferredCallingMethod,
  type CallingMethod,
} from "@/lib/dispatch/communication-preferences";

type CommunicationCallChooserProps = {
  open: boolean;
  phone: string | null;
  settingsMode: boolean;
  preferredMethod: CallingMethod | null;
  onSelect: (method: CallingMethod, saveAsPreferred: boolean) => void;
  onClose: () => void;
  onOpenSettings: () => void;
  onRefreshPreference: () => void;
};

export default function CommunicationCallChooser({
  open,
  phone,
  settingsMode,
  preferredMethod,
  onSelect,
  onClose,
  onOpenSettings,
  onRefreshPreference,
}: CommunicationCallChooserProps) {
  const [rememberChoice, setRememberChoice] = useState(false);
  const title = settingsMode ? "Preferred Calling Method" : "Call with";

  return (
    <ReassignModalShell open={open} onClose={onClose} title={title}>
      {settingsMode ? (
        <div className="px-4 py-3">
          <p className="mb-2 text-[11px] text-slate-500">
            Choose your default app for outbound calls.
          </p>
          <ul className="space-y-1">
            {CALLING_METHODS.map((method) => {
              const isCurrent = preferredMethod === method;

              return (
                <li key={method}>
                  <button
                    type="button"
                    onClick={() => {
                      setPreferredCallingMethod(method);
                      onRefreshPreference();
                    }}
                    className={`flex w-full items-center justify-between rounded-lg px-2 py-2 text-left text-[12px] hover:bg-[#F8FBFF] ${
                      isCurrent ? "bg-[#EFF6FF] font-semibold text-[#1E3A8A]" : "text-slate-800"
                    }`}
                  >
                    {CALLING_METHOD_LABELS[method]}
                    {isCurrent ? <span className="text-[10px]">Saved</span> : null}
                  </button>
                </li>
              );
            })}
          </ul>
          {preferredMethod ? (
            <button
              type="button"
              onClick={() => {
                clearPreferredCallingMethod();
                onRefreshPreference();
              }}
              className="mt-2 text-[10px] font-medium text-slate-500 hover:text-slate-700"
            >
              Clear saved preference
            </button>
          ) : null}
        </div>
      ) : (
        <>
          <div className="px-4 py-3">
            {phone ? (
              <p className="mb-2 text-[11px] text-slate-500">
                Calling <span className="font-semibold text-slate-800">{phone}</span>
              </p>
            ) : null}
            <ul className="space-y-1">
              {CALLING_METHODS.map((method) => (
                <li key={method}>
                  <button
                    type="button"
                    onClick={() => onSelect(method, rememberChoice)}
                    className="flex w-full rounded-lg px-2 py-2 text-left text-[12px] font-medium text-slate-800 hover:bg-[#F8FBFF]"
                  >
                    {CALLING_METHOD_LABELS[method]}
                  </button>
                </li>
              ))}
            </ul>
            <label className="mt-3 flex items-center gap-2 text-[11px] text-slate-600">
              <input
                type="checkbox"
                checked={rememberChoice}
                onChange={(event) => setRememberChoice(event.target.checked)}
                className="rounded border-slate-300"
              />
              Save as preferred calling method
            </label>
          </div>
          <div className="flex items-center justify-between border-t border-[#F1F5F9] px-4 py-2.5">
            <button
              type="button"
              onClick={onOpenSettings}
              className="text-[11px] font-semibold text-[#1E3A8A] hover:underline"
            >
              Preferred Calling Method
            </button>
            <button
              type="button"
              onClick={onClose}
              className="h-8 rounded-md border border-[#E2E8F0] px-3 text-[11px] font-medium text-slate-600"
            >
              Cancel
            </button>
          </div>
        </>
      )}

      {settingsMode ? (
        <div className="border-t border-[#F1F5F9] px-4 py-2.5 text-right">
          <button
            type="button"
            onClick={onClose}
            className="h-8 rounded-md border border-[#E2E8F0] px-3 text-[11px] font-medium text-slate-600"
          >
            Done
          </button>
        </div>
      ) : null}
    </ReassignModalShell>
  );
}
