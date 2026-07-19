"use client";

import type { ReactNode } from "react";

export function PortalCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] ${className}`}
    >
      {children}
    </div>
  );
}

export function PortalStat({
  label,
  value,
  hint,
  tone = "default",
}: {
  label: string;
  value: string | number;
  hint?: string;
  tone?: "default" | "success" | "warning" | "critical" | "info";
}) {
  const valueColor =
    tone === "success"
      ? "text-[#16A34A]"
      : tone === "warning"
        ? "text-[#EA580C]"
        : tone === "critical"
          ? "text-[#DC2626]"
          : tone === "info"
            ? "text-[#2563EB]"
            : "text-[#111827]";

  return (
    <div className="rounded-2xl bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
      <p className="carrieros-label text-[#6B7280]">{label}</p>
      <p className={`mt-2 text-[28px] font-bold tracking-tight ${valueColor}`}>
        {value}
      </p>
      {hint ? <p className="mt-1 text-sm text-[#6B7280]">{hint}</p> : null}
    </div>
  );
}

export function PortalSectionTitle({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 className="carrieros-page-title text-[#111827]">{title}</h2>
        {subtitle ? (
          <p className="mt-1 text-sm text-[#6B7280]">{subtitle}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

export function PortalBadge({
  children,
  tone = "gray",
}: {
  children: ReactNode;
  tone?: "gray" | "blue" | "green" | "orange" | "red";
}) {
  const styles =
    tone === "blue"
      ? "bg-[#EFF6FF] text-[#1D4ED8]"
      : tone === "green"
        ? "bg-[#ECFDF3] text-[#166534]"
        : tone === "orange"
          ? "bg-[#FFF7ED] text-[#C2410C]"
          : tone === "red"
            ? "bg-[#FEF2F2] text-[#B91C1C]"
            : "bg-[#F3F4F6] text-[#4B5563]";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[12px] font-semibold ${styles}`}
    >
      {children}
    </span>
  );
}

export function PortalEmpty({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-2xl bg-[#F8F9FB] px-6 py-10 text-center">
      <p className="text-base font-semibold text-[#111827]">{title}</p>
      <p className="mt-1 text-sm text-[#6B7280]">{body}</p>
    </div>
  );
}

export function PortalTooltip({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <span className="group relative inline-flex">
      {children}
      <span className="pointer-events-none absolute bottom-full left-1/2 z-40 mb-2 hidden w-56 -translate-x-1/2 rounded-xl bg-[#111827] px-3 py-2 text-center text-[12px] font-medium leading-snug text-white shadow-lg group-hover:block group-focus-within:block">
        {label}
      </span>
    </span>
  );
}
