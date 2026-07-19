"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AiAutomationLevelSelect from "@/components/ai-safety/AiAutomationLevelSelect";
import AiPolicyNotice from "@/components/ai-safety/AiPolicyNotice";
import { SettingsPanelFrame } from "@/components/settings/SettingsField";
import {
  AI_POLICY_CONSTITUTION_HREF,
  AI_POLICY_HREF,
  AI_POLICY_TAGLINE,
  getAiSafetySettings,
  listAiAudit,
  saveAiSafetySettings,
  type AiSafetyCompanySettings,
  type AutomationLevel,
} from "@/lib/ai-safety";


export default function AiSafetySettingsPanel() {
  const [settings, setSettings] = useState<AiSafetyCompanySettings | null>(null);
  const [savedFlash, setSavedFlash] = useState(false);
  const [auditCount, setAuditCount] = useState(0);

  useEffect(() => {
    setSettings(getAiSafetySettings());
    setAuditCount(listAiAudit(300).length);
  }, []);

  if (!settings) {
    return (
      <SettingsPanelFrame
        title="AI Safety Policy"
        description="Loading company AI preferences…"
      >
        <div className="h-24 animate-pulse rounded-[16px] bg-[#F1F5F9]" />
      </SettingsPanelFrame>
    );
  }

  function persist(
    patch: Partial<
      Pick<AiSafetyCompanySettings, "automationLevel" | "allowAlphContactCustomers">
    >,
  ) {
    const next = saveAiSafetySettings(patch);
    setSettings(next);
    setSavedFlash(true);
    window.setTimeout(() => setSavedFlash(false), 1600);
  }

  return (
    <SettingsPanelFrame
      title="AI Safety Policy"
      description={`${AI_POLICY_TAGLINE} Set how Alph may automate for your company.`}
    >
      <AiAutomationLevelSelect
        value={settings.automationLevel}
        onChange={(automationLevel: AutomationLevel) =>
          persist({ automationLevel })
        }
      />

      <label className="flex cursor-pointer items-start gap-3 rounded-[14px] bg-[#F8F9FB] px-4 py-4">
        <input
          type="checkbox"
          className="mt-1 h-4 w-4 rounded border-[#CBD5E1] text-[#2563EB]"
          checked={settings.allowAlphContactCustomers}
          onChange={(e) =>
            persist({ allowAlphContactCustomers: e.target.checked })
          }
        />
        <span>
          <span className="block text-[15px] font-semibold text-[#0F172A]">
            Allow Alph to contact customers
          </span>
          <span className="mt-0.5 block text-[14px] text-[#64748B]">
            Off by default. When disabled, Alph never emails or messages
            customers without a separate human action.
          </span>
        </span>
      </label>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[14px] bg-[#EFF6FF] px-4 py-4">
        <div>
          <p className="text-[15px] font-semibold text-[#0F172A]">
            Full policy
          </p>
          <p className="mt-0.5 text-[14px] text-[#64748B]">
            What Alph may and must never do — readable by your whole company.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={AI_POLICY_HREF}
            className="inline-flex h-10 items-center rounded-[12px] bg-[#2563EB] px-4 text-[14px] font-semibold text-white transition hover:bg-[#1D4ED8]"
          >
            Open AI Safety Policy
          </Link>
          <Link
            href={AI_POLICY_CONSTITUTION_HREF}
            className="inline-flex h-10 items-center rounded-[12px] bg-white px-4 text-[14px] font-semibold text-[#334155] ring-1 ring-[#E2E8F0] transition hover:ring-[#BFDBFE]"
          >
            Constitution
          </Link>
        </div>
      </div>

      <p className="text-[13px] text-[#64748B]">
        Local AI audit entries on this device: {auditCount}
        {savedFlash ? (
          <span className="ml-2 font-semibold text-[#16A34A]">Saved</span>
        ) : null}
      </p>

      <AiPolicyNotice variant="charter" />
    </SettingsPanelFrame>
  );
}
