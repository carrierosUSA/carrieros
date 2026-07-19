import { logAction } from "@/lib/permissions/audit";
import { getAdminStore, updateAdminStore } from "./store";
import type { FeatureFlag, FeatureFlagId } from "./types";

export function listFeatureFlags(): FeatureFlag[] {
  return getAdminStore().featureFlags;
}

export function getFeatureFlag(id: FeatureFlagId): FeatureFlag | undefined {
  return listFeatureFlags().find((f) => f.id === id);
}

export function isFeatureEnabled(id: FeatureFlagId): boolean {
  return getFeatureFlag(id)?.enabled ?? false;
}

export function setFeatureFlag(
  id: FeatureFlagId,
  enabled: boolean,
): FeatureFlag | null {
  let updated: FeatureFlag | null = null;

  updateAdminStore((prev) => ({
    ...prev,
    featureFlags: prev.featureFlags.map((flag) => {
      if (flag.id !== id) return flag;
      const next: FeatureFlag = { ...flag, enabled };
      updated = next;
      return next;
    }),
  }));

  if (updated) {
    const flagLabel = (updated as FeatureFlag).label;
    logAction({
      action: enabled ? "enabled" : "disabled",
      resource: "admin.feature_flag",
      resourceId: id,
      details: `${enabled ? "Enabled" : "Disabled"} feature flag “${flagLabel}”`,
    });
  }

  return updated;
}

export function toggleFeatureFlag(id: FeatureFlagId): FeatureFlag | null {
  const current = getFeatureFlag(id);
  if (!current) return null;
  return setFeatureFlag(id, !current.enabled);
}
