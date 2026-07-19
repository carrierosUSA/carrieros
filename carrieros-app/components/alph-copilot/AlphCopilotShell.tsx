"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles } from "lucide-react";
import type { ReactNode } from "react";
import AiPolicyNotice from "@/components/ai-safety/AiPolicyNotice";
import FadeIn from "@/components/ui/FadeIn";
import PageShell from "@/components/ui/PageShell";
import {
  getCopilotRoleDef,
  listCopilotRoles,
  type CopilotRole,
} from "@/lib/alph-copilot";

type AlphCopilotShellProps = {
  role?: CopilotRole;
  title?: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
};

export default function AlphCopilotShell({
  role,
  title,
  description,
  action,
  children,
}: AlphCopilotShellProps) {
  const pathname = usePathname();
  const roles = listCopilotRoles();
  const def = role ? getCopilotRoleDef(role) : undefined;

  return (
    <PageShell
      eyebrow="Alph Copilot™"
      title={title ?? def?.name ?? "Alph Copilot™"}
      description={
        description ??
        def?.tagline ??
        "Role-specific AI employees — proactive, memory-aware, one-command capable."
      }
      action={
        action ?? (
          <Link href="/" className="transpo-btn-secondary">
            Alph workspace
          </Link>
        )
      }
    >
      <div className="mb-1">
        <AiPolicyNotice variant="assist" />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Link
          href="/alph/copilot"
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-semibold transition ${
            pathname === "/alph/copilot"
              ? "bg-[#2563EB] text-white"
              : "bg-[#F5F7FA] text-[#475569] hover:bg-[#EFF6FF] hover:text-[#2563EB]"
          }`}
        >
          <Sparkles className="h-3.5 w-3.5" strokeWidth={2} />
          Home
        </Link>
        {roles.map((r) => {
          const active = pathname === r.href || role === r.id;
          return (
            <Link
              key={r.id}
              href={r.href}
              className={`rounded-full px-3 py-1.5 text-[13px] font-semibold transition ${
                active
                  ? "bg-[#2563EB] text-white"
                  : "bg-[#F5F7FA] text-[#475569] hover:bg-[#EFF6FF] hover:text-[#2563EB]"
              }`}
            >
              {r.name.replace(" Alph", "")}
            </Link>
          );
        })}
      </div>

      <FadeIn className="mt-5">{children}</FadeIn>
    </PageShell>
  );
}
