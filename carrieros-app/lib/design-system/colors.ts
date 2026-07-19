/** Semantic color classes — Transpo.ai palette (blue/green/orange/red/gray). */
export const TRANSPO_COLORS = {
  info: {
    bg: "bg-[#EFF6FF]",
    text: "text-[#2563EB]",
    border: "border-[#BFDBFE]",
    ring: "ring-[#93C5FD]",
  },
  success: {
    bg: "bg-[#ECFDF3]",
    text: "text-[#16A34A]",
    border: "border-[#BBF7D0]",
    ring: "ring-[#86EFAC]",
  },
  warning: {
    bg: "bg-[#FFF7ED]",
    text: "text-[#EA580C]",
    border: "border-[#FED7AA]",
    ring: "ring-[#FDBA74]",
  },
  critical: {
    bg: "bg-[#FEF2F2]",
    text: "text-[#DC2626]",
    border: "border-[#FECACA]",
    ring: "ring-[#FCA5A5]",
  },
  disabled: {
    bg: "bg-[#F8FAFC]",
    text: "text-[#94A3B8]",
    border: "border-[#E2E8F0]",
    ring: "ring-[#CBD5E1]",
  },
} as const;

/** @deprecated Prefer TRANSPO_COLORS — kept for internal migration aliases */
export const CARRIEROS_COLORS = TRANSPO_COLORS;

export type CarrierosSemanticColor = keyof typeof TRANSPO_COLORS;
export type TranspoSemanticColor = CarrierosSemanticColor;
