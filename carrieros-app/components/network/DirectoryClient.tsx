"use client";

import { useMemo, useState } from "react";
import DirectoryCard from "@/components/network/DirectoryCard";
import EmptyState from "@/components/ui/EmptyState";
import { filterDirectory } from "@/lib/network/board";
import type { DirectoryFilters, NetworkCategory, NetworkMember } from "@/lib/network/types";
import { NETWORK_CATEGORY_LABELS } from "@/lib/network/types";
import { Search } from "lucide-react";

const CATEGORIES = Object.keys(NETWORK_CATEGORY_LABELS) as NetworkCategory[];

export default function DirectoryClient({
  initialMembers,
}: {
  initialMembers: NetworkMember[];
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<DirectoryFilters["category"]>("all");
  const [kind, setKind] = useState<DirectoryFilters["kind"]>("all");
  const [state, setState] = useState("");
  const [language, setLanguage] = useState("");
  const [equipment, setEquipment] = useState("");
  const [minTrust, setMinTrust] = useState("");
  const [availability, setAvailability] =
    useState<DirectoryFilters["availability"]>("all");

  const results = useMemo(() => {
    // Prefer live filter over initial snapshot so store mutations stay consistent.
    void initialMembers;
    return filterDirectory({
      query,
      category,
      kind,
      state: state || undefined,
      language: language || undefined,
      equipment: equipment || undefined,
      minTrustScore: minTrust ? Number(minTrust) : undefined,
      availability,
    });
  }, [
    initialMembers,
    query,
    category,
    kind,
    state,
    language,
    equipment,
    minTrust,
    availability,
  ]);

  return (
    <div className="space-y-4">
      <div className="rounded-[16px] bg-[#F8F9FB] p-4">
        <label className="relative block">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]"
            strokeWidth={1.9}
            aria-hidden
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search people, companies, services, Transpo ID…"
            className="w-full rounded-[12px] bg-white py-3 pl-10 pr-4 text-[14px] text-[#111827] outline-none ring-1 ring-[#E5E7EB] focus:ring-2 focus:ring-[#93C5FD]"
          />
        </label>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <Select
            label="Type"
            value={kind ?? "all"}
            onChange={(v) => setKind(v as DirectoryFilters["kind"])}
            options={[
              { value: "all", label: "People & companies" },
              { value: "person", label: "People" },
              { value: "company", label: "Companies" },
            ]}
          />
          <Select
            label="Category"
            value={category ?? "all"}
            onChange={(v) => setCategory(v as DirectoryFilters["category"])}
            options={[
              { value: "all", label: "All categories" },
              ...CATEGORIES.map((c) => ({
                value: c,
                label: NETWORK_CATEGORY_LABELS[c],
              })),
            ]}
          />
          <Field label="State" value={state} onChange={setState} placeholder="TX" />
          <Field
            label="Language"
            value={language}
            onChange={setLanguage}
            placeholder="Spanish"
          />
          <Field
            label="Equipment"
            value={equipment}
            onChange={setEquipment}
            placeholder="Reefer"
          />
          <Select
            label="Availability"
            value={availability ?? "all"}
            onChange={(v) =>
              setAvailability(v as DirectoryFilters["availability"])
            }
            options={[
              { value: "all", label: "Any availability" },
              { value: "available", label: "Available" },
              { value: "limited", label: "Limited" },
              { value: "unavailable", label: "Unavailable" },
            ]}
          />
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <Field
            label="Min trust"
            value={minTrust}
            onChange={setMinTrust}
            placeholder="80"
          />
          <p className="pt-5 text-[13px] text-[#6B7280]">
            {results.length} verified network matches
          </p>
        </div>
      </div>

      {results.length === 0 ? (
        <EmptyState
          title="No matches"
          description="Try a broader category, clear filters, or search by specialization."
          actionLabel="Reset filters"
          onAction={() => {
            setQuery("");
            setCategory("all");
            setKind("all");
            setState("");
            setLanguage("");
            setEquipment("");
            setMinTrust("");
            setAvailability("all");
          }}
        />
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {results.map((m) => (
            <DirectoryCard key={m.id} member={m} />
          ))}
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block text-[12px] font-medium text-[#6B7280]">
      {label}
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1 w-full rounded-[10px] bg-white px-3 py-2 text-[13px] text-[#111827] outline-none ring-1 ring-[#E5E7EB] focus:ring-2 focus:ring-[#93C5FD]"
      />
    </label>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="block text-[12px] font-medium text-[#6B7280]">
      {label}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-[10px] bg-white px-3 py-2 text-[13px] text-[#111827] outline-none ring-1 ring-[#E5E7EB] focus:ring-2 focus:ring-[#93C5FD]"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
