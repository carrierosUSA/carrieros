import type { CallingMethod } from "@/lib/dispatch/communication-preferences";

function digitsOnly(e164: string): string {
  return e164.replace(/\D/g, "");
}

export function buildCallUrl(method: CallingMethod, e164: string): string {
  const digits = digitsOnly(e164);
  const encoded = encodeURIComponent(e164);

  switch (method) {
    case "device_phone":
      return `tel:${e164}`;
    case "whatsapp":
      return `https://wa.me/${digits}`;
    case "google_voice":
      return `https://voice.google.com/u/0/calls?a=nc,${encoded}`;
    case "ringcentral":
      return `rcmobile://call?number=${encoded}`;
    case "openphone":
      return `https://my.openphone.com/dialer?number=${encoded}`;
    case "zoom_phone":
      return `zoomphonecall://${digits}`;
    case "microsoft_teams":
      return `https://teams.microsoft.com/l/call/0/0?users=${encoded}`;
    default:
      return `tel:${e164}`;
  }
}
