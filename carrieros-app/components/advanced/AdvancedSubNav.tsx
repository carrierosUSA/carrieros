"use client";

import { Suspense } from "react";
import WorkspaceSubNav from "@/components/navigation/WorkspaceSubNav";
import { ADVANCED_WORKSPACE_LINKS } from "@/lib/navigation/daily-use";

function AdvancedSubNavInner() {
  return (
    <WorkspaceSubNav
      ariaLabel="Advanced sections"
      links={ADVANCED_WORKSPACE_LINKS}
      primaryCount={6}
      moreOnDesktop
    />
  );
}

export default function AdvancedSubNav() {
  return (
    <Suspense fallback={<div className="h-10" aria-hidden />}>
      <AdvancedSubNavInner />
    </Suspense>
  );
}
