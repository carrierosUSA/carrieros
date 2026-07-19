"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import {
  getActiveCopilotRole,
  getCopilotRoleDef,
  initCopilotRoleFromSession,
  subscribeCopilotStore,
} from "@/lib/alph-copilot";
import { getCurrentSession } from "@/lib/auth/session";

type RoleContextBannerProps = {
  compact?: boolean;
};

export default function RoleContextBanner({
  compact = false,
}: RoleContextBannerProps) {
  const [label, setLabel] = useState("Alph · Owner");
  const [href, setHref] = useState("/alph/copilot/owner");

  useEffect(() => {
    const session = getCurrentSession();
    initCopilotRoleFromSession(session.role);
    const sync = () => {
      const role = getActiveCopilotRole();
      const def = getCopilotRoleDef(role);
      setLabel(def.name);
      setHref(def.href);
    };
    sync();
    return subscribeCopilotStore(sync);
  }, []);

  if (compact) {
    return (
      <Link
        href="/alph/copilot"
        className="inline-flex items-center gap-1.5 rounded-full bg-[#EFF6FF] px-3 py-1.5 text-[12px] font-semibold text-[#2563EB] transition hover:bg-[#DBEAFE]"
      >
        <Sparkles className="h-3.5 w-3.5" strokeWidth={2} />
        Open Alph · {label}
      </Link>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-[16px] bg-[#EFF6FF] px-4 py-3">
      <div className="min-w-0">
        <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#2563EB]">
          Alph
        </p>
        <p className="mt-0.5 text-[14px] font-medium text-[#1E3A8A]">
          Workspace focus: {label} — one Alph, context-aware. You decide.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Link href={href} className="transpo-btn-primary text-[13px]">
          Open Copilot
        </Link>
        <Link href="/alph/copilot" className="transpo-btn-secondary text-[13px]">
          All roles
        </Link>
      </div>
    </div>
  );
}
