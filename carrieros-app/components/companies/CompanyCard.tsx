"use client";

import Link from "next/link";
import CompanyStatusBadge from "@/components/companies/CompanyStatusBadge";
import CompanyTypeBadge from "@/components/companies/CompanyTypeBadge";
import {
  buildMailtoUrl,
  buildSmsUrl,
  buildTelUrl,
  openCommunicationUrl,
} from "@/lib/dispatch/communication";
import {
  formatCompanyCityState,
  formatCompanyAddress,
} from "@/lib/data/companies";
import {
  getCompanyInitials,
  getPrimaryCompanyContact,
} from "@/lib/companies/company-board";
import type { DirectoryCompany } from "@/lib/types";

type CompanyCardProps = {
  company: DirectoryCompany;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
};

function ContactButton({
  label,
  href,
  disabled,
  disabledReason,
}: {
  label: string;
  href?: string;
  disabled?: boolean;
  disabledReason?: string;
}) {
  return (
    <button
      type="button"
      disabled={disabled || !href}
      title={disabled ? disabledReason : undefined}
      onClick={() => href && openCommunicationUrl(href)}
      className="inline-flex h-8 flex-1 items-center justify-center rounded-lg bg-[#F8FAFC] text-[12px] font-semibold text-slate-700 ring-1 ring-[#EAEAEA] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
    >
      {label}
    </button>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="font-medium text-slate-400">{label}</dt>
      <dd className="truncate font-semibold text-slate-800">{value}</dd>
    </div>
  );
}

export default function CompanyCard({
  company,
  isFavorite,
  onToggleFavorite,
}: CompanyCardProps) {
  const primary = getPrimaryCompanyContact(company);
  const phone = company.phone ?? primary?.phone ?? primary?.mobile ?? "";
  const email = company.email ?? primary?.email ?? "";
  const telUrl = buildTelUrl(phone);
  const smsUrl = buildSmsUrl(phone);
  const mailUrl = buildMailtoUrl(
    email,
    `Message for ${company.name}`,
    `Hi ${primary?.name?.split(" ")[0] ?? "there"},\n\n`,
  );
  const location =
    formatCompanyCityState(company.address) ||
    formatCompanyAddress(company.address) ||
    "—";

  return (
    <Link
      href={`/companies/${company.id}`}
      className="group relative block rounded-[16px] border border-[#EAEAEA] bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.05)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(15,23,42,0.08)]"
    >
      <button
        type="button"
        aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        title={isFavorite ? "Remove from favorites" : "Add to favorites"}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          onToggleFavorite(company.id);
        }}
        className={`absolute right-4 top-4 inline-flex h-8 w-8 items-center justify-center rounded-full text-[16px] transition ${
          isFavorite
            ? "bg-[#FFF7ED] text-[#EA580C]"
            : "bg-[#F8FAFC] text-slate-400 hover:text-[#EA580C]"
        } ring-1 ring-[#EAEAEA]`}
      >
        {isFavorite ? "★" : "☆"}
      </button>

      <div className="flex items-start gap-3 pr-10">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-[14px] bg-[#EFF6FF] text-[15px] font-bold text-[#2563EB]">
          {company.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={company.logoUrl}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            getCompanyInitials(company.name)
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-[16px] font-semibold text-slate-950 group-hover:text-[#2563EB]">
              {company.name}
            </h3>
            <CompanyStatusBadge status={company.status} />
          </div>
          <div className="mt-1.5">
            <CompanyTypeBadge type={company.type} />
          </div>
          <p className="mt-1.5 text-[13px] text-slate-500">
            {[company.mcNumber, company.dotNumber, company.scac]
              .filter(Boolean)
              .join(" · ") || "No authority on file"}
          </p>
        </div>
      </div>

      <div className="mt-4 flex gap-2" onClick={(event) => event.preventDefault()}>
        <ContactButton
          label="Call"
          href={telUrl}
          disabled={!telUrl}
          disabledReason="No phone on file"
        />
        <ContactButton
          label="Message"
          href={smsUrl}
          disabled={!smsUrl}
          disabledReason="No phone on file"
        />
        <ContactButton
          label="Email"
          href={mailUrl}
          disabled={!mailUrl}
          disabledReason="No email on file"
        />
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-x-3 gap-y-2.5 text-[12px]">
        <MetaRow label="Address" value={location} />
        <MetaRow label="Phone" value={phone || "—"} />
        <MetaRow label="Email" value={email || "—"} />
        <MetaRow
          label="Website"
          value={company.website?.replace(/^https?:\/\//, "") ?? "—"}
        />
        <MetaRow label="MC" value={company.mcNumber ?? "—"} />
        <MetaRow label="DOT" value={company.dotNumber ?? "—"} />
        <MetaRow label="SCAC" value={company.scac ?? "—"} />
        <MetaRow label="Contact" value={primary?.name ?? "—"} />
      </dl>
    </Link>
  );
}
