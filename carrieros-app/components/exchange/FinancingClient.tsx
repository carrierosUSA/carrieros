"use client";

import { useState } from "react";
import { TRANSPO_COLORS } from "@/lib/design-system/colors";
import { formatMoney } from "@/lib/exchange/board";
import { listFinancing, submitFinancingApplication } from "@/lib/exchange/store";
import {
  FINANCING_PRODUCT_LABELS,
  type FinancingApplication,
  type FinancingProductType,
} from "@/lib/exchange/types";

const STATUS_LABEL: Record<FinancingApplication["status"], string> = {
  draft: "Draft",
  submitted: "Submitted",
  under_review: "Under review (demo)",
  approved_demo: "Approved (demo)",
  declined_demo: "Declined (demo)",
  funded_demo: "Funded (demo)",
};

export default function FinancingClient({
  initial,
}: {
  initial: FinancingApplication[];
}) {
  const [apps, setApps] = useState(initial);
  const [product, setProduct] = useState<FinancingProductType>("equipment");
  const [amount, setAmount] = useState("50000");
  const [termMonths, setTermMonths] = useState("48");
  const [businessName, setBusinessName] = useState("Reyes Logistics LLC");
  const [contactName, setContactName] = useState("Jordan Reyes");

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
      <form
        className="space-y-4 rounded-[16px] bg-[#F8F9FB] p-5"
        onSubmit={(e) => {
          e.preventDefault();
          submitFinancingApplication({
            product,
            amount: Number(amount) || 0,
            termMonths: Number(termMonths) || 12,
            businessName,
            contactName,
          });
          setApps(listFinancing());
        }}
      >
        <div>
          <h2 className="transpo-section-title text-[17px]">Apply (demo pipeline)</h2>
          <p className={`mt-1 text-[13px] ${TRANSPO_COLORS.warning.text}`}>
            Architecture-ready financing UI — not a live lender decision.
          </p>
        </div>
        <label className="block space-y-1.5">
          <span className="transpo-label text-[13px]">Product</span>
          <select
            value={product}
            onChange={(e) => setProduct(e.target.value as FinancingProductType)}
            className="w-full rounded-[12px] bg-white px-3 py-2.5 text-[14px]"
          >
            {(Object.keys(FINANCING_PRODUCT_LABELS) as FinancingProductType[]).map((p) => (
              <option key={p} value={p}>
                {FINANCING_PRODUCT_LABELS[p]}
              </option>
            ))}
          </select>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="space-y-1.5">
            <span className="transpo-label text-[13px]">Amount</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded-[12px] bg-white px-3 py-2.5 text-[14px]"
            />
          </label>
          <label className="space-y-1.5">
            <span className="transpo-label text-[13px]">Term (months)</span>
            <input
              type="number"
              value={termMonths}
              onChange={(e) => setTermMonths(e.target.value)}
              className="w-full rounded-[12px] bg-white px-3 py-2.5 text-[14px]"
            />
          </label>
        </div>
        <label className="block space-y-1.5">
          <span className="transpo-label text-[13px]">Business name</span>
          <input
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            className="w-full rounded-[12px] bg-white px-3 py-2.5 text-[14px]"
          />
        </label>
        <label className="block space-y-1.5">
          <span className="transpo-label text-[13px]">Contact</span>
          <input
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
            className="w-full rounded-[12px] bg-white px-3 py-2.5 text-[14px]"
          />
        </label>
        <button type="submit" className="transpo-btn-primary">
          Submit application
        </button>
      </form>

      <section className="space-y-3">
        <h2 className="transpo-section-title text-[17px]">Applications</h2>
        {apps.map((app) => (
          <article key={app.id} className="rounded-[16px] bg-[#F8F9FB] p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[15px] font-semibold">
                  {FINANCING_PRODUCT_LABELS[app.product]}
                </p>
                <p className="mt-1 text-[13px] text-[#6B7280]">
                  {app.businessName} · {app.termMonths} mo · {STATUS_LABEL[app.status]}
                </p>
                <p className="mt-2 text-[12px] text-[#6B7280]">{app.notes}</p>
              </div>
              <p className="text-[16px] font-bold">{formatMoney(app.amount)}</p>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
