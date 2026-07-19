"use client";

import { Star } from "lucide-react";
import { getAlphUrgency, type AlphIssue } from "@/lib/dispatch/alph-issues";

type LoadDetailAlphBubbleProps = {
  issues: AlphIssue[];
};

const URGENCY_STYLES = {
  normal: {
    button:
      "bg-white/95 shadow-[0_2px_12px_rgba(59,130,246,0.28),0_0_0_1px_rgba(59,130,246,0.12)] hover:shadow-[0_4px_16px_rgba(59,130,246,0.36),0_0_0_1px_rgba(59,130,246,0.18)]",
    glow: "bg-blue-400/35 blur-[4px]",
    star: "fill-blue-500 text-blue-500 drop-shadow-[0_0_6px_rgba(59,130,246,0.75)]",
    ring: "",
    badge: "bg-[#2563EB]",
  },
  urgent: {
    button: "alph-bubble-urgent bg-white/95",
    glow: "bg-orange-400/40 blur-[5px]",
    star: "fill-orange-500 text-orange-500 drop-shadow-[0_0_6px_rgba(249,115,22,0.8)]",
    ring: "ring-2 ring-orange-400/30",
    badge: "bg-[#EA580C]",
  },
  critical: {
    button: "alph-bubble-critical bg-white/95",
    glow: "bg-red-400/45 blur-[5px]",
    star: "fill-red-500 text-red-500 drop-shadow-[0_0_6px_rgba(239,68,68,0.85)]",
    ring: "ring-2 ring-red-400/35",
    badge: "bg-[#DC2626]",
  },
} as const;

function scrollToAlph() {
  document.getElementById("load-alph")?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

export default function LoadDetailAlphBubble({ issues }: LoadDetailAlphBubbleProps) {
  const urgency = getAlphUrgency(issues);
  const styles = URGENCY_STYLES[urgency];
  const issueCount = issues.length;

  return (
    <>
      <button
        type="button"
        onClick={scrollToAlph}
        aria-label={
          issueCount > 0
            ? `Open Alph — ${issueCount} issue${issueCount === 1 ? "" : "s"} detected`
            : "Open Alph"
        }
        className={`fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full backdrop-blur-sm transition-[box-shadow,transform] duration-200 hover:scale-[1.04] active:scale-[0.97] ${styles.button} ${styles.ring}`}
      >
        <span className="relative flex h-5 w-5 items-center justify-center">
          <span
            className={`absolute inset-[-4px] rounded-full ${styles.glow}`}
            aria-hidden
          />
          <Star className={`relative h-4 w-4 ${styles.star}`} aria-hidden />
        </span>
        {issueCount > 0 ? (
          <span
            className={`absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white ${styles.badge}`}
          >
            {issueCount}
          </span>
        ) : null}
      </button>

      <style jsx global>{`
        @keyframes alph-bubble-pulse-orange {
          0%,
          100% {
            box-shadow:
              0 2px 12px rgba(249, 115, 22, 0.35),
              0 0 0 0 rgba(249, 115, 22, 0.45);
          }
          50% {
            box-shadow:
              0 4px 18px rgba(249, 115, 22, 0.5),
              0 0 0 10px rgba(249, 115, 22, 0);
          }
        }

        @keyframes alph-bubble-pulse-red {
          0%,
          100% {
            box-shadow:
              0 2px 12px rgba(239, 68, 68, 0.4),
              0 0 0 0 rgba(239, 68, 68, 0.5);
          }
          50% {
            box-shadow:
              0 4px 20px rgba(239, 68, 68, 0.55),
              0 0 0 12px rgba(239, 68, 68, 0);
          }
        }

        .alph-bubble-urgent {
          animation: alph-bubble-pulse-orange 2.2s ease-in-out infinite;
        }

        .alph-bubble-critical {
          animation: alph-bubble-pulse-red 1.6s ease-in-out infinite;
        }
      `}</style>
    </>
  );
}
