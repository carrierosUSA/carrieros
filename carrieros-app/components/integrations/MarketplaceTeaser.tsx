import { ArrowUpRight, Store } from "lucide-react";

const TEASERS = [
  {
    title: "Browse marketplace",
    description:
      "Discover certified ELD, factoring, and fuel partners built for carriers.",
  },
  {
    title: "Partner APIs",
    description:
      "Publish your own webhooks and pull Transpo.ai data into custom tools.",
  },
  {
    title: "Coming soon partners",
    description:
      "KeepTruckin legacy, KeepTruckin→Motive migration kits, and more.",
  },
];

export default function MarketplaceTeaser() {
  return (
    <section className="rounded-[16px] bg-gradient-to-br from-[#EFF6FF] to-[#F8FAFC] p-5 ring-1 ring-[#BFDBFE]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-[12px] bg-white text-[#2563EB] shadow-sm ring-1 ring-[#BFDBFE]">
            <Store className="h-5 w-5" strokeWidth={1.9} />
          </div>
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#2563EB]">
              Future API Marketplace
            </p>
            <h2 className="mt-1 text-[16px] font-semibold text-slate-900">
              More partners, one place
            </h2>
            <p className="mt-1 max-w-xl text-[13px] leading-5 text-slate-600">
              A curated catalog of trucking APIs — install with one click when
              we open the marketplace.
            </p>
          </div>
        </div>
        <button
          type="button"
          disabled
          title="Marketplace opens in a future release"
          className="inline-flex h-10 cursor-not-allowed items-center gap-1.5 rounded-full bg-white/80 px-4 text-[13px] font-semibold text-slate-400 ring-1 ring-[#E2E8F0]"
        >
          Browse marketplace
          <ArrowUpRight className="h-4 w-4" strokeWidth={2} />
        </button>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {TEASERS.map((card) => (
          <div
            key={card.title}
            className="rounded-[14px] bg-white/90 p-4 ring-1 ring-white"
          >
            <p className="text-[14px] font-semibold text-slate-900">
              {card.title}
            </p>
            <p className="mt-1.5 text-[13px] leading-5 text-slate-500">
              {card.description}
            </p>
            <p className="mt-3 text-[12px] font-semibold text-[#2563EB]">
              Coming soon
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
