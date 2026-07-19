import { WIZARD_STEPS } from "@/lib/migration/categories";
import type { MigrationWizardStep } from "@/lib/migration/types";

type WizardProgressProps = {
  current: MigrationWizardStep;
};

export default function WizardProgress({ current }: WizardProgressProps) {
  const currentIdx = WIZARD_STEPS.findIndex((s) => s.id === current);

  return (
    <ol className="flex flex-wrap gap-2" aria-label="Migration steps">
      {WIZARD_STEPS.map((step, idx) => {
        const active = idx === currentIdx;
        const done = idx < currentIdx;
        return (
          <li
            key={step.id}
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[13px] font-medium ${
              active
                ? "bg-[#2563EB] text-white"
                : done
                  ? "bg-[#EFF6FF] text-[#1D4ED8]"
                  : "bg-[#F3F4F6] text-[#6B7280]"
            }`}
          >
            <span
              className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold ${
                active ? "bg-white/20" : done ? "bg-[#2563EB] text-white" : "bg-white text-[#9CA3AF]"
              }`}
            >
              {step.number}
            </span>
            {step.label}
          </li>
        );
      })}
    </ol>
  );
}
