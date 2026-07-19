"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";

export type ComboboxOption = {
  value: string;
  label: string;
  description?: string;
};

type SearchComboboxProps = {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  options: ComboboxOption[];
  placeholder?: string;
  required?: boolean;
  autoFilled?: boolean;
  allowClear?: boolean;
  onCreateNew?: () => void;
  createNewLabel?: string;
};

export default function SearchCombobox({
  label,
  name,
  value,
  onChange,
  options,
  placeholder = "Search…",
  required = false,
  autoFilled = false,
  allowClear = true,
  onCreateNew,
  createNewLabel = "+ New",
}: SearchComboboxProps) {
  const listboxId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const selected = options.find((option) => option.value === value);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return options;
    }

    return options.filter(
      (option) =>
        option.label.toLowerCase().includes(normalized) ||
        option.description?.toLowerCase().includes(normalized),
    );
  }, [options, query]);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  function selectOption(optionValue: string) {
    onChange(optionValue);
    setOpen(false);
    setQuery("");
  }

  function handleInputFocus() {
    setOpen(true);
    setQuery(selected?.label ?? "");
  }

  function handleInputChange(nextQuery: string) {
    setQuery(nextQuery);
    setOpen(true);

    const exact = options.find(
      (option) => option.label.toLowerCase() === nextQuery.trim().toLowerCase(),
    );

    if (exact) {
      onChange(exact.value);
    } else if (allowClear && !nextQuery.trim()) {
      onChange("");
    }
  }

  return (
    <div ref={containerRef} className="relative block space-y-1.5">
      <input type="hidden" name={name} value={value} required={required && !value} />

      <span className="flex items-center gap-2 text-[13px] font-medium text-slate-700">
        {label}
        {autoFilled ? (
          <span className="rounded-full bg-[#EFF6FF] px-2 py-0.5 text-[10px] font-semibold text-[#2563EB]">
            Auto-filled
          </span>
        ) : null}
      </span>

      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-controls={listboxId}
          value={open ? query : (selected?.label ?? "")}
          onChange={(event) => handleInputChange(event.target.value)}
          onFocus={handleInputFocus}
          placeholder={placeholder}
          className={`w-full rounded-xl border px-3.5 py-2.5 pr-9 text-[14px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#2563EB] focus:ring-2 focus:ring-[#BFDBFE] ${
            autoFilled
              ? "border-[#BFDBFE] bg-[#F8FBFF]"
              : "border-[#EAEAEA] bg-white"
          }`}
        />
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
            <path
              d="M3.5 5.25L7 8.75L10.5 5.25"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </div>

      {open ? (
        <ul
          id={listboxId}
          role="listbox"
          className="absolute z-30 mt-1 max-h-56 w-full overflow-auto rounded-xl border border-[#EAEAEA] bg-white py-1 shadow-lg"
        >
          {onCreateNew ? (
            <li>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  setQuery("");
                  onCreateNew();
                }}
                className="flex w-full items-center gap-2 px-3.5 py-2.5 text-left text-[13px] font-semibold text-[#2563EB] transition hover:bg-[#EFF6FF]"
              >
                {createNewLabel}
              </button>
            </li>
          ) : null}

          {filtered.length === 0 ? (
            <li className="px-3.5 py-2.5 text-[13px] text-slate-500">No matches</li>
          ) : (
            filtered.map((option) => (
              <li key={option.value}>
                <button
                  type="button"
                  role="option"
                  aria-selected={option.value === value}
                  onClick={() => selectOption(option.value)}
                  className={`flex w-full flex-col px-3.5 py-2.5 text-left transition hover:bg-[#F8FAFC] ${
                    option.value === value ? "bg-[#EFF6FF]" : ""
                  }`}
                >
                  <span className="text-[14px] font-medium text-slate-900">
                    {option.label}
                  </span>
                  {option.description ? (
                    <span className="mt-0.5 text-[12px] text-slate-500">
                      {option.description}
                    </span>
                  ) : null}
                </button>
              </li>
            ))
          )}
        </ul>
      ) : null}
    </div>
  );
}
