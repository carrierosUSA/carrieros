"use client";

import { useRouter } from "next/navigation";
import {
  buildMailtoUrl,
  buildSmsUrl,
  buildTelUrl,
  openCommunicationUrl,
} from "@/lib/dispatch/communication";
import { getPrimaryCompanyContact } from "@/lib/companies/company-board";
import type { DirectoryCompany } from "@/lib/types";

type CompanyQuickActionsProps = {
  company: DirectoryCompany;
};

function ActionButton({
  label,
  href,
  onClick,
  primary,
  disabled,
  title,
}: {
  label: string;
  href?: string;
  onClick?: () => void;
  primary?: boolean;
  disabled?: boolean;
  title?: string;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      title={title}
      onClick={() => {
        if (onClick) {
          onClick();
          return;
        }

        if (href) {
          openCommunicationUrl(href);
        }
      }}
      className={`inline-flex h-9 items-center justify-center rounded-full px-4 text-[13px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
        primary
          ? "bg-[#2563EB] text-white hover:bg-[#1D4ED8]"
          : "bg-[#F8FAFC] text-slate-700 ring-1 ring-[#EAEAEA] hover:bg-white"
      }`}
    >
      {label}
    </button>
  );
}

export default function CompanyQuickActions({
  company,
}: CompanyQuickActionsProps) {
  const router = useRouter();
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
  const createDisabled = company.status === "inactive";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <ActionButton
        label="+ Create Load"
        primary
        disabled={createDisabled}
        title={
          createDisabled
            ? "Company is inactive — reactivate before booking"
            : "Create a new load with this company"
        }
        onClick={() => router.push("/loads/new")}
      />
      <ActionButton
        label="Call"
        href={telUrl}
        disabled={!telUrl}
        title={telUrl ? "Call company" : "No phone on file"}
      />
      <ActionButton
        label="Message"
        href={smsUrl}
        disabled={!smsUrl}
        title={smsUrl ? "Text company" : "No phone on file"}
      />
      <ActionButton
        label="Email"
        href={mailUrl}
        disabled={!mailUrl}
        title={mailUrl ? "Email company" : "No email on file"}
      />
      <ActionButton
        label="Add Contact"
        onClick={() => router.push(`/companies/${company.id}?tab=contacts`)}
      />
      <ActionButton
        label="Add Location"
        onClick={() => router.push(`/companies/${company.id}?tab=locations`)}
      />
      <ActionButton
        label="Upload Document"
        onClick={() => router.push(`/companies/${company.id}?tab=documents`)}
      />
      <ActionButton
        label="View Company History"
        onClick={() => router.push(`/companies/${company.id}?tab=timeline`)}
      />
    </div>
  );
}
