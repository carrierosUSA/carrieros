import type {
  DriverAlert,
  DriverDvir,
  DriverExpense,
  DriverMessageThread,
  DriverMobileLoad,
  DriverMobileState,
  DriverTask,
  DriverUploadedDoc,
  HosSummary,
  LocationShareSnapshot,
  OfflineQueueItem,
  AlphSuggestion,
  PayrollSettlement,
} from "@/lib/driver-mobile/types";

/** One-tap operational status for Transpo Driver App™ */
export type DriverTripStatus =
  | "available"
  | "accepted"
  | "heading_to_pickup"
  | "arrived_pickup"
  | "loaded"
  | "departed"
  | "arrived_delivery"
  | "delivered"
  | "empty"
  | "delayed"
  | "breakdown"
  | "traffic_weather_delay"
  | "detention_start"
  | "detention_end";

export type DriverDocKind =
  | "rate_con"
  | "bol"
  | "pod"
  | "fuel"
  | "scale"
  | "lumper"
  | "repair"
  | "parking"
  | "hotel"
  | "toll"
  | "inspection"
  | "insurance"
  | "registration"
  | "permits"
  | "medical"
  | "cdl"
  | "other";

export type ExpenseFlag = "personal" | "company" | "reimbursable";

export type ExpenseApprovalStatus =
  | "draft"
  | "pending_approval"
  | "approved"
  | "rejected"
  | "queued";

export type SettlementApprovalStatus =
  | "draft"
  | "pending_manager"
  | "approved"
  | "paid"
  | "rejected";

export type ServiceCategory =
  | "fuel"
  | "eld"
  | "gps"
  | "telematics"
  | "insurance"
  | "maintenance"
  | "banks"
  | "payroll"
  | "accounting"
  | "factoring"
  | "load_boards"
  | "tolls"
  | "parking"
  | "oem";

export type FuelProviderId =
  | "comdata"
  | "efs"
  | "wex"
  | "rts"
  | "fleet_one"
  | "loves"
  | "pilot"
  | "ta";

export type FuelTransaction = {
  id: string;
  providerId: FuelProviderId;
  providerName: string;
  truckUnit: string;
  driverName: string;
  stationName: string;
  stationCity: string;
  stationState: string;
  gallons: number;
  defGallons?: number;
  pricePerGallon: number;
  amount: number;
  cardLast4: string;
  txnId: string;
  purchasedAt: string;
  unusual?: boolean;
  unusualReason?: string;
  source: "provider_sync" | "receipt_ocr";
  receiptImageName?: string;
};

export type ConnectedService = {
  id: string;
  category: ServiceCategory;
  name: string;
  provider: string;
  connected: boolean;
  lastSyncAt?: string;
  statusNote?: string;
};

export type OcrExtractedFields = {
  documentType: DriverDocKind;
  confidence: number;
  summary: string;
  fields: Record<string, string>;
  linkedLoadId?: string;
  linkedTruck?: string;
  linkedTrailer?: string;
};

export type PodAiResult = {
  signaturePresent: boolean;
  deliveredAt?: string;
  receiverName?: string;
  sealNumber?: string;
  pieces?: number;
  notes?: string;
  summary: string;
  invoiceReady: boolean;
  dispatchNotified: boolean;
  accountingNotified: boolean;
};

export type DriverAppDocument = DriverUploadedDoc & {
  kind: DriverDocKind;
  ocr?: OcrExtractedFields;
  podAi?: PodAiResult;
  aiSummary?: string;
  categoryLabel: string;
};

export type DriverAppExpense = DriverExpense & {
  flag: ExpenseFlag;
  approvalStatus: ExpenseApprovalStatus;
  aiCategory?: string;
  aiSummary?: string;
  photoName?: string;
};

export type DriverSettlement = PayrollSettlement & {
  approvalStatus: SettlementApprovalStatus;
  loadedMiles: number;
  emptyMiles: number;
  stopPay: number;
  detentionPay: number;
  layoverPay: number;
  bonuses: number;
  reimbursements: number;
  advances: number;
  deductions: number;
  perDiem: number;
  managerNote?: string;
};

export type MaintenanceIssue = {
  id: string;
  unit: string;
  severity: "low" | "medium" | "high" | "critical";
  title: string;
  description: string;
  aiPossibleIssue?: string;
  status: "reported" | "acknowledged" | "in_shop" | "resolved";
  photoName?: string;
  voiceNoteName?: string;
  reportedAt: string;
};

export type SafetyAlert = {
  id: string;
  title: string;
  body: string;
  kind: "weather" | "road" | "hos" | "compliance";
  severity: "info" | "warning" | "critical";
  createdAt: string;
};

export type WeatherSnapshot = {
  label: string;
  tempF: number;
  condition: string;
  windMph: number;
};

export type TrafficSnapshot = {
  label: string;
  delayMinutes: number;
  severity: "clear" | "moderate" | "heavy";
};

export type SecuritySettings = {
  faceIdEnabled: boolean;
  fingerprintEnabled: boolean;
  pinEnabled: boolean;
  pinSet: boolean;
  encryptedAtRest: boolean;
};

export type DriverAppTrip = DriverMobileLoad & {
  stops?: { label: string; city: string; state: string; type: "pickup" | "delivery" | "stop" }[];
  remainingMiles?: number;
  appointmentWindow?: string;
  brokerNotes?: string;
  dispatcherNotes?: string;
  tempReq?: string;
  sealNumber?: string;
  references?: string[];
  trailerUnit?: string;
  timeline?: { id: string; label: string; at?: string; done: boolean }[];
};

export type DriverAppState = Omit<
  DriverMobileState,
  "loads" | "expenses" | "documents" | "payroll"
> & {
  brand: "Transpo Driver App™";
  tripStatus: DriverTripStatus;
  fuelLevelPct: number;
  remainingMiles: number;
  appointmentWindow: string;
  weather: WeatherSnapshot;
  traffic: TrafficSnapshot;
  loads: DriverAppTrip[];
  expenses: DriverAppExpense[];
  documents: DriverAppDocument[];
  payroll: DriverSettlement[];
  fuelTransactions: FuelTransaction[];
  connections: ConnectedService[];
  maintenanceIssues: MaintenanceIssue[];
  safetyAlerts: SafetyAlert[];
  security: SecuritySettings;
  mpgAverage: number;
  lastToast?: string | null;
};

export type {
  DriverAlert,
  DriverDvir,
  DriverMessageThread,
  DriverTask,
  HosSummary,
  LocationShareSnapshot,
  OfflineQueueItem,
  AlphSuggestion,
};
