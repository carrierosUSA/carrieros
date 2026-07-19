"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { buildDriverAppState } from "@/lib/driver-app/seed";
import {
  categorizeExpenseAi,
  extractDocumentFields,
  processPodAi,
} from "@/lib/driver-app/ocr";
import {
  enqueueOfflineAction,
  readOfflineQueue,
  syncOfflineQueue,
} from "@/lib/driver-app/offline-queue";
import { TRIP_STATUS_LABELS } from "@/lib/driver-app/constants";
import { MockMobileGpsShare } from "@/lib/driver-mobile/location-share";
import type {
  ConnectedService,
  DriverAppDocument,
  DriverAppExpense,
  DriverAppState,
  DriverDocKind,
  DriverTripStatus,
  ExpenseFlag,
  FuelTransaction,
  MaintenanceIssue,
  OfflineQueueItem,
  SecuritySettings,
} from "@/lib/driver-app/types";
import type {
  DriverDvir,
  DriverLoadAction,
  MessageChannel,
  LocationShareSnapshot,
} from "@/lib/driver-mobile/types";

type ToastFn = (msg: string) => void;

type DriverAppContextValue = {
  state: DriverAppState;
  online: boolean;
  darkMode: boolean;
  setDarkMode: (v: boolean) => void;
  location: LocationShareSnapshot;
  setSharing: (sharing: boolean) => void;
  toast: string | null;
  syncQueue: () => Promise<void>;
  setTripStatus: (status: DriverTripStatus) => void;
  acceptLoad: (loadId: string) => void;
  rejectLoad: (loadId: string, reason: string) => void;
  runLoadAction: (loadId: string, action: DriverLoadAction) => void;
  sendMessage: (channel: MessageChannel, body: string) => void;
  markAlertsRead: () => void;
  uploadDocument: (input: {
    kind: DriverDocKind;
    fileName: string;
    loadId?: string;
    fileSize?: number;
    lastModified?: number;
  }) => DriverAppDocument;
  processPod: (input: { fileName: string; loadId?: string }) => DriverAppDocument;
  submitExpense: (input: {
    amount: number;
    note: string;
    photoName?: string;
    loadId?: string;
    flag?: ExpenseFlag;
  }) => void;
  requestExpenseApproval: (expenseId: string) => void;
  approveExpenseDemo: (expenseId: string) => void;
  submitDvir: (input: Omit<DriverDvir, "id" | "submittedAt" | "status">) => void;
  reportMaintenance: (input: {
    unit: string;
    severity: MaintenanceIssue["severity"];
    title: string;
    description: string;
    photoName?: string;
  }) => void;
  toggleConnection: (id: string) => void;
  syncFuelDemo: () => void;
  addFuelFromReceipt: (fileName: string) => void;
  requestSettlementApproval: (settlementId: string) => void;
  updateSecurity: (patch: Partial<SecuritySettings>) => void;
  flash: ToastFn;
};

const DriverAppContext = createContext<DriverAppContextValue | null>(null);

function uid(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function queueOrRun(
  online: boolean,
  type: Parameters<typeof enqueueOfflineAction>[0],
  label: string,
  payload: Record<string, unknown>,
  apply: () => void,
  setQueue: (q: OfflineQueueItem[]) => void,
) {
  if (!online) {
    enqueueOfflineAction(type, label, payload);
    setQueue(readOfflineQueue());
    apply();
    return;
  }
  apply();
}

export function DriverAppProvider({
  driverId,
  children,
}: {
  driverId: string;
  children: ReactNode;
}) {
  const [state, setState] = useState(() => buildDriverAppState(driverId));
  const [online, setOnline] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [location, setLocation] = useState<LocationShareSnapshot>(state.location);
  const [queue, setQueue] = useState<OfflineQueueItem[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  const share = useMemo(
    () => new MockMobileGpsShare(state.loads.find((l) => l.id === state.todaysLoadId)?.eta),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [driverId],
  );

  const flash = useCallback((msg: string) => {
    setToast(msg);
    setState((s) => ({ ...s, lastToast: msg }));
    window.setTimeout(() => setToast(null), 2400);
  }, []);

  useEffect(() => {
    setState(buildDriverAppState(driverId));
  }, [driverId]);

  useEffect(() => {
    setQueue(readOfflineQueue());
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const stored = localStorage.getItem("carrieros.driver.darkMode");
    if (stored != null) setDarkMode(stored === "1");
    else setDarkMode(mq.matches);

    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);
    setOnline(navigator.onLine);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);

    const unsub = share.subscribe(setLocation);
    share.start(5000);

    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
      unsub();
      share.stop();
    };
  }, [share]);

  useEffect(() => {
    localStorage.setItem("carrieros.driver.darkMode", darkMode ? "1" : "0");
  }, [darkMode]);

  useEffect(() => {
    setState((s) => ({ ...s, offlineQueue: queue, location }));
  }, [queue, location]);

  const setSharing = useCallback((sharing: boolean) => share.setSharing(sharing), [share]);

  const syncQueue = useCallback(async () => {
    if (!navigator.onLine) return;
    await syncOfflineQueue(setQueue);
    flash("Queue synced with dispatch");
  }, [flash]);

  useEffect(() => {
    if (online && queue.length > 0) void syncQueue();
  }, [online, queue.length, syncQueue]);

  const setTripStatus = useCallback(
    (status: DriverTripStatus) => {
      const label = TRIP_STATUS_LABELS[status];
      queueOrRun(
        online,
        "load_action",
        `Status: ${label}`,
        { status },
        () => {
          setState((s) => {
            const loadId = s.todaysLoadId;
            const detentionActive = status === "detention_start";
            return {
              ...s,
              tripStatus: status,
              currentStatus: label,
              loads: s.loads.map((l) => {
                if (loadId && l.id !== loadId) return l;
                const next = { ...l, detentionActive };
                if (status === "accepted") next.status = "accepted";
                if (status === "heading_to_pickup") next.status = "dispatched";
                if (status === "arrived_pickup") next.status = "checked_in";
                if (status === "loaded") next.status = "loaded";
                if (status === "departed") next.status = "in_transit";
                if (status === "arrived_delivery") next.status = "in_transit";
                if (status === "delivered") next.status = "completed";
                if (status === "empty") next.status = "empty";
                if (status === "available") next.status = "empty";
                if (status === "detention_end") next.detentionActive = false;
                return next;
              }),
            };
          });
          flash(
            online
              ? `Dispatch notified — ${label}`
              : `Queued offline — ${label}`,
          );
        },
        setQueue,
      );
    },
    [online, flash],
  );

  const acceptLoad = useCallback(
    (loadId: string) => {
      queueOrRun(
        online,
        "load_action",
        "Accept load",
        { loadId, action: "accept" },
        () => {
          setState((s) => ({
            ...s,
            currentStatus: "Heading to Pickup",
            tripStatus: "heading_to_pickup",
            todaysLoadId: loadId,
            loads: s.loads.map((l) =>
              l.id === loadId ? { ...l, status: "accepted", offered: false } : l,
            ),
          }));
          flash(online ? "Dispatch notified — load accepted" : "Queued — accept load");
        },
        setQueue,
      );
    },
    [online, flash],
  );

  const rejectLoad = useCallback(
    (loadId: string, reason: string) => {
      queueOrRun(
        online,
        "load_action",
        `Reject — ${reason}`,
        { loadId, action: "reject", reason },
        () => {
          setState((s) => ({
            ...s,
            loads: s.loads.map((l) =>
              l.id === loadId
                ? { ...l, status: "rejected", offered: false, notes: reason }
                : l,
            ),
          }));
          flash("Dispatch notified — load declined");
        },
        setQueue,
      );
    },
    [online, flash],
  );

  const runLoadAction = useCallback(
    (loadId: string, action: DriverLoadAction) => {
      const labels: Record<DriverLoadAction, string> = {
        accept: "Accept",
        reject: "Reject",
        check_in: "Check in",
        check_out: "Check out",
        mark_loaded: "Mark loaded",
        mark_empty: "Mark empty",
        start_detention: "Start detention",
        stop_detention: "Stop detention",
        complete_delivery: "Complete delivery",
      };
      queueOrRun(
        online,
        "load_action",
        labels[action],
        { loadId, action },
        () => {
          setState((s) => ({
            ...s,
            loads: s.loads.map((l) => {
              if (l.id !== loadId) return l;
              switch (action) {
                case "check_in":
                  return { ...l, status: "checked_in" };
                case "check_out":
                  return { ...l, status: "in_transit" };
                case "mark_loaded":
                  return { ...l, status: "loaded" };
                case "mark_empty":
                  return { ...l, status: "empty" };
                case "start_detention":
                  return { ...l, detentionActive: true, status: "detention" };
                case "stop_detention":
                  return { ...l, detentionActive: false, status: "in_transit" };
                case "complete_delivery":
                  return { ...l, status: "completed", detentionActive: false };
                default:
                  return l;
              }
            }),
            tripStatus:
              action === "complete_delivery"
                ? "delivered"
                : action === "start_detention"
                  ? "detention_start"
                  : action === "mark_loaded"
                    ? "loaded"
                    : action === "check_in"
                      ? "arrived_pickup"
                      : s.tripStatus,
            currentStatus:
              action === "complete_delivery"
                ? "Delivered"
                : action === "start_detention"
                  ? "Detention"
                  : s.currentStatus,
          }));
          flash(`Dispatch notified — ${labels[action]}`);
        },
        setQueue,
      );
    },
    [online, flash],
  );

  const sendMessage = useCallback(
    (channel: MessageChannel, body: string) => {
      const text = body.trim();
      if (!text) return;
      queueOrRun(
        online,
        "send_message",
        `Message ${channel}`,
        { channel, body: text },
        () =>
          setState((s) => ({
            ...s,
            threads: s.threads.map((t) =>
              t.channel === channel
                ? {
                    ...t,
                    messages: [
                      ...t.messages,
                      {
                        id: uid("msg"),
                        channel,
                        sender: "driver",
                        senderName: "You",
                        body: text,
                        sentAt: new Date().toISOString(),
                        // read locally as sent
                      },
                    ],
                  }
                : t,
            ),
          })),
        setQueue,
      );
    },
    [online],
  );

  const markAlertsRead = useCallback(() => {
    setState((s) => ({
      ...s,
      alerts: s.alerts.map((a) => ({ ...a, read: true })),
    }));
  }, []);

  const uploadDocument = useCallback(
    (input: {
      kind: DriverDocKind;
      fileName: string;
      loadId?: string;
      fileSize?: number;
      lastModified?: number;
    }) => {
      const ocr = extractDocumentFields({
        fileName: input.fileName,
        kind: input.kind,
        loadId: input.loadId ?? state.todaysLoadId,
        truckUnit: state.truckUnit,
        trailerUnit: state.loads.find((l) => l.id === (input.loadId ?? state.todaysLoadId))
          ?.trailerUnit,
        fileSize: input.fileSize,
        lastModified: input.lastModified,
      });
      const doc: DriverAppDocument = {
        id: uid("doc"),
        type:
          input.kind === "pod"
            ? "pod"
            : input.kind === "bol"
              ? "bol"
              : input.kind === "fuel"
                ? "fuel"
                : input.kind === "rate_con"
                  ? "rate_con"
                  : "delivery_photos",
        kind: ocr.documentType,
        fileName: input.fileName,
        loadId: input.loadId ?? state.todaysLoadId,
        uploadedAt: new Date().toISOString(),
        status: online ? "uploaded" : "queued",
        ocr,
        aiSummary: ocr.summary,
        categoryLabel: ocr.documentType.replace(/_/g, " ").toUpperCase(),
      };
      queueOrRun(
        online,
        "upload_document",
        `Upload ${doc.categoryLabel}`,
        { ...input },
        () => setState((s) => ({ ...s, documents: [doc, ...s.documents] })),
        setQueue,
      );
      flash(online ? `Uploaded · ${ocr.summary.slice(0, 48)}…` : "Queued offline — document");
      return doc;
    },
    [online, state.todaysLoadId, state.truckUnit, state.loads, flash],
  );

  const processPod = useCallback(
    (input: { fileName: string; loadId?: string }) => {
      const loadId = input.loadId ?? state.todaysLoadId;
      const load = state.loads.find((l) => l.id === loadId);
      const podAi = processPodAi({
        fileName: input.fileName,
        loadReference: load?.reference,
      });
      const ocr = extractDocumentFields({
        fileName: input.fileName,
        kind: "pod",
        loadId,
        truckUnit: state.truckUnit,
        trailerUnit: load?.trailerUnit,
      });
      const doc: DriverAppDocument = {
        id: uid("pod"),
        type: "pod",
        kind: "pod",
        fileName: input.fileName,
        loadId,
        uploadedAt: new Date().toISOString(),
        status: online ? "uploaded" : "queued",
        ocr,
        podAi,
        aiSummary: podAi.summary,
        categoryLabel: "POD",
      };
      queueOrRun(
        online,
        "upload_document",
        "POD AI upload",
        { ...input, loadId },
        () =>
          setState((s) => ({
            ...s,
            documents: [doc, ...s.documents],
            tripStatus: "delivered",
            currentStatus: "Delivered",
            loads: s.loads.map((l) =>
              l.id === loadId
                ? {
                    ...l,
                    status: "completed",
                    missingDocs: l.missingDocs.filter((d) => d.toLowerCase() !== "pod"),
                  }
                : l,
            ),
          })),
        setQueue,
      );
      flash(
        online
          ? "POD processed · Dispatch & accounting notified · Invoice ready"
          : "POD queued offline",
      );
      return doc;
    },
    [online, state.todaysLoadId, state.loads, state.truckUnit, flash],
  );

  const submitExpense = useCallback(
    (input: {
      amount: number;
      note: string;
      photoName?: string;
      loadId?: string;
      flag?: ExpenseFlag;
    }) => {
      const ai = categorizeExpenseAi(input.photoName ?? "", input.note);
      const expense: DriverAppExpense = {
        id: uid("exp"),
        category: "other",
        amount: input.amount,
        note: input.note,
        receiptName: input.photoName,
        photoName: input.photoName,
        loadId: input.loadId,
        submittedAt: new Date().toISOString(),
        status: online ? "submitted" : "queued",
        flag: input.flag ?? ai.flag,
        approvalStatus: "draft",
        aiCategory: ai.category,
        aiSummary: ai.summary,
      };
      queueOrRun(
        online,
        "submit_expense",
        `Expense $${input.amount.toFixed(2)}`,
        { ...input },
        () => setState((s) => ({ ...s, expenses: [expense, ...s.expenses] })),
        setQueue,
      );
      flash(ai.summary);
    },
    [online, flash],
  );

  const requestExpenseApproval = useCallback(
    (expenseId: string) => {
      setState((s) => ({
        ...s,
        expenses: s.expenses.map((e) =>
          e.id === expenseId
            ? { ...e, approvalStatus: "pending_approval", status: "submitted" }
            : e,
        ),
      }));
      flash("Approval requested — flows to payroll when approved");
    },
    [flash],
  );

  const approveExpenseDemo = useCallback(
    (expenseId: string) => {
      setState((s) => ({
        ...s,
        expenses: s.expenses.map((e) =>
          e.id === expenseId
            ? { ...e, approvalStatus: "approved", status: "approved" }
            : e,
        ),
      }));
      flash("Expense approved — included in next settlement draft");
    },
    [flash],
  );

  const submitDvir = useCallback(
    (input: Omit<DriverDvir, "id" | "submittedAt" | "status">) => {
      const dvir: DriverDvir = {
        ...input,
        id: uid("dvir"),
        submittedAt: new Date().toISOString(),
        status: online ? "submitted" : "queued",
      };
      queueOrRun(
        online,
        "submit_dvir",
        `${input.tripType === "pre_trip" ? "Pre" : "Post"}-trip DVIR`,
        { tripType: input.tripType },
        () => setState((s) => ({ ...s, dvirs: [dvir, ...s.dvirs] })),
        setQueue,
      );
      flash(online ? "DVIR submitted to safety" : "DVIR queued offline");
    },
    [online, flash],
  );

  const reportMaintenance = useCallback(
    (input: {
      unit: string;
      severity: MaintenanceIssue["severity"];
      title: string;
      description: string;
      photoName?: string;
    }) => {
      const issue: MaintenanceIssue = {
        id: uid("mi"),
        ...input,
        aiPossibleIssue: `AI: possible ${input.title.toLowerCase()} — inspect related systems.`,
        status: "reported",
        reportedAt: new Date().toISOString(),
      };
      setState((s) => ({
        ...s,
        maintenanceIssues: [issue, ...s.maintenanceIssues],
      }));
      flash("Maintenance notified — issue reported");
    },
    [flash],
  );

  const toggleConnection = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      connections: s.connections.map((c: ConnectedService) =>
        c.id === id
          ? {
              ...c,
              connected: !c.connected,
              lastSyncAt: !c.connected ? new Date().toISOString() : c.lastSyncAt,
              statusNote: !c.connected
                ? "Demo connection — architecture-ready, not live API"
                : c.statusNote,
            }
          : c,
      ),
    }));
  }, []);

  const syncFuelDemo = useCallback(() => {
    const txn: FuelTransaction = {
      id: uid("fuel"),
      providerId: "wex",
      providerName: "WEX",
      truckUnit: state.truckUnit,
      driverName: state.driverName,
      stationName: "WEX Partner Station",
      stationCity: "Norman",
      stationState: "OK",
      gallons: 64.2,
      defGallons: 2.5,
      pricePerGallon: 3.61,
      amount: 238.40,
      cardLast4: "4412",
      txnId: `WX-${Math.floor(Math.random() * 1e8)}`,
      purchasedAt: new Date().toISOString(),
      source: "provider_sync",
    };
    setState((s) => ({
      ...s,
      fuelTransactions: [txn, ...s.fuelTransactions],
      connections: s.connections.map((c) =>
        c.category === "fuel"
          ? { ...c, lastSyncAt: new Date().toISOString(), connected: true }
          : c,
      ),
      fuelLevelPct: Math.min(100, s.fuelLevelPct + 28),
    }));
    flash("Fuel providers synced (demo) — new transaction added");
  }, [state.truckUnit, state.driverName, flash]);

  const addFuelFromReceipt = useCallback(
    (fileName: string) => {
      const ocr = extractDocumentFields({
        fileName,
        kind: "fuel",
        truckUnit: state.truckUnit,
      });
      const gallons = Number(ocr.fields.gallons ?? 50);
      const amount = Number(ocr.fields.amount ?? 180);
      const txn: FuelTransaction = {
        id: uid("fuel"),
        providerId: "loves",
        providerName: "Receipt OCR",
        truckUnit: state.truckUnit,
        driverName: state.driverName,
        stationName: ocr.fields.station ?? "Unknown station",
        stationCity: "—",
        stationState: "—",
        gallons,
        pricePerGallon: gallons ? amount / gallons : 0,
        amount,
        cardLast4: "••••",
        txnId: `OCR-${Date.now().toString(36).toUpperCase()}`,
        purchasedAt: new Date().toISOString(),
        source: "receipt_ocr",
        receiptImageName: fileName,
      };
      const doc = uploadDocument({ kind: "fuel", fileName });
      setState((s) => ({
        ...s,
        fuelTransactions: [txn, ...s.fuelTransactions],
        documents: s.documents.some((d) => d.id === doc.id)
          ? s.documents
          : [doc, ...s.documents],
      }));
      flash("Fuel receipt OCR complete");
    },
    [state.truckUnit, state.driverName, uploadDocument, flash],
  );

  const requestSettlementApproval = useCallback(
    (settlementId: string) => {
      setState((s) => ({
        ...s,
        payroll: s.payroll.map((p) =>
          p.id === settlementId
            ? {
                ...p,
                approvalStatus: "pending_manager",
                status: "pending",
                managerNote: "Manager approval required before payment.",
              }
            : p,
        ),
      }));
      flash("Settlement sent for manager approval");
    },
    [flash],
  );

  const updateSecurity = useCallback((patch: Partial<SecuritySettings>) => {
    setState((s) => ({ ...s, security: { ...s.security, ...patch } }));
  }, []);

  const value: DriverAppContextValue = {
    state: { ...state, offlineQueue: queue, location },
    online,
    darkMode,
    setDarkMode,
    location,
    setSharing,
    toast,
    syncQueue,
    setTripStatus,
    acceptLoad,
    rejectLoad,
    runLoadAction,
    sendMessage,
    markAlertsRead,
    uploadDocument,
    processPod,
    submitExpense,
    requestExpenseApproval,
    approveExpenseDemo,
    submitDvir,
    reportMaintenance,
    toggleConnection,
    syncFuelDemo,
    addFuelFromReceipt,
    requestSettlementApproval,
    updateSecurity,
    flash,
  };

  return (
    <DriverAppContext.Provider value={value}>{children}</DriverAppContext.Provider>
  );
}

export function useDriverApp() {
  const ctx = useContext(DriverAppContext);
  if (!ctx) throw new Error("useDriverApp must be used within DriverAppProvider");
  return ctx;
}

/** Compatibility shim for legacy driver-mobile views */
export function useDriverMobileCompat() {
  const app = useDriverApp();
  return {
    state: app.state,
    online: app.online,
    darkMode: app.darkMode,
    setDarkMode: app.setDarkMode,
    location: app.location,
    setSharing: app.setSharing,
    syncQueue: app.syncQueue,
    toast: app.toast,
    flash: app.flash,
    acceptLoad: app.acceptLoad,
    rejectLoad: app.rejectLoad,
    runLoadAction: app.runLoadAction,
    updateLoad: () => undefined,
    sendMessage: app.sendMessage,
    markAlertsRead: app.markAlertsRead,
    uploadDocument: (input: {
      type: string;
      fileName: string;
      loadId?: string;
    }) => {
      const kindMap: Record<string, DriverDocKind> = {
        pod: "pod",
        bol: "bol",
        rate_con: "rate_con",
        fuel: "fuel",
        scale: "scale",
        lumper: "lumper",
        repair: "repair",
      };
      app.uploadDocument({
        kind: kindMap[input.type] ?? "other",
        fileName: input.fileName,
        loadId: input.loadId,
      });
    },
    submitExpense: (input: {
      category: string;
      amount: number;
      note: string;
      receiptName?: string;
      loadId?: string;
    }) =>
      app.submitExpense({
        amount: input.amount,
        note: input.note,
        photoName: input.receiptName,
        loadId: input.loadId,
      }),
    submitDvir: app.submitDvir,
  };
}
