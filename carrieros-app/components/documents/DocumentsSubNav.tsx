"use client";

import { Suspense } from "react";
import WorkspaceSubNav from "@/components/navigation/WorkspaceSubNav";
import { DOCUMENTS_WORKSPACE_LINKS } from "@/lib/navigation/daily-use";

function DocumentsSubNavInner() {
  return (
    <WorkspaceSubNav
      ariaLabel="Documents sections"
      links={DOCUMENTS_WORKSPACE_LINKS}
      primaryCount={7}
    />
  );
}

export default function DocumentsSubNav() {
  return (
    <Suspense fallback={<div className="h-10" aria-hidden />}>
      <DocumentsSubNavInner />
    </Suspense>
  );
}
