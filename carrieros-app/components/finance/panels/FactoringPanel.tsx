"use client";

import FinancePanelShell, {
  FinanceEmpty,
} from "@/components/finance/FinancePanelShell";
import FinanceStatusBadge from "@/components/finance/FinanceStatusBadge";
import { formatFinanceMoney, formatFinancePercent } from "@/lib/finance/finance-board";
import type { FactoringAccount } from "@/lib/types/finance";
import { ACCOUNTING_PROVIDERS } from "@/lib/finance/accounting-integrations";

type FactoringPanelProps = {
  accounts: FactoringAccount[];
};

export default function FactoringPanel({ accounts }: FactoringPanelProps) {
  return (
    <FinancePanelShell
      title="Factoring"
      subtitle="Advance rates, fees, reserves, and released funds."
    >
      {accounts.length === 0 ? (
        <FinanceEmpty
          title="No factoring accounts"
          description="Connect a factoring company to track advances and reserves."
        />
      ) : (
        <div className="space-y-2">
          {accounts.map((account) => (
            <article
              key={account.id}
              className="rounded-[14px] bg-white px-4 py-4 ring-1 ring-[#EAEAEA]"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-[15px] font-semibold text-slate-950">
                      {account.companyName}
                    </p>
                    <FinanceStatusBadge
                      label={account.status === "active" ? "Active" : "Paused"}
                      tone={account.status === "active" ? "success" : "disabled"}
                    />
                  </div>
                  <p className="mt-0.5 text-[13px] text-slate-500">
                    {account.invoicesFactored} invoices factored
                    {account.lastReleaseAt
                      ? ` · Last release ${account.lastReleaseAt}`
                      : ""}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[12px] font-medium text-slate-500">
                    Released funds
                  </p>
                  <p className="text-[18px] font-bold tabular-nums text-[#16A34A]">
                    {formatFinanceMoney(account.releasedFunds)}
                  </p>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-5">
                {[
                  {
                    label: "Advance",
                    value: formatFinancePercent(account.advancePercent),
                  },
                  {
                    label: "Fees",
                    value: formatFinancePercent(account.feePercent),
                  },
                  {
                    label: "Reserve %",
                    value: formatFinancePercent(account.reservePercent),
                  },
                  {
                    label: "Reserve held",
                    value: formatFinanceMoney(account.reserveHeld),
                  },
                  {
                    label: "Outstanding",
                    value: formatFinanceMoney(account.outstandingAdvance),
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-[10px] bg-[#F8FAFC] px-3 py-2"
                  >
                    <p className="text-[11px] font-medium text-slate-500">
                      {item.label}
                    </p>
                    <p className="text-[13px] font-semibold tabular-nums text-slate-900">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      )}

      <div className="rounded-[16px] bg-[#F8FAFC] p-4 ring-1 ring-[#EAEAEA]">
        <p className="text-[14px] font-semibold text-slate-900">
          Accounting integrations
        </p>
        <p className="mt-0.5 text-[13px] text-slate-500">
          QuickBooks, Xero, Stripe, and Plaid stubs are ready for connection.
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {ACCOUNTING_PROVIDERS.map((provider) => (
            <div
              key={provider.id}
              className="rounded-[12px] bg-white px-3 py-3 ring-1 ring-[#EAEAEA]"
            >
              <p className="text-[14px] font-semibold text-slate-900">
                {provider.name}
              </p>
              <p className="mt-0.5 text-[12px] text-slate-500">
                {provider.description}
              </p>
              <button
                type="button"
                disabled
                title="Integration not configured yet"
                className="mt-2 inline-flex h-8 items-center rounded-full bg-[#F8FAFC] px-3 text-[12px] font-semibold text-slate-400 ring-1 ring-[#EAEAEA]"
              >
                Connect soon
              </button>
            </div>
          ))}
        </div>
      </div>
    </FinancePanelShell>
  );
}
