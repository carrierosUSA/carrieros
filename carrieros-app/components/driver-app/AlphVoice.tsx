"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Mic, Sparkles } from "lucide-react";
import AiPolicyNotice from "@/components/ai-safety/AiPolicyNotice";
import { useDriverApp } from "@/components/driver-app/DriverAppProvider";
import { mapsNavigationUrl, telHref } from "@/lib/driver-mobile/location-share";
import { DmCard, DmPrimaryButton } from "@/components/driver-mobile/ui";

const COMMANDS = [
  { id: "pod", label: "Upload POD", href: "/driver/documents" },
  { id: "fuel", label: "Fuel receipt", href: "/driver/services" },
  { id: "nav", label: "Navigate", action: "navigate" as const },
  { id: "translate", label: "Translate", reply: "AI translation ready for messages — open Messages and tap Translate." },
  { id: "dispatch", label: "Call Dispatch", action: "call_dispatch" as const },
  { id: "parking", label: "Find parking", reply: "Love’s / TA parking 8 mi ahead with 14 open truck spots (demo)." },
  { id: "fuel_find", label: "Find fuel", reply: "Pilot #289 — diesel ~$0.06 under corridor average." },
  { id: "repair", label: "Find repair", href: "/driver/maintenance" },
  { id: "breakdown", label: "Breakdown", href: "/driver/emergency" },
  { id: "hours", label: "Hours", href: "/driver/eld" },
  { id: "weather", label: "Weather", href: "/driver/safety" },
  { id: "wallet", label: "Wallet", href: "/driver/wallet" },
  { id: "expense", label: "Expense", href: "/driver/expenses" },
];

export default function AlphVoice() {
  const { state, flash } = useDriverApp();
  const router = useRouter();
  const [reply, setReply] = useState<string | null>(null);
  const [listening, setListening] = useState(false);
  const [speechOk, setSpeechOk] = useState(false);

  useEffect(() => {
    setSpeechOk(
      typeof window !== "undefined" &&
        ("SpeechRecognition" in window || "webkitSpeechRecognition" in window),
    );
  }, []);

  const run = (cmd: (typeof COMMANDS)[number]) => {
    const load = state.loads.find((l) => l.id === state.todaysLoadId);
    if (cmd.href) {
      router.push(cmd.href);
      flash(`Alph · ${cmd.label}`);
      return;
    }
    if (cmd.action === "navigate" && load) {
      window.open(
        mapsNavigationUrl(load.destAddress ?? `${load.destCity}, ${load.destState}`),
        "_blank",
      );
      setReply("Opening navigation to your next stop.");
      return;
    }
    if (cmd.action === "call_dispatch") {
      window.location.href = telHref(load?.dispatchPhone ?? "210-555-0100");
      return;
    }
    setReply(cmd.reply ?? state.alphSuggestions[0]?.body ?? "I'm here.");
  };

  const startListen = () => {
    const SR =
      (window as unknown as { SpeechRecognition?: new () => SpeechRecognition }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognition })
        .webkitSpeechRecognition;
    if (!SR) {
      setReply("Speech recognition isn’t available in this browser. Use a command chip.");
      return;
    }
    const rec = new SR();
    rec.lang = "en-US";
    rec.interimResults = false;
    setListening(true);
    rec.onresult = (ev: SpeechRecognitionEvent) => {
      const text = ev.results[0]?.[0]?.transcript?.toLowerCase() ?? "";
      setListening(false);
      const match = COMMANDS.find(
        (c) =>
          text.includes(c.label.toLowerCase().split(" ")[0]!) ||
          text.includes(c.id.replace("_", " ")),
      );
      if (match) run(match);
      else setReply(`Heard: “${text}”. Try a command chip below.`);
    };
    rec.onerror = () => {
      setListening(false);
      setReply("Couldn’t catch that — tap a command chip.");
    };
    rec.onend = () => setListening(false);
    rec.start();
  };

  return (
    <div className="space-y-5 animate-[carrieros-fade-in_0.35s_ease]">
      <div>
        <h2 className="text-[22px] font-bold tracking-tight">Alph</h2>
        <p className="mt-1 text-[14px] text-[var(--dm-muted)]">
          Voice & command assistant — POD, fuel, navigate, dispatch, hours, and more.
        </p>
        <div className="mt-2">
          <AiPolicyNotice variant="assist" />
        </div>
      </div>

      <DmCard className="space-y-3 text-center">
        <Sparkles className="mx-auto h-8 w-8 text-[var(--color-info)]" />
        <p className="text-[15px] text-[var(--dm-muted)]">
          {speechOk
            ? "Web Speech API available — tap the mic or a command."
            : "Speech API unavailable — use command chips."}
        </p>
        <DmPrimaryButton onClick={startListen} disabled={listening}>
          <Mic className="h-5 w-5" />
          {listening ? "Listening…" : "Hold to speak"}
        </DmPrimaryButton>
        {reply && (
          <p className="rounded-2xl bg-[var(--dm-elevated)] px-4 py-3 text-left text-[14px] leading-relaxed">
            {reply}
          </p>
        )}
      </DmCard>

      <div className="flex flex-wrap gap-2">
        {COMMANDS.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => run(c)}
            className="min-h-11 rounded-full bg-[var(--dm-surface)] px-3.5 text-[13px] font-semibold"
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {state.alphSuggestions.map((s) => (
          <DmCard key={s.id}>
            <p className="text-[15px] font-semibold">{s.title}</p>
            <p className="mt-1 text-[13px] text-[var(--dm-muted)]">{s.body}</p>
          </DmCard>
        ))}
      </div>
    </div>
  );
}

/** Minimal SpeechRecognition typings for browsers that expose the API */
type SpeechRecognition = {
  lang: string;
  interimResults: boolean;
  start: () => void;
  onresult: ((ev: SpeechRecognitionEvent) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
};

type SpeechRecognitionEvent = {
  results: { [index: number]: { [index: number]: { transcript: string } } };
};
