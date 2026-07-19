"use client";

import type { ReactNode } from "react";

export function DmCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-[22px] bg-[var(--dm-surface)] p-4 shadow-[0_8px_28px_rgba(15,23,42,0.04)] ${className}`}
    >
      {children}
    </section>
  );
}

export function DmSectionLabel({ children }: { children: ReactNode }) {
  return (
    <h2 className="mb-2 px-1 text-[13px] font-semibold uppercase tracking-[0.04em] text-[var(--dm-muted)]">
      {children}
    </h2>
  );
}

export function DmPrimaryButton({
  children,
  onClick,
  disabled,
  tone = "primary",
  type = "button",
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  tone?: "primary" | "success" | "warning" | "danger" | "muted";
  type?: "button" | "submit";
}) {
  const tones = {
    primary: "bg-[var(--color-info)] text-white",
    success: "bg-[var(--color-success)] text-white",
    warning: "bg-[var(--color-warning)] text-white",
    danger: "bg-[var(--color-critical)] text-white",
    muted: "bg-[var(--dm-elevated)] text-[var(--dm-fg)]",
  };
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl px-4 text-[16px] font-semibold transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-45 ${tones[tone]}`}
    >
      {children}
    </button>
  );
}

export function DmSecondaryButton({
  children,
  onClick,
  disabled,
  href,
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  href?: string;
}) {
  const className =
    "flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[var(--dm-elevated)] px-4 text-[15px] font-semibold text-[var(--dm-fg)] transition active:scale-[0.98] disabled:opacity-45";
  if (href) {
    return (
      <a href={href} className={className}>
        {children}
      </a>
    );
  }
  return (
    <button type="button" disabled={disabled} onClick={onClick} className={className}>
      {children}
    </button>
  );
}

export function StatusChip({
  label,
  tone = "info",
}: {
  label: string;
  tone?: "info" | "success" | "warning" | "critical" | "muted";
}) {
  const tones = {
    info: "bg-blue-500/15 text-[var(--color-info)]",
    success: "bg-green-500/15 text-[var(--color-success)]",
    warning: "bg-orange-500/15 text-[var(--color-warning)]",
    critical: "bg-red-500/15 text-[var(--color-critical)]",
    muted: "bg-[var(--dm-elevated)] text-[var(--dm-muted)]",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[12px] font-semibold ${tones[tone]}`}
    >
      {label}
    </span>
  );
}

export function formatMoney(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

export function formatStatus(status: string) {
  return status
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function statusTone(
  status: string,
): "info" | "success" | "warning" | "critical" | "muted" {
  if (["in_transit", "accepted", "loaded", "checked_in"].includes(status)) return "success";
  if (["offered", "dispatched", "detention"].includes(status)) return "warning";
  if (["rejected", "cancelled"].includes(status)) return "critical";
  if (["delivered", "completed", "invoiced", "empty"].includes(status)) return "muted";
  return "info";
}

export function BottomSheet({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 backdrop-blur-[2px]">
      <button
        type="button"
        className="absolute inset-0"
        aria-label="Close"
        onClick={onClose}
      />
      <div
        className="relative z-10 w-full max-w-lg rounded-t-[28px] bg-[var(--dm-surface)] px-4 pt-3 shadow-2xl"
        style={{ paddingBottom: "max(20px, env(safe-area-inset-bottom))" }}
      >
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-[var(--dm-border)]" />
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-[18px] font-semibold">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-3 py-2 text-[14px] font-medium text-[var(--dm-muted)]"
          >
            Close
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
