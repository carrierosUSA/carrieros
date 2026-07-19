import type { CommunicationChannel } from "@/lib/communications/types";

export const CHANNEL_META: Record<
  CommunicationChannel,
  {
    label: string;
    short: string;
    bg: string;
    text: string;
    soft: string;
  }
> = {
  voice: {
    label: "Voice",
    short: "Call",
    bg: "bg-[#EFF6FF]",
    text: "text-[#2563EB]",
    soft: "bg-[#DBEAFE]",
  },
  sms: {
    label: "SMS",
    short: "SMS",
    bg: "bg-[#ECFDF3]",
    text: "text-[#16A34A]",
    soft: "bg-[#D1FAE5]",
  },
  email: {
    label: "Email",
    short: "Email",
    bg: "bg-[#F1F5F9]",
    text: "text-[#475569]",
    soft: "bg-[#E2E8F0]",
  },
  chat: {
    label: "Chat",
    short: "Chat",
    bg: "bg-[#F0FDFA]",
    text: "text-[#0F766E]",
    soft: "bg-[#CCFBF1]",
  },
};
