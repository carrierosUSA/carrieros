"use client";

import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import AlphCopilotShell from "@/components/alph-copilot/AlphCopilotShell";
import CommandBar from "@/components/alph-copilot/CommandBar";
import LearningPanel from "@/components/alph-copilot/LearningPanel";
import ProactiveFeed from "@/components/alph-copilot/ProactiveFeed";
import {
  getActiveCopilotRole,
  getCopilotSnapshot,
  initCopilotRoleFromSession,
  listAlerts,
  listCopilotRoles,
  setActiveCopilotRole,
  subscribeCopilotStore,
  type CopilotRole,
} from "@/lib/alph-copilot";
import type { CarrierOSRole } from "@/lib/auth/session";

type AlphCopilotHomeProps = {
  sessionRole: CarrierOSRole;
  userName: string;
};

function useCopilotTick() {
  return useSyncExternalStore(
    subscribeCopilotStore,
    () => JSON.stringify(getCopilotSnapshot()),
    () => "",
  );
}

export default function AlphCopilotHome({
  sessionRole,
  userName,
}: AlphCopilotHomeProps) {
  const tick = useCopilotTick();
  const [role, setRole] = useState<CopilotRole>("owner");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const active = initCopilotRoleFromSession(sessionRole);
    setRole(active);
    setReady(true);
  }, [sessionRole]);

  void tick;

  const activeRole = ready ? getActiveCopilotRole() : role;
  const alerts = listAlerts({ role: activeRole });
  const roles = listCopilotRoles();

  function switchRole(next: CopilotRole) {
    setActiveCopilotRole(next);
    setRole(next);
  }

  return (
    <AlphCopilotShell
      title="Alph"
      description={`One assistant for ${userName.split(" ")[0] ?? "your"} company — workspace context changes what Alph retrieves. Alph assists; you decide.`}
      action={
        <Link href={roles.find((r) => r.id === activeRole)?.href ?? "/alph/copilot/owner"} className="transpo-btn-primary">
          Open {roles.find((r) => r.id === activeRole)?.name ?? "Alph · Owner"}
        </Link>
      }
    >
      <div className="space-y-6">
        <section className="rounded-[16px] bg-[#F8FAFC] px-4 py-4 sm:px-5">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#2563EB]">
                Role switcher
              </p>
              <p className="mt-1 text-[14px] text-[#6B7280]">
                Session role:{" "}
                <span className="font-semibold text-[#111827]">
                  {sessionRole.replace("_", " ")}
                </span>
                {" · "}
                Demo switch anytime
              </p>
            </div>
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {roles.map((r) => {
              const selected = r.id === activeRole;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => switchRole(r.id)}
                  className={`rounded-[14px] px-4 py-3 text-left transition ${
                    selected
                      ? "bg-[#2563EB] text-white shadow-sm"
                      : "bg-white text-[#111827] shadow-[inset_0_0_0_1px_#EAEAEA] hover:shadow-[inset_0_0_0_1px_#BFDBFE]"
                  }`}
                >
                  <p className="text-[14px] font-semibold">{r.name}</p>
                  <p
                    className={`mt-0.5 text-[12px] ${
                      selected ? "text-white/80" : "text-[#6B7280]"
                    }`}
                  >
                    {r.title}
                  </p>
                </button>
              );
            })}
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-6">
            <section>
              <h2 className="text-[16px] font-semibold text-[#111827]">
                Today&apos;s proactive feed
              </h2>
              <p className="mt-0.5 text-[13px] text-[#6B7280]">
                Filtered for{" "}
                {roles.find((r) => r.id === activeRole)?.name ?? "your Alph"}
              </p>
              <div className="mt-3">
                <ProactiveFeed
                  alerts={alerts}
                  role={activeRole}
                  onChange={() => setRole(getActiveCopilotRole())}
                />
              </div>
            </section>
            <CommandBar role={activeRole} />
          </div>

          <div className="space-y-6">
            <section>
              <h2 className="text-[16px] font-semibold text-[#111827]">
                Meet your Alph team
              </h2>
              <div className="mt-3 space-y-2">
                {roles.map((r) => (
                  <Link
                    key={r.id}
                    href={r.href}
                    className="block rounded-[14px] bg-[#F8FAFC] px-4 py-3 transition hover:bg-[#EFF6FF]"
                  >
                    <p className="text-[14px] font-semibold text-[#111827]">
                      {r.name}
                    </p>
                    <p className="mt-0.5 text-[13px] text-[#6B7280]">
                      {r.tagline}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
            <LearningPanel role={activeRole} />
          </div>
        </div>
      </div>
    </AlphCopilotShell>
  );
}
