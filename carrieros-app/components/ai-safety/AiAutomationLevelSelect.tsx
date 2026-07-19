"use client";

import {
  AUTOMATION_LEVEL_DESCRIPTIONS,
  AUTOMATION_LEVEL_LABELS,
  AUTOMATION_LEVELS,
  type AutomationLevel,
} from "@/lib/ai-safety";

type AiAutomationLevelSelectProps = {
  value: AutomationLevel;
  onChange: (level: AutomationLevel) => void;
  disabled?: boolean;
  className?: string;
};

export default function AiAutomationLevelSelect({
  value,
  onChange,
  disabled = false,
  className = "",
}: AiAutomationLevelSelectProps) {
  return (
    <div className={`space-y-3 ${className}`}>
      <p className="text-[13px] font-medium text-[#64748B]">
        Company automation preference
      </p>
      <div className="grid gap-2 sm:grid-cols-3">
        {AUTOMATION_LEVELS.map((level) => {
          const active = value === level;
          return (
            <button
              key={level}
              type="button"
              disabled={disabled}
              onClick={() => onChange(level)}
              className={`rounded-[14px] px-3 py-3 text-left transition ${
                active
                  ? "bg-[#EFF6FF] shadow-[inset_0_0_0_2px_#2563EB]"
                  : "bg-[#F8F9FB] hover:bg-[#F1F5F9]"
              } disabled:cursor-not-allowed disabled:opacity-60`}
            >
              <p className="text-[14px] font-semibold text-[#0F172A]">
                {AUTOMATION_LEVEL_LABELS[level]}
              </p>
              <p className="mt-1 text-[13px] leading-snug text-[#64748B]">
                {AUTOMATION_LEVEL_DESCRIPTIONS[level]}
              </p>
            </button>
          );
        })}
      </div>
      {value === "full" ? (
        <p className="text-[13px] text-[#EA580C]">
          Fully Automated never bypasses approvals for money, payroll, safety,
          compliance, legal, employment, or contracts.
        </p>
      ) : null}
    </div>
  );
}
