export type CallingMethod =
  | "device_phone"
  | "whatsapp"
  | "google_voice"
  | "ringcentral"
  | "openphone"
  | "zoom_phone"
  | "microsoft_teams";

export const CALLING_METHODS: CallingMethod[] = [
  "device_phone",
  "whatsapp",
  "google_voice",
  "ringcentral",
  "openphone",
  "zoom_phone",
  "microsoft_teams",
];

export const CALLING_METHOD_LABELS: Record<CallingMethod, string> = {
  device_phone: "Device Phone",
  whatsapp: "WhatsApp",
  google_voice: "Google Voice",
  ringcentral: "RingCentral",
  openphone: "OpenPhone",
  zoom_phone: "Zoom Phone",
  microsoft_teams: "Microsoft Teams",
};

const STORAGE_KEY = "carrieros.dispatch.preferredCallingMethod";

export function getPreferredCallingMethod(): CallingMethod | null {
  if (typeof window === "undefined") {
    return null;
  }

  const stored = window.localStorage.getItem(STORAGE_KEY);

  if (!stored || !CALLING_METHODS.includes(stored as CallingMethod)) {
    return null;
  }

  return stored as CallingMethod;
}

export function setPreferredCallingMethod(method: CallingMethod): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, method);
}

export function clearPreferredCallingMethod(): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(STORAGE_KEY);
}
