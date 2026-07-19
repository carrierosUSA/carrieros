"use client";

type QuickActionId =
  | "createWorkOrder"
  | "schedulePm"
  | "addRepair"
  | "uploadInvoice"
  | "orderParts"
  | "reportBreakdown"
  | "assignMechanic";

type MaintenanceQuickActionsProps = {
  onAction: (action: QuickActionId) => void;
};

const actions: { id: QuickActionId; label: string; primary?: boolean }[] = [
  { id: "createWorkOrder", label: "Create Work Order", primary: true },
  { id: "schedulePm", label: "Schedule PM" },
  { id: "addRepair", label: "Add Repair" },
  { id: "uploadInvoice", label: "Upload Invoice" },
  { id: "orderParts", label: "Order Parts" },
  { id: "reportBreakdown", label: "Report Breakdown" },
  { id: "assignMechanic", label: "Assign Mechanic" },
];

export default function MaintenanceQuickActions({
  onAction,
}: MaintenanceQuickActionsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {actions.map((action) => (
        <button
          key={action.id}
          type="button"
          onClick={() => onAction(action.id)}
          className={`inline-flex h-9 items-center justify-center rounded-full px-4 text-[13px] font-semibold transition ${
            action.primary
              ? "bg-[#2563EB] text-white hover:bg-[#1D4ED8]"
              : "bg-[#F8FAFC] text-slate-700 ring-1 ring-[#EAEAEA] hover:bg-white"
          }`}
        >
          {action.primary ? `+ ${action.label}` : action.label}
        </button>
      ))}
    </div>
  );
}

export type { QuickActionId };
