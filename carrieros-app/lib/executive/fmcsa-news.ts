/**
 * Seeded FMCSA News Center items for Home.
 * Not live news — clearly labeled demo content for carrier owners.
 */

export type FmcsaNewsItem = {
  id: string;
  headline: string;
  alphSummary: string;
  dateLabel: string;
  /** ISO date for sorting */
  dateIso: string;
  readHref: string;
  affectMeHref: string;
  topic: "rules" | "compliance" | "enforcement" | "state";
};

export const FMCSA_NEWS_DEMO_LABEL = "Seeded demo · not live FMCSA feed";

export const FMCSA_NEWS_ITEMS: FmcsaNewsItem[] = [
  {
    id: "fmcsa-hos-reminder",
    headline: "Hours-of-Service reminder for summer freight peaks",
    alphSummary:
      "Alph notes: confirm ELD clocks and split-sleeper use before peak weekend freight so HOS violations do not stop your trucks.",
    dateLabel: "Jul 15, 2026",
    dateIso: "2026-07-15",
    topic: "rules",
    readHref: "/compliance",
    affectMeHref: "/?q=Does%20the%20HOS%20summer%20reminder%20affect%20my%20fleet%3F",
  },
  {
    id: "fmcsa-cdl-medical",
    headline: "CDL medical card renewal window tightening",
    alphSummary:
      "Alph notes: drivers with medical cards expiring in 30 days should renew now to avoid roadside out-of-service.",
    dateLabel: "Jul 12, 2026",
    dateIso: "2026-07-12",
    topic: "compliance",
    readHref: "/compliance",
    affectMeHref:
      "/?q=Which%20of%20my%20drivers%20have%20medical%20cards%20expiring%20soon%3F",
  },
  {
    id: "fmcsa-state-weigh",
    headline: "Midwest weigh-station enforcement increase",
    alphSummary:
      "Alph notes: expect more roadside inspections on IL–IN–OH lanes this month — keep annual inspections and IFTA current.",
    dateLabel: "Jul 10, 2026",
    dateIso: "2026-07-10",
    topic: "enforcement",
    readHref: "/fleet",
    affectMeHref:
      "/?q=Do%20Midwest%20weigh-station%20checks%20affect%20my%20active%20lanes%3F",
  },
];

export function listFmcsaNewsItems(limit = 3): FmcsaNewsItem[] {
  return FMCSA_NEWS_ITEMS.slice(0, limit);
}
