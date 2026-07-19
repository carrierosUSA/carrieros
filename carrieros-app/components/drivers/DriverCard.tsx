"use client";

import Link from "next/link";
import DriverOperationalBadge from "@/components/drivers/DriverOperationalBadge";
import {
  buildMailtoUrl,
  buildSmsUrl,
  buildTelUrl,
  openCommunicationUrl,
} from "@/lib/dispatch/communication";
import type { Driver, Load } from "@/lib/types";
import { getDriverOperationalStatus } from "@/lib/drivers/driver-board";
import { detectDriverAlerts } from "@/lib/drivers/driver-alerts";
import { CARRIEROS_COLORS } from "@/lib/design-system/colors";

type DriverCardProps = {
  driver: Driver;
  loads: Load[];
};

function formatExpiry(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function ContactButton({
  label,
  href,
}: {
  label: string;
  href?: string;
}) {
  return (
    <button
      type="button"
      disabled={!href}
      onClick={() => href && openCommunicationUrl(href)}
      className="inline-flex h-8 flex-1 items-center justify-center rounded-lg bg-[#F8FAFC] text-[12px] font-semibold text-slate-700 ring-1 ring-[#E5E7EB] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
    >
      {label}
    </button>
  );
}

export default function DriverCard({ driver, loads }: DriverCardProps) {
  const operationalStatus = getDriverOperationalStatus(driver, loads);
  const alerts = detectDriverAlerts(driver);
  const hasComplianceAlert = alerts.length > 0;
  const telUrl = buildTelUrl(driver.phone);
  const smsUrl = buildSmsUrl(driver.phone);
  const mailUrl = buildMailtoUrl(
    driver.email,
    `Message for ${driver.name}`,
    `Hi ${driver.name.split(" ")[0]},\n\n`,
  );

  return (
    <article className="rounded-[16px] bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.06)] ring-1 ring-[#E5E7EB] transition hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(15,23,42,0.08)]">
      <Link href={`/drivers/${driver.id}`} className="block">
        <div className="flex items-start gap-3">
          <div className="relative shrink-0">
            {driver.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={driver.photoUrl}
                alt=""
                className="h-14 w-14 rounded-full object-cover ring-2 ring-white"
              />
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#EFF6FF] text-[18px] font-bold text-[#2563EB]">
                {driver.name
                  .split(" ")
                  .map((part) => part[0])
                  .join("")
                  .slice(0, 2)}
              </div>
            )}
            {hasComplianceAlert ? (
              <span
                className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full ring-2 ring-white ${CARRIEROS_COLORS.warning.bg}`}
                title="Compliance alert"
              />
            ) : null}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="truncate text-[16px] font-semibold text-slate-950">
                {driver.name}
              </h3>
              <DriverOperationalBadge status={operationalStatus} />
            </div>
            <p className="mt-0.5 text-[13px] text-slate-500">{driver.role}</p>
          </div>
        </div>
      </Link>

      <div className="mt-4 flex gap-2">
        <ContactButton label="Call" href={telUrl} />
        <ContactButton label="Message" href={smsUrl} />
        <ContactButton label="Email" href={mailUrl} />
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-x-3 gap-y-2 text-[12px]">
        <div>
          <dt className="font-medium text-slate-400">CDL</dt>
          <dd className="font-semibold text-slate-800">
            {formatExpiry(driver.licenseExpiresAt)}
          </dd>
        </div>
        <div>
          <dt className="font-medium text-slate-400">Medical</dt>
          <dd
            className={`font-semibold ${
              alerts.some((a) => a.type === "medical_expiry")
                ? CARRIEROS_COLORS.warning.text
                : "text-slate-800"
            }`}
          >
            {formatExpiry(driver.medicalExpiresAt)}
          </dd>
        </div>
        <div>
          <dt className="font-medium text-slate-400">License State</dt>
          <dd className="font-semibold text-slate-800">{driver.licenseState}</dd>
        </div>
        <div>
          <dt className="font-medium text-slate-400">Home Terminal</dt>
          <dd className="truncate font-semibold text-slate-800">
            {driver.homeTerminal ?? driver.location}
          </dd>
        </div>
      </dl>
    </article>
  );
}
