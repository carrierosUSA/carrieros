import { listBrokersByTenant } from "@/lib/data/brokers";
import {
  formatCompanyCityState,
  listCompaniesByTenant,
} from "@/lib/data/companies";
import { listCustomersByTenant } from "@/lib/data/customers";
import { listCarrierDocuments } from "@/lib/data/carrier-document-store";
import { loadDocumentStore, invoiceDraftStore } from "@/lib/data/document-store";
import { driverStore } from "@/lib/data/driver-store";
import { trailerStore, truckStore } from "@/lib/data/fleet-store";
import { listInvoices } from "@/lib/data/finance-store";
import {
  candidateStore,
  companyStore as hiringCompanyStore,
  jobStore,
  listByTenant,
} from "@/lib/data/workforce-store";
import { listWorkflows } from "@/lib/data/workflow-store";
import { getCustomerById } from "@/lib/data/customers";
import { getBrokerById } from "@/lib/data/brokers";
import { dispatchBoardSeedLoads } from "@/lib/dispatch/demo-loads";
import { loads as seedLoads } from "@/lib/data/loads";
import type { CommandPaletteResult } from "@/lib/command-palette/types";
import {
  COMPANY_TYPE_LABELS,
  DOCUMENT_CATEGORY_LABELS,
  LOAD_STATUS_LABELS,
  TRAILER_TYPE_LABELS,
} from "@/lib/types";
import { PROFESSIONAL_ROLE_LABELS } from "@/lib/types/workforce";
import { candidateFullName } from "@/lib/workforce/board";
import { getActionLabel, getTriggerLabel } from "@/lib/workflows/catalog";
import { ADVANCED_CATEGORIES } from "@/lib/navigation/daily-use";
import { PLATFORM_SEARCH_DESTINATIONS } from "@/lib/platform/catalog";

const ALL_LOADS = [...seedLoads, ...dispatchBoardSeedLoads];

function normalizeQuery(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/^load\s*#?\s*/i, "")
    .replace(/^truck\s*#?\s*/i, "")
    .replace(/^trailer\s*#?\s*/i, "")
    .replace(/^ld-?\s*/i, "")
    .replace(/\s+/g, " ");
}

function matchesQuery(haystack: string, query: string): boolean {
  const normalizedHaystack = haystack.toLowerCase();
  const tokens = query.split(" ").filter(Boolean);

  if (tokens.length === 0) {
    return true;
  }

  return tokens.every((token) => normalizedHaystack.includes(token));
}

function loadLane(load: (typeof ALL_LOADS)[number]): string {
  return `${load.origin.city}, ${load.origin.state} → ${load.destination.city}, ${load.destination.state}`;
}

export function searchCommandPalette(
  tenantId: string,
  rawQuery: string,
  limit = 24,
): CommandPaletteResult[] {
  const query = normalizeQuery(rawQuery);

  if (!query) {
    return [];
  }

  const results: CommandPaletteResult[] = [];

  for (const load of ALL_LOADS) {
    if (load.tenantId !== tenantId) {
      continue;
    }

    const brokerName = load.brokerId ? getBrokerById(load.brokerId)?.name : undefined;
    const customerName = getCustomerById(load.customerId)?.name;
    const keywords = [
      load.reference,
      load.reference.replace(/^LD-/i, ""),
      load.id,
      brokerName ?? "",
      customerName ?? "",
      load.origin.city,
      load.destination.city,
      LOAD_STATUS_LABELS[load.status],
    ].join(" ");

    if (!matchesQuery(keywords, query)) {
      continue;
    }

    results.push({
      id: `load-${load.id}`,
      category: "loads",
      title: `Load ${load.reference.replace(/^LD-/i, "")}`,
      subtitle: loadLane(load),
      href: `/loads/${load.id}`,
      keywords: keywords.split(" ").filter(Boolean),
    });
  }

  for (const driver of driverStore) {
    if (driver.tenantId !== tenantId) {
      continue;
    }

    const keywords = [driver.name, driver.phone, driver.email, driver.id].join(" ");

    if (!matchesQuery(keywords, query)) {
      continue;
    }

    results.push({
      id: `driver-${driver.id}`,
      category: "drivers",
      title: driver.name,
      subtitle: driver.phone,
      href: `/drivers/${driver.id}`,
      keywords: keywords.split(" ").filter(Boolean),
    });
  }

  for (const company of listCompaniesByTenant(tenantId)) {
    const contactNames = company.contacts.map((contact) => contact.name).join(" ");
    const keywords = [
      company.name,
      company.mcNumber ?? "",
      company.dotNumber ?? "",
      company.scac ?? "",
      company.phone ?? "",
      company.email ?? "",
      formatCompanyCityState(company.address),
      company.address?.city ?? "",
      company.address?.state ?? "",
      COMPANY_TYPE_LABELS[company.type],
      contactNames,
      company.id,
    ].join(" ");

    if (!matchesQuery(keywords, query)) {
      continue;
    }

    results.push({
      id: `company-${company.id}`,
      category: "companies",
      title: company.name,
      subtitle:
        COMPANY_TYPE_LABELS[company.type] +
        (company.mcNumber ? ` · ${company.mcNumber}` : ""),
      href: `/companies/${company.id}`,
      keywords: keywords.split(" ").filter(Boolean),
    });
  }

  for (const broker of listBrokersByTenant(tenantId)) {
    const keywords = [
      broker.name,
      broker.mcNumber ?? "",
      broker.dotNumber ?? "",
      broker.phone ?? "",
      broker.email ?? "",
      broker.id,
    ].join(" ");

    if (!matchesQuery(keywords, query)) {
      continue;
    }

    results.push({
      id: `broker-${broker.id}`,
      category: "brokers",
      title: broker.name,
      subtitle: broker.mcNumber ?? broker.homeBase,
      href: `/brokers/${broker.id}`,
      keywords: keywords.split(" ").filter(Boolean),
    });
  }

  for (const customer of listCustomersByTenant(tenantId)) {
    const keywords = [customer.name, customer.type, customer.id].join(" ");

    if (!matchesQuery(keywords, query)) {
      continue;
    }

    results.push({
      id: `customer-${customer.id}`,
      category: "customers",
      title: customer.name,
      subtitle: customer.type.replace("_", " "),
      href: `/loads?q=${encodeURIComponent(customer.name)}`,
      keywords: keywords.split(" ").filter(Boolean),
    });
  }

  for (const invoice of listInvoices(tenantId)) {
    const keywords = [
      invoice.invoiceNumber,
      invoice.loadId ?? "",
      invoice.loadReference ?? "",
      invoice.brokerName,
      invoice.id,
      "invoice",
      "finance",
    ].join(" ");

    if (!matchesQuery(keywords, query)) {
      continue;
    }

    results.push({
      id: `finance-invoice-${invoice.id}`,
      category: "invoices",
      title: invoice.invoiceNumber,
      subtitle: `${invoice.brokerName} · ${invoice.status}`,
      href: `/finance?tab=invoices`,
      keywords: keywords.split(" ").filter(Boolean),
    });
  }

  for (const invoice of invoiceDraftStore) {
    if (invoice.tenantId !== tenantId) {
      continue;
    }

    const keywords = [invoice.invoiceNumber, invoice.loadId, invoice.billTo, invoice.id].join(
      " ",
    );

    if (!matchesQuery(keywords, query)) {
      continue;
    }

    results.push({
      id: `invoice-${invoice.id}`,
      category: "invoices",
      title: invoice.invoiceNumber,
      subtitle: invoice.billTo,
      href: `/finance?tab=invoices`,
      keywords: keywords.split(" ").filter(Boolean),
    });
  }

  if (
    matchesQuery(
      "alph copilot driver dispatcher safety maintenance accounting owner ai employee proactive",
      query,
    )
  ) {
    const copilotNav: CommandPaletteResult[] = [
      {
        id: "nav-alph-copilot",
        category: "platform",
        title: "Alph Copilot™",
        subtitle: "Role-specific AI employees",
        href: "/alph/copilot",
        keywords: ["alph", "copilot", "ai", "employee"],
      },
      {
        id: "nav-alph-copilot-driver",
        category: "platform",
        title: "Driver Alph",
        subtitle: "Alph Copilot™ · trips & reminders",
        href: "/alph/copilot/driver",
        keywords: ["driver alph", "copilot driver"],
      },
      {
        id: "nav-alph-copilot-dispatcher",
        category: "platform",
        title: "Dispatcher Alph",
        subtitle: "Alph Copilot™ · assign & ETA",
        href: "/alph/copilot/dispatcher",
        keywords: ["dispatcher alph", "copilot dispatch"],
      },
      {
        id: "nav-alph-copilot-safety",
        category: "platform",
        title: "Safety Alph",
        subtitle: "Alph Copilot™ · compliance & risk",
        href: "/alph/copilot/safety",
        keywords: ["safety alph", "copilot safety"],
      },
      {
        id: "nav-alph-copilot-maintenance",
        category: "platform",
        title: "Maintenance Alph",
        subtitle: "Alph Copilot™ · PM & shop",
        href: "/alph/copilot/maintenance",
        keywords: ["maintenance alph", "copilot maintenance"],
      },
      {
        id: "nav-alph-copilot-accounting",
        category: "platform",
        title: "Accounting Alph",
        subtitle: "Alph Copilot™ · invoices & payroll",
        href: "/alph/copilot/accounting",
        keywords: ["accounting alph", "copilot accounting"],
      },
      {
        id: "nav-alph-copilot-owner",
        category: "platform",
        title: "Owner Alph",
        subtitle: "Alph Copilot™ · morning brief",
        href: "/alph/copilot/owner",
        keywords: ["owner alph", "copilot owner", "morning brief"],
      },
    ];
    for (const item of copilotNav) {
      if (matchesQuery([item.title, item.subtitle ?? "", ...item.keywords].join(" "), query)) {
        results.push(item);
      }
    }
  }

  if (
    matchesQuery(
      "home dashboard executive daily business health",
      query,
    )
  ) {
    results.push({
      id: "nav-home",
      category: "platform",
      title: "Home",
      subtitle: "Executive daily dashboard",
      href: "/dashboard",
      keywords: ["home", "dashboard", "executive"],
    });
  }

  if (
    matchesQuery(
      "customers brokers shippers companies directory relationships",
      query,
    )
  ) {
    results.push({
      id: "nav-customers",
      category: "customers",
      title: "Customers",
      subtitle: "Brokers, shippers, and partners",
      href: "/customers",
      keywords: ["customers", "brokers", "shippers", "companies"],
    });
  }

  if (matchesQuery("finance accounting invoices payroll factoring", query)) {
    results.push({
      id: "nav-finance",
      category: "invoices",
      title: "Finance",
      subtitle: "Accounting & finance dashboard",
      href: "/finance",
      keywords: ["finance", "accounting", "invoices", "payroll", "factoring"],
    });
  }

  if (matchesQuery("settings company users permissions roles notifications billing", query)) {
    results.push({
      id: "nav-settings",
      category: "platform",
      title: "Settings",
      subtitle: "Company profile, users, roles, and billing prefs",
      href: "/settings",
      keywords: ["settings", "company", "users", "permissions", "roles", "billing"],
    });
  }

  if (
    matchesQuery(
      "advanced automation marketplace integrations migration developer security administration future platform",
      query,
    )
  ) {
    results.push({
      id: "nav-advanced",
      category: "advanced",
      title: "Advanced",
      subtitle: "Platform-power tools workspace",
      href: "/advanced",
      keywords: [
        "advanced",
        "automation",
        "marketplace",
        "integrations",
        "migration",
        "developer",
        "security",
        "administration",
      ],
    });
  }

  for (const category of ADVANCED_CATEGORIES) {
    const categoryKeywords = [
      category.name,
      category.description,
      ...category.links.map((link) => link.name),
    ].join(" ");
    if (matchesQuery(categoryKeywords, query)) {
      results.push({
        id: `advanced-category-${category.id}`,
        category: "advanced",
        title: category.name,
        subtitle: `Advanced · ${category.description}`,
        href: `/advanced/view/${category.id}`,
        keywords: [category.name, category.id, "advanced"],
      });
    }
    for (const link of category.links) {
      const linkKeywords = [link.name, link.description, category.name, "advanced"].join(
        " ",
      );
      if (!matchesQuery(linkKeywords, query)) continue;
      results.push({
        id: `advanced-link-${category.id}-${link.name}`,
        category: "advanced",
        title: link.name,
        subtitle: `Advanced · ${category.name}`,
        href: link.href,
        keywords: [link.name, category.name, "advanced"],
      });
    }
  }

  if (
    matchesQuery(
      "workforce hiring recruiting jobs candidates interviews onboarding alph recruiter",
      query,
    )
  ) {
    results.push({
      id: "nav-workforce",
      category: "workforce",
      title: "Workforce",
      subtitle: "Hiring command center",
      href: "/workforce",
      keywords: ["workforce", "hiring", "recruiting", "jobs", "candidates"],
    });
    results.push({
      id: "nav-workforce-ai",
      category: "workforce",
      title: "AI Recruiting",
      subtitle: "Alph recruiter workspace",
      href: "/workforce/ai",
      keywords: ["ai recruiting", "alph", "recruiter", "match"],
    });
    results.push({
      id: "nav-workforce-jobs",
      category: "workforce",
      title: "Jobs",
      subtitle: "Open job postings",
      href: "/workforce/jobs",
      keywords: ["jobs", "postings", "hiring"],
    });
  }

  for (const dest of PLATFORM_SEARCH_DESTINATIONS) {
    const keywords = [dest.title, dest.subtitle, ...dest.keywords].join(" ");
    if (!matchesQuery(keywords, query)) continue;
    results.push({
      id: dest.id,
      category: "platform",
      title: dest.title,
      subtitle: dest.subtitle,
      href: dest.href,
      keywords: [...dest.keywords],
    });
  }

  if (
    matchesQuery(
      "wallet passport career professional identity badges trust score share documents cdl medical",
      query,
    )
  ) {
    results.push({
      id: "nav-wallet",
      category: "wallet",
      title: "Digital Professional Wallet",
      subtitle: "Career Passport & identity",
      href: "/wallet",
      keywords: ["wallet", "passport", "career", "identity"],
    });
    results.push({
      id: "nav-wallet-passport",
      category: "wallet",
      title: "Career Passport",
      subtitle: "Lifelong professional timeline",
      href: "/wallet/passport",
      keywords: ["passport", "timeline", "career"],
    });
    results.push({
      id: "nav-wallet-documents",
      category: "wallet",
      title: "Wallet documents",
      subtitle: "CDL, medical, certs, consents",
      href: "/wallet/documents",
      keywords: ["cdl", "medical", "wallet documents"],
    });
    results.push({
      id: "nav-wallet-sharing",
      category: "wallet",
      title: "Wallet sharing",
      subtitle: "Secure share links",
      href: "/wallet/sharing",
      keywords: ["share", "sharing", "revoke"],
    });
    results.push({
      id: "nav-wallet-ai",
      category: "wallet",
      title: "Wallet AI Assistant",
      subtitle: "Document + career coach",
      href: "/wallet/ai",
      keywords: ["wallet ai", "career coach", "ocr"],
    });
  }

  if (
    matchesQuery(
      "network verified directory identity reputation connections community alph networking transpo id business passport",
      query,
    )
  ) {
    results.push({
      id: "nav-network",
      category: "network",
      title: "Transpo Verified Network",
      subtitle: "Trusted professional network",
      href: "/network",
      keywords: ["network", "verified", "transpo", "directory"],
    });
    results.push({
      id: "nav-network-directory",
      category: "network",
      title: "Network directory",
      subtitle: "People & companies",
      href: "/network/directory",
      keywords: ["directory", "search", "mechanics", "brokers"],
    });
    results.push({
      id: "nav-network-identity",
      category: "network",
      title: "My Identity",
      subtitle: "Universal Verified ID",
      href: "/network/identity",
      keywords: ["identity", "transpo id", "qr", "badges"],
    });
    results.push({
      id: "nav-network-ai",
      category: "network",
      title: "AI Networking",
      subtitle: "Alph industry assistant",
      href: "/network/ai",
      keywords: ["ai networking", "alph", "reefer mechanic"],
    });
    results.push({
      id: "nav-network-trust",
      category: "network",
      title: "Network Trust Center",
      subtitle: "Verification & audit",
      href: "/network/trust",
      keywords: ["trust", "verification", "audit"],
    });
  }

  if (
    matchesQuery(
      "exchange transpo exchange marketplace equipment parts services rentals auctions financing orders ai shopping seller buyer",
      query,
    )
  ) {
    const exchangeNav: CommandPaletteResult[] = [
      {
        id: "nav-exchange",
        category: "exchange",
        title: "Transpo Exchange™",
        subtitle: "B2B trucking commerce",
        href: "/exchange",
        keywords: ["exchange", "marketplace", "commerce"],
      },
      {
        id: "nav-exchange-equipment",
        category: "exchange",
        title: "Exchange · Equipment",
        subtitle: "Trucks, trailers, reefers",
        href: "/exchange/equipment",
        keywords: ["equipment", "trucks", "trailers", "reefer"],
      },
      {
        id: "nav-exchange-parts",
        category: "exchange",
        title: "Exchange · Parts",
        subtitle: "OEM & aftermarket",
        href: "/exchange/parts",
        keywords: ["parts", "oem", "tires", "turbo"],
      },
      {
        id: "nav-exchange-ai",
        category: "exchange",
        title: "Exchange · AI Shopping",
        subtitle: "Alph purchasing assistant",
        href: "/exchange/ai",
        keywords: ["ai shopping", "alph", "purchase"],
      },
      {
        id: "nav-exchange-orders",
        category: "exchange",
        title: "Exchange · Orders",
        subtitle: "POs, invoices, demo escrow",
        href: "/exchange/orders",
        keywords: ["orders", "escrow", "invoices"],
      },
      {
        id: "nav-exchange-seller",
        category: "exchange",
        title: "Exchange · Seller Hub",
        subtitle: "Inventory & leads",
        href: "/exchange/seller",
        keywords: ["seller", "inventory", "leads"],
      },
      {
        id: "nav-exchange-buyer",
        category: "exchange",
        title: "Exchange · Buyer Hub",
        subtitle: "Favorites & quotes",
        href: "/exchange/buyer",
        keywords: ["buyer", "favorites", "quotes"],
      },
    ];
    results.push(...exchangeNav);
  }

  for (const job of listByTenant(jobStore, tenantId)) {
    const keywords = [
      job.title,
      job.region,
      PROFESSIONAL_ROLE_LABELS[job.role],
      "job",
      "workforce",
    ].join(" ");
    if (!matchesQuery(keywords, query)) continue;
    results.push({
      id: `workforce-job-${job.id}`,
      category: "workforce",
      title: job.title,
      subtitle: `${job.region} · ${job.status}`,
      href: `/workforce/jobs/${job.id}`,
      keywords: keywords.split(" ").filter(Boolean),
    });
  }

  for (const candidate of listByTenant(candidateStore, tenantId)) {
    const name = candidateFullName(candidate);
    const keywords = [
      name,
      candidate.headline,
      candidate.locationCity,
      candidate.locationState,
      ...candidate.roles.map((r) => PROFESSIONAL_ROLE_LABELS[r]),
      "candidate",
      "workforce",
    ].join(" ");
    if (!matchesQuery(keywords, query)) continue;
    results.push({
      id: `workforce-candidate-${candidate.id}`,
      category: "workforce",
      title: name,
      subtitle: candidate.headline,
      href: `/workforce/candidates/${candidate.id}`,
      keywords: keywords.split(" ").filter(Boolean),
    });
  }

  for (const company of listByTenant(hiringCompanyStore, tenantId)) {
    const keywords = [
      company.name,
      company.hqCity,
      company.hqState,
      company.dotNumber,
      company.mcNumber,
      "hiring company",
      "workforce",
    ]
      .filter(Boolean)
      .join(" ");
    if (!matchesQuery(keywords, query)) continue;
    results.push({
      id: `workforce-company-${company.id}`,
      category: "workforce",
      title: company.name,
      subtitle: `${company.hqCity}, ${company.hqState}`,
      href: `/workforce/companies/${company.id}`,
      keywords: keywords.split(" ").filter(Boolean),
    });
  }

  for (const truck of truckStore) {
    if (truck.tenantId !== tenantId) {
      continue;
    }

    const keywords = [
      truck.unitNumber,
      `unit ${truck.unitNumber}`,
      truck.id,
      truck.make,
      truck.model,
    ].join(" ");

    if (!matchesQuery(keywords, query)) {
      continue;
    }

    results.push({
      id: `truck-${truck.id}`,
      category: "trucks",
      title: `Unit ${truck.unitNumber}`,
      subtitle: `${truck.make} ${truck.model}`,
      href: `/fleet/trucks/${truck.id}`,
      keywords: keywords.split(" ").filter(Boolean),
    });
  }

  for (const trailer of trailerStore) {
    if (trailer.tenantId !== tenantId) {
      continue;
    }

    const typeLabel =
      TRAILER_TYPE_LABELS[trailer.type] ?? trailer.type.replaceAll("_", " ");
    const keywords = [
      trailer.unitNumber,
      trailer.type,
      typeLabel,
      trailer.id,
    ].join(" ");

    if (!matchesQuery(keywords, query)) {
      continue;
    }

    results.push({
      id: `trailer-${trailer.id}`,
      category: "trailers",
      title: trailer.unitNumber,
      subtitle: typeLabel,
      href: `/fleet/trailers/${trailer.id}`,
      keywords: keywords.split(" ").filter(Boolean),
    });
  }

  for (const document of listCarrierDocuments(tenantId)) {
    if (document.status === "deleted") {
      continue;
    }

    const keywords = [
      document.filename,
      DOCUMENT_CATEGORY_LABELS[document.category],
      document.category,
      document.ocrText ?? "",
      document.loadNumber ?? "",
      document.invoiceNumber ?? "",
      document.poNumber ?? "",
      document.bolNumber ?? "",
      document.tags.join(" "),
      document.uploadedBy,
      ...Object.values(document.links).filter(Boolean),
      document.id,
    ].join(" ");

    if (!matchesQuery(keywords, query)) {
      continue;
    }

    results.push({
      id: `carrier-document-${document.id}`,
      category: "documents",
      title: document.filename,
      subtitle: DOCUMENT_CATEGORY_LABELS[document.category],
      href: `/documents/${document.id}`,
      keywords: keywords.split(" ").filter(Boolean),
    });
  }

  for (const document of loadDocumentStore) {
    if (document.tenantId !== tenantId) {
      continue;
    }

    const keywords = [
      document.label,
      document.fileName,
      document.type,
      document.loadId,
      document.id,
    ].join(" ");

    if (!matchesQuery(keywords, query)) {
      continue;
    }

    results.push({
      id: `document-${document.id}`,
      category: "documents",
      title: document.label,
      subtitle: document.fileName,
      href: `/loads/${document.loadId}/documents`,
      keywords: keywords.split(" ").filter(Boolean),
    });
  }

  for (const workflow of listWorkflows()) {
    const keywords = [
      workflow.name,
      workflow.description,
      workflow.trigger.type,
      getTriggerLabel(workflow.trigger.type),
      ...workflow.actions.map((action) => action.type),
      ...workflow.actions.map((action) => getActionLabel(action.type)),
      "workflow",
      "automation",
    ].join(" ");

    if (!matchesQuery(keywords, query)) {
      continue;
    }

    results.push({
      id: `workflow-${workflow.id}`,
      category: "workflows",
      title: workflow.name,
      subtitle: getTriggerLabel(workflow.trigger.type),
      href: `/workflows/${workflow.id}`,
      keywords: keywords.split(" ").filter(Boolean),
    });
  }

  return results.slice(0, limit);
}
