import type { DriverDocKind, DriverTripStatus, ServiceCategory } from "@/lib/driver-app/types";
import { DEMO_DRIVER_ID } from "@/lib/driver-mobile/seed";

export { DEMO_DRIVER_ID };

export function resolveDriverId(searchParams?: {
  driverId?: string | string[] | null;
}): string {
  const raw = searchParams?.driverId;
  const value = Array.isArray(raw) ? raw[0] : raw;
  return value?.trim() || DEMO_DRIVER_ID;
}

export const DRIVER_BRAND = "Transpo Driver App™";

export const TRIP_STATUS_FLOW: {
  id: DriverTripStatus;
  label: string;
  notify: string;
}[] = [
  { id: "accepted", label: "Accept", notify: "Dispatch notified — load accepted" },
  { id: "heading_to_pickup", label: "Heading to Pickup", notify: "Dispatch notified — en route to pickup" },
  { id: "arrived_pickup", label: "Arrived Pickup", notify: "Dispatch notified — arrived at pickup" },
  { id: "loaded", label: "Loaded", notify: "Dispatch notified — loaded" },
  { id: "departed", label: "Departed", notify: "Dispatch notified — departed pickup" },
  { id: "arrived_delivery", label: "Arrived Delivery", notify: "Dispatch notified — arrived at delivery" },
  { id: "delivered", label: "Delivered", notify: "Dispatch notified — delivered" },
  { id: "empty", label: "Empty", notify: "Dispatch notified — empty" },
  { id: "available", label: "Available", notify: "Dispatch notified — available" },
];

export const TRIP_STATUS_EXCEPTIONS: {
  id: DriverTripStatus;
  label: string;
  notify: string;
}[] = [
  { id: "delayed", label: "Delayed", notify: "Dispatch notified — delayed" },
  { id: "breakdown", label: "Breakdown", notify: "Dispatch notified — breakdown" },
  {
    id: "traffic_weather_delay",
    label: "Traffic / Weather",
    notify: "Dispatch notified — traffic/weather delay",
  },
  {
    id: "detention_start",
    label: "Detention Start",
    notify: "Dispatch notified — detention started",
  },
  {
    id: "detention_end",
    label: "Detention End",
    notify: "Dispatch notified — detention ended",
  },
];

export const DOC_KIND_OPTIONS: { id: DriverDocKind; label: string }[] = [
  { id: "rate_con", label: "Rate Con" },
  { id: "bol", label: "BOL" },
  { id: "pod", label: "POD" },
  { id: "fuel", label: "Fuel" },
  { id: "scale", label: "Scale" },
  { id: "lumper", label: "Lumper" },
  { id: "repair", label: "Repair" },
  { id: "parking", label: "Parking" },
  { id: "hotel", label: "Hotel" },
  { id: "toll", label: "Toll" },
  { id: "inspection", label: "Inspection" },
  { id: "insurance", label: "Insurance" },
  { id: "registration", label: "Registration" },
  { id: "permits", label: "Permits" },
  { id: "medical", label: "Medical" },
  { id: "cdl", label: "CDL" },
  { id: "other", label: "Other" },
];

export const BOTTOM_NAV = [
  { href: "/driver", label: "Home", match: (p: string) => p === "/driver" },
  {
    href: "/driver/trips",
    label: "Trips",
    match: (p: string) => p.startsWith("/driver/trips") || p.startsWith("/driver/loads"),
  },
  {
    href: "/driver/documents",
    label: "Documents",
    match: (p: string) => p.startsWith("/driver/documents"),
  },
  {
    href: "/driver/messages",
    label: "Messages",
    match: (p: string) => p.startsWith("/driver/messages"),
  },
  {
    href: "/driver/wallet",
    label: "Wallet",
    match: (p: string) => p.startsWith("/driver/wallet"),
  },
  {
    href: "/driver/more",
    label: "More",
    match: (p: string) =>
      p.startsWith("/driver/more") ||
      [
        "/driver/expenses",
        "/driver/maintenance",
        "/driver/dvir",
        "/driver/payroll",
        "/driver/safety",
        "/driver/emergency",
        "/driver/services",
        "/driver/eld",
        "/driver/alph",
        "/driver/settings",
        "/alph/copilot",
      ].some((x) => p.startsWith(x)),
  },
] as const;

export const MORE_LINKS: {
  href: string;
  title: string;
  subtitle: string;
}[] = [
  { href: "/driver/maintenance", title: "Maintenance", subtitle: "Report issues & track repairs" },
  { href: "/driver/dvir", title: "DVIR", subtitle: "Pre / post-trip inspection" },
  { href: "/driver/expenses", title: "Expenses", subtitle: "Photo → AI categorize" },
  { href: "/driver/payroll", title: "Payroll", subtitle: "Settlements & approvals" },
  { href: "/driver/safety", title: "Safety", subtitle: "Weather & road alerts" },
  { href: "/driver/emergency", title: "Emergency", subtitle: "Dispatcher · Roadside · 911" },
  { href: "/driver/services", title: "Connected Services", subtitle: "Fuel, ELD, banks…" },
  { href: "/driver/eld", title: "ELD", subtitle: "Hours & duty status" },
  { href: "/driver/alph", title: "Alph", subtitle: "Voice & command assistant" },
  {
    href: "/alph/copilot/driver",
    title: "Driver Alph",
    subtitle: "Alph Copilot™ — trip reminders & one-command help",
  },
  { href: "/driver/settings", title: "Settings", subtitle: "Security, theme, PIN" },
  { href: "/network", title: "Network identity", subtitle: "Verified professional profile" },
  { href: "/exchange/parts", title: "Exchange · Parts", subtitle: "Find parts & services" },
  { href: "/platform/apps", title: "Platform apps", subtitle: "Transpo ecosystem" },
];

export const SERVICE_CATEGORY_LABELS: Record<ServiceCategory, string> = {
  fuel: "Fuel",
  eld: "ELD",
  gps: "GPS",
  telematics: "Telematics",
  insurance: "Insurance",
  maintenance: "Maintenance",
  banks: "Banks",
  payroll: "Payroll",
  accounting: "Accounting",
  factoring: "Factoring",
  load_boards: "Load Boards",
  tolls: "Tolls",
  parking: "Parking",
  oem: "OEM",
};

export const TRIP_STATUS_LABELS: Record<DriverTripStatus, string> = {
  available: "Available",
  accepted: "Accepted",
  heading_to_pickup: "Heading to Pickup",
  arrived_pickup: "Arrived Pickup",
  loaded: "Loaded",
  departed: "Departed",
  arrived_delivery: "Arrived Delivery",
  delivered: "Delivered",
  empty: "Empty",
  delayed: "Delayed",
  breakdown: "Breakdown",
  traffic_weather_delay: "Traffic / Weather Delay",
  detention_start: "Detention",
  detention_end: "Detention Ended",
};
