"use client";

import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useDriverMobile } from "@/components/driver-mobile/DriverMobileProvider";
import {
  DmCard,
  DmPrimaryButton,
  DmSectionLabel,
} from "@/components/driver-mobile/ui";
import type { ExpenseCategory } from "@/lib/driver-mobile/types";

const CATEGORIES: ExpenseCategory[] = [
  "fuel",
  "hotel",
  "parking",
  "toll",
  "lumper",
  "repairs",
  "other",
];

export default function ExpensesForm() {
  const { submitExpense } = useDriverMobile();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [category, setCategory] = useState<ExpenseCategory>("fuel");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  function goBack() {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("view");
    router.replace(`${pathname}?${params.toString()}`);
  }

  function onSubmit() {
    const value = Number.parseFloat(amount);
    if (!Number.isFinite(value) || value <= 0) return;
    submitExpense({
      category,
      amount: value,
      note: note.trim() || category,
    });
    goBack();
  }

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={goBack}
        className="text-[14px] font-semibold text-[var(--color-info)]"
      >
        ← Back
      </button>
      <DmSectionLabel>Submit expense</DmSectionLabel>
      <DmCard className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className={`rounded-full px-3 py-1.5 text-[13px] font-semibold capitalize ${
                category === c
                  ? "bg-blue-500/15 text-[var(--color-info)]"
                  : "bg-[var(--dm-elevated)]"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        <input
          type="number"
          inputMode="decimal"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="h-12 w-full rounded-2xl bg-[var(--dm-elevated)] px-4 text-[15px]"
        />
        <textarea
          placeholder="Note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="min-h-24 w-full rounded-2xl bg-[var(--dm-elevated)] px-4 py-3 text-[15px]"
        />
        <DmPrimaryButton onClick={onSubmit}>Submit expense</DmPrimaryButton>
      </DmCard>
    </div>
  );
}
