/** Transpo Exchange™ — B2B trucking commerce types. */

export type ExchangeCategory =
  | "equipment"
  | "parts"
  | "services"
  | "fleet"
  | "freight"
  | "business_services"
  | "warehouse"
  | "rentals"
  | "auctions"
  | "businesses"
  | "government"
  | "enterprise";

export const EXCHANGE_CATEGORY_LABELS: Record<ExchangeCategory, string> = {
  equipment: "Equipment",
  parts: "Parts",
  services: "Services",
  fleet: "Fleet Marketplace",
  freight: "Freight",
  business_services: "Business Services",
  warehouse: "Warehouse",
  rentals: "Rentals",
  auctions: "Auctions",
  businesses: "Businesses for Sale",
  government: "Government",
  enterprise: "Enterprise",
};

export type ListingCondition =
  | "new"
  | "like_new"
  | "used_excellent"
  | "used_good"
  | "used_fair"
  | "refurbished"
  | "for_parts"
  | "n_a";

export const LISTING_CONDITION_LABELS: Record<ListingCondition, string> = {
  new: "New",
  like_new: "Like new",
  used_excellent: "Used — excellent",
  used_good: "Used — good",
  used_fair: "Used — fair",
  refurbished: "Refurbished",
  for_parts: "For parts",
  n_a: "Service / N/A",
};

export type ListingStatus = "active" | "pending" | "sold" | "expired" | "draft";

export type OfferStatus =
  | "draft"
  | "sent"
  | "countered"
  | "accepted"
  | "declined"
  | "expired"
  | "withdrawn";

export type OrderStatus =
  | "quote_requested"
  | "quoted"
  | "po_issued"
  | "awaiting_payment"
  | "payment_demo_hold"
  | "escrow_demo"
  | "in_fulfillment"
  | "shipped"
  | "delivered"
  | "completed"
  | "return_requested"
  | "cancelled";

export type FinancingProductType =
  | "equipment"
  | "trailer"
  | "working_capital"
  | "fleet_loan"
  | "fuel_advance"
  | "business_loan";

export type FinancingStatus =
  | "draft"
  | "submitted"
  | "under_review"
  | "approved_demo"
  | "declined_demo"
  | "funded_demo";

export type PaymentMode = "demo_card" | "demo_ach" | "demo_wire" | "demo_escrow" | "financing";

export type FraudSeverity = "info" | "watch" | "high";

export type ExchangeSeller = {
  id: string;
  name: string;
  kind: "dealer" | "carrier" | "shop" | "broker" | "oem" | "government" | "enterprise";
  city: string;
  state: string;
  rating: number;
  reviewCount: number;
  verified: boolean;
  verificationLevel: "unverified" | "basic" | "verified" | "premium";
  networkMemberId?: string;
  trustScore?: number;
  responseHours: number;
  memberSince: string;
  bio: string;
  specialties: string[];
};

export type ExchangeListing = {
  id: string;
  tenantId: string;
  sellerId: string;
  category: ExchangeCategory;
  subcategory: string;
  title: string;
  summary: string;
  description: string;
  price: number;
  priceLabel?: string;
  compareAtPrice?: number;
  currency: "USD";
  condition: ListingCondition;
  year?: number;
  make?: string;
  model?: string;
  mileage?: number;
  hours?: number;
  locationCity: string;
  locationState: string;
  distanceMiles: number;
  shippingAvailable: boolean;
  shippingEstimate?: number;
  deliveryDays?: number;
  warrantyMonths?: number;
  availability: "in_stock" | "available" | "lead_time" | "made_to_order" | "auction";
  quantity?: number;
  tags: string[];
  featured: boolean;
  sponsored: boolean;
  boosted: boolean;
  status: ListingStatus;
  imageHue: number;
  createdAt: string;
  updatedAt: string;
  endsAt?: string;
  bidCount?: number;
  aiScore?: number;
  fraudFlags: FraudFlag[];
  specs: Record<string, string>;
  channel?: "government" | "enterprise" | "public";
};

export type FraudFlag = {
  id: string;
  code: string;
  label: string;
  severity: FraudSeverity;
  detail: string;
};

export type ExchangeOffer = {
  id: string;
  listingId: string;
  buyerName: string;
  sellerId: string;
  amount: number;
  quantity: number;
  message: string;
  status: OfferStatus;
  kind: "standard" | "bulk" | "fleet" | "volume" | "contract";
  aiSuggestedAmount?: number;
  history: OfferEvent[];
  createdAt: string;
  updatedAt: string;
};

export type OfferEvent = {
  at: string;
  actor: "buyer" | "seller" | "system" | "alph";
  action: string;
  amount?: number;
  note?: string;
};

export type ExchangeOrder = {
  id: string;
  listingId: string;
  sellerId: string;
  buyerName: string;
  title: string;
  amount: number;
  status: OrderStatus;
  paymentMode?: PaymentMode;
  paymentDemoLabel?: string;
  financingApplicationId?: string;
  trackingNumber?: string;
  shippingCarrier?: string;
  warrantyMonths?: number;
  returnEligible: boolean;
  invoiceNumber?: string;
  poNumber?: string;
  createdAt: string;
  updatedAt: string;
  events: { at: string; label: string }[];
};

export type FinancingApplication = {
  id: string;
  product: FinancingProductType;
  amount: number;
  termMonths: number;
  businessName: string;
  contactName: string;
  listingId?: string;
  status: FinancingStatus;
  createdAt: string;
  updatedAt: string;
  notes: string;
};

export type AdCampaign = {
  id: string;
  listingId?: string;
  sellerId: string;
  name: string;
  placement: "homepage" | "search" | "category" | "video" | "sponsored_business";
  status: "draft" | "live_demo" | "paused" | "ended";
  dailyBudget: number;
  impressions: number;
  clicks: number;
  spendDemo: number;
};

export type ExchangeMessage = {
  id: string;
  threadId: string;
  listingId?: string;
  from: string;
  to: string;
  body: string;
  at: string;
  read: boolean;
};

export type ExchangeReview = {
  id: string;
  sellerId: string;
  listingId?: string;
  author: string;
  rating: number;
  body: string;
  at: string;
};

export type SavedSearch = {
  id: string;
  name: string;
  query: string;
  category?: ExchangeCategory;
  maxPrice?: number;
  maxDistance?: number;
  verifiedOnly?: boolean;
  createdAt: string;
};

export type AuditEntry = {
  id: string;
  at: string;
  actor: string;
  action: string;
  summary: string;
  entityType?: string;
  entityId?: string;
};

export type ListingFilters = {
  category?: ExchangeCategory;
  query?: string;
  minPrice?: number;
  maxPrice?: number;
  condition?: ListingCondition;
  verifiedOnly?: boolean;
  maxDistance?: number;
  state?: string;
  featuredOnly?: boolean;
  channel?: "government" | "enterprise" | "public";
  subcategory?: string;
};

export type ExchangeInsight = {
  id: string;
  title: string;
  summary: string;
  metric: string;
  deltaLabel: string;
  tone: "info" | "success" | "warning";
  series: number[];
};

export const FINANCING_PRODUCT_LABELS: Record<FinancingProductType, string> = {
  equipment: "Equipment financing",
  trailer: "Trailer financing",
  working_capital: "Working capital",
  fleet_loan: "Fleet loan",
  fuel_advance: "Fuel advance",
  business_loan: "Business loan",
};

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  quote_requested: "Quote requested",
  quoted: "Quoted",
  po_issued: "PO issued",
  awaiting_payment: "Awaiting payment",
  payment_demo_hold: "Payment hold (demo)",
  escrow_demo: "Escrow hold (demo)",
  in_fulfillment: "In fulfillment",
  shipped: "Shipped",
  delivered: "Delivered",
  completed: "Completed",
  return_requested: "Return requested",
  cancelled: "Cancelled",
};

export const OFFER_STATUS_LABELS: Record<OfferStatus, string> = {
  draft: "Draft",
  sent: "Sent",
  countered: "Countered",
  accepted: "Accepted",
  declined: "Declined",
  expired: "Expired",
  withdrawn: "Withdrawn",
};

export const PAYMENT_DEMO_DISCLAIMER =
  "Demo payment flow only — no live card, ACH, or escrow processors. Labels show simulated states for architecture review.";

export const ESCROW_DEMO_DISCLAIMER =
  "Escrow-ready checkout UI. Funds are not held; this is a simulated Transpo Exchange™ settlement path.";
