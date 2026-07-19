"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type LoadQuickActionHandlers = {
  loadId?: string;
  loadLabel?: string;
  assignDriver?: () => void;
  assignTruck?: () => void;
  createInvoice?: () => void;
  emailBroker?: () => void;
  requestPayment?: () => void;
  openTracking?: () => void;
  openCameras?: () => void;
  trackingAvailable?: boolean;
  camerasAvailable?: boolean;
};

type QuickActionsContextValue = {
  open: boolean;
  openQuickActions: () => void;
  closeQuickActions: () => void;
  loadHandlers: LoadQuickActionHandlers | null;
  registerLoadHandlers: (handlers: LoadQuickActionHandlers) => () => void;
};

const QuickActionsContext = createContext<QuickActionsContextValue | null>(null);

export function useQuickActions() {
  const context = useContext(QuickActionsContext);

  if (!context) {
    throw new Error("useQuickActions must be used within QuickActionsProvider.");
  }

  return context;
}

export function useRegisterLoadQuickActions(handlers: LoadQuickActionHandlers) {
  const context = useContext(QuickActionsContext);

  useEffect(() => {
    if (!context) {
      return;
    }

    return context.registerLoadHandlers(handlers);
  }, [context, handlers]);
}

type QuickActionsProviderProps = {
  children: ReactNode;
};

export default function QuickActionsProvider({ children }: QuickActionsProviderProps) {
  const [open, setOpen] = useState(false);
  const [loadHandlers, setLoadHandlers] = useState<LoadQuickActionHandlers | null>(
    null,
  );

  const openQuickActions = useCallback(() => {
    setOpen(true);
  }, []);

  const closeQuickActions = useCallback(() => {
    setOpen(false);
  }, []);

  const registerLoadHandlers = useCallback((handlers: LoadQuickActionHandlers) => {
    setLoadHandlers(handlers);

    return () => {
      setLoadHandlers((current) => (current === handlers ? null : current));
    };
  }, []);

  return (
    <QuickActionsContext.Provider
      value={{
        open,
        openQuickActions,
        closeQuickActions,
        loadHandlers,
        registerLoadHandlers,
      }}
    >
      {children}
    </QuickActionsContext.Provider>
  );
}
