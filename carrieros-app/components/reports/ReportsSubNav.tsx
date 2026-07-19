"use client";

import { Suspense } from "react";
import WorkspaceSubNav from "@/components/navigation/WorkspaceSubNav";
import { REPORTS_WORKSPACE_LINKS } from "@/lib/navigation/daily-use";

function ReportsSubNavInner() {
  return (
    <WorkspaceSubNav
      ariaLabel="Reports sections"
      links={REPORTS_WORKSPACE_LINKS}
      primaryCount={6}
    />
  );
}

export default function ReportsSubNav() {
  return (
    <Suspense fallback={<div className="h-10" aria-hidden />}>
      <ReportsSubNavInner />
    </Suspense>
  );
}
