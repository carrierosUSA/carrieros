"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from "react";

type LoadDetailActionTriggersContextValue = {
  registerAssignDriver: (trigger: (() => void) | null) => void;
  registerAssignTruck: (trigger: (() => void) | null) => void;
  triggerAssignDriver: () => void;
  triggerAssignTruck: () => void;
};

const LoadDetailActionTriggersContext =
  createContext<LoadDetailActionTriggersContextValue | null>(null);

export function useLoadDetailActionTriggers() {
  const context = useContext(LoadDetailActionTriggersContext);

  if (!context) {
    throw new Error(
      "useLoadDetailActionTriggers must be used within LoadDetailActionTriggersProvider.",
    );
  }

  return context;
}

export function useRegisterAssignDriverTrigger(trigger: () => void) {
  const { registerAssignDriver } = useLoadDetailActionTriggers();

  useEffect(() => {
    registerAssignDriver(trigger);
    return () => registerAssignDriver(null);
  }, [registerAssignDriver, trigger]);
}

export function useRegisterAssignTruckTrigger(trigger: () => void) {
  const { registerAssignTruck } = useLoadDetailActionTriggers();

  useEffect(() => {
    registerAssignTruck(trigger);
    return () => registerAssignTruck(null);
  }, [registerAssignTruck, trigger]);
}

type LoadDetailActionTriggersProviderProps = {
  children: ReactNode;
};

export default function LoadDetailActionTriggersProvider({
  children,
}: LoadDetailActionTriggersProviderProps) {
  const assignDriverRef = useRef<(() => void) | null>(null);
  const assignTruckRef = useRef<(() => void) | null>(null);

  const registerAssignDriver = useCallback((trigger: (() => void) | null) => {
    assignDriverRef.current = trigger;
  }, []);

  const registerAssignTruck = useCallback((trigger: (() => void) | null) => {
    assignTruckRef.current = trigger;
  }, []);

  const value = useMemo(
    () => ({
      registerAssignDriver,
      registerAssignTruck,
      triggerAssignDriver: () => assignDriverRef.current?.(),
      triggerAssignTruck: () => assignTruckRef.current?.(),
    }),
    [registerAssignDriver, registerAssignTruck],
  );

  return (
    <LoadDetailActionTriggersContext.Provider value={value}>
      {children}
    </LoadDetailActionTriggersContext.Provider>
  );
}
