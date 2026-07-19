"use client";

import { useEffect } from "react";
import IssueRecovery from "@/components/support/IssueRecovery";

type ErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ComplianceError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("[Compliance]", error);
  }, [error]);

  return (
    <IssueRecovery error={error} reset={reset} source="Safety & Compliance" />
  );
}
