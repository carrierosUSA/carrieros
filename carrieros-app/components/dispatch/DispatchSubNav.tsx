"use client";

import { Suspense } from "react";
import WorkspaceSubNav from "@/components/navigation/WorkspaceSubNav";
import {
  DISPATCH_PRIMARY_COUNT,
  DISPATCH_WORKSPACE_LINKS,
} from "@/lib/navigation/daily-use";

function DispatchSubNavInner() {
  return (
    <WorkspaceSubNav
      ariaLabel="Dispatch sections"
      links={DISPATCH_WORKSPACE_LINKS}
      primaryCount={DISPATCH_PRIMARY_COUNT}
    />
  );
}

export default function DispatchSubNav() {
  return (
    <Suspense fallback={<div className="h-10" aria-hidden />}>
      <DispatchSubNavInner />
    </Suspense>
  );
}
