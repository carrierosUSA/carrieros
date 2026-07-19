"use client";

import { useRouter } from "next/navigation";
import {
  buildMailtoUrl,
  buildSmsUrl,
  buildTelUrl,
  openCommunicationUrl,
} from "@/lib/dispatch/communication";
import { getBrokerContact } from "@/lib/data/brokers";
import type { Broker } from "@/lib/types";

type BrokerQuickActionsProps = {
  broker: Broker;
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

export default function BrokerQuickActions({ broker }: BrokerQuickActionsProps) {
  const router = useRouter();
  const dispatcher = getBrokerContact(broker, "dispatcher");
  const phone = broker.phone ?? dispatcher?.phone ?? "";
  const email = broker.email ?? dispatcher?.email ?? "";
  const telUrl = buildTelUrl(phone);
  const smsUrl = buildSmsUrl(phone);
  const mailUrl = buildMailtoUrl(
    email,
    `Message for ${broker.name}`,
    `Hi ${dispatcher?.name?.split(" ")[0] ?? "there"},\n\n`,
  );
  const createDisabled = broker.status === "credit_hold";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <ActionButton
        label="+ Create Load"
        primary
        disabled={createDisabled}
        title={
          createDisabled
            ? "Broker is on credit hold — clear balance before booking"
            : "Create a new load with this broker"
        }
        onClick={() => router.push("/loads/new")}
      />
      <ActionButton
        label="Call"
        href={telUrl}
        disabled={!telUrl}
        title={telUrl ? "Call broker" : "No phone on file"}
      />
      <ActionButton
        label="Message"
        href={smsUrl}
        disabled={!smsUrl}
        title={smsUrl ? "Text broker" : "No phone on file"}
      />
      <ActionButton
        label="Email"
        href={mailUrl}
        disabled={!mailUrl}
        title={mailUrl ? "Email broker" : "No email on file"}
      />
      <ActionButton
        label="Upload Document"
        onClick={() =>
          router.push(`/brokers/${broker.id}?tab=documents`)
        }
      />
      <ActionButton
        label="Add Contact"
        onClick={() =>
          router.push(`/brokers/${broker.id}?tab=contacts`)
        }
      />
      <ActionButton
        label="View Payment History"
        onClick={() =>
          router.push(`/brokers/${broker.id}?tab=payments`)
        }
      />
    </div>
  );
}
