"use client";

import {
  SettingsPanelFrame,
  SettingsSaveButton,
} from "@/components/settings/SettingsField";
import type { CarrierSettingsState } from "@/lib/settings/types";
import {
  NOTIFICATION_CHANNEL_LABELS,
  NOTIFICATION_CHANNELS,
  type NotificationChannel,
  type NotificationPreferences,
} from "@/lib/types/notifications";

type NotificationsPanelProps = {
  settings: CarrierSettingsState;
  dirty: boolean;
  saving: boolean;
  savedFlash: boolean;
  onChange: (prefs: NotificationPreferences) => void;
  onSave: () => void;
};

export default function NotificationsPanel({
  settings,
  dirty,
  saving,
  savedFlash,
  onChange,
  onSave,
}: NotificationsPanelProps) {
  const prefs = settings.notifications;

  function toggleChannel(channel: NotificationChannel) {
    onChange({
      ...prefs,
      channels: {
        ...prefs.channels,
        [channel]: !prefs.channels[channel],
      },
    });
  }

  return (
    <SettingsPanelFrame
      title="Notifications"
      description="Choose which channels Transpo.ai may use. Wired to Notification Center preferences."
      footer={
        <SettingsSaveButton
          onClick={onSave}
          disabled={!dirty}
          saving={saving}
          saved={savedFlash}
          disabledReason="No changes to save."
        />
      }
    >
      <div className="space-y-2">
        {NOTIFICATION_CHANNELS.map((channel) => {
          const enabled = prefs.channels[channel];
          return (
            <button
              key={channel}
              type="button"
              onClick={() => toggleChannel(channel)}
              className="flex w-full items-center justify-between rounded-[14px] bg-[#F8FAFC] px-4 py-3.5 text-left ring-1 ring-[#EAEAEA] transition hover:bg-white"
            >
              <div>
                <p className="text-[15px] font-semibold text-slate-950">
                  {NOTIFICATION_CHANNEL_LABELS[channel]}
                </p>
                <p className="mt-0.5 text-[13px] text-slate-500">
                  {channelHint(channel)}
                </p>
              </div>
              <span
                className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition ${
                  enabled ? "bg-[#2563EB]" : "bg-slate-300"
                }`}
                aria-hidden
              >
                <span
                  className={`inline-block h-5 w-5 rounded-full bg-white shadow transition ${
                    enabled ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </span>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() =>
          onChange({ ...prefs, quietHoursEnabled: !prefs.quietHoursEnabled })
        }
        className="flex w-full items-center justify-between rounded-[14px] bg-white px-4 py-3.5 text-left ring-1 ring-[#EAEAEA]"
      >
        <div>
          <p className="text-[15px] font-semibold text-slate-950">Quiet hours</p>
          <p className="mt-0.5 text-[13px] text-slate-500">
            Mute non-critical email, SMS, and push overnight.
          </p>
        </div>
        <span
          className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition ${
            prefs.quietHoursEnabled ? "bg-[#2563EB]" : "bg-slate-300"
          }`}
        >
          <span
            className={`inline-block h-5 w-5 rounded-full bg-white shadow transition ${
              prefs.quietHoursEnabled ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </span>
      </button>
    </SettingsPanelFrame>
  );
}

function channelHint(channel: NotificationChannel): string {
  switch (channel) {
    case "in_app":
      return "Bell and Notification Center inside Transpo.ai.";
    case "email":
      return "Operational alerts to your work inbox.";
    case "sms":
      return "Urgent check calls and appointment reminders.";
    case "push":
      return "Mobile push when the driver or ops apps are installed.";
    case "desktop":
      return "Browser desktop notifications while Transpo.ai is open.";
  }
}
