import Link from "next/link";
import {
  BROKER_CONTACT_ROLE_LABELS,
  BROKER_DOCUMENT_TYPE_LABELS,
  BROKER_PAYMENT_METHOD_LABELS,
  LOAD_STATUS_LABELS,
  type Broker,
  type Load,
} from "@/lib/types";
import {
  formatBrokerDate,
  formatBrokerMoney,
  formatBrokerRating,
  formatPaymentDays,
  formatPerformanceScore,
} from "@/lib/brokers/broker-board";
import { formatLoadLane } from "@/lib/services/loads/load-helpers";
import type { BrokerDetailTab } from "@/components/brokers/BrokerDetailTabs";
import { CARRIEROS_COLORS } from "@/lib/design-system/colors";

type BrokerTabPanelsProps = {
  broker: Broker;
  loads: Load[];
  activeTab: BrokerDetailTab;
};

function PanelCard({
  title,
  children,
  action,
}: {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section className="rounded-[16px] border border-[#EAEAEA] bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-[16px] font-semibold text-slate-950">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-[14px] bg-[#F8FAFC] px-5 py-10 text-center ring-1 ring-[#EAEAEA]">
      <p className="text-[15px] font-semibold text-slate-900">{title}</p>
      <p className="mt-1 text-[14px] text-slate-500">{description}</p>
    </div>
  );
}

function OverviewPanel({ broker }: { broker: Broker }) {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <PanelCard title="Company">
        <dl className="grid gap-3 text-[14px]">
          {[
            ["MC", broker.mcNumber ?? "—"],
            ["DOT", broker.dotNumber ?? "—"],
            ["Phone", broker.phone ?? "—"],
            ["Email", broker.email ?? "—"],
            ["Website", broker.website?.replace(/^https?:\/\//, "") ?? "—"],
            ["Home base", broker.homeBase ?? "—"],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between gap-4">
              <dt className="font-medium text-slate-500">{label}</dt>
              <dd className="text-right font-semibold text-slate-900">{value}</dd>
            </div>
          ))}
        </dl>
      </PanelCard>

      <PanelCard title="Performance">
        <dl className="grid gap-3 text-[14px]">
          {[
            ["Rating", formatBrokerRating(broker.rating)],
            ["Score", formatPerformanceScore(broker.performanceScore)],
            ["Detention", String(broker.detentionIncidents ?? 0)],
            ["Claims", String(broker.claimsCount ?? 0)],
            ["Late payments", String(broker.latePaymentCount ?? 0)],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between gap-4">
              <dt className="font-medium text-slate-500">{label}</dt>
              <dd className="text-right font-semibold text-slate-900">{value}</dd>
            </div>
          ))}
        </dl>
      </PanelCard>

      <PanelCard title="Payment snapshot">
        <dl className="grid gap-3 text-[14px]">
          {[
            ["Terms", broker.paymentTerms],
            ["Method", BROKER_PAYMENT_METHOD_LABELS[broker.paymentMethod]],
            ["Avg days", formatPaymentDays(broker.avgPaymentDays)],
            ["Last paid", formatBrokerDate(broker.lastPaymentAt)],
            ["Outstanding", formatBrokerMoney(broker.outstandingBalance)],
            ["Lifetime revenue", formatBrokerMoney(broker.totalRevenue)],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between gap-4">
              <dt className="font-medium text-slate-500">{label}</dt>
              <dd className="text-right font-semibold text-slate-900">{value}</dd>
            </div>
          ))}
        </dl>
      </PanelCard>

      {broker.notes ? (
        <div className="lg:col-span-3">
          <PanelCard title="Internal note">
            <p className="text-[14px] leading-6 text-slate-700">{broker.notes}</p>
          </PanelCard>
        </div>
      ) : null}
    </div>
  );
}

function LoadsPanel({ loads }: { loads: Load[] }) {
  if (loads.length === 0) {
    return (
      <EmptyState
        title="No loads yet"
        description="Loads booked with this broker will show up here."
      />
    );
  }

  return (
    <PanelCard title="Loads with this broker">
      <ul className="divide-y divide-[#F1F5F9]">
        {loads.map((load) => (
          <li key={load.id}>
            <Link
              href={`/loads/${load.id}`}
              className="flex flex-col gap-1 py-3 transition hover:bg-[#F8FAFC] sm:flex-row sm:items-center sm:justify-between sm:gap-4"
            >
              <div className="min-w-0">
                <p className="text-[14px] font-semibold text-slate-950">
                  {load.reference}
                </p>
                <p className="truncate text-[13px] text-slate-500">
                  {formatLoadLane(load)}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <span className="text-[13px] font-semibold tabular-nums text-slate-800">
                  {formatBrokerMoney(load.rate)}
                </span>
                <span className="rounded-full bg-[#F8FAFC] px-2.5 py-1 text-[12px] font-semibold text-slate-600 ring-1 ring-[#EAEAEA]">
                  {LOAD_STATUS_LABELS[load.status]}
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </PanelCard>
  );
}

function PaymentsPanel({ broker }: { broker: Broker }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {[
        {
          label: "Standard Terms",
          value: broker.paymentTerms,
          hint: BROKER_PAYMENT_METHOD_LABELS[broker.paymentMethod],
        },
        {
          label: "Quick Pay",
          value:
            broker.paymentMethod === "quick_pay" ? "Enabled" : "Not preferred",
          hint:
            broker.paymentMethod === "quick_pay"
              ? formatPaymentDays(broker.avgPaymentDays)
              : "Uses standard or factoring",
        },
        {
          label: "Factoring",
          value:
            broker.paymentMethod === "factoring" ? "Active" : "Not in use",
          hint:
            broker.paymentMethod === "factoring"
              ? broker.paymentTerms
              : "No factor on file",
        },
        {
          label: "Last Payment",
          value: formatBrokerDate(broker.lastPaymentAt),
          hint: "Most recent cleared payment",
        },
        {
          label: "Average Payment Time",
          value: formatPaymentDays(broker.avgPaymentDays),
          hint: "Across settled invoices",
        },
        {
          label: "Outstanding Balance",
          value: formatBrokerMoney(broker.outstandingBalance),
          hint: "Open receivables",
          warn: broker.outstandingBalance > 0,
        },
      ].map((card) => (
        <div
          key={card.label}
          className={`rounded-[16px] border p-5 ${
            card.warn
              ? `${CARRIEROS_COLORS.warning.bg} ${CARRIEROS_COLORS.warning.border}`
              : "border-[#EAEAEA] bg-white"
          }`}
        >
          <p className="text-[12px] font-medium text-slate-500">{card.label}</p>
          <p
            className={`mt-2 text-[22px] font-bold tracking-tight ${
              card.warn ? CARRIEROS_COLORS.warning.text : "text-slate-950"
            }`}
          >
            {card.value}
          </p>
          <p className="mt-1 text-[13px] text-slate-500">{card.hint}</p>
        </div>
      ))}
    </div>
  );
}

function DocumentsPanel({ broker }: { broker: Broker }) {
  if (broker.documents.length === 0) {
    return (
      <EmptyState
        title="No documents"
        description="Upload a broker packet, agreement, or rate confirmation."
      />
    );
  }

  return (
    <PanelCard title="Documents">
      <ul className="space-y-3">
        {broker.documents.map((doc) => (
          <li
            key={doc.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-[12px] bg-[#F8FAFC] px-4 py-3 ring-1 ring-[#EAEAEA]"
          >
            <div className="min-w-0">
              <p className="text-[14px] font-semibold text-slate-900">{doc.name}</p>
              <p className="text-[13px] text-slate-500">
                {BROKER_DOCUMENT_TYPE_LABELS[doc.type]} ·{" "}
                {formatBrokerDate(doc.uploadedAt)}
              </p>
            </div>
            <span
              className={`rounded-full px-2.5 py-1 text-[12px] font-semibold ring-1 ${
                doc.status === "on_file"
                  ? `${CARRIEROS_COLORS.success.bg} ${CARRIEROS_COLORS.success.text} ${CARRIEROS_COLORS.success.border}`
                  : doc.status === "expired"
                    ? `${CARRIEROS_COLORS.critical.bg} ${CARRIEROS_COLORS.critical.text} ${CARRIEROS_COLORS.critical.border}`
                    : `${CARRIEROS_COLORS.warning.bg} ${CARRIEROS_COLORS.warning.text} ${CARRIEROS_COLORS.warning.border}`
              }`}
            >
              {doc.status === "on_file"
                ? "On file"
                : doc.status === "expired"
                  ? "Expired"
                  : "Pending"}
            </span>
          </li>
        ))}
      </ul>
    </PanelCard>
  );
}

function ContactsPanel({ broker }: { broker: Broker }) {
  if (broker.contacts.length === 0) {
    return (
      <EmptyState
        title="No contacts"
        description="Add dispatcher, accounting, and safety contacts."
      />
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {broker.contacts.map((contact) => (
        <div
          key={contact.id}
          className="rounded-[16px] border border-[#EAEAEA] bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)]"
        >
          <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-slate-400">
            {BROKER_CONTACT_ROLE_LABELS[contact.role]}
          </p>
          <p className="mt-2 text-[16px] font-semibold text-slate-950">
            {contact.name}
          </p>
          <p className="mt-3 text-[14px] text-slate-700">{contact.phone}</p>
          <p className="text-[14px] text-slate-500">{contact.email}</p>
          <div className="mt-4 flex gap-2">
            <a
              href={`tel:${contact.phone.replace(/\D/g, "")}`}
              className="inline-flex h-8 flex-1 items-center justify-center rounded-lg bg-[#F8FAFC] text-[12px] font-semibold text-slate-700 ring-1 ring-[#EAEAEA] transition hover:bg-white"
            >
              Call
            </a>
            <a
              href={`mailto:${contact.email}`}
              className="inline-flex h-8 flex-1 items-center justify-center rounded-lg bg-[#F8FAFC] text-[12px] font-semibold text-slate-700 ring-1 ring-[#EAEAEA] transition hover:bg-white"
            >
              Email
            </a>
          </div>
        </div>
      ))}
    </div>
  );
}

function RateHistoryPanel({ broker }: { broker: Broker }) {
  if (broker.rateHistory.length === 0) {
    return (
      <EmptyState
        title="No rate history"
        description="Accepted rates with this broker will appear here."
      />
    );
  }

  return (
    <PanelCard title="Rate history">
      <ul className="divide-y divide-[#F1F5F9]">
        {broker.rateHistory.map((entry) => (
          <li
            key={entry.id}
            className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="text-[14px] font-semibold text-slate-950">
                {entry.lane}
              </p>
              <p className="text-[13px] text-slate-500">
                {entry.equipment} · {entry.miles.toLocaleString()} mi ·{" "}
                {formatBrokerDate(entry.occurredAt)}
                {entry.loadReference ? ` · ${entry.loadReference}` : ""}
              </p>
            </div>
            <p className="text-[16px] font-bold tabular-nums text-slate-950">
              {formatBrokerMoney(entry.rate)}
            </p>
          </li>
        ))}
      </ul>
    </PanelCard>
  );
}

function NotesPanel({ broker }: { broker: Broker }) {
  if (broker.noteEntries.length === 0) {
    return (
      <EmptyState
        title="No notes"
        description="Add internal notes about this broker relationship."
      />
    );
  }

  return (
    <PanelCard title="Notes">
      <ul className="space-y-3">
        {broker.noteEntries.map((note) => (
          <li
            key={note.id}
            className="rounded-[12px] bg-[#F8FAFC] px-4 py-3 ring-1 ring-[#EAEAEA]"
          >
            <p className="text-[14px] leading-6 text-slate-800">{note.body}</p>
            <p className="mt-2 text-[12px] font-medium text-slate-500">
              {note.author} · {formatBrokerDate(note.createdAt)}
            </p>
          </li>
        ))}
      </ul>
    </PanelCard>
  );
}

function TimelinePanel({ broker }: { broker: Broker }) {
  if (broker.timeline.length === 0) {
    return (
      <EmptyState
        title="No activity yet"
        description="Payments, loads, and alerts will build this timeline."
      />
    );
  }

  return (
    <PanelCard title="Timeline">
      <ol className="relative space-y-4 border-l border-[#EAEAEA] pl-5">
        {broker.timeline.map((event) => (
          <li key={event.id} className="relative">
            <span className="absolute -left-[1.4rem] top-1.5 h-2.5 w-2.5 rounded-full bg-[#2563EB] ring-4 ring-white" />
            <p className="text-[14px] font-semibold text-slate-950">
              {event.label}
            </p>
            {event.detail ? (
              <p className="text-[13px] text-slate-500">{event.detail}</p>
            ) : null}
            <p className="mt-1 text-[12px] font-medium text-slate-400">
              {formatBrokerDate(event.occurredAt)}
            </p>
          </li>
        ))}
      </ol>
    </PanelCard>
  );
}

export default function BrokerTabPanels({
  broker,
  loads,
  activeTab,
}: BrokerTabPanelsProps) {
  switch (activeTab) {
    case "loads":
      return <LoadsPanel loads={loads} />;
    case "payments":
      return <PaymentsPanel broker={broker} />;
    case "documents":
      return <DocumentsPanel broker={broker} />;
    case "contacts":
      return <ContactsPanel broker={broker} />;
    case "rate_history":
      return <RateHistoryPanel broker={broker} />;
    case "notes":
      return <NotesPanel broker={broker} />;
    case "timeline":
      return <TimelinePanel broker={broker} />;
    case "overview":
    default:
      return <OverviewPanel broker={broker} />;
  }
}
