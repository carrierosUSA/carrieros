"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  buildMailtoUrl,
  buildSmsUrl,
  buildTelUrl,
  openCommunicationUrl,
} from "@/lib/dispatch/communication";
import type { Driver } from "@/lib/types";

type DriverQuickActionsProps = {
  driver: Driver;
  variant?: "header" | "bar";
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
          : "bg-[#F8FAFC] text-slate-700 ring-1 ring-[#E5E7EB] hover:bg-white"
      }`}
    >
      {label}
    </button>
  );
}

export default function DriverQuickActions({
  driver,
  variant = "header",
}: DriverQuickActionsProps) {
  const router = useRouter();
  const telUrl = buildTelUrl(driver.phone);
  const smsUrl = buildSmsUrl(driver.phone);
  const mailUrl = buildMailtoUrl(
    driver.email,
    `Message for ${driver.name}`,
    `Hi ${driver.name.split(" ")[0]},\n\n`,
  );

  const actions = (
    <>
      <ActionButton
        label="+ Assign Load"
        primary
        onClick={() => router.push("/loads")}
        title="Open dispatch to assign a load"
      />
      <ActionButton
        label="Reassign Load"
        onClick={() => router.push("/loads")}
        title="Open dispatch to reassign"
      />
      <ActionButton label="Call" href={telUrl} disabled={!telUrl} title="Call driver" />
      <ActionButton
        label="Message"
        href={smsUrl}
        disabled={!smsUrl}
        title="Text driver"
      />
      <ActionButton
        label="Email"
        href={mailUrl}
        disabled={!mailUrl}
        title="Email driver"
      />
      <ActionButton
        label="Upload Document"
        onClick={() =>
          router.push(`/drivers/${driver.id}?tab=documents`)
        }
      />
      <ActionButton
        label="View Timeline"
        onClick={() =>
          router.push(`/drivers/${driver.id}?tab=timeline`)
        }
      />
      <ActionButton
        label="Open Wallet"
        onClick={() => router.push("/wallet")}
        title="Open Digital Professional Wallet / Career Passport"
      />
    </>
  );

  if (variant === "bar") {
    return (
      <div className="flex flex-wrap gap-2">{actions}</div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {actions}
      <Link
        href={`/drivers/${driver.id}/edit`}
        className="inline-flex h-9 items-center justify-center rounded-full px-4 text-[13px] font-medium text-slate-500 transition hover:text-slate-800"
      >
        Edit
      </Link>
    </div>
  );
}
