"use client";

import { useMemo, useState } from "react";
import {
  addEldCallNote,
  buildEldProviderEmailBody,
  buildEldProviderEmailSubject,
  buildEldProviderRequestLetter,
  type EldCatalogProvider,
} from "@/lib/eld";

type CompanyDefaults = {
  carrierCompany: string;
  mcNumber: string;
  dotNumber: string;
  contactName?: string;
};

type EldContactProviderPanelProps = {
  provider: EldCatalogProvider;
  company: CompanyDefaults;
  requestId?: string;
  onClose: () => void;
};

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

function downloadText(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function EldContactProviderPanel({
  provider,
  company,
  requestId,
  onClose,
}: EldContactProviderPanelProps) {
  const [feedback, setFeedback] = useState<string | null>(null);
  const [eldContact, setEldContact] = useState({
    name: "",
    email: provider.contactEmail ?? "",
    phone: "",
    title: "",
  });
  const [callNotes, setCallNotes] = useState("");

  const templateInput = useMemo(
    () => ({
      carrierCompany: company.carrierCompany,
      mcNumber: company.mcNumber,
      dotNumber: company.dotNumber,
      eldProviderName: provider.name,
      contactName: eldContact.name || company.contactName,
    }),
    [company, provider.name, eldContact.name],
  );

  const subject = buildEldProviderEmailSubject(templateInput);
  const body = buildEldProviderEmailBody(templateInput);
  const letter = buildEldProviderRequestLetter(templateInput);

  const mailtoHref = `mailto:${encodeURIComponent(
    eldContact.email || provider.contactEmail || "",
  )}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  return (
    <div className="space-y-5 rounded-[16px] bg-white p-5 ring-1 ring-[#EAEAEA] sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-slate-400">
            Contact ELD provider
          </p>
          <h2 className="mt-1 text-lg font-semibold text-slate-900">
            {provider.name}
          </h2>
          <p className="mt-1 text-[13px] text-slate-500">
            Ready-made message using your company MC / DOT from Settings.
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg px-2.5 py-1.5 text-[13px] font-semibold text-slate-500 hover:bg-[#F5F7FA]"
        >
          Close
        </button>
      </div>

      <div className="rounded-[12px] bg-[#F5F7FA] px-4 py-3">
        <p className="text-[12px] font-medium text-slate-400">Subject</p>
        <p className="mt-1 text-[14px] font-semibold text-slate-800">{subject}</p>
        <p className="mt-3 text-[12px] font-medium text-slate-400">Message</p>
        <pre className="mt-1 whitespace-pre-wrap font-sans text-[13px] leading-6 text-slate-700">
          {body}
        </pre>
      </div>

      {feedback ? (
        <p className="rounded-[12px] bg-[#ECFDF3] px-3 py-2 text-[13px] font-medium text-[#166534]">
          {feedback}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={async () => {
            const ok = await copyText(`${subject}\n\n${body}`);
            setFeedback(ok ? "Message copied." : "Could not copy — select text manually.");
          }}
          className="inline-flex h-10 items-center rounded-xl bg-[#2563EB] px-4 text-[13px] font-semibold text-white hover:bg-[#1D4ED8]"
        >
          Copy Message
        </button>
        <a
          href={mailtoHref}
          className="inline-flex h-10 items-center rounded-xl bg-[#F5F7FA] px-4 text-[13px] font-semibold text-slate-800 hover:bg-[#E8EDF5]"
        >
          Send Email
        </a>
        <button
          type="button"
          onClick={() => {
            downloadText(
              `${provider.id}-integration-request-letter.txt`,
              letter,
            );
            setFeedback("Request letter downloaded.");
          }}
          className="inline-flex h-10 items-center rounded-xl bg-[#F5F7FA] px-4 text-[13px] font-semibold text-slate-800 hover:bg-[#E8EDF5]"
        >
          Download Request Letter
        </button>
      </div>

      <div className="space-y-3 border-t border-[#F1F5F9] pt-5">
        <p className="text-[14px] font-semibold text-slate-900">
          Add ELD contact information
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-[12px] font-medium text-slate-500">
            Name
            <input
              value={eldContact.name}
              onChange={(e) =>
                setEldContact((c) => ({ ...c, name: e.target.value }))
              }
              className="mt-1 h-10 w-full rounded-xl bg-[#F5F7FA] px-3 text-[14px] text-slate-900 outline-none ring-1 ring-transparent focus:ring-[#93C5FD]"
            />
          </label>
          <label className="block text-[12px] font-medium text-slate-500">
            Email
            <input
              value={eldContact.email}
              onChange={(e) =>
                setEldContact((c) => ({ ...c, email: e.target.value }))
              }
              className="mt-1 h-10 w-full rounded-xl bg-[#F5F7FA] px-3 text-[14px] text-slate-900 outline-none ring-1 ring-transparent focus:ring-[#93C5FD]"
            />
          </label>
          <label className="block text-[12px] font-medium text-slate-500">
            Phone
            <input
              value={eldContact.phone}
              onChange={(e) =>
                setEldContact((c) => ({ ...c, phone: e.target.value }))
              }
              className="mt-1 h-10 w-full rounded-xl bg-[#F5F7FA] px-3 text-[14px] text-slate-900 outline-none ring-1 ring-transparent focus:ring-[#93C5FD]"
            />
          </label>
          <label className="block text-[12px] font-medium text-slate-500">
            Title
            <input
              value={eldContact.title}
              onChange={(e) =>
                setEldContact((c) => ({ ...c, title: e.target.value }))
              }
              className="mt-1 h-10 w-full rounded-xl bg-[#F5F7FA] px-3 text-[14px] text-slate-900 outline-none ring-1 ring-transparent focus:ring-[#93C5FD]"
            />
          </label>
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-[14px] font-semibold text-slate-900">
          Record call notes
        </p>
        <textarea
          value={callNotes}
          onChange={(e) => setCallNotes(e.target.value)}
          rows={3}
          placeholder="Who you spoke with, what they promised, next follow-up…"
          className="w-full rounded-xl bg-[#F5F7FA] px-3 py-2.5 text-[14px] text-slate-900 outline-none ring-1 ring-transparent focus:ring-[#93C5FD]"
        />
        <button
          type="button"
          disabled={!callNotes.trim()}
          title={
            !callNotes.trim() ? "Add notes before saving" : "Save call notes"
          }
          onClick={() => {
            addEldCallNote({
              providerId: provider.id,
              requestId,
              contactName: eldContact.name || undefined,
              contactEmail: eldContact.email || undefined,
              contactPhone: eldContact.phone || undefined,
              notes: callNotes.trim(),
            });
            setCallNotes("");
            setFeedback("Call notes saved.");
          }}
          className="inline-flex h-10 items-center rounded-xl bg-[#16A34A] px-4 text-[13px] font-semibold text-white enabled:hover:bg-[#15803D] disabled:cursor-not-allowed disabled:bg-[#CBD5E1]"
        >
          Record Call Notes
        </button>
      </div>
    </div>
  );
}
