"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  clearPortalSession,
  getPendingPortal2FA,
  getPortalSession,
} from "@/lib/portal/session";
import {
  cancelPortalLoadRequest,
  createPortalLoadRequest,
  duplicatePortalLoadRequest,
  listPortalDocuments,
  listPortalLoadRequests,
  listPortalNotifications,
  listPortalThreads,
  markAllPortalNotificationsRead,
  markPortalNotificationRead,
  sendPortalMessage,
  uploadPortalDocument,
} from "@/lib/portal/data";
import type {
  PortalDocument,
  PortalLoadRequest,
  PortalMessageThread,
  PortalNotification,
  PortalSession,
} from "@/lib/portal/types";

type PortalContextValue = {
  session: PortalSession | null;
  ready: boolean;
  refreshSession: () => void;
  signOut: () => void;
  loadRequests: PortalLoadRequest[];
  documents: PortalDocument[];
  notifications: PortalNotification[];
  threads: PortalMessageThread[];
  createLoadRequest: typeof createPortalLoadRequest;
  cancelLoadRequest: (id: string) => PortalLoadRequest | null;
  duplicateLoadRequest: (id: string) => PortalLoadRequest | null;
  uploadDocument: typeof uploadPortalDocument;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  sendMessage: (threadId: string, body: string) => PortalMessageThread | null;
  bump: () => void;
};

const PortalContext = createContext<PortalContextValue | null>(null);

function subscribeStorage(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => {};
  const handler = () => onStoreChange();
  window.addEventListener("storage", handler);
  return () => window.removeEventListener("storage", handler);
}

function readSessionSnapshot(): string {
  if (typeof window === "undefined") return "ssr";
  const session = getPortalSession();
  const pending = getPendingPortal2FA();
  return JSON.stringify({ session, pending });
}

export default function PortalProvider({ children }: { children: ReactNode }) {
  const [version, setVersion] = useState(0);
  const bump = useCallback(() => setVersion((v) => v + 1), []);

  const storageStamp = useSyncExternalStore(
    subscribeStorage,
    readSessionSnapshot,
    () => "ssr",
  );

  const ready = storageStamp !== "ssr";
  const session = ready ? getPortalSession() : null;

  const companyId = session?.companyId;

  const loadRequests = useMemo(() => {
    void version;
    return companyId ? listPortalLoadRequests(companyId) : [];
  }, [companyId, version]);

  const documents = useMemo(() => {
    void version;
    return companyId ? listPortalDocuments(companyId) : [];
  }, [companyId, version]);

  const notifications = useMemo(() => {
    void version;
    return companyId ? listPortalNotifications(companyId) : [];
  }, [companyId, version]);

  const threads = useMemo(() => {
    void version;
    return companyId ? listPortalThreads(companyId) : [];
  }, [companyId, version]);

  const refreshSession = useCallback(() => {
    bump();
  }, [bump]);

  const signOut = useCallback(() => {
    clearPortalSession();
    bump();
  }, [bump]);

  const value = useMemo<PortalContextValue>(
    () => ({
      session,
      ready,
      refreshSession,
      signOut,
      loadRequests,
      documents,
      notifications,
      threads,
      createLoadRequest: (input) => {
        const created = createPortalLoadRequest(input);
        bump();
        return created;
      },
      cancelLoadRequest: (id) => {
        if (!companyId) return null;
        const result = cancelPortalLoadRequest(companyId, id);
        bump();
        return result;
      },
      duplicateLoadRequest: (id) => {
        if (!session) return null;
        const result = duplicatePortalLoadRequest(
          session.companyId,
          id,
          session.userId,
        );
        bump();
        return result;
      },
      uploadDocument: (doc) => {
        const created = uploadPortalDocument(doc);
        bump();
        return created;
      },
      markNotificationRead: (id) => {
        markPortalNotificationRead(id);
        bump();
      },
      markAllNotificationsRead: () => {
        if (!companyId) return;
        markAllPortalNotificationsRead(companyId);
        bump();
      },
      sendMessage: (threadId, body) => {
        if (!session) return null;
        const result = sendPortalMessage(
          session.companyId,
          threadId,
          session.name,
          body,
        );
        bump();
        return result;
      },
      bump,
    }),
    [
      session,
      ready,
      refreshSession,
      signOut,
      loadRequests,
      documents,
      notifications,
      threads,
      companyId,
      bump,
    ],
  );

  return (
    <PortalContext.Provider value={value}>{children}</PortalContext.Provider>
  );
}

export function usePortal() {
  const ctx = useContext(PortalContext);
  if (!ctx) {
    throw new Error("usePortal must be used within PortalProvider");
  }
  return ctx;
}
