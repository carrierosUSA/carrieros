"use client";

import { useEffect, useSyncExternalStore, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { buildSmsUrl } from "@/lib/dispatch/communication";

function useIsClient() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

type ReassignModalShellProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
};

export default function ReassignModalShell({
  open,
  onClose,
  title,
  subtitle,
  children,
}: ReassignModalShellProps) {
  const isClient = useIsClient();

  useEffect(() => {
    if (!open) {
      return;
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open || !isClient) {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/30 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="w-full max-w-sm rounded-xl border border-[#E5E7EB] bg-white shadow-2xl shadow-slate-400/20"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="reassign-modal-title"
      >
        <div className="border-b border-[#F1F5F9] px-4 py-3">
          <h2 id="reassign-modal-title" className="text-[14px] font-semibold text-slate-900">
            {title}
          </h2>
          {subtitle ? (
            <p className="mt-0.5 text-[11px] text-slate-500">{subtitle}</p>
          ) : null}
        </div>
        {children}
      </div>
    </div>,
    document.body,
  );
}

export type ReassignListItem = {
  id: string;
  name: string;
  detail?: string;
};

type ReassignPickerProps = {
  searchPlaceholder: string;
  listLabel: string;
  addNewHref: string;
  addNewLabel?: string;
  items: ReassignListItem[];
  currentId?: string;
  pendingId: string | null;
  isPending: boolean;
  error: string | null;
  query: string;
  onQueryChange: (value: string) => void;
  onSelect: (id: string) => void;
  onCancel: () => void;
};

export function ReassignPicker({
  searchPlaceholder,
  listLabel,
  addNewHref,
  addNewLabel = "+ Add New",
  items,
  currentId,
  pendingId,
  isPending,
  error,
  query,
  onQueryChange,
  onSelect,
  onCancel,
}: ReassignPickerProps) {
  return (
    <>
      <div className="px-4 py-3">
        <label className="mb-1.5 block text-[11px] font-medium text-slate-600">
          🔍 {searchPlaceholder}
        </label>
        <input
          type="search"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder={searchPlaceholder}
          className="h-9 w-full rounded-lg border border-[#E2E8F0] px-3 text-[12px] outline-none focus:border-[#93C5FD] focus:ring-2 focus:ring-blue-100"
          autoFocus
        />
        <p className="mt-3 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
          {listLabel}
        </p>
        <ul className="mt-1.5 max-h-[220px] space-y-0.5 overflow-y-auto">
          {items.length === 0 ? (
            <li className="py-2 text-center text-[11px] text-slate-400">No matches</li>
          ) : (
            items.map((item) => {
              const isCurrent = item.id === currentId;
              const isLoading = pendingId === item.id && isPending;

              return (
                <li key={item.id}>
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => onSelect(item.id)}
                    className={`flex w-full items-start gap-2 rounded-lg px-2 py-2 text-left transition hover:bg-[#F8FBFF] disabled:opacity-60 ${
                      isCurrent ? "bg-[#EFF6FF]" : ""
                    }`}
                  >
                    <span className="mt-0.5 text-[12px] text-slate-400">•</span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-2">
                        <span className="text-[12px] font-semibold text-slate-900">
                          {item.name}
                        </span>
                        {isLoading ? (
                          <span className="text-[10px] text-[#1E3A8A]">Saving…</span>
                        ) : isCurrent ? (
                          <span className="text-[10px] font-medium text-[#1E3A8A]">
                            Current
                          </span>
                        ) : null}
                      </span>
                      {item.detail ? (
                        <span className="text-[10px] text-slate-500">{item.detail}</span>
                      ) : null}
                    </span>
                  </button>
                </li>
              );
            })
          )}
        </ul>
        {error ? <p className="mt-2 text-[11px] text-rose-600">{error}</p> : null}
      </div>
      <div className="flex items-center justify-between border-t border-[#F1F5F9] px-4 py-2.5">
        <a
          href={addNewHref}
          className="text-[11px] font-semibold text-[#1E3A8A] hover:underline"
        >
          {addNewLabel}
        </a>
        <button
          type="button"
          onClick={onCancel}
          className="h-8 rounded-md border border-[#E2E8F0] px-3 text-[11px] font-medium text-slate-600"
        >
          Cancel
        </button>
      </div>
    </>
  );
}

type ReassignSuccessProps = {
  message: string;
  prompt: string;
  onEmail: () => void;
  onSkip: () => void;
};

export function ReassignSuccess({
  message,
  prompt,
  onEmail,
  onSkip,
}: ReassignSuccessProps) {
  return (
    <>
      <div className="px-4 py-4">
        <p className="text-[13px] font-semibold text-slate-900">{message}</p>
        <p className="mt-2 text-[12px] text-slate-600">{prompt}</p>
      </div>
      <div className="flex gap-2 border-t border-[#F1F5F9] px-4 py-3">
        <button
          type="button"
          onClick={onEmail}
          className="h-9 flex-1 rounded-lg bg-[#1E3A8A] text-[12px] font-semibold text-white hover:bg-[#1E40AF]"
        >
          Email Broker
        </button>
        <button
          type="button"
          onClick={onSkip}
          className="h-9 flex-1 rounded-lg border border-[#E2E8F0] text-[12px] font-medium text-slate-700"
        >
          Skip
        </button>
      </div>
    </>
  );
}

type ReassignEmailPreviewProps = {
  brokerEmail?: string;
  subject: string;
  body: string;
  onDone: () => void;
};

type ReassignSmsPreviewProps = {
  phone?: string;
  body: string;
  onDone: () => void;
};

export function ReassignSmsPreview({
  phone,
  body,
  onDone,
}: ReassignSmsPreviewProps) {
  const smsHref = phone ? buildSmsUrl(phone, body) : undefined;

  return (
    <>
      <div className="space-y-2 px-4 py-3">
        <p className="text-[11px] text-slate-500">Review before sending</p>
        <div>
          <p className="text-[10px] uppercase tracking-wide text-slate-400">To</p>
          <p className="text-[12px] font-medium text-slate-800">
            {phone ?? "No driver phone on file"}
          </p>
        </div>
        <textarea
          readOnly
          value={body}
          rows={6}
          className="w-full resize-none rounded-lg border border-[#E2E8F0] bg-[#FAFBFC] px-2 py-1.5 text-[11px] leading-relaxed text-slate-700"
        />
      </div>
      <div className="flex gap-2 border-t border-[#F1F5F9] px-4 py-3">
        {smsHref ? (
          <a
            href={smsHref}
            className="flex h-9 flex-1 items-center justify-center rounded-lg bg-[#1E3A8A] text-[12px] font-semibold text-white hover:bg-[#1E40AF]"
          >
            Open in Messages
          </a>
        ) : (
          <button
            type="button"
            disabled
            className="h-9 flex-1 rounded-lg bg-slate-200 text-[12px] font-semibold text-slate-500"
          >
            No Driver Phone
          </button>
        )}
        <button
          type="button"
          onClick={onDone}
          className="h-9 flex-1 rounded-lg border border-[#E2E8F0] text-[12px] font-medium text-slate-700"
        >
          Done
        </button>
      </div>
    </>
  );
}

type ReassignConfirmActionProps = {
  message: string;
  detail?: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ReassignConfirmAction({
  message,
  detail,
  confirmLabel,
  onConfirm,
  onCancel,
}: ReassignConfirmActionProps) {
  return (
    <>
      <div className="px-4 py-4">
        <p className="text-[13px] font-semibold text-slate-900">{message}</p>
        {detail ? (
          <p className="mt-2 text-[12px] text-slate-600">{detail}</p>
        ) : null}
      </div>
      <div className="flex gap-2 border-t border-[#F1F5F9] px-4 py-3">
        <button
          type="button"
          onClick={onConfirm}
          className="h-9 flex-1 rounded-lg bg-[#1E3A8A] text-[12px] font-semibold text-white hover:bg-[#1E40AF]"
        >
          {confirmLabel}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="h-9 flex-1 rounded-lg border border-[#E2E8F0] text-[12px] font-medium text-slate-700"
        >
          Cancel
        </button>
      </div>
    </>
  );
}

export function ReassignEmailPreview({
  brokerEmail,
  subject,
  body,
  onDone,
  documentsHref,
  documentsLabel = "View Documents",
}: ReassignEmailPreviewProps & {
  documentsHref?: string;
  documentsLabel?: string;
}) {
  const mailtoHref = brokerEmail
    ? `mailto:${brokerEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    : undefined;

  return (
    <>
      <div className="space-y-2 px-4 py-3">
        <p className="text-[11px] text-slate-500">Review before sending</p>
        <div>
          <p className="text-[10px] uppercase tracking-wide text-slate-400">To</p>
          <p className="text-[12px] font-medium text-slate-800">
            {brokerEmail ?? "No broker email on file"}
          </p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wide text-slate-400">Subject</p>
          <p className="text-[12px] font-medium text-slate-800">{subject}</p>
        </div>
        <textarea
          readOnly
          value={body}
          rows={8}
          className="w-full resize-none rounded-lg border border-[#E2E8F0] bg-[#FAFBFC] px-2 py-1.5 text-[11px] leading-relaxed text-slate-700"
        />
      </div>
      <div className="flex flex-col gap-2 border-t border-[#F1F5F9] px-4 py-3">
        <div className="flex gap-2">
          {mailtoHref ? (
            <a
              href={mailtoHref}
              className="flex h-9 flex-1 items-center justify-center rounded-lg bg-[#1E3A8A] text-[12px] font-semibold text-white hover:bg-[#1E40AF]"
            >
              Open in Email App
            </a>
          ) : (
            <button
              type="button"
              disabled
              className="h-9 flex-1 rounded-lg bg-slate-200 text-[12px] font-semibold text-slate-500"
            >
              No Broker Email
            </button>
          )}
          <button
            type="button"
            onClick={onDone}
            className="h-9 flex-1 rounded-lg border border-[#E2E8F0] text-[12px] font-medium text-slate-700"
          >
            Done
          </button>
        </div>
        {documentsHref ? (
          <a
            href={documentsHref}
            className="text-center text-[11px] font-semibold text-[#1E3A8A] hover:underline"
          >
            {documentsLabel}
          </a>
        ) : null}
      </div>
    </>
  );
}
