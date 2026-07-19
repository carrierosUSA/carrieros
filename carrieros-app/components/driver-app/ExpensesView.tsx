"use client";

import { useRef, useState } from "react";
import { Camera } from "lucide-react";
import AiPolicyNotice from "@/components/ai-safety/AiPolicyNotice";
import { useAiSafety } from "@/components/ai-safety/AiSafetyProvider";
import { useDriverApp } from "@/components/driver-app/DriverAppProvider";
import type { ExpenseFlag } from "@/lib/driver-app/types";
import {
  DmCard,
  DmPrimaryButton,
  DmSectionLabel,
  StatusChip,
  formatMoney,
} from "@/components/driver-mobile/ui";

export default function ExpensesView() {
  const { runAiSuggestedAction } = useAiSafety();
  const {
    state,
    submitExpense,
    requestExpenseApproval,
    approveExpenseDemo,
  } = useDriverApp();
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [flag, setFlag] = useState<ExpenseFlag>("reimbursable");
  const [photoName, setPhotoName] = useState<string | undefined>();
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-5 animate-[carrieros-fade-in_0.35s_ease]">
      <div>
        <h2 className="text-[22px] font-bold tracking-tight">Expenses</h2>
        <p className="mt-1 text-[14px] text-[var(--dm-muted)]">
          Photo → AI categorize → Personal / Company / Reimbursable → approval → payroll.
        </p>
        <div className="mt-2">
          <AiPolicyNotice variant="assist" />
        </div>
      </div>

      <DmCard className="space-y-3">
        <label className="block">
          <span className="text-[13px] font-medium text-[var(--dm-muted)]">Amount</span>
          <input
            type="number"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="mt-1.5 min-h-12 w-full rounded-2xl bg-[var(--dm-elevated)] px-4 text-[16px] outline-none ring-[var(--color-info)] focus:ring-2"
            placeholder="0.00"
          />
        </label>
        <label className="block">
          <span className="text-[13px] font-medium text-[var(--dm-muted)]">Note</span>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="mt-1.5 min-h-12 w-full rounded-2xl bg-[var(--dm-elevated)] px-4 text-[16px] outline-none ring-[var(--color-info)] focus:ring-2"
            placeholder="Hotel, parking, toll…"
          />
        </label>
        <div className="flex flex-wrap gap-2">
          {(["personal", "company", "reimbursable"] as ExpenseFlag[]).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFlag(f)}
              className={`min-h-11 rounded-full px-3.5 text-[13px] font-semibold capitalize ${
                flag === f
                  ? "bg-[var(--color-info)] text-white"
                  : "bg-[var(--dm-elevated)]"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) setPhotoName(f.name);
          }}
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[var(--dm-elevated)] text-[15px] font-semibold"
        >
          <Camera className="h-5 w-5" />
          {photoName ?? "Attach photo"}
        </button>
        <DmPrimaryButton
          disabled={!amount || Number(amount) <= 0}
          onClick={() => {
            submitExpense({
              amount: Number(amount),
              note: note || "Expense",
              photoName,
              flag,
            });
            setAmount("");
            setNote("");
            setPhotoName(undefined);
          }}
        >
          Save expense
        </DmPrimaryButton>
      </DmCard>

      <DmSectionLabel>History</DmSectionLabel>
      {state.expenses.length === 0 ? (
        <DmCard>
          <p className="text-[15px] font-semibold">No expenses yet</p>
          <p className="mt-1 text-[14px] text-[var(--dm-muted)]">
            Snap a receipt — Alph will categorize it for you.
          </p>
        </DmCard>
      ) : (
        <div className="space-y-3">
          {state.expenses.map((exp) => (
            <DmCard key={exp.id} className="space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[17px] font-bold">{formatMoney(exp.amount)}</p>
                  <p className="text-[14px] text-[var(--dm-muted)]">{exp.note}</p>
                  {exp.aiSummary && (
                    <p className="mt-1 text-[13px] text-[var(--dm-muted)]">{exp.aiSummary}</p>
                  )}
                </div>
                <StatusChip
                  label={exp.approvalStatus.replace(/_/g, " ")}
                  tone={
                    exp.approvalStatus === "approved"
                      ? "success"
                      : exp.approvalStatus === "pending_approval"
                        ? "warning"
                        : "info"
                  }
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <StatusChip label={exp.flag} tone="muted" />
                {exp.aiCategory && <StatusChip label={exp.aiCategory} tone="info" />}
              </div>
              {exp.approvalStatus === "draft" && (
                <DmPrimaryButton onClick={() => requestExpenseApproval(exp.id)}>
                  Request approval
                </DmPrimaryButton>
              )}
              {exp.approvalStatus === "pending_approval" && (
                <button
                  type="button"
                  onClick={() => {
                    void runAiSuggestedAction({
                      kind: "payroll_approve",
                      suggestion: `Approve expense ${formatMoney(exp.amount)} for payroll`,
                      confidence: "review_recommended",
                      reason:
                        exp.aiSummary ??
                        "Alph categorized this expense. A human must approve before payroll.",
                      dataUsed: [
                        "Expense draft",
                        exp.aiCategory ?? "uncategorized",
                        exp.flag,
                      ],
                      source: "driver-app-expenses",
                      onConfirm: () => approveExpenseDemo(exp.id),
                    });
                  }}
                  className="min-h-11 w-full rounded-2xl bg-[var(--dm-elevated)] text-[14px] font-semibold"
                >
                  Demo: manager approve
                </button>
              )}
            </DmCard>
          ))}
        </div>
      )}
    </div>
  );
}
