"use client";

import { Mail, MessageCircle, Phone } from "lucide-react";
import { useLoadDetailCommunication } from "@/components/dispatch/load-detail/communication/LoadDetailCommunicationProvider";

type CommunicationActionButtonsProps = {
  phone?: string;
  email?: string;
  partyLabel: string;
  className?: string;
  disabled?: boolean;
  onDisabledClick?: () => void;
};

type ActionVariant = "call" | "message" | "email";

const VARIANT_STYLES: Record<
  ActionVariant,
  {
    bg: string;
    hoverBg: string;
    color: string;
    Icon: typeof Phone;
  }
> = {
  call: {
    bg: "bg-[#ECFDF3]",
    hoverBg: "hover:bg-[#D1FAE5]",
    color: "text-[#16A34A]",
    Icon: Phone,
  },
  message: {
    bg: "bg-[#EFF6FF]",
    hoverBg: "hover:bg-[#DBEAFE]",
    color: "text-[#2563EB]",
    Icon: MessageCircle,
  },
  email: {
    bg: "bg-[#F5F3FF]",
    hoverBg: "hover:bg-[#EDE9FE]",
    color: "text-[#7C3AED]",
    Icon: Mail,
  },
};

function CommunicationActionButton({
  variant,
  label,
  onClick,
  disabled,
}: {
  variant: ActionVariant;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  const { bg, hoverBg, color, Icon } = VARIANT_STYLES[variant];

  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex h-8 shrink-0 items-center gap-2 rounded-full px-[14px] text-[13px] font-medium transition-[background-color,box-shadow] ${bg} ${color} ${hoverBg} hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-45 disabled:shadow-none disabled:hover:bg-inherit`}
    >
      <Icon className="h-4 w-4 shrink-0" strokeWidth={2.25} aria-hidden="true" />
      <span>{label}</span>
    </button>
  );
}

export default function CommunicationActionButtons({
  phone,
  email,
  partyLabel,
  className = "",
  disabled = false,
  onDisabledClick,
}: CommunicationActionButtonsProps) {
  const { call, message, email: sendEmail } = useLoadDetailCommunication();
  const hasPhone = Boolean(phone && phone !== "—");
  const hasEmail = Boolean(email && email !== "—" && email?.includes("@"));
  const callDisabled = disabled || !hasPhone;
  const messageDisabled = disabled || !hasPhone;
  const emailDisabled = disabled || !hasEmail;

  function handleDisabled() {
    onDisabledClick?.();
  }

  return (
    <div className={`flex flex-nowrap items-center gap-2 overflow-x-auto ${className}`}>
      <CommunicationActionButton
        variant="call"
        label="Call"
        disabled={callDisabled}
        onClick={() => {
          if (callDisabled) {
            handleDisabled();
            return;
          }

          if (phone) {
            call(phone);
          }
        }}
      />
      <CommunicationActionButton
        variant="message"
        label="Message"
        disabled={messageDisabled}
        onClick={() => {
          if (messageDisabled) {
            handleDisabled();
            return;
          }

          if (phone) {
            message(phone);
          }
        }}
      />
      <CommunicationActionButton
        variant="email"
        label="Email"
        disabled={emailDisabled}
        onClick={() => {
          if (emailDisabled) {
            handleDisabled();
            return;
          }

          if (email) {
            sendEmail(email, partyLabel);
          }
        }}
      />
    </div>
  );
}
