"use client";

import {
  NOTIFICATION_CHANNELS,
  NOTIFICATION_CHANNEL_LABELS,
  type NotificationChannel,
  type NotificationPreferences,
} from "@/lib/types/notifications";

type NotificationPreferencesProps = {
  preferences: NotificationPreferences;
  onChange: (next: Partial<NotificationPreferences>) => void;
};

const CHANNEL_HINTS: Record<NotificationChannel, string> = {
  in_app: "Bell & Notification Center",
  push: "Mobile push (stub)",
  email: "Email digests (stub)",
  sms: "Critical SMS only (stub)",
  desktop: "Browser desktop alerts (stub)",
};

export default function NotificationPreferencesPanel({
  preferences,
  onChange,
}: NotificationPreferencesProps) {
  return (
    <section
      aria-label="Delivery preferences"
      className="rounded-[16px] bg-white p-4 ring-1 ring-[#E8ECF2]"
    >
      <div className="mb-3">
        <h2 className="text-[15px] font-semibold text-[#111827]">
          Delivery channels
        </h2>
        <p className="mt-0.5 text-[13px] text-[#6B7280]">
          Choose how Transpo.ai reaches you. Senders are stubbed until push,
          email, and SMS are connected.
        </p>
      </div>

      <div className="space-y-2">
        {NOTIFICATION_CHANNELS.map((channel) => {
          const enabled = preferences.channels[channel];
          return (
            <label
              key={channel}
              className="flex cursor-pointer items-center justify-between gap-3 rounded-[12px] bg-[#F8F9FB] px-3 py-3 transition hover:bg-[#F5F7FA]"
            >
              <div className="min-w-0">
                <p className="text-[14px] font-semibold text-[#111827]">
                  {NOTIFICATION_CHANNEL_LABELS[channel]}
                </p>
                <p className="text-[12px] font-medium text-[#6B7280]">
                  {CHANNEL_HINTS[channel]}
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={enabled}
                onClick={() =>
                  onChange({
                    channels: {
                      ...preferences.channels,
                      [channel]: !enabled,
                    },
                  })
                }
                className={`relative h-7 w-12 shrink-0 rounded-full transition ${
                  enabled ? "bg-[#2563EB]" : "bg-[#CBD5E1]"
                }`}
              >
                <span
                  className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition ${
                    enabled ? "left-[22px]" : "left-0.5"
                  }`}
                />
              </button>
            </label>
          );
        })}
      </div>

      <label className="mt-3 flex cursor-pointer items-center justify-between gap-3 rounded-[12px] px-1 py-2">
        <div>
          <p className="text-[14px] font-semibold text-[#111827]">
            Quiet hours
          </p>
          <p className="text-[12px] font-medium text-[#6B7280]">
            Mute non-critical channels overnight (stub)
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={preferences.quietHoursEnabled}
          onClick={() =>
            onChange({ quietHoursEnabled: !preferences.quietHoursEnabled })
          }
          className={`relative h-7 w-12 shrink-0 rounded-full transition ${
            preferences.quietHoursEnabled ? "bg-[#2563EB]" : "bg-[#CBD5E1]"
          }`}
        >
          <span
            className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition ${
              preferences.quietHoursEnabled ? "left-[22px]" : "left-0.5"
            }`}
          />
        </button>
      </label>
    </section>
  );
}
