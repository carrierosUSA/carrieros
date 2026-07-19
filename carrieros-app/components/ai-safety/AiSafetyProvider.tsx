"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import AiConfirmationModal, {
  type AiConfirmationModalPayload,
} from "@/components/ai-safety/AiConfirmationModal";
import {
  runAiSuggestedAction,
  type RunAiSuggestedActionInput,
  type RunAiSuggestedActionResult,
} from "@/lib/ai-safety";

type AiSafetyContextValue = {
  runAiSuggestedAction: (
    input: Omit<RunAiSuggestedActionInput, "requestConfirmation">,
  ) => Promise<RunAiSuggestedActionResult>;
};

const AiSafetyContext = createContext<AiSafetyContextValue | null>(null);

export function useAiSafety(): AiSafetyContextValue {
  const ctx = useContext(AiSafetyContext);
  if (!ctx) {
    throw new Error("useAiSafety must be used within AiSafetyProvider");
  }
  return ctx;
}

/** Safe hook when provider may be absent — falls back to blocked critical path. */
export function useAiSafetyOptional(): AiSafetyContextValue | null {
  return useContext(AiSafetyContext);
}

export default function AiSafetyProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [payload, setPayload] = useState<AiConfirmationModalPayload | null>(
    null,
  );
  const resolverRef = useRef<((approved: boolean) => void) | null>(null);

  const requestConfirmation = useCallback(
    (next: AiConfirmationModalPayload) =>
      new Promise<boolean>((resolve) => {
        resolverRef.current = resolve;
        setPayload(next);
        setOpen(true);
      }),
    [],
  );

  const settle = useCallback((approved: boolean) => {
    setOpen(false);
    setPayload(null);
    const resolve = resolverRef.current;
    resolverRef.current = null;
    resolve?.(approved);
  }, []);

  const run = useCallback(
    (input: Omit<RunAiSuggestedActionInput, "requestConfirmation">) =>
      runAiSuggestedAction({
        ...input,
        requestConfirmation,
      }),
    [requestConfirmation],
  );

  const value = useMemo(() => ({ runAiSuggestedAction: run }), [run]);

  return (
    <AiSafetyContext.Provider value={value}>
      {children}
      <AiConfirmationModal
        open={open}
        payload={payload}
        onApprove={() => settle(true)}
        onCancel={() => settle(false)}
      />
    </AiSafetyContext.Provider>
  );
}
