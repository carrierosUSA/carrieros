"use client";

import { useMemo, useState } from "react";
import { Download } from "lucide-react";
import { usePortal } from "@/components/portal/PortalProvider";
import {
  PortalBadge,
  PortalCard,
  PortalEmpty,
  PortalSectionTitle,
  PortalStat,
} from "@/components/portal/ui";
import { getPortalInvoicesForSession } from "@/lib/portal/data";
import { FINANCE_INVOICE_STATUS_LABELS } from "@/lib/types/finance";
import PermissionButton from "@/components/portal/PermissionButton";

export default function PortalInvoices() {
  const { session } = usePortal();
  const [toast, setToast] = useState<string | null>(null);

  const invoices = useMemo(
    () => (session ? getPortalInvoicesForSession(session) : []),
    [session],
  );

  if (!session) return null;

  const outstanding = invoices
    .filter((i) => i.status !== "paid")
    .reduce((sum, i) => sum + Math.max(0, i.amount - i.amountPaid), 0);
  const paid = invoices.filter((i) => i.status === "paid");
  const open = invoices.filter((i) => i.status !== "paid");

  function toneFor(
    status: string,
  ): "gray" | "blue" | "green" | "orange" | "red" {
    if (status === "paid") return "green";
    if (status === "overdue") return "red";
    if (status === "sent" || status === "partial") return "orange";
    return "gray";
  }

  return (
    <div className="space-y-6">
      <PortalSectionTitle
        title="Invoices"
        subtitle="Payment status, due dates, and downloadable invoice PDFs."
      />

      {toast ? (
        <div className="rounded-xl bg-[#ECFDF3] px-4 py-3 text-sm font-medium text-[#166534]">
          {toast}
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-3">
        <PortalStat
          label="Outstanding balance"
          value={`$${outstanding.toLocaleString()}`}
          tone={outstanding > 0 ? "warning" : "success"}
        />
        <PortalStat label="Open invoices" value={open.length} tone="info" />
        <PortalStat label="Paid" value={paid.length} tone="success" />
      </div>

      <PortalCard>
        {invoices.length === 0 ? (
          <PortalEmpty
            title="No invoices yet"
            body="Invoices linked to your company loads will show here."
          />
        ) : (
          <ul className="divide-y divide-[#F3F4F6]">
            {invoices.map((inv) => (
              <li
                key={inv.id}
                className="flex flex-wrap items-center justify-between gap-3 py-3.5"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-[#111827]">
                      {inv.invoiceNumber}
                    </p>
                    <PortalBadge tone={toneFor(inv.status)}>
                      {FINANCE_INVOICE_STATUS_LABELS[inv.status] ?? inv.status}
                    </PortalBadge>
                  </div>
                  <p className="mt-1 text-sm text-[#6B7280]">
                    {inv.loadReference ?? "—"} · Due{" "}
                    {new Date(inv.dueDate).toLocaleDateString()} · $
                    {inv.amount.toLocaleString()}
                    {inv.amountPaid > 0
                      ? ` · Paid $${inv.amountPaid.toLocaleString()}`
                      : ""}
                  </p>
                  {inv.paidAt ? (
                    <p className="mt-0.5 text-[12px] font-medium text-[#16A34A]">
                      Paid {new Date(inv.paidAt).toLocaleDateString()}
                    </p>
                  ) : null}
                </div>
                <PermissionButton
                  role={session.role}
                  permission="view_invoices"
                  onClick={() =>
                    setToast(
                      `Opening ${inv.pdfName ?? `${inv.invoiceNumber}.pdf`}…`,
                    )
                  }
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#F5F7FA] px-3 py-2 text-[13px] font-semibold text-[#374151]"
                >
                  <Download className="h-3.5 w-3.5" />
                  PDF
                </PermissionButton>
              </li>
            ))}
          </ul>
        )}
      </PortalCard>

      {paid.length > 0 ? (
        <PortalCard>
          <h3 className="carrieros-card-title mb-3">Payment history</h3>
          <ul className="space-y-2">
            {paid.slice(0, 6).map((inv) => (
              <li
                key={`hist-${inv.id}`}
                className="flex justify-between gap-3 rounded-xl bg-[#F8F9FB] px-3 py-2.5 text-sm"
              >
                <span className="font-medium text-[#111827]">
                  {inv.invoiceNumber}
                </span>
                <span className="text-[#6B7280]">
                  ${inv.amountPaid.toLocaleString()} ·{" "}
                  {inv.paidAt
                    ? new Date(inv.paidAt).toLocaleDateString()
                    : "—"}
                </span>
              </li>
            ))}
          </ul>
        </PortalCard>
      ) : null}
    </div>
  );
}
