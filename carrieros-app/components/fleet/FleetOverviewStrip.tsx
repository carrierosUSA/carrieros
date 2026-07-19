"use client";

import { TRANSPO_COLORS } from "@/lib/design-system/colors";
import type {
  FleetFilter,
  FleetOpsStatus,
  FleetOverviewCard,
} from "@/lib/fleet/fleet-dashboard";

type FleetOverviewStripProps = {
  cards: FleetOverviewCard[];
  activeFilter: FleetFilter;
  onSelect: (filter: FleetFilter) => void;
};

function isActive(card: FleetOverviewCard, filter: FleetFilter): boolean {
  if (!filter) return false;
  return filter.kind === card.kind && filter.id === card.id;
}

function OverviewCardButton({
  card,
  active,
  onSelect,
}: {
  card: FleetOverviewCard;
  active: boolean;
  onSelect: (filter: FleetFilter) => void;
}) {
  const toneStyles = card.tone ? TRANSPO_COLORS[card.tone] : null;
  const surface =
    active
      ? "bg-white shadow-[0_8px_24px_rgba(37,99,235,0.12)] ring-2 ring-[#93C5FD]"
      : card.highlight === "critical"
        ? TRANSPO_COLORS.critical.bg
        : card.highlight === "warning"
          ? TRANSPO_COLORS.warning.bg
          : "bg-[#F8F9FB]";
  const valueColor = active
    ? "text-[#2563EB]"
    : card.highlight === "critical"
      ? TRANSPO_COLORS.critical.text
      : card.highlight === "warning"
        ? TRANSPO_COLORS.warning.text
        : toneStyles
          ? toneStyles.text
          : "text-[#111827]";
  const dotClass =
    card.highlight === "critical"
      ? "bg-[#DC2626]"
      : card.highlight === "warning"
        ? "bg-[#EA580C]"
        : card.tone === "success"
          ? "bg-[#16A34A]"
          : card.tone === "info"
            ? "bg-[#2563EB]"
            : card.tone === "critical"
              ? "bg-[#DC2626]"
              : card.tone === "warning"
                ? "bg-[#EA580C]"
                : "bg-[#94A3B8]";

  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={() => {
        if (active) {
          onSelect(null);
          return;
        }
        onSelect(
          card.kind === "status"
            ? { kind: "status", id: card.id as FleetOpsStatus }
            : { kind: "equipment", id: card.id },
        );
      }}
      className={`flex h-16 w-[112px] shrink-0 flex-col justify-between rounded-[12px] px-3 py-2 text-left transition duration-200 hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_8px_24px_rgba(37,99,235,0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#93C5FD] sm:w-[120px] ${surface}`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="line-clamp-2 text-[12px] font-medium leading-snug text-[#6B7280]">
          {card.label}
        </p>
        <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${dotClass}`} aria-hidden />
      </div>
      <p className={`text-[20px] font-bold tabular-nums tracking-tight ${valueColor}`}>
        {card.count}
      </p>
    </button>
  );
}

export default function FleetOverviewStrip({
  cards,
  activeFilter,
  onSelect,
}: FleetOverviewStripProps) {
  const equipmentCards = cards.filter((card) => card.kind === "equipment");
  const statusCards = cards.filter((card) => card.kind === "status");

  return (
    <div
      className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 md:flex-wrap md:overflow-visible"
      role="group"
      aria-label="Fleet overview filters"
    >
      {equipmentCards.map((card) => (
        <OverviewCardButton
          key={`${card.kind}:${card.id}`}
          card={card}
          active={isActive(card, activeFilter)}
          onSelect={onSelect}
        />
      ))}

      {equipmentCards.length > 0 && statusCards.length > 0 ? (
        <div
          className="mx-1 hidden h-16 w-px shrink-0 self-center bg-[#E2E8F0] md:block"
          aria-hidden
        />
      ) : null}

      {statusCards.map((card) => (
        <OverviewCardButton
          key={`${card.kind}:${card.id}`}
          card={card}
          active={isActive(card, activeFilter)}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}
