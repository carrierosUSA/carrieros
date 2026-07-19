"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import CommunicationCallChooser from "@/components/dispatch/load-detail/communication/CommunicationCallChooser";
import {
  buildCallUrl,
  buildLoadEmailBody,
  buildLoadEmailSubject,
  buildMailtoUrl,
  buildSmsUrl,
  openCommunicationUrl,
  type LoadEmailContext,
} from "@/lib/dispatch/communication";
import {
  getPreferredCallingMethod,
  setPreferredCallingMethod,
  type CallingMethod,
} from "@/lib/dispatch/communication-preferences";

type LoadDetailCommunicationProviderProps = {
  loadContext: LoadEmailContext;
  children: ReactNode;
};

type CommunicationContextValue = {
  loadContext: LoadEmailContext;
  preferredCallingMethod: CallingMethod | null;
  call: (phone: string, options?: { forceChooser?: boolean }) => void;
  message: (phone: string) => void;
  email: (email: string, partyLabel?: string) => void;
  openCallingSettings: () => void;
};

const CommunicationContext = createContext<CommunicationContextValue | null>(null);

export function useLoadDetailCommunication(): CommunicationContextValue {
  const context = useContext(CommunicationContext);

  if (!context) {
    throw new Error("useLoadDetailCommunication must be used within LoadDetailCommunicationProvider.");
  }

  return context;
}

export default function LoadDetailCommunicationProvider({
  loadContext,
  children,
}: LoadDetailCommunicationProviderProps) {
  const router = useRouter();
  const [preferredCallingMethod, setPreferredMethod] = useState<CallingMethod | null>(
    null,
  );
  const [chooserOpen, setChooserOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [pendingPhone, setPendingPhone] = useState<string | null>(null);

  const refreshPreference = useCallback(() => {
    setPreferredMethod(getPreferredCallingMethod());
  }, []);

  const launchCall = useCallback((method: CallingMethod, phone: string) => {
    const url = buildCallUrl(method, phone);

    if (url) {
      openCommunicationUrl(url);
    }
  }, []);

  const call = useCallback(
    (phone: string, options?: { forceChooser?: boolean }) => {
      const method = options?.forceChooser ? null : getPreferredCallingMethod();

      if (method) {
        launchCall(method, phone);
        return;
      }

      setPendingPhone(phone);
      setSettingsOpen(false);
      setChooserOpen(true);
    },
    [launchCall],
  );

  const message = useCallback(
    (phone: string) => {
      const params = new URLSearchParams({
        compose: "sms",
        phone,
      });

      if (loadContext.loadId) {
        params.set("loadId", loadContext.loadId);
      }

      const smsUrl = buildSmsUrl(phone);
      if (smsUrl) {
        openCommunicationUrl(smsUrl);
      }

      router.push(`/communications?${params.toString()}`);
    },
    [loadContext.loadId, router],
  );

  const email = useCallback(
    (address: string, partyLabel?: string) => {
      const context = { ...loadContext, partyLabel };
      const url = buildMailtoUrl(
        address,
        buildLoadEmailSubject(context),
        buildLoadEmailBody(context),
      );

      if (url) {
        openCommunicationUrl(url);
      }
    },
    [loadContext],
  );

  const openCallingSettings = useCallback(() => {
    setPendingPhone(null);
    setSettingsOpen(true);
    setChooserOpen(true);
  }, []);

  const handleSelectMethod = useCallback(
    (method: CallingMethod, saveAsPreferred: boolean) => {
      if (saveAsPreferred) {
        setPreferredCallingMethod(method);
        setPreferredMethod(method);
      }

      if (pendingPhone) {
        launchCall(method, pendingPhone);
      }

      setChooserOpen(false);
      setPendingPhone(null);
      setSettingsOpen(false);
    },
    [launchCall, pendingPhone],
  );

  const handleCloseChooser = useCallback(() => {
    setChooserOpen(false);
    setPendingPhone(null);
    setSettingsOpen(false);
  }, []);

  const value = useMemo(
    () => ({
      loadContext,
      preferredCallingMethod,
      call,
      message,
      email,
      openCallingSettings,
    }),
    [call, email, loadContext, message, openCallingSettings, preferredCallingMethod],
  );

  return (
    <CommunicationContext.Provider value={value}>
      {children}
      <CommunicationCallChooser
        open={chooserOpen}
        phone={pendingPhone}
        settingsMode={settingsOpen}
        preferredMethod={preferredCallingMethod ?? getPreferredCallingMethod()}
        onSelect={handleSelectMethod}
        onClose={handleCloseChooser}
        onOpenSettings={() => {
          setSettingsOpen(true);
          refreshPreference();
        }}
        onRefreshPreference={refreshPreference}
      />
    </CommunicationContext.Provider>
  );
}
