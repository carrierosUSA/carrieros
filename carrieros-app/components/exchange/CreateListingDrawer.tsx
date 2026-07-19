"use client";

import { useState } from "react";
import { X } from "lucide-react";
import {
  EXCHANGE_CATEGORY_LABELS,
  LISTING_CONDITION_LABELS,
  type ExchangeCategory,
  type ListingCondition,
} from "@/lib/exchange/types";
import { createListing } from "@/lib/exchange/store";

const categories = Object.keys(EXCHANGE_CATEGORY_LABELS) as ExchangeCategory[];
const conditions = Object.keys(LISTING_CONDITION_LABELS) as ListingCondition[];

export default function CreateListingDrawer({
  open,
  onClose,
  onCreated,
  defaultCategory,
}: {
  open: boolean;
  onClose: () => void;
  onCreated?: (id: string) => void;
  defaultCategory?: ExchangeCategory;
}) {
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState<ExchangeCategory>(defaultCategory ?? "equipment");
  const [subcategory, setSubcategory] = useState("general");
  const [condition, setCondition] = useState<ListingCondition>("used_good");
  const [city, setCity] = useState("Chicago");
  const [state, setState] = useState("IL");

  if (!open) return null;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const listing = createListing({
      sellerId: "sel-midwest-truck",
      category,
      subcategory,
      title: title.trim() || "Untitled listing",
      summary: summary.trim() || "New Transpo Exchange™ listing",
      description: description.trim() || summary || title,
      price: Number(price) || 0,
      condition,
      locationCity: city,
      locationState: state,
    });
    onCreated?.(listing.id);
    onClose();
    setTitle("");
    setSummary("");
    setDescription("");
    setPrice("");
  }

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-[#0F172A]/30 backdrop-blur-[1px]">
      <button type="button" className="flex-1" aria-label="Close" onClick={onClose} />
      <aside className="flex h-full w-full max-w-md flex-col bg-white shadow-[-12px_0_40px_rgba(15,23,42,0.12)]">
        <header className="flex items-center justify-between px-5 py-4">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#6B7280]">
              Transpo Exchange™
            </p>
            <h2 className="transpo-section-title text-[18px]">Create listing</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-[#6B7280] hover:bg-[#F8F9FB]"
            aria-label="Close drawer"
          >
            <X className="h-5 w-5" strokeWidth={2} />
          </button>
        </header>
        <form onSubmit={submit} className="flex flex-1 flex-col gap-4 overflow-y-auto px-5 pb-6">
          <label className="block space-y-1.5">
            <span className="transpo-label text-[13px]">Title</span>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-[12px] bg-[#F8F9FB] px-3 py-2.5 text-[14px] outline-none ring-1 ring-transparent focus:bg-white focus:ring-[#BFDBFE]"
              placeholder="e.g. 2021 Cascadia sleeper"
            />
          </label>
          <label className="block space-y-1.5">
            <span className="transpo-label text-[13px]">Summary</span>
            <input
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="w-full rounded-[12px] bg-[#F8F9FB] px-3 py-2.5 text-[14px] outline-none focus:bg-white focus:ring-1 focus:ring-[#BFDBFE]"
            />
          </label>
          <label className="block space-y-1.5">
            <span className="transpo-label text-[13px]">Description</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full rounded-[12px] bg-[#F8F9FB] px-3 py-2.5 text-[14px] outline-none focus:bg-white focus:ring-1 focus:ring-[#BFDBFE]"
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block space-y-1.5">
              <span className="transpo-label text-[13px]">Category</span>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ExchangeCategory)}
                className="w-full rounded-[12px] bg-[#F8F9FB] px-3 py-2.5 text-[14px]"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {EXCHANGE_CATEGORY_LABELS[c]}
                  </option>
                ))}
              </select>
            </label>
            <label className="block space-y-1.5">
              <span className="transpo-label text-[13px]">Subcategory</span>
              <input
                value={subcategory}
                onChange={(e) => setSubcategory(e.target.value)}
                className="w-full rounded-[12px] bg-[#F8F9FB] px-3 py-2.5 text-[14px]"
              />
            </label>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="block space-y-1.5">
              <span className="transpo-label text-[13px]">Price (USD)</span>
              <input
                type="number"
                min={0}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full rounded-[12px] bg-[#F8F9FB] px-3 py-2.5 text-[14px]"
              />
            </label>
            <label className="block space-y-1.5">
              <span className="transpo-label text-[13px]">Condition</span>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value as ListingCondition)}
                className="w-full rounded-[12px] bg-[#F8F9FB] px-3 py-2.5 text-[14px]"
              >
                {conditions.map((c) => (
                  <option key={c} value={c}>
                    {LISTING_CONDITION_LABELS[c]}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="block space-y-1.5">
              <span className="transpo-label text-[13px]">City</span>
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full rounded-[12px] bg-[#F8F9FB] px-3 py-2.5 text-[14px]"
              />
            </label>
            <label className="block space-y-1.5">
              <span className="transpo-label text-[13px]">State</span>
              <input
                value={state}
                onChange={(e) => setState(e.target.value)}
                maxLength={2}
                className="w-full rounded-[12px] bg-[#F8F9FB] px-3 py-2.5 text-[14px] uppercase"
              />
            </label>
          </div>
          <button type="submit" className="transpo-btn-primary mt-auto">
            Publish listing
          </button>
        </form>
      </aside>
    </div>
  );
}
