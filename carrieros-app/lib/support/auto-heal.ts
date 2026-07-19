import type { AutoHealActionId, RepairAttempt } from "@/lib/support/types";

const RISKY_KEYWORDS = [
  "delete permanent",
  "bank",
  "payment",
  "tax",
  "government",
  "legal",
  "insurance change",
  "remove user",
  "ownership",
  "payroll approval",
];

export const SAFE_AUTO_HEAL: Record<
  AutoHealActionId,
  { label: string; description: string }
> = {
  retry_email: {
    label: "Retry failed email",
    description: "Re-queue the outbound email without changing content.",
  },
  retry_sms: {
    label: "Retry failed SMS",
    description: "Send the SMS again through the messaging provider.",
  },
  retry_upload: {
    label: "Retry file processing",
    description: "Reprocess the uploaded file through OCR and linking.",
  },
  restart_job: {
    label: "Restart background task",
    description: "Restart a failed job from the last safe checkpoint.",
  },
  reconnect_integration: {
    label: "Reconnect integration",
    description: "Refresh OAuth/token and reconnect a supported provider.",
  },
  rerun_ocr: {
    label: "Re-run document OCR",
    description: "Extract fields again from the stored document copy.",
  },
  rebuild_report: {
    label: "Rebuild report",
    description: "Regenerate the report from source data.",
  },
  fix_formatting: {
    label: "Correct formatting",
    description: "Fix safe display/format issues without changing values.",
  },
  remove_temp_duplicate: {
    label: "Remove temporary duplicate",
    description: "Delete a temporary duplicate record only.",
  },
  refresh_stale_data: {
    label: "Refresh stale data",
    description: "Pull the latest snapshot from connected systems.",
  },
  recalc_dashboard: {
    label: "Recalculate dashboard",
    description: "Rebuild KPI totals from current ledgers.",
  },
  resync_eld: {
    label: "Re-sync ELD data",
    description: "Request a fresh ELD pull for GPS, HOS, and miles.",
  },
  restore_defaults: {
    label: "Restore default configuration",
    description: "Reset non-destructive UI defaults for this feature.",
  },
  guide_missing_fields: {
    label: "Guide missing fields",
    description: "Highlight required fields and open the setup step.",
  },
  suggest_permissions: {
    label: "Suggest permissions",
    description: "Recommend a role that unlocks the blocked action.",
  },
  clear_cache: {
    label: "Clear failed cache",
    description: "Clear tenant-scoped cache entries safely.",
  },
  reprocess_notifications: {
    label: "Reprocess notifications",
    description: "Replay queued notification deliveries.",
  },
};

export function isAutoHealSafe(action: AutoHealActionId, context = ""): boolean {
  const blob = `${action} ${context}`.toLowerCase();
  return !RISKY_KEYWORDS.some((keyword) => blob.includes(keyword));
}

export function runSafeAutoHeal(
  action: AutoHealActionId,
  context = "",
): RepairAttempt {
  const meta = SAFE_AUTO_HEAL[action];
  const safe = isAutoHealSafe(action, context);
  const at = new Date().toISOString();

  if (!safe) {
    return {
      id: `repair-${action}-${Date.now()}`,
      at,
      action: meta.label,
      safe: false,
      result: "needs_approval",
      detail:
        "This action touches sensitive data and requires authorized human approval.",
    };
  }

  // Demo: reconnect/resync succeed; others succeed unless marked failed in context
  const fail = context.toLowerCase().includes("force-fail");
  return {
    id: `repair-${action}-${Date.now()}`,
    at,
    action: meta.label,
    safe: true,
    result: fail ? "failed" : "success",
    detail: fail
      ? `${meta.description} The retry did not succeed.`
      : `${meta.description} Completed successfully.`,
  };
}
