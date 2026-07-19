import Link from "next/link";
import {
  COMPANY_CONTACT_ROLE_LABELS,
  COMPANY_DOCUMENT_TYPE_LABELS,
  COMPANY_LOCATION_KIND_LABELS,
  COMPANY_PAYMENT_RISK_LABELS,
  COMPANY_TYPE_LABELS,
  LOAD_STATUS_LABELS,
  type DirectoryCompany,
  type Load,
} from "@/lib/types";
import {
  formatCompanyDate,
  formatCompanyMoney,
  formatDetentionHours,
  formatPerformanceScore,
} from "@/lib/companies/company-board";
import { formatCompanyAddress } from "@/lib/data/companies";
import { formatLoadLane } from "@/lib/services/loads/load-helpers";
import type { CompanyDetailTab } from "@/components/companies/CompanyDetailTabs";
import { CARRIEROS_COLORS } from "@/lib/design-system/colors";

type CompanyTabPanelsProps = {
  company: DirectoryCompany;
  loads: Load[];
  activeTab: CompanyDetailTab;
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

function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-[14px] bg-[#F8FAFC] px-5 py-10 text-center ring-1 ring-[#EAEAEA]">
      <p className="text-[15px] font-semibold text-slate-900">{title}</p>
      <p className="mt-1 text-[14px] text-slate-500">{description}</p>
    </div>
  );
}

function OverviewPanel({ company }: { company: DirectoryCompany }) {
  const riskTone =
    company.paymentRisk === "high"
      ? CARRIEROS_COLORS.critical
      : company.paymentRisk === "medium"
        ? CARRIEROS_COLORS.warning
        : CARRIEROS_COLORS.success;

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <PanelCard title="Company">
        <dl className="grid gap-3 text-[14px]">
          {[
            ["Type", COMPANY_TYPE_LABELS[company.type]],
            ["MC", company.mcNumber ?? "—"],
            ["DOT", company.dotNumber ?? "—"],
            ["SCAC", company.scac ?? "—"],
            ["Phone", company.phone ?? "—"],
            ["Email", company.email ?? "—"],
            ["Website", company.website?.replace(/^https?:\/\//, "") ?? "—"],
            ["Address", formatCompanyAddress(company.address) || "—"],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between gap-4">
              <dt className="font-medium text-slate-500">{label}</dt>
              <dd className="text-right font-semibold text-slate-900">{value}</dd>
            </div>
          ))}
        </dl>
      </PanelCard>

      <PanelCard title="Alph performance">
        <dl className="grid gap-3 text-[14px]">
          {[
            ["Performance", formatPerformanceScore(company.performanceScore)],
            ["Avg detention", formatDetentionHours(company.averageDetentionHours)],
            ["Avg load value", company.averageLoadValue != null ? formatCompanyMoney(company.averageLoadValue) : "—"],
            ["Claims", String(company.claimsCount ?? 0)],
            ["Frequently used", company.frequentlyUsed ? "Yes" : "No"],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between gap-4">
              <dt className="font-medium text-slate-500">{label}</dt>
              <dd className="text-right font-semibold text-slate-900">{value}</dd>
            </div>
          ))}
        </dl>
      </PanelCard>

      <PanelCard title="Payment & risk">
        <div
          className={`mb-4 rounded-[12px] px-3 py-3 ring-1 ${riskTone.bg} ${riskTone.border}`}
        >
          <p className="text-[12px] font-medium text-slate-500">Payment risk</p>
          <p className={`mt-1 text-[18px] font-bold ${riskTone.text}`}>
            {company.paymentRisk
              ? COMPANY_PAYMENT_RISK_LABELS[company.paymentRisk]
              : "Not assessed"}
          </p>
        </div>
        <dl className="grid gap-3 text-[14px]">
          {[
            ["Terms", company.paymentTerms ?? "—"],
            [
              "Outstanding",
              company.outstandingBalance != null
                ? formatCompanyMoney(company.outstandingBalance)
                : "—",
            ],
            [
              "Lifetime revenue",
              company.totalRevenue != null
                ? formatCompanyMoney(company.totalRevenue)
                : "—",
            ],
            [
              "Avg payment days",
              company.avgPaymentDays != null
                ? `${company.avgPaymentDays} days`
                : "—",
            ],
            ["Last paid", formatCompanyDate(company.lastPaymentAt)],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between gap-4">
              <dt className="font-medium text-slate-500">{label}</dt>
              <dd className="text-right font-semibold text-slate-900">{value}</dd>
            </div>
          ))}
        </dl>
      </PanelCard>

      {company.preferredLanes && company.preferredLanes.length > 0 ? (
        <div className="lg:col-span-3">
          <PanelCard title="Preferred lanes">
            <div className="flex flex-wrap gap-2">
              {company.preferredLanes.map((lane) => (
                <span
                  key={lane}
                  className="rounded-full bg-[#EFF6FF] px-3 py-1.5 text-[13px] font-semibold text-[#2563EB]"
                >
                  {lane}
                </span>
              ))}
            </div>
          </PanelCard>
        </div>
      ) : null}

      {company.notes ? (
        <div className="lg:col-span-3">
          <PanelCard title="Internal note">
            <p className="text-[14px] leading-6 text-slate-700">{company.notes}</p>
          </PanelCard>
        </div>
      ) : null}
    </div>
  );
}

function ContactsPanel({ company }: { company: DirectoryCompany }) {
  if (company.contacts.length === 0) {
    return (
      <EmptyState
        title="No contacts"
        description="Add dispatcher, shipping, accounting, and other contacts."
      />
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {company.contacts.map((contact) => (
        <div
          key={contact.id}
          className="rounded-[16px] border border-[#EAEAEA] bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)]"
        >
          <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-slate-400">
            {COMPANY_CONTACT_ROLE_LABELS[contact.role]}
          </p>
          <p className="mt-2 text-[16px] font-semibold text-slate-950">
            {contact.name}
          </p>
          {contact.position ? (
            <p className="mt-0.5 text-[13px] text-slate-500">{contact.position}</p>
          ) : null}
          <dl className="mt-3 space-y-1.5 text-[14px]">
            {contact.phone ? (
              <div className="flex justify-between gap-2">
                <dt className="text-slate-500">Phone</dt>
                <dd className="font-semibold text-slate-800">
                  {contact.phone}
                  {contact.extension ? ` x${contact.extension}` : ""}
                </dd>
              </div>
            ) : null}
            {contact.mobile ? (
              <div className="flex justify-between gap-2">
                <dt className="text-slate-500">Mobile</dt>
                <dd className="font-semibold text-slate-800">{contact.mobile}</dd>
              </div>
            ) : null}
            {contact.email ? (
              <div className="flex justify-between gap-2">
                <dt className="text-slate-500">Email</dt>
                <dd className="truncate font-semibold text-slate-800">
                  {contact.email}
                </dd>
              </div>
            ) : null}
          </dl>
          <div className="mt-4 flex gap-2">
            {contact.phone || contact.mobile ? (
              <a
                href={`tel:${(contact.mobile ?? contact.phone ?? "").replace(/\D/g, "")}`}
                className="inline-flex h-8 flex-1 items-center justify-center rounded-lg bg-[#F8FAFC] text-[12px] font-semibold text-slate-700 ring-1 ring-[#EAEAEA] transition hover:bg-white"
              >
                Call
              </a>
            ) : null}
            {contact.email ? (
              <a
                href={`mailto:${contact.email}`}
                className="inline-flex h-8 flex-1 items-center justify-center rounded-lg bg-[#F8FAFC] text-[12px] font-semibold text-slate-700 ring-1 ring-[#EAEAEA] transition hover:bg-white"
              >
                Email
              </a>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}

function LocationsPanel({ company }: { company: DirectoryCompany }) {
  if (company.locations.length === 0) {
    return (
      <EmptyState
        title="No locations"
        description="Add headquarters, pickup, delivery, or warehouse locations."
      />
    );
  }

  const grouped = COMPANY_LOCATION_KIND_LABELS;

  return (
    <div className="space-y-4">
      {(Object.keys(grouped) as Array<keyof typeof grouped>).map((kind) => {
        const items = company.locations.filter((location) => location.kind === kind);
        if (items.length === 0) {
          return null;
        }

        return (
          <PanelCard key={kind} title={grouped[kind]}>
            <ul className="space-y-3">
              {items.map((location) => (
                <li
                  key={location.id}
                  className="rounded-[12px] bg-[#F8FAFC] px-4 py-3 ring-1 ring-[#EAEAEA]"
                >
                  <p className="text-[14px] font-semibold text-slate-950">
                    {location.name}
                  </p>
                  <p className="mt-1 text-[13px] text-slate-600">
                    {formatCompanyAddress(location.address) || "—"}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-slate-500">
                    {location.phone ? <span>{location.phone}</span> : null}
                    {location.hours ? <span>{location.hours}</span> : null}
                  </div>
                  {location.notes ? (
                    <p className="mt-2 text-[13px] text-slate-500">
                      {location.notes}
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          </PanelCard>
        );
      })}
    </div>
  );
}

function DocumentsPanel({ company }: { company: DirectoryCompany }) {
  if (company.documents.length === 0) {
    return (
      <EmptyState
        title="No documents"
        description="Upload contracts, W-9s, insurance, or rate agreements."
      />
    );
  }

  return (
    <PanelCard title="Documents">
      <ul className="space-y-3">
        {company.documents.map((doc) => (
          <li
            key={doc.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-[12px] bg-[#F8FAFC] px-4 py-3 ring-1 ring-[#EAEAEA]"
          >
            <div className="min-w-0">
              <p className="text-[14px] font-semibold text-slate-900">{doc.name}</p>
              <p className="text-[13px] text-slate-500">
                {COMPANY_DOCUMENT_TYPE_LABELS[doc.type]} ·{" "}
                {formatCompanyDate(doc.uploadedAt)}
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

function LoadsPanel({ loads }: { loads: Load[] }) {
  if (loads.length === 0) {
    return (
      <EmptyState
        title="No linked loads"
        description="Loads linked via broker or customer ID will appear here."
      />
    );
  }

  return (
    <PanelCard title="Loads with this company">
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
                  {formatCompanyMoney(load.rate)}
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

function PaymentsPanel({ company }: { company: DirectoryCompany }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {[
        {
          label: "Payment terms",
          value: company.paymentTerms ?? "—",
          hint: "Agreed settlement terms",
        },
        {
          label: "Average payment time",
          value:
            company.avgPaymentDays != null
              ? `${company.avgPaymentDays} days`
              : "—",
          hint: "Across settled invoices",
        },
        {
          label: "Last payment",
          value: formatCompanyDate(company.lastPaymentAt),
          hint: "Most recent cleared payment",
        },
        {
          label: "Outstanding balance",
          value:
            company.outstandingBalance != null
              ? formatCompanyMoney(company.outstandingBalance)
              : "—",
          hint: "Open receivables",
          warn: (company.outstandingBalance ?? 0) > 0,
        },
        {
          label: "Lifetime revenue",
          value:
            company.totalRevenue != null
              ? formatCompanyMoney(company.totalRevenue)
              : "—",
          hint: "Total booked with this company",
        },
        {
          label: "Payment risk",
          value: company.paymentRisk
            ? COMPANY_PAYMENT_RISK_LABELS[company.paymentRisk]
            : "—",
          hint: "Alph payment assessment",
          warn: company.paymentRisk === "high" || company.paymentRisk === "medium",
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

function NotesPanel({ company }: { company: DirectoryCompany }) {
  if (company.noteEntries.length === 0) {
    return (
      <EmptyState
        title="No notes"
        description="Add internal notes about this company relationship."
      />
    );
  }

  return (
    <PanelCard title="Notes">
      <ul className="space-y-3">
        {company.noteEntries.map((note) => (
          <li
            key={note.id}
            className="rounded-[12px] bg-[#F8FAFC] px-4 py-3 ring-1 ring-[#EAEAEA]"
          >
            <p className="text-[14px] leading-6 text-slate-800">{note.body}</p>
            <p className="mt-2 text-[12px] font-medium text-slate-500">
              {note.author} · {formatCompanyDate(note.createdAt)}
            </p>
          </li>
        ))}
      </ul>
    </PanelCard>
  );
}

function TimelinePanel({ company }: { company: DirectoryCompany }) {
  if (company.timeline.length === 0) {
    return (
      <EmptyState
        title="No activity yet"
        description="Loads, payments, and alerts will build this timeline."
      />
    );
  }

  return (
    <PanelCard title="Timeline">
      <ol className="relative space-y-4 border-l border-[#EAEAEA] pl-5">
        {company.timeline.map((event) => (
          <li key={event.id} className="relative">
            <span className="absolute -left-[1.4rem] top-1.5 h-2.5 w-2.5 rounded-full bg-[#2563EB] ring-4 ring-white" />
            <p className="text-[14px] font-semibold text-slate-950">
              {event.label}
            </p>
            {event.detail ? (
              <p className="text-[13px] text-slate-500">{event.detail}</p>
            ) : null}
            <p className="mt-1 text-[12px] font-medium text-slate-400">
              {formatCompanyDate(event.occurredAt)}
            </p>
          </li>
        ))}
      </ol>
    </PanelCard>
  );
}

export default function CompanyTabPanels({
  company,
  loads,
  activeTab,
}: CompanyTabPanelsProps) {
  switch (activeTab) {
    case "contacts":
      return <ContactsPanel company={company} />;
    case "locations":
      return <LocationsPanel company={company} />;
    case "documents":
      return <DocumentsPanel company={company} />;
    case "loads":
      return <LoadsPanel loads={loads} />;
    case "payments":
      return <PaymentsPanel company={company} />;
    case "notes":
      return <NotesPanel company={company} />;
    case "timeline":
      return <TimelinePanel company={company} />;
    case "overview":
    default:
      return <OverviewPanel company={company} />;
  }
}
