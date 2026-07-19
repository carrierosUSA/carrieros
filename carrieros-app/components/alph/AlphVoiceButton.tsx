"use client";

import { Mic, MicOff } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  createAlphVoiceListener,
  isAlphVoiceSupported,
  type AlphVoiceStatus,
} from "@/lib/alph/voice";

type AlphVoiceButtonProps = {
  onTranscript: (text: string, isFinal: boolean) => void;
  disabled?: boolean;
};

export default function AlphVoiceButton({
  onTranscript,
  disabled,
}: AlphVoiceButtonProps) {
  const [status, setStatus] = useState<AlphVoiceStatus>("idle");
  const [supported, setSupported] = useState(false);
  const listenerRef = useRef<ReturnType<typeof createAlphVoiceListener> | null>(
    null,
  );
  // Keep latest callback without re-creating the voice listener every render.
  const onTranscriptRef = useRef(onTranscript);
  onTranscriptRef.current = onTranscript;

  useEffect(() => {
    setSupported(isAlphVoiceSupported());
    listenerRef.current = createAlphVoiceListener({
      onResult: (text, isFinal) => onTranscriptRef.current(text, isFinal),
      onStatus: setStatus,
    });

    return () => {
      listenerRef.current?.stopListening();
    };
  }, []);

  const listening = status === "listening";
  const tooltip = !supported
    ? "Voice not available in this browser"
    : status === "denied"
      ? "Microphone permission denied"
      : listening
        ? "Listening… tap to stop"
        : "Speak a command";

  return (
    <button
      type="button"
      disabled={disabled || !supported}
      title={tooltip}
      aria-label={tooltip}
      onClick={() => {
        if (!listenerRef.current) {
          return;
        }
        if (listening) {
          listenerRef.current.stopListening();
          return;
        }
        listenerRef.current.startListening();
      }}
      className={`grid h-11 w-11 place-items-center rounded-xl transition ${
        listening
          ? "bg-[#2563EB] text-white shadow-[0_8px_18px_rgba(37,99,235,0.28)]"
          : supported
            ? "bg-[#F5F7FA] text-[#334155] hover:bg-[#EFF6FF] hover:text-[#1D4ED8]"
            : "cursor-not-allowed bg-[#F8FAFC] text-[#94A3B8]"
      }`}
    >
      {listening ? (
        <MicOff className="h-[18px] w-[18px]" strokeWidth={2} />
      ) : (
        <Mic className="h-[18px] w-[18px]" strokeWidth={2} />
      )}
    </button>
  );
}
