"use client";

import Link from "next/link";
import BrokerStatusBadge from "@/components/brokers/BrokerStatusBadge";
import {
  buildMailtoUrl,
  buildSmsUrl,
  buildTelUrl,
  openCommunicationUrl,
} from "@/lib/dispatch/communication";
import { getBrokerContact } from "@/lib/data/brokers";
import {
  formatBrokerRating,
  formatPerformanceScore,
} from "@/lib/brokers/broker-board";
import type { Broker } from "@/lib/types";

type BrokerCardProps = {
  broker: Broker;
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

export default function BrokerCard({ broker }: BrokerCardProps) {
  const dispatcher = getBrokerContact(broker, "dispatcher");
  const accounting = getBrokerContact(broker, "accounting");
  const safety = getBrokerContact(broker, "safety");
  const phone = broker.phone ?? dispatcher?.phone ?? "";
  const email = broker.email ?? dispatcher?.email ?? "";
  const telUrl = buildTelUrl(phone);
  const smsUrl = buildSmsUrl(phone);
  const mailUrl = buildMailtoUrl(
    email,
    `Message for ${broker.name}`,
    `Hi ${dispatcher?.name?.split(" ")[0] ?? "there"},\n\n`,
  );

  return (
    <Link
      href={`/brokers/${broker.id}`}
      className="group block rounded-[16px] border border-[#EAEAEA] bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.05)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(15,23,42,0.08)]"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] bg-[#EFF6FF] text-[15px] font-bold text-[#2563EB]">
          {broker.name
            .split(" ")
            .map((part) => part[0])
            .join("")
            .slice(0, 2)
            .toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-[16px] font-semibold text-slate-950 group-hover:text-[#2563EB]">
              {broker.name}
            </h3>
            <BrokerStatusBadge status={broker.status} />
          </div>
          <p className="mt-0.5 text-[13px] text-slate-500">
            {[broker.mcNumber, broker.dotNumber].filter(Boolean).join(" · ") ||
              "No authority on file"}
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
        <MetaRow label="Phone" value={phone || "—"} />
        <MetaRow label="Email" value={email || "—"} />
        <MetaRow
          label="Website"
          value={broker.website?.replace(/^https?:\/\//, "") ?? "—"}
        />
        <MetaRow label="Rating" value={formatBrokerRating(broker.rating)} />
        <MetaRow
          label="Dispatcher"
          value={dispatcher?.name ?? "—"}
        />
        <MetaRow
          label="Accounting"
          value={accounting?.name ?? "—"}
        />
        <MetaRow label="Safety" value={safety?.name ?? "—"} />
        <MetaRow
          label="Performance"
          value={formatPerformanceScore(broker.performanceScore)}
        />
      </dl>
    </Link>
  );
}
