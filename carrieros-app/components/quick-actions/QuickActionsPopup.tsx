"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import ActionTooltip from "@/components/ui/ActionTooltip";
import { useQuickActions } from "@/components/quick-actions/QuickActionsProvider";
import type { CarrierosSemanticColor } from "@/lib/design-system/colors";
import { CARRIEROS_COLORS } from "@/lib/design-system/colors";

type QuickActionItem = {
  id: string;
  emoji: string;
  label: string;
  tone: CarrierosSemanticColor;
  shortcut?: string;
  href?: string;
  requiresLoad?: boolean;
  requiresTracking?: boolean;
  requiresCameras?: boolean;
};

const QUICK_ACTIONS: QuickActionItem[] = [
  { id: "newLoad", emoji: "➕", label: "New Load", tone: "info", shortcut: "N", href: "/loads/new" },
  {
    id: "newDriver",
    emoji: "👤",
    label: "New Driver",
    tone: "info",
    href: "/drivers/hiring/new",
  },
  {
    id: "newTruck",
    emoji: "🚚",
    label: "New Truck",
    tone: "info",
    href: "/fleet/trucks/new",
  },
  {
    id: "newTrailer",
    emoji: "🚛",
    label: "New Trailer",
    tone: "info",
    href: "/fleet/trailers/new",
  },
  {
    id: "newInvoice",
    emoji: "📄",
    label: "New Invoice",
    tone: "success",
    shortcut: "I",
    href: "/finance?tab=invoices",
  },
  {
    id: "uploadPod",
    emoji: "📎",
    label: "Upload POD",
    tone: "info",
    href: "/documents",
  },
  {
    id: "assignDriver",
    emoji: "🧭",
    label: "Assign Driver",
    tone: "info",
    href: "/loads",
  },
  {
    id: "generatePayroll",
    emoji: "💵",
    label: "Generate Payroll",
    tone: "success",
    href: "/payroll",
  },
  {
    id: "generateIfta",
    emoji: "⛽",
    label: "Generate IFTA",
    tone: "warning",
    href: "/ifta",
  },
  {
    id: "createMaintenance",
    emoji: "🔧",
    label: "Create Maintenance Ticket",
    tone: "warning",
    href: "/fleet/maintenance",
  },
  {
    id: "assignTruck",
    emoji: "🚚",
    label: "Assign Truck",
    tone: "info",
    requiresLoad: true,
  },
  {
    id: "emailBroker",
    emoji: "📨",
    label: "Email Broker",
    tone: "info",
    requiresLoad: true,
    shortcut: "B",
  },
  {
    id: "requestPayment",
    emoji: "💰",
    label: "Request Payment",
    tone: "warning",
    requiresLoad: true,
  },
  {
    id: "openTracking",
    emoji: "📍",
    label: "Open Live Tracking",
    tone: "success",
    requiresLoad: true,
    requiresTracking: true,
    shortcut: "G",
  },
  {
    id: "openCameras",
    emoji: "📷",
    label: "Open Cameras",
    tone: "info",
    requiresLoad: true,
    requiresCameras: true,
  },
];

function useIsClient() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

function getDisabledReason(
  action: QuickActionItem,
  hasLoad: boolean,
  handlers: ReturnType<typeof useQuickActions>["loadHandlers"],
): string | undefined {
  if (action.requiresLoad && !hasLoad) {
    return "Open a load first";
  }

  if (action.requiresTracking && !handlers?.trackingAvailable) {
    return "Tracking unavailable for this load";
  }

  if (action.requiresCameras && !handlers?.camerasAvailable) {
    return "Cameras unavailable for this load";
  }

  return undefined;
}

export default function QuickActionsPopup() {
  const router = useRouter();
  const isClient = useIsClient();
  const { open, closeQuickActions, loadHandlers } = useQuickActions();
  const hasLoad = Boolean(loadHandlers?.loadId);

  useEffect(() => {
    if (!open) {
      return;
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        closeQuickActions();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [closeQuickActions, open]);

  const runAction = useCallback(
    (action: QuickActionItem) => {
      if (action.id === "assignDriver" && loadHandlers?.assignDriver) {
        loadHandlers.assignDriver();
        closeQuickActions();
        return;
      }

      if (action.href) {
        closeQuickActions();
        router.push(action.href);
        return;
      }

      switch (action.id) {
        case "assignTruck":
          loadHandlers?.assignTruck?.();
          closeQuickActions();
          return;
        case "emailBroker":
          loadHandlers?.emailBroker?.();
          closeQuickActions();
          return;
        case "requestPayment":
          loadHandlers?.requestPayment?.();
          closeQuickActions();
          return;
        case "openTracking":
          loadHandlers?.openTracking?.();
          closeQuickActions();
          return;
        case "openCameras":
          loadHandlers?.openCameras?.();
          closeQuickActions();
          return;
        default:
          return;
      }
    },
    [closeQuickActions, loadHandlers, router],
  );

  if (!open || !isClient) {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[10001] flex items-center justify-center bg-slate-900/30 px-4 backdrop-blur-[3px]"
      onClick={closeQuickActions}
      role="presentation"
    >
      <div
        className="max-h-[min(720px,90vh)] w-full max-w-[720px] animate-[carrieros-fade-in_0.25s_ease-out_both] overflow-hidden rounded-[20px] border border-[#EAEAEA] bg-white shadow-2xl shadow-slate-400/25"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Quick actions"
      >
        <div className="border-b border-[#F1F5F9] px-6 py-5">
          <p className="text-[13px] font-medium text-slate-500">Quick actions</p>
          <h2 className="mt-1 text-[22px] font-bold tracking-[-0.03em] text-slate-950">
            What do you want to do?
          </h2>
          {hasLoad && loadHandlers?.loadLabel ? (
            <p className="mt-1.5 text-[14px] font-medium text-[#2563EB]">
              Load #{loadHandlers.loadLabel}
            </p>
          ) : (
            <p className="mt-1.5 text-[14px] text-slate-500">
              Create something new, or open a load for assignment actions.
            </p>
          )}
        </div>

        <div className="grid max-h-[min(480px,55vh)] grid-cols-1 gap-3 overflow-y-auto p-5 sm:grid-cols-2">
          {QUICK_ACTIONS.map((action) => {
            const disabledReason = getDisabledReason(action, hasLoad, loadHandlers);
            const disabled = Boolean(disabledReason);
            const tone = disabled ? CARRIEROS_COLORS.disabled : CARRIEROS_COLORS[action.tone];

            const button = (
              <button
                type="button"
                disabled={disabled}
                onClick={() => runAction(action)}
                className={`group flex min-h-[80px] w-full items-center gap-4 rounded-[16px] border px-4 py-3.5 text-left transition duration-150 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-70 disabled:shadow-none ${tone.border} ${disabled ? tone.bg : `${tone.bg} hover:brightness-[0.98]`}`}
              >
                <span
                  className={`grid h-12 w-12 shrink-0 place-items-center rounded-[14px] border bg-white text-[22px] shadow-sm ${tone.border}`}
                  aria-hidden="true"
                >
                  {action.emoji}
                </span>
                <span className="min-w-0 flex-1">
                  <span className={`block text-[15px] font-semibold ${tone.text}`}>
                    {action.label}
                  </span>
                  {action.shortcut ? (
                    <span className="mt-1 inline-flex items-center gap-1.5 text-[12px] font-medium text-slate-500">
                      Shortcut
                      <kbd className="rounded border border-[#EAEAEA] bg-white px-1.5 py-0.5 font-mono text-[10px] text-slate-500">
                        {action.shortcut}
                      </kbd>
                    </span>
                  ) : null}
                </span>
              </button>
            );

            return (
              <ActionTooltip
                key={action.id}
                label={action.label}
                reason={disabledReason}
                disabled={disabled}
              >
                {button}
              </ActionTooltip>
            );
          })}
        </div>

        <div className="flex items-center justify-between border-t border-[#F1F5F9] px-6 py-3 text-[12px] font-medium text-slate-400">
          <span>Large actions. Zero hunting.</span>
          <span>
            Press <kbd className="rounded border border-[#EAEAEA] bg-[#F8FAFC] px-1.5 py-0.5 font-mono text-[10px]">Esc</kbd> to close
          </span>
        </div>
      </div>
    </div>,
    document.body,
  );
}
