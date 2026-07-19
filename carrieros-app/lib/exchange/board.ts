import { seedInsights } from "@/lib/exchange/seed";
import {
  listAds,
  listAuditLog,
  listCompareListings,
  listFavorites,
  listFinancing,
  listListings,
  listMessages,
  listOffers,
  listOrders,
  listReviews,
  listSavedSearches,
  listSellers,
  getSeller,
} from "@/lib/exchange/store";
import type {
  ExchangeCategory,
  ExchangeInsight,
  ExchangeListing,
  ExchangeOrder,
  ExchangeSeller,
} from "@/lib/exchange/types";
import { EXCHANGE_CATEGORY_LABELS } from "@/lib/exchange/types";

export type ExchangeKpi = {
  label: string;
  value: string;
  hint: string;
  tone: "info" | "success" | "warning";
};

export type CategoryTile = {
  category: ExchangeCategory;
  label: string;
  count: number;
  href: string;
};

export type ExchangeDashboard = {
  kpis: ExchangeKpi[];
  categories: CategoryTile[];
  aiPicks: ExchangeListing[];
  trending: ExchangeListing[];
  featured: ExchangeListing[];
  saved: ExchangeListing[];
  openOrders: ExchangeOrder[];
  sellerSnippet: {
    seller: ExchangeSeller;
    activeListings: number;
    openOrders: number;
    revenueDemo: number;
    rating: number;
  } | null;
  recentAudit: ReturnType<typeof listAuditLog>;
};

const CATEGORY_HREF: Record<ExchangeCategory, string> = {
  equipment: "/exchange/equipment",
  parts: "/exchange/parts",
  services: "/exchange/services",
  fleet: "/exchange/fleet",
  freight: "/exchange/freight",
  business_services: "/exchange/business-services",
  warehouse: "/exchange/warehouse",
  rentals: "/exchange/rentals",
  auctions: "/exchange/auctions",
  businesses: "/exchange/businesses",
  government: "/exchange/government",
  enterprise: "/exchange/enterprise",
};

export function getExchangeDashboard(_tenantId?: string): ExchangeDashboard {
  const all = listListings();
  const orders = listOrders();
  const openOrders = orders.filter(
    (o) => !["completed", "cancelled", "delivered"].includes(o.status),
  );
  const favorites = listFavorites();
  const sellers = listSellers();
  const primarySeller = sellers.find((s) => s.id === "sel-midwest-truck") ?? sellers[0];

  const categories = (Object.keys(EXCHANGE_CATEGORY_LABELS) as ExchangeCategory[]).map(
    (category) => ({
      category,
      label: EXCHANGE_CATEGORY_LABELS[category],
      count: listListings({ category }).length,
      href: CATEGORY_HREF[category],
    }),
  );

  const aiPicks = [...all]
    .filter((l) => (l.aiScore ?? 0) >= 90)
    .sort((a, b) => (b.aiScore ?? 0) - (a.aiScore ?? 0))
    .slice(0, 6);

  const trending = [...all]
    .filter((l) => l.featured || l.boosted || l.sponsored)
    .slice(0, 8);

  const featured = all.filter((l) => l.featured).slice(0, 6);

  const sellerListings = primarySeller
    ? all.filter((l) => l.sellerId === primarySeller.id)
    : [];
  const sellerOrders = primarySeller
    ? orders.filter((o) => o.sellerId === primarySeller.id)
    : [];

  return {
    kpis: [
      {
        label: "Active listings",
        value: String(all.filter((l) => l.status === "active").length),
        hint: "Across all catalogs",
        tone: "info",
      },
      {
        label: "Open orders",
        value: String(openOrders.length),
        hint: "Quotes, POs, demo escrow",
        tone: openOrders.length ? "warning" : "success",
      },
      {
        label: "Saved",
        value: String(favorites.length),
        hint: "Buyer favorites",
        tone: "info",
      },
      {
        label: "Verified sellers",
        value: String(sellers.filter((s) => s.verified).length),
        hint: "Network / Trust linked",
        tone: "success",
      },
    ],
    categories,
    aiPicks,
    trending,
    featured,
    saved: favorites.slice(0, 6),
    openOrders: openOrders.slice(0, 5),
    sellerSnippet: primarySeller
      ? {
          seller: primarySeller,
          activeListings: sellerListings.length,
          openOrders: sellerOrders.filter((o) => o.status !== "completed").length,
          revenueDemo: sellerOrders.reduce((sum, o) => sum + o.amount, 0),
          rating: primarySeller.rating,
        }
      : null,
    recentAudit: listAuditLog().slice(0, 6),
  };
}

export function getSellerHubData(sellerId = "sel-midwest-truck") {
  const seller = getSeller(sellerId);
  const inventory = listListings().filter((l) => l.sellerId === sellerId);
  const sellerOrders = listOrders().filter((o) => o.sellerId === sellerId);
  const sellerAds = listAds().filter((a) => a.sellerId === sellerId);
  const sellerReviews = listReviews(sellerId);
  const sellerOffers = listOffers().filter((o) => o.sellerId === sellerId);
  const threads = listMessages().filter((m) => {
    const listing = inventory.find((l) => l.id === m.listingId);
    return Boolean(listing) || m.from === seller?.name || m.to === seller?.name;
  });

  return {
    seller,
    inventory,
    orders: sellerOrders,
    ads: sellerAds,
    reviews: sellerReviews,
    offers: sellerOffers,
    messages: threads,
    revenueDemo: sellerOrders.reduce((s, o) => s + o.amount, 0),
    leads: sellerOffers.filter((o) => ["sent", "countered"].includes(o.status)).length,
  };
}

export function getBuyerHubData() {
  return {
    savedSearches: listSavedSearches(),
    favorites: listFavorites(),
    offers: listOffers(),
    orders: listOrders(),
    financing: listFinancing(),
    messages: listMessages(),
    compare: listCompareListings(),
    audit: listAuditLog().slice(0, 12),
  };
}

export type SellerHubData = ReturnType<typeof getSellerHubData>;
export type BuyerHubData = ReturnType<typeof getBuyerHubData>;

export function getInsights(): ExchangeInsight[] {
  return structuredClone(seedInsights);
}

export function formatMoney(amount: number, priceLabel?: string): string {
  if (priceLabel) return priceLabel;
  if (amount === 0) return "Contact / RFQ";
  if (amount < 20 && amount % 1 !== 0) return `${amount}%`;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: amount >= 1000 ? 0 : 2,
  }).format(amount);
}

export function sellerLabel(sellerId: string): string {
  return getSeller(sellerId)?.name ?? "Seller";
}
