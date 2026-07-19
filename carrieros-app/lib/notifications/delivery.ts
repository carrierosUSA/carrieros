import type {
  CarrierNotification,
  NotificationChannel,
  NotificationPreferences,
} from "@/lib/types/notifications";
import { DEFAULT_NOTIFICATION_PREFERENCES } from "@/lib/types/notifications";

export type DeliveryPayload = {
  notification: CarrierNotification;
  channel: NotificationChannel;
  to?: string;
};

export type DeliveryResult = {
  ok: boolean;
  channel: NotificationChannel;
  stub: true;
  message: string;
  deliveredAt: string;
};

/**
 * Channel senders — stubs until WebSocket / FCM / SES / Twilio / Notification API
 * are wired. Prefer calling `deliverNotification` so preferences gate each channel.
 */
export async function sendInApp(
  payload: DeliveryPayload,
): Promise<DeliveryResult> {
  return stubResult(payload.channel, `In-app delivered: ${payload.notification.title}`);
}

export async function sendPush(
  payload: DeliveryPayload,
): Promise<DeliveryResult> {
  return stubResult(
    payload.channel,
    `Push stub → device: ${payload.notification.title}`,
  );
}

export async function sendEmail(
  payload: DeliveryPayload,
): Promise<DeliveryResult> {
  return stubResult(
    payload.channel,
    `Email stub → ${payload.to ?? "ops@demo-carrier.com"}: ${payload.notification.title}`,
  );
}

export async function sendSms(
  payload: DeliveryPayload,
): Promise<DeliveryResult> {
  return stubResult(
    payload.channel,
    `SMS stub → ${payload.to ?? "+1-210-555-0100"}: ${payload.notification.title}`,
  );
}

export async function sendDesktop(
  payload: DeliveryPayload,
): Promise<DeliveryResult> {
  if (typeof window !== "undefined" && "Notification" in window) {
    // Soft probe only — never prompt from stub path without user gesture.
    if (Notification.permission === "granted") {
      try {
        new Notification(payload.notification.title, {
          body: payload.notification.body,
          tag: payload.notification.id,
        });
      } catch {
        // ignore browser restrictions in stub mode
      }
    }
  }
  return stubResult(
    payload.channel,
    `Desktop notification stub: ${payload.notification.title}`,
  );
}

const SENDERS: Record<
  NotificationChannel,
  (payload: DeliveryPayload) => Promise<DeliveryResult>
> = {
  in_app: sendInApp,
  push: sendPush,
  email: sendEmail,
  sms: sendSms,
  desktop: sendDesktop,
};

export async function deliverNotification(
  notification: CarrierNotification,
  preferences: NotificationPreferences = DEFAULT_NOTIFICATION_PREFERENCES,
  options?: { to?: string; channels?: NotificationChannel[] },
): Promise<DeliveryResult[]> {
  const channels =
    options?.channels ??
    notification.channels ??
    (Object.keys(preferences.channels) as NotificationChannel[]).filter(
      (c) => preferences.channels[c],
    );

  const results: DeliveryResult[] = [];
  for (const channel of channels) {
    if (!preferences.channels[channel]) continue;
    const sender = SENDERS[channel];
    results.push(
      await sender({
        notification,
        channel,
        to: options?.to,
      }),
    );
  }
  return results;
}

function stubResult(
  channel: NotificationChannel,
  message: string,
): DeliveryResult {
  return {
    ok: true,
    channel,
    stub: true,
    message,
    deliveredAt: new Date().toISOString(),
  };
}
