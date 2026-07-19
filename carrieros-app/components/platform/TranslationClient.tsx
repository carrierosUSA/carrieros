"use client";

import { useMemo, useState } from "react";
import { TRANSPO_COLORS } from "@/lib/design-system/colors";
import {
  LANGUAGE_LABELS,
  type PlatformLanguage,
} from "@/lib/platform/types";
import {
  getPreferredLanguage,
  setPreferredLanguage,
} from "@/lib/platform/store";
import {
  getTranslateSample,
  translateDemoSample,
  type TranslateDemoKind,
} from "@/lib/platform/translate";

const KINDS: TranslateDemoKind[] = ["chat", "document", "job", "invoice"];
const LANGS = Object.keys(LANGUAGE_LABELS) as PlatformLanguage[];

export default function TranslationClient() {
  const [language, setLanguage] = useState<PlatformLanguage>(() => getPreferredLanguage());
  const [kind, setKind] = useState<TranslateDemoKind>("chat");

  const result = useMemo(
    () => translateDemoSample(kind, language),
    [kind, language],
  );

  return (
    <div className="space-y-6">
      <section className="rounded-[16px] bg-[#F8F9FB] p-5">
        <h2 className="text-[16px] font-semibold text-[#111827]">Preferred language</h2>
        <p className="mt-1 text-[14px] text-[#6B7280]">
          Persists in your local Platform store. Soft-wired preference for demos — full i18n can
          layer on later.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {LANGS.map((lang) => (
            <button
              key={lang}
              type="button"
              onClick={() => {
                setPreferredLanguage(lang);
                setLanguage(lang);
              }}
              className={`rounded-full px-3 py-1.5 text-[13px] font-medium ${
                language === lang
                  ? "bg-[#2563EB] text-white"
                  : "bg-white text-[#64748B] shadow-[inset_0_0_0_1px_#E5E7EB]"
              }`}
            >
              {LANGUAGE_LABELS[lang]}
            </button>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-[16px] font-semibold text-[#111827]">Alph translate demo</h2>
        <p className="mt-1 text-[14px] text-[#6B7280]">
          Translate sample chat, document, job, or invoice copy.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {KINDS.map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setKind(k)}
              className={`rounded-full px-3 py-1.5 text-[13px] font-medium capitalize ${
                kind === k
                  ? "bg-[#2563EB] text-white"
                  : "bg-[#F8F9FB] text-[#64748B]"
              }`}
            >
              {k}
            </button>
          ))}
        </div>

        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          <div className="rounded-[16px] bg-white p-4 shadow-[inset_0_0_0_1px_#EEF2F7]">
            <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#94A3B8]">
              Source (English)
            </p>
            <p className="mt-3 text-[14px] leading-relaxed text-[#111827]">
              {getTranslateSample(kind)}
            </p>
          </div>
          <div className={`rounded-[16px] p-4 ${TRANSPO_COLORS.info.bg}`}>
            <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#64748B]">
              {result.languageLabel}
            </p>
            <p className="mt-3 text-[14px] leading-relaxed text-[#111827]">{result.translated}</p>
            <p className="mt-4 text-[12px] text-[#64748B]">{result.engineNote}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
