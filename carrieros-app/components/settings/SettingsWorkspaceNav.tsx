"use client";

import { Suspense } from "react";
import WorkspaceSubNav from "@/components/navigation/WorkspaceSubNav";
import {
  SETTINGS_WORKSPACE_MORE,
  SETTINGS_WORKSPACE_PRIMARY,
} from "@/lib/navigation/daily-use";

function SettingsWorkspaceNavInner() {
  return (
    <WorkspaceSubNav
      ariaLabel="Settings sections"
      links={[...SETTINGS_WORKSPACE_PRIMARY, ...SETTINGS_WORKSPACE_MORE]}
      primaryCount={SETTINGS_WORKSPACE_PRIMARY.length}
      moreOnDesktop
    />
  );
}

export default function SettingsWorkspaceNav() {
  return (
    <Suspense fallback={<div className="h-10" aria-hidden />}>
      <SettingsWorkspaceNavInner />
    </Suspense>
  );
}
