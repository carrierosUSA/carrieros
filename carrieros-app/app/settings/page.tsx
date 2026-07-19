import { Suspense } from "react";
import SettingsShell from "@/components/settings/SettingsShell";
import SettingsSkeleton from "@/components/settings/SettingsSkeleton";

export default function SettingsPage() {
  return (
    <Suspense fallback={<SettingsSkeleton />}>
      <SettingsShell />
    </Suspense>
  );
}
