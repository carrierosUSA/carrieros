import {
  EXCHANGE_TENANT_ID,
  seedAds,
  seedAudit,
  seedCompareIds,
  seedFavorites,
  seedFinancing,
  seedListings,
  seedMessages,
  seedOffers,
  seedOrders,
  seedReviews,
  seedSavedSearches,
  seedSellers,
} from "@/lib/exchange/seed";
import type {
  AdCampaign,
  AuditEntry,
  ExchangeListing,
  ExchangeMessage,
  ExchangeOffer,
  ExchangeOrder,
  ExchangeReview,
  ExchangeSeller,
  FinancingApplication,
  FinancingProductType,
  ListingFilters,
  OfferStatus,
  OrderStatus,
  PaymentMode,
  SavedSearch,
} from "@/lib/exchange/types";

const listings: ExchangeListing[] = structuredClone(seedListings);
const sellers: ExchangeSeller[] = structuredClone(seedSellers);
const offers: ExchangeOffer[] = structuredClone(seedOffers);
const orders: ExchangeOrder[] = structuredClone(seedOrders);
const financing: FinancingApplication[] = structuredClone(seedFinancing);
const ads: AdCampaign[] = structuredClone(seedAds);
const messages: ExchangeMessage[] = structuredClone(seedMessages);
const reviews: ExchangeReview[] = structuredClone(seedReviews);
const favorites = new Set<string>(seedFavorites);
const compareIds = new Set<string>(seedCompareIds);
const savedSearches: SavedSearch[] = structuredClone(seedSavedSearches);
const auditLog: AuditEntry[] = structuredClone(seedAudit);

function nowIso() {
  return new Date().toISOString();
}

function pushAudit(
  action: string,
  summary: string,
  entityType?: string,
  entityId?: string,
  actor = "Jordan Reyes",
) {
  auditLog.unshift({
    id: `aud-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    at: nowIso(),
    actor,
    action,
    summary,
    entityType,
    entityId,
  });
}

export function getExchangeTenantId() {
  return EXCHANGE_TENANT_ID;
}

export function listSellers(): ExchangeSeller[] {
  return [...sellers];
}

export function getSeller(id: string): ExchangeSeller | undefined {
  return sellers.find((s) => s.id === id);
}

export function listListings(filters: ListingFilters = {}): ExchangeListing[] {
  let rows = listings.filter((l) => l.status !== "draft");

  if (filters.category) {
    rows = rows.filter((l) => l.category === filters.category);
  }
  if (filters.channel) {
    rows = rows.filter(
      (l) => l.channel === filters.channel || l.category === filters.channel,
    );
  }
  if (filters.subcategory) {
    rows = rows.filter((l) => l.subcategory === filters.subcategory);
  }
  if (filters.minPrice != null) {
    rows = rows.filter((l) => l.price >= filters.minPrice!);
  }
  if (filters.maxPrice != null) {
    rows = rows.filter((l) => l.price > 0 && l.price <= filters.maxPrice!);
  }
  if (filters.condition) {
    rows = rows.filter((l) => l.condition === filters.condition);
  }
  if (filters.maxDistance != null) {
    rows = rows.filter((l) => l.distanceMiles <= filters.maxDistance!);
  }
  if (filters.state) {
    const st = filters.state.toUpperCase();
    rows = rows.filter((l) => l.locationState.toUpperCase() === st);
  }
  if (filters.featuredOnly) {
    rows = rows.filter((l) => l.featured || l.sponsored);
  }
  if (filters.verifiedOnly) {
    rows = rows.filter((l) => {
      const seller = getSeller(l.sellerId);
      return seller?.verified;
    });
  }
  if (filters.query?.trim()) {
    const q = filters.query.trim().toLowerCase();
    rows = rows.filter((l) => {
      const hay = [
        l.title,
        l.summary,
        l.description,
        l.make,
        l.model,
        l.subcategory,
        ...l.tags,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }

  return rows.sort((a, b) => {
    const scoreA = (a.featured ? 2 : 0) + (a.sponsored ? 1 : 0) + (a.aiScore ?? 0) / 100;
    const scoreB = (b.featured ? 2 : 0) + (b.sponsored ? 1 : 0) + (b.aiScore ?? 0) / 100;
    return scoreB - scoreA || b.createdAt.localeCompare(a.createdAt);
  });
}

export function getListing(id: string): ExchangeListing | undefined {
  return listings.find((l) => l.id === id);
}

export function listListingsBySeller(sellerId: string): ExchangeListing[] {
  return listings.filter((l) => l.sellerId === sellerId);
}

export type CreateListingInput = {
  sellerId: string;
  category: ExchangeListing["category"];
  subcategory: string;
  title: string;
  summary: string;
  description: string;
  price: number;
  condition: ExchangeListing["condition"];
  locationCity: string;
  locationState: string;
  tags?: string[];
};

export function createListing(input: CreateListingInput): ExchangeListing {
  const listing: ExchangeListing = {
    id: `lst-${Date.now().toString(36)}`,
    tenantId: EXCHANGE_TENANT_ID,
    sellerId: input.sellerId,
    category: input.category,
    subcategory: input.subcategory,
    title: input.title,
    summary: input.summary,
    description: input.description,
    price: input.price,
    currency: "USD",
    condition: input.condition,
    locationCity: input.locationCity,
    locationState: input.locationState,
    distanceMiles: 0,
    shippingAvailable: true,
    availability: "available",
    tags: input.tags ?? [],
    featured: false,
    sponsored: false,
    boosted: false,
    status: "active",
    imageHue: Math.floor(Math.random() * 360),
    createdAt: nowIso(),
    updatedAt: nowIso(),
    fraudFlags: [],
    specs: {},
  };
  listings.unshift(listing);
  pushAudit("listing_created", `Listing created: ${listing.title}`, "listing", listing.id);
  return listing;
}

export function toggleFavorite(listingId: string): boolean {
  if (favorites.has(listingId)) {
    favorites.delete(listingId);
    pushAudit("favorite_removed", `Removed favorite ${listingId}`, "listing", listingId);
    return false;
  }
  favorites.add(listingId);
  pushAudit("favorite_added", `Saved favorite ${listingId}`, "listing", listingId);
  return true;
}

export function listFavorites(): ExchangeListing[] {
  return [...favorites]
    .map((id) => getListing(id))
    .filter((l): l is ExchangeListing => Boolean(l));
}

export function isFavorite(listingId: string): boolean {
  return favorites.has(listingId);
}

export function toggleCompare(listingId: string): string[] {
  if (compareIds.has(listingId)) {
    compareIds.delete(listingId);
  } else if (compareIds.size < 4) {
    compareIds.add(listingId);
  }
  return [...compareIds];
}

export function listCompareIds(): string[] {
  return [...compareIds];
}

export function listCompareListings(): ExchangeListing[] {
  return listCompareIds()
    .map((id) => getListing(id))
    .filter((l): l is ExchangeListing => Boolean(l));
}

export function clearCompare() {
  compareIds.clear();
}

export function listOffers(listingId?: string): ExchangeOffer[] {
  const rows = listingId ? offers.filter((o) => o.listingId === listingId) : [...offers];
  return rows.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function getOffer(id: string): ExchangeOffer | undefined {
  return offers.find((o) => o.id === id);
}

export function createOffer(input: {
  listingId: string;
  amount: number;
  quantity?: number;
  message?: string;
  kind?: ExchangeOffer["kind"];
}): ExchangeOffer | { error: string } {
  const listing = getListing(input.listingId);
  if (!listing) return { error: "Listing not found" };
  const seller = getSeller(listing.sellerId);
  const aiSuggested = Math.round(listing.price * 0.96);
  const offer: ExchangeOffer = {
    id: `off-${Date.now().toString(36)}`,
    listingId: listing.id,
    buyerName: "Jordan Reyes",
    sellerId: listing.sellerId,
    amount: input.amount,
    quantity: input.quantity ?? 1,
    message: input.message ?? "",
    status: "sent",
    kind: input.kind ?? "standard",
    aiSuggestedAmount: aiSuggested,
    history: [
      {
        at: nowIso(),
        actor: "buyer",
        action: "offer_sent",
        amount: input.amount,
        note: input.message,
      },
      {
        at: nowIso(),
        actor: "alph",
        action: "ai_suggestion",
        amount: aiSuggested,
        note: `Alph suggests ~$${aiSuggested.toLocaleString()} based on list price`,
      },
    ],
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };
  offers.unshift(offer);
  pushAudit(
    "offer_sent",
    `Offer $${input.amount} on ${listing.title}${seller && !seller.verified ? " (seller unverified)" : ""}`,
    "offer",
    offer.id,
  );
  return offer;
}

export function counterOffer(
  offerId: string,
  amount: number,
  actor: "buyer" | "seller",
  note?: string,
): ExchangeOffer | { error: string } {
  const offer = getOffer(offerId);
  if (!offer) return { error: "Offer not found" };
  if (!["sent", "countered"].includes(offer.status)) {
    return { error: "Offer is not open for counter" };
  }
  offer.amount = amount;
  offer.status = "countered";
  offer.updatedAt = nowIso();
  offer.history.push({
    at: nowIso(),
    actor,
    action: "countered",
    amount,
    note,
  });
  pushAudit("offer_countered", `Counter $${amount} on ${offerId}`, "offer", offerId, actor);
  return { ...offer };
}

export function resolveOffer(
  offerId: string,
  status: Extract<OfferStatus, "accepted" | "declined" | "withdrawn">,
): ExchangeOffer | { error: string } {
  const offer = getOffer(offerId);
  if (!offer) return { error: "Offer not found" };
  offer.status = status;
  offer.updatedAt = nowIso();
  offer.history.push({
    at: nowIso(),
    actor: status === "withdrawn" ? "buyer" : "seller",
    action: status,
    amount: offer.amount,
  });
  pushAudit(`offer_${status}`, `Offer ${status}: ${offerId}`, "offer", offerId);
  if (status === "accepted") {
    createOrderFromOffer(offer);
  }
  return { ...offer };
}

function createOrderFromOffer(offer: ExchangeOffer) {
  const listing = getListing(offer.listingId);
  if (!listing) return;
  const seller = getSeller(listing.sellerId);
  const useEscrow = Boolean(seller?.verified) && offer.amount >= 10000;
  const order: ExchangeOrder = {
    id: `ord-${Date.now().toString(36)}`,
    listingId: listing.id,
    sellerId: listing.sellerId,
    buyerName: offer.buyerName,
    title: listing.title,
    amount: offer.amount * offer.quantity,
    status: useEscrow ? "escrow_demo" : "awaiting_payment",
    paymentMode: useEscrow ? "demo_escrow" : "demo_card",
    paymentDemoLabel: useEscrow
      ? "Escrow hold (demo) — verified seller"
      : "Awaiting demo payment",
    warrantyMonths: listing.warrantyMonths,
    returnEligible: listing.category === "parts",
    poNumber: `PO-${Math.floor(4000 + Math.random() * 999)}`,
    createdAt: nowIso(),
    updatedAt: nowIso(),
    events: [
      { at: nowIso(), label: "Offer accepted" },
      {
        at: nowIso(),
        label: useEscrow
          ? "Escrow demo hold created (architecture-ready)"
          : "Awaiting demo payment",
      },
    ],
  };
  orders.unshift(order);
  pushAudit(
    useEscrow ? "escrow_demo_created" : "order_created",
    `Order ${order.id} from accepted offer`,
    "order",
    order.id,
    "system",
  );
}

export function listOrders(): ExchangeOrder[] {
  return [...orders].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function getOrder(id: string): ExchangeOrder | undefined {
  return orders.find((o) => o.id === id);
}

export function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  label?: string,
): ExchangeOrder | { error: string } {
  const order = getOrder(orderId);
  if (!order) return { error: "Order not found" };
  order.status = status;
  order.updatedAt = nowIso();
  order.events.push({ at: nowIso(), label: label ?? status });
  pushAudit("order_status", `Order ${orderId} → ${status}`, "order", orderId, "system");
  return { ...order };
}

export function simulateDemoPayment(
  orderId: string,
  mode: PaymentMode,
): ExchangeOrder | { error: string } {
  const order = getOrder(orderId);
  if (!order) return { error: "Order not found" };
  const listing = getListing(order.listingId);
  const seller = listing ? getSeller(listing.sellerId) : undefined;

  if (mode === "demo_escrow" && seller && !seller.verified) {
    return {
      error: "Escrow demo requires a verified seller. Complete Trust verification first.",
    };
  }

  order.paymentMode = mode;
  order.paymentDemoLabel =
    mode === "demo_escrow"
      ? "Escrow hold (demo) — not a live escrow provider"
      : mode === "financing"
        ? "Linked to financing application (demo)"
        : `Demo ${mode.replace("demo_", "").toUpperCase()} — not charged`;
  order.status = mode === "demo_escrow" ? "escrow_demo" : "payment_demo_hold";
  order.updatedAt = nowIso();
  order.events.push({
    at: nowIso(),
    label: `Demo payment path: ${order.paymentDemoLabel}`,
  });
  pushAudit(
    "payment_demo",
    `Demo payment ${mode} on ${orderId} — no live processor`,
    "order",
    orderId,
    "system",
  );
  return { ...order };
}

export function listFinancing(): FinancingApplication[] {
  return [...financing].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function submitFinancingApplication(input: {
  product: FinancingProductType;
  amount: number;
  termMonths: number;
  businessName: string;
  contactName: string;
  listingId?: string;
}): FinancingApplication {
  const app: FinancingApplication = {
    id: `fin-${Date.now().toString(36)}`,
    product: input.product,
    amount: input.amount,
    termMonths: input.termMonths,
    businessName: input.businessName,
    contactName: input.contactName,
    listingId: input.listingId,
    status: "submitted",
    createdAt: nowIso(),
    updatedAt: nowIso(),
    notes: "Submitted to demo underwriting pipeline — not a live credit decision.",
  };
  financing.unshift(app);
  pushAudit(
    "financing_submitted",
    `Financing application ${app.id} submitted (demo)`,
    "financing",
    app.id,
  );
  // Advance demo pipeline shortly in-state
  app.status = "under_review";
  app.updatedAt = nowIso();
  return { ...app };
}

export function listAds(): AdCampaign[] {
  return [...ads];
}

export function boostListing(listingId: string): AdCampaign | { error: string } {
  const listing = getListing(listingId);
  if (!listing) return { error: "Listing not found" };
  listing.boosted = true;
  listing.sponsored = true;
  listing.updatedAt = nowIso();
  const campaign: AdCampaign = {
    id: `ad-${Date.now().toString(36)}`,
    listingId,
    sellerId: listing.sellerId,
    name: `Boost: ${listing.title}`,
    placement: "search",
    status: "live_demo",
    dailyBudget: 50,
    impressions: 0,
    clicks: 0,
    spendDemo: 0,
  };
  ads.unshift(campaign);
  pushAudit("ad_boost", `Listing boosted (demo ad slot): ${listingId}`, "ad", campaign.id);
  return campaign;
}

export function listMessages(threadId?: string): ExchangeMessage[] {
  const rows = threadId ? messages.filter((m) => m.threadId === threadId) : [...messages];
  return rows.sort((a, b) => b.at.localeCompare(a.at));
}

export function sendMessage(input: {
  threadId: string;
  listingId?: string;
  to: string;
  body: string;
}): ExchangeMessage {
  const msg: ExchangeMessage = {
    id: `msg-${Date.now().toString(36)}`,
    threadId: input.threadId,
    listingId: input.listingId,
    from: "Jordan Reyes",
    to: input.to,
    body: input.body,
    at: nowIso(),
    read: true,
  };
  messages.unshift(msg);
  return msg;
}

export function listReviews(sellerId?: string): ExchangeReview[] {
  return sellerId ? reviews.filter((r) => r.sellerId === sellerId) : [...reviews];
}

export function listSavedSearches(): SavedSearch[] {
  return [...savedSearches];
}

export function listAuditLog(): AuditEntry[] {
  return [...auditLog];
}

export function searchForAi(query: string): ExchangeListing[] {
  const q = query.toLowerCase();
  if (q.includes("reefer") && (q.includes("45") || q.includes("under"))) {
    return listListings({ category: "equipment", maxPrice: 45000, query: "reefer" });
  }
  if (q.includes("cascadia") && (q.includes("300") || q.includes("mile"))) {
    return listListings({ query: "cascadia", maxDistance: 300 });
  }
  if (q.includes("fuel") && q.includes("card")) {
    return listListings({ category: "business_services", subcategory: "fuel_cards" });
  }
  if (q.includes("turbo")) {
    return listListings({ query: "turbo oem" });
  }
  if (q.includes("tire") || q.includes("emergency")) {
    return listListings({ query: "emergency tire" });
  }
  if (q.includes("insurance")) {
    return listListings({ category: "business_services", subcategory: "insurance" });
  }
  if (q.includes("maintenance") || q.includes("pm")) {
    return listListings({ category: "services", query: "maintenance" });
  }
  return listListings({ query });
}
