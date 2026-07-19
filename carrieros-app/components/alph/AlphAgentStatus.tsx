"use client";

import Link from "next/link";
import { Bot, Sparkles } from "lucide-react";
import {
  ALPH_AGENTS,
  getAlphAgentCopilotHref,
} from "@/lib/alph/agents";

export default function AlphAgentStatus() {
  return (
    <section className="rounded-[18px] bg-[#F8FAFC] px-5 py-5">
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-white text-[#2563EB]">
          <Bot className="h-5 w-5" strokeWidth={1.9} />
        </span>
        <div>
          <h2 className="text-[16px] font-semibold text-[#0F172A]">
            Alph workspace focuses
          </h2>
          <p className="mt-1 text-[13px] leading-relaxed text-[#64748B]">
            One Alph — open a focus for dispatch, finance, safety, or fleet.
            Context changes with the workspace; permissions stay yours.
          </p>
        </div>
      </div>

      <ul className="mt-5 grid gap-3 sm:grid-cols-2">
        {ALPH_AGENTS.map((agent) => (
          <li key={agent.id}>
            <Link
              href={getAlphAgentCopilotHref(agent.id)}
              className="block rounded-2xl bg-white px-4 py-3.5 transition hover:bg-[#EFF6FF]"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-[14px] font-semibold text-[#0F172A]">
                  {agent.name}
                </p>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EFF6FF] px-2.5 py-1 text-[11px] font-semibold text-[#2563EB]">
                  <Sparkles className="h-3 w-3" strokeWidth={2} />
                  {agent.statusLabel}
                </span>
              </div>
              <p className="mt-1.5 text-[13px] leading-snug text-[#64748B]">
                {agent.description}
              </p>
            </Link>
          </li>
        ))}
      </ul>

      <Link
        href="/alph/copilot"
        className="mt-4 inline-flex text-[13px] font-semibold text-[#2563EB]"
      >
        Open Alph →
      </Link>
    </section>
  );
}
