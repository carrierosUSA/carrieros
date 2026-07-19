"use client";

import WalletBadgeChip from "@/components/wallet/WalletBadgeChip";
import { TRANSPO_COLORS } from "@/lib/design-system/colors";
import type { CareerPassport, WalletBadge } from "@/lib/wallet/types";

const KIND_TONE: Record<string, keyof typeof TRANSPO_COLORS> = {
  employment: "info",
  certification: "success",
  award: "warning",
  training: "info",
  milestone: "success",
  review: "info",
};

export default function PassportClient({
  passport,
  badges,
}: {
  passport: CareerPassport;
  badges: WalletBadge[];
}) {
  const { identity } = passport;

  return (
    <div className="space-y-8">
      <section className="rounded-[16px] bg-gradient-to-br from-[#EFF6FF] via-[#F8F9FB] to-white p-5 sm:p-6">
        <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#6B7280]">
          Lifelong Career Passport
        </p>
        <div className="mt-4 flex flex-wrap items-start gap-4">
          <div className="grid h-16 w-16 place-items-center rounded-full bg-white text-[18px] font-bold text-[#2563EB] shadow-[0_8px_24px_rgba(37,99,235,0.12)]">
            {identity.photoInitials}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-[22px] font-bold text-[#111827]">{identity.fullName}</h2>
            <p className="mt-1 text-[15px] text-[#334155]">{identity.headline}</p>
            <p className="mt-2 text-[14px] text-[#6B7280]">
              {identity.locationCity}, {identity.locationState} · {identity.yearsExperience}{" "}
              years experience · {identity.languages.join(" / ")}
            </p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {badges.map((b) => (
            <WalletBadgeChip key={b.id} badge={b} compact />
          ))}
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Equipment", values: identity.equipmentExperience },
          { label: "Trailers", values: identity.trailerExperience },
          { label: "States driven", values: identity.statesDriven },
          { label: "Special skills", values: identity.specialSkills },
        ].map((block) => (
          <section key={block.label} className="rounded-[12px] bg-[#F8F9FB] p-4">
            <h3 className="text-[13px] font-medium text-[#6B7280]">{block.label}</h3>
            <p className="mt-2 text-[14px] leading-relaxed text-[#111827]">
              {block.values.join(" · ")}
            </p>
          </section>
        ))}
      </div>

      <section className="space-y-3">
        <h2 className="text-[15px] font-semibold text-[#111827]">Companies worked</h2>
        <div className="space-y-2">
          {passport.companies.map((c) => (
            <div
              key={c.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-[12px] bg-[#F8F9FB] px-4 py-3"
            >
              <div>
                <p className="text-[14px] font-semibold text-[#111827]">{c.name}</p>
                <p className="mt-0.5 text-[13px] text-[#6B7280]">
                  {c.role} · {c.startDate}
                  {c.endDate ? ` – ${c.endDate}` : " – Present"}
                </p>
              </div>
              {c.verified ? (
                <span
                  className={`rounded-full px-2.5 py-1 text-[12px] font-medium ${TRANSPO_COLORS.success.bg} ${TRANSPO_COLORS.success.text}`}
                >
                  Verified employment
                </span>
              ) : null}
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-[15px] font-semibold text-[#111827]">
          Professional growth timeline
        </h2>
        <ol className="relative space-y-0 border-l border-[#E5E7EB] ml-3">
          {passport.timeline.map((event) => {
            const tone = KIND_TONE[event.kind] ?? "info";
            const colors = TRANSPO_COLORS[tone];
            return (
              <li key={event.id} className="relative pb-6 pl-6 last:pb-0">
                <span
                  className={`absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full ${colors.bg} ring-2 ring-white`}
                  style={{ backgroundColor: tone === "success" ? "#16A34A" : tone === "warning" ? "#EA580C" : "#2563EB" }}
                />
                <p className="text-[12px] font-medium uppercase tracking-wide text-[#6B7280]">
                  {event.date}
                </p>
                <p className="mt-1 text-[15px] font-semibold text-[#111827]">
                  {event.title}
                  {event.verified ? (
                    <span className={`ml-2 text-[12px] font-medium ${TRANSPO_COLORS.success.text}`}>
                      Verified
                    </span>
                  ) : null}
                </p>
                <p className="mt-1 text-[14px] leading-relaxed text-[#6B7280]">
                  {event.detail}
                </p>
              </li>
            );
          })}
        </ol>
      </section>

      <div className="grid gap-4 lg:grid-cols-3">
        <section className="rounded-[12px] bg-[#F8F9FB] p-4">
          <h3 className="text-[15px] font-semibold text-[#111827]">Training</h3>
          <ul className="mt-3 space-y-2">
            {passport.trainingHighlights.map((t) => (
              <li key={t} className="text-[14px] text-[#334155]">
                {t}
              </li>
            ))}
          </ul>
        </section>
        <section className="rounded-[12px] bg-[#F8F9FB] p-4">
          <h3 className="text-[15px] font-semibold text-[#111827]">Awards & achievements</h3>
          <ul className="mt-3 space-y-2">
            {passport.awards.map((a) => (
              <li key={a.id} className="text-[14px] text-[#334155]">
                <span className="font-medium text-[#111827]">{a.title}</span>
                <span className="text-[#6B7280]">
                  {" "}
                  · {a.year} · {a.issuer}
                </span>
              </li>
            ))}
            {passport.achievements.map((a) => (
              <li key={a} className="text-[14px] text-[#334155]">
                {a}
              </li>
            ))}
          </ul>
        </section>
        <section className="rounded-[12px] bg-[#F8F9FB] p-4">
          <h3 className="text-[15px] font-semibold text-[#111827]">Verified reviews</h3>
          <div className="mt-3 space-y-3">
            {passport.reviews.map((r) => (
              <div key={r.id}>
                <p className="text-[14px] font-semibold text-[#111827]">
                  {r.author}{" "}
                  <span className="font-medium text-[#6B7280]">· {r.role}</span>
                </p>
                <p className="mt-1 text-[14px] leading-relaxed text-[#334155]">{r.body}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
