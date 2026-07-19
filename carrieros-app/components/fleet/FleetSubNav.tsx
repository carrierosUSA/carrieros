"use client";

import { Suspense } from "react";
import WorkspaceSubNav from "@/components/navigation/WorkspaceSubNav";
import {
  FLEET_WORKSPACE_MORE,
  FLEET_WORKSPACE_PRIMARY,
} from "@/lib/navigation/daily-use";

function FleetSubNavInner() {
  return (
    <WorkspaceSubNav
      ariaLabel="Fleet sections"
      links={[...FLEET_WORKSPACE_PRIMARY, ...FLEET_WORKSPACE_MORE]}
      primaryCount={FLEET_WORKSPACE_PRIMARY.length}
    />
  );
}

export default function FleetSubNav() {
  return (
    <Suspense fallback={<div className="h-10" aria-hidden />}>
      <FleetSubNavInner />
    </Suspense>
  );
}
