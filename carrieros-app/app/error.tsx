"use client";

import { useEffect } from "react";
import IssueRecovery from "@/components/support/IssueRecovery";

type ErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function HomeError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("[Alph workspace]", error);
  }, [error]);

  return <IssueRecovery error={error} reset={reset} source="Alph workspace" />;
}
