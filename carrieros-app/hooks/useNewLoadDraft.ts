"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { SmartLoadFormDefaults } from "@/lib/forms/smart-load-intelligence";

const DRAFT_KEY = "carrieros-new-load-draft";
const DEBOUNCE_MS = 600;

type DraftStatus = "idle" | "saving" | "saved";

export function useNewLoadDraft(initialValues: SmartLoadFormDefaults) {
  const [values, setValues] = useState<SmartLoadFormDefaults>(initialValues);
  const [draftStatus, setDraftStatus] = useState<DraftStatus>("idle");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hydratedRef = useRef(false);

  useEffect(() => {
    if (hydratedRef.current) {
      return;
    }

    hydratedRef.current = true;

    try {
      const stored = window.localStorage.getItem(DRAFT_KEY);
      if (stored) {
        setValues({ ...initialValues, ...JSON.parse(stored) });
        setDraftStatus("saved");
      }
    } catch {
      // ignore corrupt drafts
    }
  }, [initialValues]);

  const persistDraft = useCallback((next: SmartLoadFormDefaults) => {
    setDraftStatus("saving");

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      try {
        window.localStorage.setItem(DRAFT_KEY, JSON.stringify(next));
        setDraftStatus("saved");
      } catch {
        setDraftStatus("idle");
      }
    }, DEBOUNCE_MS);
  }, []);

  const updateValues = useCallback(
    (updater: SmartLoadFormDefaults | ((current: SmartLoadFormDefaults) => SmartLoadFormDefaults)) => {
      setValues((current) => {
        const next = typeof updater === "function" ? updater(current) : updater;
        persistDraft(next);
        return next;
      });
    },
    [persistDraft],
  );

  const clearDraft = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    window.localStorage.removeItem(DRAFT_KEY);
    setDraftStatus("idle");
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return {
    values,
    setValues: updateValues,
    draftStatus,
    clearDraft,
  };
}
