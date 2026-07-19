"use client";

import { useEffect } from "react";
import IssueRecovery from "@/components/support/IssueRecovery";

type ErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function MigrationError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("[AI Migration Center]", error);
  }, [error]);

  return <IssueRecovery error={error} reset={reset} source="AI Migration Center" />;
}
