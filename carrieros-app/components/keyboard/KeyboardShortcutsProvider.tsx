"use client";

import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import { isEditableTarget } from "@/lib/keyboard/is-editable-target";

export type LoadKeyboardActions = {
  invoice?: () => void;
  pod?: () => void;
  broker?: () => void;
  gps?: () => void;
};

type KeyboardShortcutsContextValue = {
  registerLoadActions: (actions: LoadKeyboardActions) => () => void;
  registerOverlayClose: (close: () => void) => () => void;
  setCommandPaletteOpen: (open: boolean) => void;
};

const KeyboardShortcutsContext =
  createContext<KeyboardShortcutsContextValue | null>(null);

export function useRegisterLoadKeyboardActions(actions: LoadKeyboardActions) {
  const context = useContext(KeyboardShortcutsContext);

  useEffect(() => {
    if (!context) {
      return;
    }

    return context.registerLoadActions(actions);
  }, [actions, context]);
}

export function useKeyboardShortcuts() {
  const context = useContext(KeyboardShortcutsContext);

  if (!context) {
    throw new Error(
      "useKeyboardShortcuts must be used within KeyboardShortcutsProvider.",
    );
  }

  return context;
}

export function useRegisterOverlayClose(close: () => void) {
  const context = useContext(KeyboardShortcutsContext);

  useEffect(() => {
    if (!context) {
      return;
    }

    return context.registerOverlayClose(close);
  }, [close, context]);
}

type KeyboardShortcutsProviderProps = {
  children: ReactNode;
};

export default function KeyboardShortcutsProvider({
  children,
}: KeyboardShortcutsProviderProps) {
  const router = useRouter();
  const loadActionsRef = useRef<LoadKeyboardActions | null>(null);
  const overlayCloseRef = useRef<(() => void) | null>(null);
  const commandPaletteOpenRef = useRef(false);

  const registerLoadActions = useCallback((actions: LoadKeyboardActions) => {
    loadActionsRef.current = actions;

    return () => {
      if (loadActionsRef.current === actions) {
        loadActionsRef.current = null;
      }
    };
  }, []);

  const registerOverlayClose = useCallback((close: () => void) => {
    overlayCloseRef.current = close;

    return () => {
      if (overlayCloseRef.current === close) {
        overlayCloseRef.current = null;
      }
    };
  }, []);

  const setCommandPaletteOpen = useCallback((open: boolean) => {
    commandPaletteOpenRef.current = open;
  }, []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.defaultPrevented) {
        return;
      }

      if (event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }

      const key = event.key;

      if (key === "Escape") {
        if (commandPaletteOpenRef.current && overlayCloseRef.current) {
          event.preventDefault();
          overlayCloseRef.current();
        }
        return;
      }

      if (isEditableTarget(event.target)) {
        return;
      }

      if (commandPaletteOpenRef.current) {
        return;
      }

      const loadActions = loadActionsRef.current;

      switch (key.toLowerCase()) {
        case "n":
          event.preventDefault();
          router.push("/loads/new");
          return;
        case "d":
          event.preventDefault();
          router.push("/loads");
          return;
        case "i":
          if (loadActions?.invoice) {
            event.preventDefault();
            loadActions.invoice();
          }
          return;
        case "p":
          if (loadActions?.pod) {
            event.preventDefault();
            loadActions.pod();
          }
          return;
        case "b":
          if (loadActions?.broker) {
            event.preventDefault();
            loadActions.broker();
          }
          return;
        case "g":
          if (loadActions?.gps) {
            event.preventDefault();
            loadActions.gps();
          }
          return;
        default:
          return;
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [router]);

  const value: KeyboardShortcutsContextValue = {
    registerLoadActions,
    registerOverlayClose,
    setCommandPaletteOpen,
  };

  return (
    <KeyboardShortcutsContext.Provider value={value}>
      {children}
    </KeyboardShortcutsContext.Provider>
  );
}
