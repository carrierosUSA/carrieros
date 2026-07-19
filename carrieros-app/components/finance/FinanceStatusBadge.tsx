import { CARRIEROS_COLORS } from "@/lib/design-system/colors";
import type {
  BrokerPaymentStatus,
  FinanceInvoiceStatus,
  PayrollSettlementStatus,
  RevenueStatus,
} from "@/lib/types/finance";
import {
  BROKER_PAYMENT_STATUS_LABELS,
  FINANCE_INVOICE_STATUS_LABELS,
  REVENUE_STATUS_LABELS,
} from "@/lib/types/finance";

type Tone = keyof typeof CARRIEROS_COLORS;

function toneClasses(tone: Tone) {
  const c = CARRIEROS_COLORS[tone];
  return `${c.bg} ${c.text}`;
}

export function revenueStatusTone(status: RevenueStatus): Tone {
  switch (status) {
    case "paid":
      return "success";
    case "pending":
      return "info";
    case "overdue":
      return "critical";
    case "invoiced":
      return "warning";
  }
}

export function invoiceStatusTone(status: FinanceInvoiceStatus): Tone {
  switch (status) {
    case "paid":
      return "success";
    case "draft":
    case "sent":
      return "info";
    case "overdue":
      return "critical";
    case "partial":
      return "warning";
  }
}

export function brokerPaymentStatusTone(status: BrokerPaymentStatus): Tone {
  switch (status) {
    case "paid":
    case "factored":
      return "success";
    case "outstanding":
      return "info";
    case "partial":
      return "warning";
    case "overdue":
      return "critical";
  }
}

export function payrollStatusTone(status: PayrollSettlementStatus): Tone {
  switch (status) {
    case "paid":
      return "success";
    case "ready":
      return "info";
    case "draft":
      return "disabled";
  }
}

type FinanceStatusBadgeProps = {
  label: string;
  tone: Tone;
};

export default function FinanceStatusBadge({
  label,
  tone,
}: FinanceStatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[12px] font-semibold ${toneClasses(tone)}`}
    >
      {label}
    </span>
  );
}

export function RevenueStatusBadge({ status }: { status: RevenueStatus }) {
  return (
    <FinanceStatusBadge
      label={REVENUE_STATUS_LABELS[status]}
      tone={revenueStatusTone(status)}
    />
  );
}

export function InvoiceStatusBadge({ status }: { status: FinanceInvoiceStatus }) {
  return (
    <FinanceStatusBadge
      label={FINANCE_INVOICE_STATUS_LABELS[status]}
      tone={invoiceStatusTone(status)}
    />
  );
}

export function BrokerPaymentStatusBadge({
  status,
}: {
  status: BrokerPaymentStatus;
}) {
  return (
    <FinanceStatusBadge
      label={BROKER_PAYMENT_STATUS_LABELS[status]}
      tone={brokerPaymentStatusTone(status)}
    />
  );
}

export function PayrollStatusBadge({
  status,
}: {
  status: PayrollSettlementStatus;
}) {
  const labels = { draft: "Draft", ready: "Ready", paid: "Paid" } as const;
  return (
    <FinanceStatusBadge label={labels[status]} tone={payrollStatusTone(status)} />
  );
}
