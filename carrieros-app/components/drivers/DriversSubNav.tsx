"use client";

import { Suspense } from "react";
import WorkspaceSubNav from "@/components/navigation/WorkspaceSubNav";
import { DRIVERS_WORKSPACE_LINKS } from "@/lib/navigation/daily-use";

function DriversSubNavInner() {
  return (
    <WorkspaceSubNav
      ariaLabel="Drivers sections"
      links={DRIVERS_WORKSPACE_LINKS}
      primaryCount={5}
    />
  );
}

export default function DriversSubNav() {
  return (
    <Suspense fallback={<div className="h-10" aria-hidden />}>
      <DriversSubNavInner />
    </Suspense>
  );
}
