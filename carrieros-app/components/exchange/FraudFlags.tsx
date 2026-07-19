import { TRANSPO_COLORS } from "@/lib/design-system/colors";
import type { FraudFlag } from "@/lib/exchange/types";

const toneMap = {
  info: TRANSPO_COLORS.info,
  watch: TRANSPO_COLORS.warning,
  high: TRANSPO_COLORS.critical,
} as const;

export default function FraudFlags({ flags }: { flags: FraudFlag[] }) {
  if (!flags.length) return null;

  return (
    <ul className="space-y-2">
      {flags.map((flag) => {
        const tone = toneMap[flag.severity];
        return (
          <li
            key={flag.id}
            className={`rounded-[12px] px-3 py-2 text-[13px] ${tone.bg} ${tone.text}`}
          >
            <p className="font-medium">{flag.label}</p>
            <p className="mt-0.5 opacity-90">{flag.detail}</p>
          </li>
        );
      })}
    </ul>
  );
}
