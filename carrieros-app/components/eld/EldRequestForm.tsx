"use client";

import { useState } from "react";
import {
  ALL_ELD_DATA_TYPES,
  ELD_DATA_TYPE_LABELS,
  submitEldRequest,
  type EldCatalogProvider,
  type EldDataType,
  type EldUploadedDoc,
} from "@/lib/eld";

type CompanyDefaults = {
  carrierCompany: string;
  mcNumber: string;
  dotNumber: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
};

type EldRequestFormProps = {
  provider: EldCatalogProvider;
  company: CompanyDefaults;
  onSubmitted: (requestId: string) => void;
  onCancel: () => void;
};

export default function EldRequestForm({
  provider,
  company,
  onSubmitted,
  onCancel,
}: EldRequestFormProps) {
  const [carrierCompany, setCarrierCompany] = useState(company.carrierCompany);
  const [mcNumber, setMcNumber] = useState(company.mcNumber);
  const [dotNumber, setDotNumber] = useState(company.dotNumber);
  const [eldAccountNumber, setEldAccountNumber] = useState("");
  const [contactName, setContactName] = useState(company.contactName);
  const [contactEmail, setContactEmail] = useState(company.contactEmail);
  const [contactPhone, setContactPhone] = useState(company.contactPhone);
  const [truckCount, setTruckCount] = useState(12);
  const [features, setFeatures] = useState<EldDataType[]>(
    provider.dataTypes.slice(0, 4),
  );
  const [eldRepName, setEldRepName] = useState("");
  const [eldRepEmail, setEldRepEmail] = useState(provider.contactEmail ?? "");
  const [eldRepPhone, setEldRepPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [docs, setDocs] = useState<EldUploadedDoc[]>([]);
  const [error, setError] = useState<string | null>(null);

  function toggleFeature(dt: EldDataType) {
    setFeatures((prev) =>
      prev.includes(dt) ? prev.filter((x) => x !== dt) : [...prev, dt],
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!carrierCompany.trim() || !contactEmail.trim()) {
      setError("Carrier company and contact email are required.");
      return;
    }
    const request = submitEldRequest({
      providerId: provider.id,
      providerName: provider.name,
      carrierCompany: carrierCompany.trim(),
      mcNumber: mcNumber.trim(),
      dotNumber: dotNumber.trim(),
      eldAccountNumber: eldAccountNumber.trim(),
      contactName: contactName.trim(),
      contactEmail: contactEmail.trim(),
      contactPhone: contactPhone.trim(),
      truckCount: Number.isFinite(truckCount) ? truckCount : 0,
      featuresNeeded: features,
      eldRepresentative: {
        name: eldRepName.trim() || undefined,
        email: eldRepEmail.trim() || undefined,
        phone: eldRepPhone.trim() || undefined,
      },
      notes: notes.trim(),
      apiDocuments: docs,
    });
    onSubmitted(request.id);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-[16px] bg-white p-5 ring-1 ring-[#EAEAEA] sm:p-6"
    >
      <div>
        <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-slate-400">
          Integration request
        </p>
        <h2 className="mt-1 text-lg font-semibold text-slate-900">
          {provider.name}
        </h2>
        <p className="mt-1 text-[13px] text-slate-500">
          We notify you in Notification Center as status changes.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Carrier company">
          <input
            required
            value={carrierCompany}
            onChange={(e) => setCarrierCompany(e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="MC number">
          <input
            value={mcNumber}
            onChange={(e) => setMcNumber(e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="DOT number">
          <input
            value={dotNumber}
            onChange={(e) => setDotNumber(e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="ELD provider">
          <input value={provider.name} readOnly className={inputClass} />
        </Field>
        <Field label="ELD account number">
          <input
            value={eldAccountNumber}
            onChange={(e) => setEldAccountNumber(e.target.value)}
            className={inputClass}
            placeholder="Optional account / fleet ID"
          />
        </Field>
        <Field label="Number of trucks">
          <input
            type="number"
            min={0}
            value={truckCount}
            onChange={(e) => setTruckCount(Number(e.target.value))}
            className={inputClass}
          />
        </Field>
        <Field label="Contact name">
          <input
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Contact email">
          <input
            type="email"
            required
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Contact phone">
          <input
            value={contactPhone}
            onChange={(e) => setContactPhone(e.target.value)}
            className={inputClass}
          />
        </Field>
      </div>

      <div>
        <p className="text-[12px] font-medium text-slate-500">Features needed</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {ALL_ELD_DATA_TYPES.map((dt) => {
            const on = features.includes(dt);
            return (
              <button
                key={dt}
                type="button"
                onClick={() => toggleFeature(dt)}
                className={`rounded-lg px-2.5 py-1.5 text-[12px] font-semibold transition ${
                  on
                    ? "bg-[#EFF6FF] text-[#2563EB] ring-1 ring-[#BFDBFE]"
                    : "bg-[#F5F7FA] text-slate-600"
                }`}
              >
                {ELD_DATA_TYPE_LABELS[dt]}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <p className="text-[12px] font-medium text-slate-500">
          API documentation (stub upload)
        </p>
        <label className="mt-2 flex cursor-pointer flex-col items-start gap-2 rounded-[12px] bg-[#F5F7FA] px-4 py-3">
          <span className="text-[13px] font-semibold text-slate-700">
            Choose files
          </span>
          <input
            type="file"
            multiple
            className="text-[13px] text-slate-600"
            onChange={(e) => {
              const files = Array.from(e.target.files ?? []);
              if (!files.length) return;
              const now = new Date().toISOString();
              setDocs((prev) => [
                ...prev,
                ...files.map((f, i) => ({
                  id: `local-doc-${Date.now()}-${i}`,
                  fileName: f.name,
                  uploadedAt: now,
                  note: "Stub upload — stored in local request record",
                })),
              ]);
            }}
          />
        </label>
        {docs.length > 0 ? (
          <ul className="mt-2 space-y-1 text-[13px] text-slate-600">
            {docs.map((d) => (
              <li key={d.id}>· {d.fileName}</li>
            ))}
          </ul>
        ) : null}
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Field label="ELD representative name">
          <input
            value={eldRepName}
            onChange={(e) => setEldRepName(e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="ELD representative email">
          <input
            value={eldRepEmail}
            onChange={(e) => setEldRepEmail(e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="ELD representative phone">
          <input
            value={eldRepPhone}
            onChange={(e) => setEldRepPhone(e.target.value)}
            className={inputClass}
          />
        </Field>
      </div>

      <Field label="Notes">
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="w-full rounded-xl bg-[#F5F7FA] px-3 py-2.5 text-[14px] text-slate-900 outline-none ring-1 ring-transparent focus:ring-[#93C5FD]"
          placeholder="Why you need this ELD, urgency, existing workarounds…"
        />
      </Field>

      {error ? (
        <p className="rounded-[12px] bg-[#FEF2F2] px-3 py-2 text-[13px] font-medium text-[#991B1B]">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <button
          type="submit"
          className="inline-flex h-10 items-center rounded-xl bg-[#2563EB] px-4 text-[13px] font-semibold text-white hover:bg-[#1D4ED8]"
        >
          Submit request
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex h-10 items-center rounded-xl bg-[#F5F7FA] px-4 text-[13px] font-semibold text-slate-700 hover:bg-[#E8EDF5]"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

const inputClass =
  "mt-1 h-10 w-full rounded-xl bg-[#F5F7FA] px-3 text-[14px] text-slate-900 outline-none ring-1 ring-transparent focus:ring-[#93C5FD] read-only:text-slate-500";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-[12px] font-medium text-slate-500">
      {label}
      {children}
    </label>
  );
}
