export type IftaQuarterId = "Q1" | "Q2" | "Q3" | "Q4";

export type IftaView =
  | "trucks"
  | "states"
  | "quarters"
  | "fuel"
  | "export";

export const IFTA_VIEWS: { id: IftaView; label: string }[] = [
  { id: "trucks", label: "Truck View" },
  { id: "states", label: "State View" },
  { id: "quarters", label: "Quarter View" },
  { id: "fuel", label: "Fuel Purchases" },
  { id: "export", label: "Accountant Export" },
];

export type UsStateCode =
  | "TX"
  | "OK"
  | "AR"
  | "MO"
  | "IL"
  | "IN"
  | "OH"
  | "PA"
  | "TN"
  | "LA"
  | "KS"
  | "NM"
  | "CO"
  | "IA"
  | "KY"
  | "MS";

export type IftaTripSegment = {
  id: string;
  tenantId: string;
  truckId: string;
  driverId?: string;
  date: string;
  state: UsStateCode;
  miles: number;
  taxable: boolean;
  loadId?: string;
  notes?: string;
};

export type IftaFuelPurchase = {
  id: string;
  tenantId: string;
  truckId: string;
  driverId?: string;
  date: string;
  state: UsStateCode;
  vendor: string;
  gallons: number;
  pricePerGallon: number;
  totalCost: number;
  receiptUrl?: string | null;
  receiptStatus: "attached" | "missing" | "duplicate_suspect";
  notes?: string;
};

export type IftaReportKind =
  | "truck_summary"
  | "state_summary"
  | "quarter_summary"
  | "fuel_summary"
  | "mileage_summary"
  | "package";

export type IftaDownloadRecord = {
  id: string;
  format: "csv" | "xlsx" | "pdf" | "txt";
  filename: string;
  downloadedAt: string;
  downloadedBy: string;
};

export type IftaGeneratedReport = {
  id: string;
  tenantId: string;
  quarter: IftaQuarterId;
  year: number;
  kind: IftaReportKind;
  title: string;
  generatedAt: string;
  generatedBy: string;
  summary: {
    totalMiles: number;
    taxableMiles: number;
    nonTaxableMiles: number;
    gallons: number;
    mpg: number;
    estimatedTax: number;
    missingReceipts: number;
  };
  downloadHistory: IftaDownloadRecord[];
};

export type IftaAlphSeverity = "info" | "warning" | "critical";

export type IftaAlphAlertType =
  | "missing_receipt"
  | "suspicious_mpg"
  | "duplicate_receipt"
  | "mileage_discrepancy"
  | "missing_state_miles"
  | "audit_risk";

export type IftaAlphAlert = {
  id: string;
  type: IftaAlphAlertType;
  severity: IftaAlphSeverity;
  message: string;
  fixLabel: string;
  fixAction: IftaView | "generate" | "truck_detail";
  relatedId?: string;
};

export type IftaDashboardKpis = {
  currentQuarter: string;
  milesDriven: number;
  taxableMiles: number;
  nonTaxableMiles: number;
  fuelPurchasedGallons: number;
  fuelPurchasedCost: number;
  mpg: number;
  estimatedIftaTax: number;
  missingFuelReceipts: number;
};

export type IftaTruckRow = {
  truckId: string;
  unitNumber: string;
  totalMiles: number;
  totalFuel: number;
  mpg: number;
  statesVisited: UsStateCode[];
  estimatedTax: number;
};

export type IftaTruckStateBreakdown = {
  state: UsStateCode;
  stateName: string;
  miles: number;
  taxableMiles: number;
  gallons: number;
  mpg: number;
  taxRate: number;
  estimatedTax: number;
};

export type IftaStateRow = {
  state: UsStateCode;
  stateName: string;
  totalMiles: number;
  taxableMiles: number;
  fuelPurchasedCost: number;
  gallons: number;
  mpg: number;
  taxRate: number;
  estimatedTax: number;
};

export type IftaQuarterRow = {
  quarter: IftaQuarterId;
  year: number;
  label: string;
  totalMiles: number;
  taxableMiles: number;
  gallons: number;
  mpg: number;
  estimatedTax: number;
  tripCount: number;
  fuelCount: number;
  reportCount: number;
};

export type EldProviderId = "samsara" | "motive" | "geotab";

export type EldMileageImportRequest = {
  provider: EldProviderId;
  truckIds?: string[];
  fromDate: string;
  toDate: string;
};

export type EldMileageImportResult = {
  provider: EldProviderId;
  importedSegments: number;
  status: "stub" | "success" | "error";
  message: string;
};

export type IftaStoreState = {
  trips: IftaTripSegment[];
  fuelPurchases: IftaFuelPurchase[];
  reports: IftaGeneratedReport[];
  version: number;
};
