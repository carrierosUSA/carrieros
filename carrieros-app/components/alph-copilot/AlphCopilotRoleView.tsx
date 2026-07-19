"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import AlphCopilotShell from "@/components/alph-copilot/AlphCopilotShell";
import CommandBar from "@/components/alph-copilot/CommandBar";
import LearningPanel from "@/components/alph-copilot/LearningPanel";
import MemoryPanel from "@/components/alph-copilot/MemoryPanel";
import ProactiveFeed from "@/components/alph-copilot/ProactiveFeed";
import {
  getCopilotRoleDef,
  getCopilotSnapshot,
  listActivity,
  listAlerts,
  listMemory,
  setActiveCopilotRole,
  subscribeCopilotStore,
  type CopilotRole,
} from "@/lib/alph-copilot";

type AlphCopilotRoleViewProps = {
  role: CopilotRole;
  /** Optional owner briefing lines from executive summary */
  ownerBriefLines?: string[];
};

function useCopilotTick() {
  return useSyncExternalStore(
    subscribeCopilotStore,
    () => JSON.stringify(getCopilotSnapshot()),
    () => "",
  );
}

export default function AlphCopilotRoleView({
  role,
  ownerBriefLines,
}: AlphCopilotRoleViewProps) {
  const tick = useCopilotTick();
  const [, bump] = useState(0);
  const refresh = useCallback(() => bump((n) => n + 1), []);

  useEffect(() => {
    setActiveCopilotRole(role);
  }, [role]);

  // tick forces re-read after store changes
  void tick;

  const def = getCopilotRoleDef(role);
  const alerts = listAlerts({ role });
  const memory = listMemory(role);
  const activity = listActivity(role).slice(0, 6);

  return (
    <AlphCopilotShell role={role}>
      <div className="space-y-6">
        <header className="rounded-[16px] bg-[#F8FAFC] px-4 py-4 sm:px-5">
          <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#2563EB]">
            {def.name}
          </p>
          <h2 className="mt-1 text-[20px] font-bold tracking-[-0.02em] text-[#111827]">
            {def.title}
          </h2>
          <p className="mt-1 max-w-2xl text-[14px] text-[#6B7280]">
            {def.tagline}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {def.capabilities.slice(0, 5).map((cap) => (
              <span
                key={cap}
                className="rounded-full bg-white px-2.5 py-1 text-[12px] font-medium text-[#475569] shadow-[inset_0_0_0_1px_#EAEAEA]"
              >
                {cap}
              </span>
            ))}
          </div>
        </header>

        {role === "owner" && ownerBriefLines && ownerBriefLines.length > 0 ? (
          <section className="rounded-[16px] bg-[#EFF6FF] px-4 py-4">
            <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#2563EB]">
              From executive board
            </p>
            <ul className="mt-2 space-y-1.5">
              {ownerBriefLines.map((line) => (
                <li key={line} className="text-[14px] font-medium text-[#1E3A8A]">
                  · {line}
                </li>
              ))}
            </ul>
            <Link
              href="/dashboard"
              className="mt-3 inline-flex text-[13px] font-semibold text-[#2563EB]"
            >
              Open dashboard →
            </Link>
          </section>
        ) : null}

        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <section>
              <h2 className="text-[16px] font-semibold text-[#111827]">
                Today&apos;s proactive feed
              </h2>
              <p className="mt-0.5 text-[13px] text-[#6B7280]">
                One-click act, snooze, or dismiss.
              </p>
              <div className="mt-3">
                <ProactiveFeed
                  alerts={alerts}
                  role={role}
                  onChange={refresh}
                />
              </div>
            </section>

            <CommandBar
              role={role}
              chips={def.commandChips}
              onRan={refresh}
            />
          </div>

          <div className="space-y-6">
            <section>
              <h2 className="text-[16px] font-semibold text-[#111827]">
                Suggested actions
              </h2>
              <div className="mt-3 space-y-2">
                {def.suggestedActions.map((action) =>
                  action.href ? (
                    <Link
                      key={action.id}
                      href={action.href}
                      className="block rounded-[14px] bg-[#F8FAFC] px-4 py-3 transition hover:bg-[#EFF6FF]"
                    >
                      <p className="text-[14px] font-semibold text-[#111827]">
                        {action.label}
                      </p>
                      <p className="mt-0.5 text-[13px] text-[#6B7280]">
                        {action.description}
                      </p>
                    </Link>
                  ) : (
                    <div
                      key={action.id}
                      className="rounded-[14px] bg-[#F8FAFC] px-4 py-3"
                    >
                      <p className="text-[14px] font-semibold text-[#111827]">
                        {action.label}
                      </p>
                      <p className="mt-0.5 text-[13px] text-[#6B7280]">
                        {action.description}
                      </p>
                      <p className="mt-1 text-[12px] font-medium text-[#2563EB]">
                        Use One command → {action.commandId?.replace(/_/g, " ")}
                      </p>
                    </div>
                  ),
                )}
              </div>
              {role === "driver" ? (
                <Link
                  href="/driver"
                  className="mt-3 inline-flex text-[13px] font-semibold text-[#2563EB]"
                >
                  Open Driver App →
                </Link>
              ) : null}
            </section>

            <MemoryPanel items={memory} role={role} onChange={refresh} />
            <LearningPanel role={role} />

            <section>
              <h2 className="text-[16px] font-semibold text-[#111827]">
                Recent activity
              </h2>
              <ol className="mt-3 space-y-3">
                {activity.length === 0 ? (
                  <li className="text-[13px] text-[#6B7280]">
                    Commands and actions will show here.
                  </li>
                ) : (
                  activity.map((item) => (
                    <li key={item.id} className="flex gap-3">
                      <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#2563EB]" />
                      <div className="min-w-0">
                        {item.href ? (
                          <Link
                            href={item.href}
                            className="text-[14px] font-semibold text-[#111827] hover:text-[#2563EB]"
                          >
                            {item.title}
                          </Link>
                        ) : (
                          <p className="text-[14px] font-semibold text-[#111827]">
                            {item.title}
                          </p>
                        )}
                        <p className="text-[12px] text-[#6B7280]">{item.detail}</p>
                      </div>
                    </li>
                  ))
                )}
              </ol>
            </section>
          </div>
        </div>
      </div>
    </AlphCopilotShell>
  );
}
