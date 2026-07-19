"use client";

import { Suspense } from "react";
import WorkspaceSubNav from "@/components/navigation/WorkspaceSubNav";
import { FINANCE_WORKSPACE_LINKS } from "@/lib/navigation/daily-use";

function FinanceWorkspaceSubNavInner() {
  return (
    <WorkspaceSubNav
      ariaLabel="Finance sections"
      links={FINANCE_WORKSPACE_LINKS}
      primaryCount={7}
    />
  );
}

export default function FinanceWorkspaceSubNav() {
  return (
    <Suspense fallback={<div className="h-10" aria-hidden />}>
      <FinanceWorkspaceSubNavInner />
    </Suspense>
  );
}
