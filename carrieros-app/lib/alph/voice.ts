/**
 * Web Speech API stub — voice-ready for Alph Command Center.
 * Uses SpeechRecognition when available; otherwise reports unsupported.
 */

export type AlphVoiceStatus =
  | "idle"
  | "listening"
  | "unsupported"
  | "error"
  | "denied";

export type AlphVoiceListener = {
  startListening: () => void;
  stopListening: () => void;
  isSupported: boolean;
};

type SpeechRecognitionLike = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionResultEventLike) => void) | null;
  onerror: ((event: { error?: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};

type SpeechRecognitionResultEventLike = {
  results: ArrayLike<{
    isFinal: boolean;
    0: { transcript: string };
  }>;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

function getSpeechRecognitionCtor(): SpeechRecognitionConstructor | null {
  if (typeof window === "undefined") {
    return null;
  }

  const win = window as Window & {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  };

  return win.SpeechRecognition ?? win.webkitSpeechRecognition ?? null;
}

export function isAlphVoiceSupported(): boolean {
  return getSpeechRecognitionCtor() !== null;
}

export function createAlphVoiceListener(options: {
  onResult: (transcript: string, isFinal: boolean) => void;
  onStatus?: (status: AlphVoiceStatus) => void;
  lang?: string;
}): AlphVoiceListener {
  const Ctor = getSpeechRecognitionCtor();
  const isSupported = Ctor !== null;
  let recognition: SpeechRecognitionLike | null = null;

  if (Ctor) {
    recognition = new Ctor();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = options.lang ?? "en-US";

    recognition.onresult = (event) => {
      const last = event.results[event.results.length - 1];
      if (!last) {
        return;
      }
      options.onResult(last[0].transcript.trim(), last.isFinal);
    };

    recognition.onerror = (event) => {
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        options.onStatus?.("denied");
        return;
      }
      options.onStatus?.("error");
    };

    recognition.onend = () => {
      options.onStatus?.("idle");
    };
  }

  return {
    isSupported,
    startListening: () => {
      if (!recognition) {
        options.onStatus?.("unsupported");
        return;
      }
      try {
        options.onStatus?.("listening");
        recognition.start();
      } catch {
        options.onStatus?.("error");
      }
    },
    stopListening: () => {
      if (!recognition) {
        return;
      }
      try {
        recognition.stop();
      } catch {
        // already stopped
      }
      options.onStatus?.("idle");
    },
  };
}
