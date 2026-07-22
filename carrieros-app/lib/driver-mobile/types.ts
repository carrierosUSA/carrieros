import type { LoadStatus } from "@/lib/types";
import type { PickupNumber } from "@/lib/types/pickup-number";

export type DriverMobileTab =
  | "home"
  | "loads"
  | "documents"
  | "messages"
  | "profile";

export type DriverDocUploadType =
  | "pod"
  | "bol"
  | "rate_con"
  | "lumper"
  | "fuel"
  | "scale"
  | "washout"
  | "repair"
  | "accident_photos"
  | "delivery_photos";

export type ExpenseCategory =
  | "fuel"
  | "hotel"
  | "parking"
  | "toll"
  | "lumper"
  | "repairs"
  | "other";

export type MessageChannel =
  | "dispatch"
  | "office"
  | "accounting"
  | "maintenance"
  | "safety"
  | "payroll"
  | "group";

export type NotificationKind =
  | "new_load"
  | "load_change"
  | "appointment_change"
  | "document_request"
  | "payroll_update"
  | "safety_alert"
  | "maintenance_alert";

export type OfflineActionType =
  | "upload_document"
  | "submit_expense"
  | "submit_dvir"
  | "load_action"
  | "send_message"
  | "location_ping";

export type DriverLoadAction =
  | "accept"
  | "reject"
  | "check_in"
  | "check_out"
  | "mark_loaded"
  | "mark_empty"
  | "start_detention"
  | "stop_detention"
  | "complete_delivery";

export type DriverMobileLoadStatus =
  | LoadStatus
  | "offered"
  | "accepted"
  | "rejected"
  | "checked_in"
  | "loaded"
  | "empty"
  | "detention"
  | "completed";

export type DriverMobileLoad = {
  id: string;
  reference: string;
  status: DriverMobileLoadStatus;
  originCity: string;
  originState: string;
  originAddress?: string;
  destCity: string;
  destState: string;
  destAddress?: string;
  pickupDate: string;
  deliveryDate: string;
  pickupAt?: string;
  deliveryAt?: string;
  rate: number;
  miles: number;
  commodity?: string;
  weight?: number;
  brokerName: string;
  brokerPhone: string;
  dispatchPhone: string;
  notes?: string;
  instructions?: string;
  nextStopLabel: string;
  eta: string;
  detentionActive: boolean;
  missingDocs: string[];
  offered?: boolean;
  pickupNumbers?: PickupNumber[];
};

export type DriverTask = {
  id: string;
  title: string;
  detail: string;
  urgency: "info" | "warning" | "critical";
  href?: string;
};

export type DriverAlert = {
  id: string;
  title: string;
  body: string;
  kind: NotificationKind;
  createdAt: string;
  read: boolean;
};

export type DriverMessage = {
  id: string;
  channel: MessageChannel;
  sender: "driver" | "team";
  senderName: string;
  body: string;
  sentAt: string;
};

export type DriverMessageThread = {
  channel: MessageChannel;
  title: string;
  subtitle: string;
  unread: number;
  messages: DriverMessage[];
};

export type DriverExpense = {
  id: string;
  category: ExpenseCategory;
  amount: number;
  note: string;
  receiptName?: string;
  loadId?: string;
  submittedAt: string;
  status: "queued" | "submitted" | "approved";
};

export type DvirTripType = "pre_trip" | "post_trip";

export type DvirDefect = {
  id: string;
  area: string;
  description: string;
  photoName?: string;
};

export type DriverDvir = {
  id: string;
  tripType: DvirTripType;
  defects: DvirDefect[];
  notes: string;
  signatureName: string;
  submittedAt: string;
  status: "queued" | "submitted";
};

export type DriverUploadedDoc = {
  id: string;
  type: DriverDocUploadType;
  fileName: string;
  loadId?: string;
  uploadedAt: string;
  status: "queued" | "uploaded";
};

export type PayrollLine = {
  id: string;
  label: string;
  amount: number;
  kind: "cpm" | "bonus" | "layover" | "detention" | "reimbursement" | "deduction";
};

export type PayrollSettlement = {
  id: string;
  period: string;
  grossPay: number;
  netPay: number;
  status: "paid" | "pending" | "processing";
  lines: PayrollLine[];
};

export type HosSummary = {
  driveRemainingHours: number;
  onDutyRemainingHours: number;
  cycleRemainingHours: number;
  status: "available" | "warning" | "critical";
  nextBreakDue?: string;
};

export type LocationShareSnapshot = {
  lat: number;
  lng: number;
  speedMph: number;
  headingDeg: number;
  eta: string;
  accuracyM: number;
  sharing: boolean;
  updatedAt: string;
  geofenceEvents: GeofenceEvent[];
};

export type GeofenceEvent = {
  id: string;
  type: "entered" | "exited";
  label: string;
  occurredAt: string;
};

export type OfflineQueueItem = {
  id: string;
  type: OfflineActionType;
  label: string;
  payload: Record<string, unknown>;
  createdAt: string;
  status: "queued" | "syncing" | "failed";
};

export type AlphSuggestion = {
  id: string;
  title: string;
  body: string;
  tone: "info" | "warning" | "success";
};

export type DriverMobileState = {
  driverId: string;
  driverName: string;
  photoUrl?: string;
  phone: string;
  truckUnit: string;
  cdl: {
    class: string;
    number: string;
    state: string;
    expiresAt: string;
  };
  medical: {
    expiresAt: string;
    cardNumber: string;
  };
  training: string[];
  profileDocs: { name: string; status: string; expiresAt?: string }[];
  currentStatus: string;
  todaysLoadId?: string;
  loads: DriverMobileLoad[];
  tasks: DriverTask[];
  alerts: DriverAlert[];
  threads: DriverMessageThread[];
  expenses: DriverExpense[];
  documents: DriverUploadedDoc[];
  dvirs: DriverDvir[];
  payroll: PayrollSettlement[];
  hos: HosSummary;
  weekEarnings: number;
  location: LocationShareSnapshot;
  offlineQueue: OfflineQueueItem[];
  alphSuggestions: AlphSuggestion[];
};
