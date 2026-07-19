"use client";

import { Sparkles } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getWorkspaceIdFromPathname } from "@/lib/navigation/daily-use";

/**
 * Single Alph entry in everyday chrome.
 * Copilot role pages stay under Advanced — not promoted here.
 */
export default function AlphFloatingOrb() {
  const pathname = usePathname();
  const workspace = getWorkspaceIdFromPathname(pathname ?? "/");

  if (pathname === "/" || pathname?.startsWith("/alph")) {
    return null;
  }

  return (
    <Link
      href={`/?workspace=${workspace}`}
      title="Ask Alph"
      aria-label="Ask Alph"
      data-workspace={workspace}
      className="fixed bottom-5 right-5 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#2563EB] shadow-[0_8px_24px_rgba(15,23,42,0.12)] ring-1 ring-[#EAEAEA] transition hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(37,99,235,0.18)] hover:ring-[#BFDBFE] sm:bottom-6 sm:right-6"
    >
      <span className="absolute inset-0 rounded-full bg-[#2563EB]/10 animate-[transpo-pulse-soft_2.4s_ease-in-out_infinite]" />
      <Sparkles className="relative h-5 w-5" strokeWidth={1.9} />
    </Link>
  );
}
