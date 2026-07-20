"use client";

import { useEffect, useState, useTransition } from "react";
import { prepareAlphPayrollStatementAction } from "@/app/actions/alph-autopilot";
import type { PayrollPrepStatement } from "@/lib/alph/payroll";

export default function AlphPayrollPrepPanel() {
  const [statement, setStatement] = useState<PayrollPrepStatement | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      setStatement(await prepareAlphPayrollStatementAction());
    });
  }, []);

  if (!statement) {
    return (
      <div className="h-32 animate-pulse rounded-[16px] bg-[#F1F5F9]" />
    );
  }

  return (
    <div className="space-y-4 rounded-[18px] bg-white px-5 py-5 ring-1 ring-[#EAEAEA]">
      <div>
        <p className="text-[16px] font-semibold text-slate-950">
          Alph payroll prep
        </p>
        <p className="mt-1 text-[14px] text-slate-600">{statement.summary}</p>
        <p className="mt-2 text-[13px] font-medium text-[#EA580C]">
          Payment blocked until approval — Alph never sends pay automatically.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-[12px] bg-[#F8FAFC] px-3 py-3">
          <p className="text-[12px] font-medium text-slate-500">Gross</p>
          <p className="text-[18px] font-bold text-slate-950">
            ${statement.totals.gross.toLocaleString()}
          </p>
        </div>
        <div className="rounded-[12px] bg-[#F8FAFC] px-3 py-3">
          <p className="text-[12px] font-medium text-slate-500">Deductions</p>
          <p className="text-[18px] font-bold text-slate-950">
            ${statement.totals.deductions.toLocaleString()}
          </p>
        </div>
        <div className="rounded-[12px] bg-[#F8FAFC] px-3 py-3">
          <p className="text-[12px] font-medium text-slate-500">Net</p>
          <p className="text-[18px] font-bold text-slate-950">
            ${statement.totals.net.toLocaleString()}
          </p>
        </div>
      </div>

      {statement.missingEvidenceCount > 0 ? (
        <p className="text-[13px] text-[#C2410C]">
          {statement.missingEvidenceCount} evidence flag
          {statement.missingEvidenceCount === 1 ? "" : "s"} need review.
        </p>
      ) : null}

      <div className="space-y-2">
        {statement.lines.map((line) => (
          <div
            key={line.settlementId}
            className="rounded-[12px] bg-[#F8FAFC] px-3 py-3"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-[14px] font-semibold text-slate-950">
                {line.driverName}
              </p>
              <p className="text-[14px] font-bold text-slate-950">
                ${line.net.toLocaleString()}
              </p>
            </div>
            <p className="text-[12px] text-slate-500">
              {line.periodLabel} · {line.status}
              {pending ? " · …" : ""}
            </p>
            {line.evidenceFlags.length > 0 ? (
              <ul className="mt-2 space-y-1">
                {line.evidenceFlags.map((flag) => (
                  <li
                    key={`${line.settlementId}-${flag.code}`}
                    className="text-[12px] text-[#C2410C]"
                  >
                    {flag.message}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
