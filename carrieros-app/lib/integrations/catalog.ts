import type { IntegrationCatalogItem, IntegrationCategory } from "./types";

/**
 * Static provider catalog for the Integration Center.
 * Runtime connection state lives in the store — not here.
 */
export const INTEGRATION_CATALOG: IntegrationCatalogItem[] = [
  {
    id: "google_maps",
    name: "Google Maps",
    description: "Geocoding, routing, and live map tiles for load tracking.",
    category: "maps",
    docsUrl: "https://developers.google.com/maps/documentation",
    authMode: "api_key",
    initials: "GM",
    relatedStub: "lib/tracking/gps-provider.ts",
  },
  {
    id: "mapbox",
    name: "Mapbox",
    description: "High-performance maps, traffic layers, and turn-by-turn routes.",
    category: "maps",
    docsUrl: "https://docs.mapbox.com/",
    authMode: "api_key",
    initials: "MB",
    relatedStub: "lib/tracking/map-types.ts",
  },
  {
    id: "motive",
    name: "Motive",
    description: "ELD hours, GPS, and camera events from Motive vehicles.",
    category: "eld_telematics",
    docsUrl: "https://developer.gomotive.com/",
    authMode: "oauth",
    initials: "MO",
    relatedStub: "lib/fleet/telematics-provider.ts",
  },
  {
    id: "samsara",
    name: "Samsara",
    description: "Fleet GPS, HOS, fault codes, and dashcam streams.",
    category: "eld_telematics",
    docsUrl: "https://developers.samsara.com/",
    authMode: "api_key",
    initials: "SA",
    relatedStub: "lib/fleet/telematics-provider.ts",
  },
  {
    id: "geotab",
    name: "Geotab",
    description: "Telematics, engine diagnostics, and maintenance signals.",
    category: "eld_telematics",
    docsUrl: "https://developers.geotab.com/",
    authMode: "oauth",
    initials: "GT",
    relatedStub: "lib/fleet/maintenance-integrations.ts",
  },
  {
    id: "omnitracs",
    name: "Omnitracs",
    description: "Enterprise ELD and fleet operations — coming soon.",
    category: "eld_telematics",
    docsUrl: "https://www.omnitracs.com/",
    authMode: "oauth",
    initials: "OM",
    comingSoon: true,
    relatedStub: "lib/fleet/telematics-provider.ts",
  },
  {
    id: "quickbooks",
    name: "QuickBooks Online",
    description: "Sync invoices, expenses, and payments with QuickBooks.",
    category: "accounting",
    docsUrl: "https://developer.intuit.com/",
    authMode: "oauth",
    initials: "QB",
    relatedStub: "lib/finance/accounting-integrations.ts",
  },
  {
    id: "xero",
    name: "Xero",
    description: "Two-way sync for AR, bills, and bank reconciliation.",
    category: "accounting",
    docsUrl: "https://developer.xero.com/",
    authMode: "oauth",
    initials: "XE",
    relatedStub: "lib/finance/accounting-integrations.ts",
  },
  {
    id: "twilio",
    name: "Twilio",
    description: "SMS and voice for driver check calls and broker alerts.",
    category: "communication",
    docsUrl: "https://www.twilio.com/docs",
    authMode: "api_key",
    initials: "TW",
  },
  {
    id: "sendgrid",
    name: "SendGrid",
    description: "Transactional email for rate cons, invoices, and POD requests.",
    category: "communication",
    docsUrl: "https://docs.sendgrid.com/",
    authMode: "api_key",
    initials: "SG",
  },
  {
    id: "stripe",
    name: "Stripe",
    description: "Collect carrier and broker payments online.",
    category: "payments",
    docsUrl: "https://stripe.com/docs",
    authMode: "api_key",
    initials: "ST",
    relatedStub: "lib/finance/accounting-integrations.ts",
  },
  {
    id: "google_drive",
    name: "Google Drive",
    description: "Store rate cons, PODs, and compliance packets in Drive.",
    category: "storage",
    docsUrl: "https://developers.google.com/drive",
    authMode: "oauth",
    initials: "GD",
  },
  {
    id: "dropbox",
    name: "Dropbox",
    description: "Shared folders for documents and broker packets.",
    category: "storage",
    docsUrl: "https://www.dropbox.com/developers",
    authMode: "oauth",
    initials: "DB",
  },
  {
    id: "onedrive",
    name: "OneDrive",
    description: "Microsoft 365 document storage for your team.",
    category: "storage",
    docsUrl: "https://learn.microsoft.com/en-us/onedrive/",
    authMode: "oauth",
    initials: "OD",
  },
];

export const INTEGRATION_CATEGORY_ORDER: Exclude<
  IntegrationCategory,
  "marketplace"
>[] = [
  "maps",
  "eld_telematics",
  "accounting",
  "communication",
  "payments",
  "storage",
];

export function getCatalogItem(
  id: string,
): IntegrationCatalogItem | undefined {
  return INTEGRATION_CATALOG.find((item) => item.id === id);
}

export function listCatalogByCategory(
  category: Exclude<IntegrationCategory, "marketplace">,
): IntegrationCatalogItem[] {
  return INTEGRATION_CATALOG.filter((item) => item.category === category);
}
