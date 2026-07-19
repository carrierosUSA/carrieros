"use client";

type QuickAction = {
  id: string;
  label: string;
  primary?: boolean;
  disabled?: boolean;
  title?: string;
  onClick: () => void;
};

type FinanceQuickActionsProps = {
  actions: QuickAction[];
};

export default function FinanceQuickActions({
  actions,
}: FinanceQuickActionsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {actions.map((action) => (
        <button
          key={action.id}
          type="button"
          disabled={action.disabled}
          title={action.title}
          onClick={action.onClick}
          className={`inline-flex h-9 items-center justify-center rounded-full px-4 text-[13px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
            action.primary
              ? "bg-[#2563EB] text-white hover:bg-[#1D4ED8]"
              : "bg-[#F8FAFC] text-slate-700 ring-1 ring-[#EAEAEA] hover:bg-white"
          }`}
        >
          {action.label}
        </button>
      ))}
    </div>
  );
}
