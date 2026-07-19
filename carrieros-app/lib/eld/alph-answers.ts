import { ELD_CATALOG, getEldCatalogProvider, searchEldCatalog } from "./catalog";
import { getEldStore, listEldRequests } from "./store";
import {
  ELD_DATA_TYPE_LABELS,
  ELD_REQUEST_STATUS_LABELS,
  ELD_STATUS_LABELS,
  type EldDataType,
} from "./types";
import { buildEldProviderEmailBody, buildEldProviderEmailSubject } from "./templates";
import { loadSettings } from "@/lib/settings/settings-store";

export type EldAlphQuestionKind =
  | "is_eld_supported"
  | "why_not_connected"
  | "what_to_ask_provider"
  | "request_reviewed"
  | "which_support_data"
  | "when_available";

function detectProviderName(raw: string): string | undefined {
  const lower = raw.toLowerCase();
  for (const p of ELD_CATALOG) {
    if (lower.includes(p.name.toLowerCase()) || lower.includes(p.id.replace(/_/g, " "))) {
      return p.id;
    }
  }
  // fuzzy: "my eld" with no name
  return undefined;
}

function detectDataType(raw: string): EldDataType | undefined {
  const lower = raw.toLowerCase();
  if (/\blive\s*gps\b|\bgps\b|\blocation\b/.test(lower)) return "live_gps";
  if (/\bifta\b|\bstate\s*mileage\b/.test(lower)) return "state_mileage";
  if (/\bvehicle\s*mileage\b|\bmileage\b/.test(lower)) return "vehicle_mileage";
  if (/\bhos\b|\bhours\s+of\s+service\b/.test(lower)) return "driver_hos";
  if (/\bfuel\b/.test(lower)) return "fuel_data";
  if (/\bcamera\b|\bdash\s*cam\b/.test(lower)) return "dash_camera_events";
  if (/\bfault\b/.test(lower)) return "fault_codes";
  if (/\bengine\s*hours\b/.test(lower)) return "engine_hours";
  return undefined;
}

export function answerEldAlphQuestion(
  kind: EldAlphQuestionKind,
  raw: string,
): { title: string; body: string; href?: string } {
  const store = getEldStore();
  const providerId = detectProviderName(raw);
  const provider = providerId ? getEldCatalogProvider(providerId) : undefined;
  const status = providerId
    ? store.connections[providerId]?.status ?? provider?.status
    : undefined;

  switch (kind) {
    case "is_eld_supported": {
      if (!provider || !status) {
        const available = ELD_CATALOG.filter(
          (p) =>
            store.connections[p.id]?.status === "available" ||
            store.connections[p.id]?.status === "connected" ||
            p.status === "available" ||
            p.status === "connected",
        )
          .map((p) => p.name)
          .slice(0, 6)
          .join(", ");
        return {
          title: "ELD support depends on the provider",
          body: `Open the ELD Directory to check your brand. Technically supported today include: ${available}. Partnership-required and no-API ELDs are listed with clear next steps — never a dead end.`,
          href: "/integrations/eld",
        };
      }
      const label = ELD_STATUS_LABELS[status];
      const supported =
        status === "connected" || status === "available"
          ? "Yes — technically supported."
          : status === "partnership_required" || status === "api_restricted"
            ? "Not connected yet — waiting on ELD approval / partnership."
            : status === "no_public_api"
              ? "No public API today — you can still request integration and use fallbacks."
              : "Not connected yet — you can request connection and track status.";
      return {
        title: `${provider.name}: ${label}`,
        body: `${supported}${
          provider.unavailableReason ? ` ${provider.unavailableReason}` : ""
        }`,
        href: `/integrations/eld?provider=${provider.id}`,
      };
    }
    case "why_not_connected": {
      if (!provider || !status) {
        return {
          title: "Why an ELD might not be connected",
          body: "Common reasons: Available but not connected yet, partnership required, API restricted to approved partners, no public API, under review, or not yet supported. Pick your ELD in the directory for the exact reason and next steps.",
          href: "/integrations/eld",
        };
      }
      if (status === "connected") {
        return {
          title: `${provider.name} is connected`,
          body: "Live data should sync from Integration Center. If something looks stale, open Integrations → ELD / Telematics and run a connection test.",
          href: "/integrations?category=eld_telematics",
        };
      }
      return {
        title: `Why ${provider.name} is not connected`,
        body:
          provider.unavailableReason ??
          `Status: ${ELD_STATUS_LABELS[status]}. Use Request Connection or Contact ELD Provider — fallback imports are available if live API is blocked.`,
        href: `/integrations/eld?provider=${provider.id}`,
      };
    }
    case "what_to_ask_provider": {
      const settings = loadSettings();
      const name = provider?.name ?? "your ELD provider";
      const subject = buildEldProviderEmailSubject({
        carrierCompany: settings.company.name,
        mcNumber: settings.company.mcNumber,
        dotNumber: settings.company.dotNumber,
        eldProviderName: name,
      });
      const body = buildEldProviderEmailBody({
        carrierCompany: settings.company.name,
        mcNumber: settings.company.mcNumber,
        dotNumber: settings.company.dotNumber,
        eldProviderName: name,
      });
      return {
        title: `What to ask ${name}`,
        body: `Ask for partner/API access, docs, sandbox credentials, and a technical contact.\n\nSuggested subject: ${subject}\n\n${body.slice(0, 420)}…`,
        href: provider
          ? `/integrations/eld?provider=${provider.id}&panel=contact`
          : "/integrations/eld",
      };
    }
    case "request_reviewed": {
      const requests = listEldRequests(providerId);
      if (requests.length === 0) {
        return {
          title: "No ELD connection requests yet",
          body: "Submit a request from the ELD Directory. You’ll get Notification Center updates as status moves from Submitted through Technical Review to Connected.",
          href: "/integrations/eld/requests",
        };
      }
      const latest = requests[0];
      return {
        title: `${latest.providerName} — ${ELD_REQUEST_STATUS_LABELS[latest.status]}`,
        body: `Last update ${new Date(latest.updatedAt).toLocaleDateString()}. ${
          latest.assignedTeammate
            ? `Assigned to ${latest.assignedTeammate}. `
            : "Not yet assigned to an Integration teammate. "
        }${
          latest.status === "rejected" && latest.rejectionReason
            ? `Rejection: ${latest.rejectionReason.replace(/_/g, " ")}.`
            : "Open Requests to see the full timeline."
        }`,
        href: `/integrations/eld/requests?id=${latest.id}`,
      };
    }
    case "which_support_data": {
      const dataType = detectDataType(raw) ?? "live_gps";
      const label = ELD_DATA_TYPE_LABELS[dataType];
      const matches = ELD_CATALOG.filter((p) => p.dataTypes.includes(dataType));
      const names = matches
        .slice(0, 8)
        .map((p) => p.name)
        .join(", ");
      return {
        title: `ELDs with ${label}`,
        body: `${matches.length} providers list ${label}: ${names}${
          matches.length > 8 ? "…" : ""
        }. Filter the directory by data type for the full set.`,
        href: `/integrations/eld?data=${dataType}`,
      };
    }
    case "when_available": {
      if (!provider || !status) {
        return {
          title: "When will my ELD be available?",
          body: "Timing depends on API access and demand. Technically supported ELDs can connect today. Partnership / no-API brands move when the ELD approves access or enough carriers request them. Check your request status and the Integration Team queue.",
          href: "/integrations/eld/requests",
        };
      }
      if (status === "available" || status === "connected") {
        return {
          title: `${provider.name} is available now`,
          body:
            status === "connected"
              ? "Already connected — no wait."
              : "You can connect from the ELD Directory or Integration Center today.",
          href: `/integrations/eld?provider=${provider.id}`,
        };
      }
      const reqs = listEldRequests(provider.id);
      return {
        title: `${provider.name} availability`,
        body: `Current status: ${ELD_STATUS_LABELS[status]}. ${
          reqs.length
            ? `Your latest request is ${ELD_REQUEST_STATUS_LABELS[reqs[0].status]}.`
            : "Submit a request so we can prioritize."
        } We never promise a date — we show clear status and fallbacks meanwhile.`,
        href: `/integrations/eld?provider=${provider.id}`,
      };
    }
    default:
      return {
        title: "ELD Directory",
        body: "Ask whether your ELD is supported, why it is not connected, what to ask the provider, or which brands support live GPS / IFTA mileage.",
        href: "/integrations/eld",
      };
  }
}

export function searchEldForAlph(query: string) {
  return searchEldCatalog(query);
}
