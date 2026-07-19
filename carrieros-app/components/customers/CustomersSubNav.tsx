"use client";

import { Suspense } from "react";
import WorkspaceSubNav from "@/components/navigation/WorkspaceSubNav";
import { CUSTOMERS_WORKSPACE_LINKS } from "@/lib/navigation/daily-use";

function CustomersSubNavInner() {
  return (
    <WorkspaceSubNav
      ariaLabel="Customers sections"
      links={CUSTOMERS_WORKSPACE_LINKS}
      primaryCount={5}
    />
  );
}

export default function CustomersSubNav() {
  return (
    <Suspense fallback={<div className="h-10" aria-hidden />}>
      <CustomersSubNavInner />
    </Suspense>
  );
}
