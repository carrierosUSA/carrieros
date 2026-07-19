import type {
  AlphEntities,
  AlphIntentId,
  AlphParsedCommand,
} from "@/lib/alph/types";

const CITY_PATTERN =
  /\b(?:near|in|around|at)\s+([A-Za-z][A-Za-z.\s-]{1,40}?)(?:\s*,\s*[A-Z]{2})?(?=\s|$|\?)/i;

const TRUCK_UNIT_PATTERN =
  /\b(?:truck|unit|tractor)\s*#?\s*(\d{1,6})\b/i;

const DRIVER_NAME_PATTERN =
  /\b(?:driver|open\s+driver|show\s+driver|find\s+driver)\s+([A-Za-z][A-Za-z' -]{1,60})\b/i;

const OPEN_PERSON_PATTERN =
  /^open\s+([A-Z][a-zA-Z'’-]+(?:\s+[A-Z][a-zA-Z'’-]+)+)\s*$/;

const BROKER_NAME_PATTERN =
  /\b(?:broker|open\s+broker|show\s+broker|find\s+broker)\s+([A-Za-z0-9][A-Za-z0-9' .&-]{1,60})\b/i;

const LOAD_REF_PATTERN =
  /\b(?:load|ld)[\s#-]*(\d{3,6})\b/i;

const DAYS_PATTERN =
  /\b(?:over|older\s+than|more\s+than|past)\s+(\d{1,3})\s*days?\b/i;

const STATE_CODE_PATTERN = /\b(?:in|near|around|at)\s+([A-Z]{2})\b/;

const US_STATE_NAMES: Record<string, string> = {
  alabama: "AL",
  alaska: "AK",
  arizona: "AZ",
  arkansas: "AR",
  california: "CA",
  colorado: "CO",
  connecticut: "CT",
  delaware: "DE",
  florida: "FL",
  georgia: "GA",
  hawaii: "HI",
  idaho: "ID",
  illinois: "IL",
  indiana: "IN",
  iowa: "IA",
  kansas: "KS",
  kentucky: "KY",
  louisiana: "LA",
  maine: "ME",
  maryland: "MD",
  massachusetts: "MA",
  michigan: "MI",
  minnesota: "MN",
  mississippi: "MS",
  missouri: "MO",
  montana: "MT",
  nebraska: "NE",
  nevada: "NV",
  "new hampshire": "NH",
  "new jersey": "NJ",
  "new mexico": "NM",
  "new york": "NY",
  "north carolina": "NC",
  "north dakota": "ND",
  ohio: "OH",
  oklahoma: "OK",
  oregon: "OR",
  pennsylvania: "PA",
  "rhode island": "RI",
  "south carolina": "SC",
  "south dakota": "SD",
  tennessee: "TN",
  texas: "TX",
  utah: "UT",
  vermont: "VT",
  virginia: "VA",
  washington: "WA",
  "west virginia": "WV",
  wisconsin: "WI",
  wyoming: "WY",
};

const NL_STARTERS =
  /^(show|find|create|open|generate|run|list|who|which|what|replay|send|ask|get|how)\b/i;

/**
 * Heuristic: treat as natural-language Alph query if sentence-like.
 */
export function looksLikeAlphQuery(raw: string): boolean {
  const query = raw.trim();
  if (!query) {
    return false;
  }

  const words = query.split(/\s+/).filter(Boolean);
  if (words.length > 3) {
    return true;
  }

  if (NL_STARTERS.test(query)) {
    return true;
  }

  if (/\?$/.test(query)) {
    return true;
  }

  return false;
}

function normalize(raw: string): string {
  return raw.trim().replace(/\s+/g, " ");
}

function extractState(text: string, lower: string): string | undefined {
  const codeMatch = text.match(STATE_CODE_PATTERN);
  if (codeMatch?.[1]) {
    return codeMatch[1].toUpperCase();
  }

  for (const [name, code] of Object.entries(US_STATE_NAMES)) {
    if (new RegExp(`\\b(?:in|near|around|at)\\s+${name}\\b`).test(lower)) {
      return code;
    }
  }

  return undefined;
}

function extractEntities(text: string): AlphEntities {
  const entities: AlphEntities = {};
  const lower = text.toLowerCase();

  const state = extractState(text, lower);
  if (state) {
    entities.state = state;
  }

  const cityMatch = text.match(CITY_PATTERN);
  if (cityMatch?.[1]) {
    const city = cityMatch[1].trim().replace(/[?.!]+$/, "");
    // Avoid treating state names as cities when we already captured a state.
    if (!US_STATE_NAMES[city.toLowerCase()]) {
      entities.city = city;
    }
  }

  const truckMatch = text.match(TRUCK_UNIT_PATTERN);
  if (truckMatch?.[1]) {
    entities.truckUnit = truckMatch[1];
  }

  const brokerMatch = text.match(BROKER_NAME_PATTERN);
  if (brokerMatch?.[1]) {
    entities.brokerName = brokerMatch[1]
      .trim()
      .replace(/[?.!]+$/, "");
  }

  const driverMatch = text.match(DRIVER_NAME_PATTERN);
  if (driverMatch?.[1]) {
    const name = driverMatch[1]
      .replace(/\b(near|in|around|who|which|today).*$/i, "")
      .trim()
      .replace(/[?.!]+$/, "");
    if (name.length >= 2 && !/^(available|near|all)$/i.test(name)) {
      entities.driverName = name;
    }
  }

  // "Open John Smith" without the word driver
  if (!entities.driverName && !entities.brokerName) {
    const personMatch = text.match(OPEN_PERSON_PATTERN);
    if (personMatch?.[1]) {
      const name = personMatch[1].trim();
      if (
        !/\b(truck|load|broker|invoice|settings|fleet|finance)\b/i.test(name)
      ) {
        entities.driverName = name;
      }
    }
  }

  const loadMatch = text.match(LOAD_REF_PATTERN);
  if (loadMatch?.[1]) {
    entities.loadReference = loadMatch[1];
  }

  const daysMatch = text.match(DAYS_PATTERN);
  if (daysMatch?.[1]) {
    entities.days = Number.parseInt(daysMatch[1], 10);
  }

  if (/\btoday'?s?\b/.test(lower) || /\btoday\b/.test(lower)) {
    entities.dateHint = "today";
  } else if (/\bthis\s+week\b|\bweekly\b/.test(lower)) {
    entities.dateHint = "week";
  } else if (/\bthis\s+month\b|\bmonthly\b/.test(lower)) {
    entities.dateHint = "month";
  }

  if (/\bavailable\b/.test(lower)) {
    entities.status = "available";
  } else if (/\bon\s+load\b|\bin\s+transit\b/.test(lower)) {
    entities.status = "on_load";
  } else if (/\boverdue\b|\bunpaid\b/.test(lower)) {
    entities.status = "overdue";
  } else if (/\bcritical\b/.test(lower)) {
    entities.status = "critical";
  }

  return entities;
}

type IntentRule = {
  intent: AlphIntentId;
  score: number;
  test: (lower: string, entities: AlphEntities) => boolean;
};

const INTENT_RULES: IntentRule[] = [
  {
    intent: "upload_pod",
    score: 0.96,
    test: (lower) => /\bupload\b/.test(lower) && /\bpod\b|proof\s+of\s+delivery\b/.test(lower),
  },
  {
    intent: "open_alph_copilot",
    score: 0.97,
    test: (lower) =>
      /\balph\s+copilot\b/.test(lower) ||
      (/\bcopilot\b/.test(lower) &&
        !/\b(driver|dispatcher|safety|maintenance|accounting|owner)\b/.test(
          lower,
        )),
  },
  {
    intent: "open_driver_alph",
    score: 0.97,
    test: (lower) =>
      /\bdriver\s+alph\b/.test(lower) ||
      (/\bdriver\b/.test(lower) && /\bcopilot\b/.test(lower)),
  },
  {
    intent: "open_dispatcher_alph",
    score: 0.97,
    test: (lower) =>
      /\bdispatcher\s+alph\b/.test(lower) ||
      (/\bdispatcher\b/.test(lower) && /\bcopilot\b/.test(lower)),
  },
  {
    intent: "open_safety_alph",
    score: 0.97,
    test: (lower) =>
      /\bsafety\s+alph\b/.test(lower) ||
      (/\bsafety\b/.test(lower) && /\bcopilot\b/.test(lower)),
  },
  {
    intent: "open_maintenance_alph",
    score: 0.97,
    test: (lower) =>
      /\bmaintenance\s+alph\b/.test(lower) ||
      (/\bmaintenance\b/.test(lower) && /\bcopilot\b/.test(lower)),
  },
  {
    intent: "open_accounting_alph",
    score: 0.97,
    test: (lower) =>
      /\baccounting\s+alph\b/.test(lower) ||
      (/\baccounting\b/.test(lower) && /\bcopilot\b/.test(lower)),
  },
  {
    intent: "open_owner_alph",
    score: 0.97,
    test: (lower) =>
      /\bowner\s+alph\b/.test(lower) ||
      (/\bowner\b/.test(lower) && /\bcopilot\b/.test(lower)),
  },
  {
    intent: "assign_best_driver",
    score: 0.96,
    test: (lower) =>
      /\bassign\b/.test(lower) &&
      /\bbest\b/.test(lower) &&
      /\bdriver\b/.test(lower),
  },
  {
    intent: "find_reload",
    score: 0.95,
    test: (lower) =>
      /\breload\b/.test(lower) ||
      /\bbackhaul\b/.test(lower) ||
      /\breturn\s+load\b/.test(lower),
  },
  {
    intent: "handle_payroll",
    score: 0.96,
    test: (lower) =>
      (/\bhandle\b/.test(lower) || /\bprepare\b/.test(lower)) &&
      /\bpayroll\b/.test(lower),
  },
  {
    intent: "show_todays_profit",
    score: 0.96,
    test: (lower) =>
      /\btoday'?s?\s+profit\b/.test(lower) ||
      (/\bshow\b/.test(lower) &&
        /\bprofit\b/.test(lower) &&
        /\btoday\b/.test(lower)),
  },
  {
    intent: "find_truck_wash",
    score: 0.95,
    test: (lower) =>
      /\btruck\s+wash\b/.test(lower) ||
      (/\bwash\b/.test(lower) &&
        (/\bnearest\b/.test(lower) || /\bnearby\b/.test(lower))),
  },
  {
    intent: "assign_driver",
    score: 0.95,
    test: (lower) =>
      /\bassign\b/.test(lower) &&
      /\bdriver\b/.test(lower) &&
      !/\bbest\b/.test(lower),
  },
  {
    intent: "open_dispatch",
    score: 0.94,
    test: (lower) => /\bdispatch\b/.test(lower),
  },
  {
    intent: "show_cash_flow",
    score: 0.95,
    test: (lower) => /\bcash\s*-?\s*flow\b/.test(lower),
  },
  {
    intent: "who_owes_money",
    score: 0.96,
    test: (lower) => /\bowes?\b/.test(lower) && (/\bmoney\b|\bme\b|\bpayment\b/.test(lower) || /\bwho\b/.test(lower)),
  },
  {
    intent: "why_profit_down",
    score: 0.95,
    test: (lower) => /\bprofit\b/.test(lower) && (/\bwhy\b/.test(lower) || /\bdown\b|\blow\b/.test(lower)),
  },
  {
    intent: "why_fleet_health",
    score: 0.95,
    test: (lower) => /\bfleet\s+health\b/.test(lower),
  },
  {
    intent: "show_expiring",
    score: 0.94,
    test: (lower) =>
      /\bexpir/.test(lower) &&
      (/\bpermit\b|\binsurance\b|\bmedical\b|\bcdl\b|\bdocument\b/.test(lower) ||
        /\bshow\b/.test(lower)),
  },
  {
    intent: "driver_performance",
    score: 0.93,
    test: (lower) => /\bperformance\b/.test(lower) && /\bdriver\b/.test(lower),
  },
  {
    intent: "show_maintenance_due",
    score: 0.94,
    test: (lower) =>
      (/\bmaintenance\b/.test(lower) && (/\bdue\b|\bticket\b|\bcreate\b/.test(lower))) ||
      /\bpm\s+due\b/.test(lower),
  },
  {
    intent: "eld_is_supported",
    score: 0.96,
    test: (lower) =>
      (/\beld\b/.test(lower) ||
        /\bsamsara\b|\bmotive\b|\bgeotab\b|\bomnitracs\b|\bkeeptruckin\b|\bazuga\b/.test(
          lower,
        )) &&
      (/\bsupported\b/.test(lower) ||
        /\bis\b.+\bsupport/.test(lower) ||
        /\bsupport(ed)?\b/.test(lower)) &&
      !/\bwhich\b/.test(lower) &&
      !/\bgps\b|\bifta\b|\bmileage\b/.test(lower),
  },
  {
    intent: "eld_why_not_connected",
    score: 0.97,
    test: (lower) =>
      (/\beld\b/.test(lower) ||
        /\bsamsara\b|\bmotive\b|\bgeotab\b|\bomnitracs\b|\bverizon\b|\babc\s*eld\b/.test(
          lower,
        )) &&
      (/\bnot\s+connected\b/.test(lower) ||
        (/\bwhy\b/.test(lower) && /\bconnect/.test(lower))),
  },
  {
    intent: "eld_what_to_ask",
    score: 0.96,
    test: (lower) =>
      (/\bask\b/.test(lower) &&
        (/\beld\b/.test(lower) || /\bprovider\b/.test(lower))) ||
      /\beld\s+provider\b/.test(lower),
  },
  {
    intent: "eld_request_reviewed",
    score: 0.95,
    test: (lower) =>
      (/\beld\b/.test(lower) || /\bconnection\s+request\b/.test(lower)) &&
      (/\breview/.test(lower) ||
        /\brequest\s+status\b/.test(lower) ||
        /\bhas\s+my\b/.test(lower)),
  },
  {
    intent: "eld_which_support_data",
    score: 0.96,
    test: (lower) =>
      (/\beld/.test(lower) || /\bwhich\s+elds?\b/.test(lower)) &&
      (/\bgps\b|\bifta\b|\bmileage\b|\bhos\b|\bfuel\b|\bcamera\b/.test(lower) ||
        (/\bwhich\b/.test(lower) && /\bsupport/.test(lower))),
  },
  {
    intent: "eld_when_available",
    score: 0.95,
    test: (lower) =>
      (/\beld\b/.test(lower) ||
        /\bsamsara\b|\bmotive\b|\bomnitracs\b|\babc\s*eld\b/.test(lower)) &&
      /\bwhen\b/.test(lower) &&
      (/\bavailable\b/.test(lower) || /\bready\b/.test(lower)),
  },
  {
    intent: "replay_truck",
    score: 0.96,
    test: (lower) => /\breplay\b/.test(lower) && /\b(truck|unit|tractor)\b/.test(lower),
  },
  {
    intent: "best_broker",
    score: 0.95,
    test: (lower) =>
      /\bbest\s+broker\b/.test(lower) ||
      /\btop\s+broker\b/.test(lower) ||
      (/\bwho\b/.test(lower) && /\bbroker\b/.test(lower)),
  },
  {
    intent: "top_profit_truck",
    score: 0.95,
    test: (lower) =>
      /\bprofit\b/.test(lower) &&
      (/\btruck\b/.test(lower) || /\bwhich\b/.test(lower) || /\bmost\b/.test(lower)),
  },
  {
    intent: "loads_missing_pod",
    score: 0.94,
    test: (lower) =>
      /\bpod\b/.test(lower) ||
      /\bproof\s+of\s+delivery\b/.test(lower),
  },
  {
    intent: "find_unpaid_invoices",
    score: 0.93,
    test: (lower) =>
      (/\bunpaid\b|\boverdue\b|\boutstanding\b/.test(lower) &&
        /\binvoice/.test(lower)) ||
      (/\binvoice/.test(lower) && /\b\d+\s*days?\b/.test(lower)),
  },
  {
    intent: "generate_ifta",
    score: 0.94,
    test: (lower) =>
      /\bifta\b/.test(lower) ||
      /\bfuel\s+tax\b/.test(lower) ||
      /\bgenerate\s+ifta\b/.test(lower),
  },
  {
    intent: "generate_payroll",
    score: 0.93,
    test: (lower) =>
      /\bpayroll\b/.test(lower) ||
      /\bpay\s+drivers?\b/.test(lower) ||
      /\bgenerate\s+payroll\b/.test(lower),
  },
  {
    intent: "create_invoice",
    score: 0.9,
    test: (lower) =>
      (/\b(create|generate|new|draft)\b/.test(lower) && /\binvoice/.test(lower)) ||
      /\bai\s+invoice\b/.test(lower),
  },
  {
    intent: "show_maintenance",
    score: 0.92,
    test: (lower) =>
      /\bmaintenance\b/.test(lower) ||
      (/\btruck/.test(lower) && /\b(need|needing|due|repair|service)\b/.test(lower)),
  },
  {
    intent: "open_broker",
    score: 0.92,
    test: (lower, entities) =>
      Boolean(entities.brokerName) &&
      (/\bopen\b/.test(lower) || /\bshow\b/.test(lower) || /\bfind\b/.test(lower)),
  },
  {
    intent: "open_driver",
    score: 0.9,
    test: (lower, entities) =>
      Boolean(entities.driverName) &&
      (/\bopen\b/.test(lower) || /\bshow\b/.test(lower) || /\bdriver\b/.test(lower)) &&
      !/\bavailable\b/.test(lower) &&
      !/\bnear\b/.test(lower) &&
      !(/\bfind\b/.test(lower) && /\bdriver/.test(lower) && !/\bopen\b/.test(lower)),
  },
  {
    intent: "find_drivers",
    score: 0.9,
    test: (lower) =>
      /\bdriver/.test(lower) &&
      (/\bfind\b|\bavailable\b|\bnear\b|\bshow\b/.test(lower) ||
        /\bwho\s+is\s+available\b/.test(lower)) &&
      !/^open\s+/i.test(lower) &&
      !/\bhire\b|\bhiring\b|\brecruit|\bcandidate|\bworkforce\b/.test(lower),
  },
  {
    intent: "open_load",
    score: 0.88,
    test: (lower, entities) =>
      Boolean(entities.loadReference) &&
      (/\bopen\b/.test(lower) || /\bshow\b/.test(lower) || /\bload\b/.test(lower)),
  },
  {
    intent: "open_truck",
    score: 0.91,
    test: (lower, entities) =>
      Boolean(entities.truckUnit) &&
      !/\breplay\b/.test(lower) &&
      (/\bopen\b/.test(lower) ||
        /\bshow\b/.test(lower) ||
        /\bfind\b/.test(lower)),
  },
  {
    intent: "show_loads",
    score: 0.88,
    test: (lower) =>
      /\bloads?\b/.test(lower) &&
      !/\bpod\b/.test(lower) &&
      !/\bmissing\b/.test(lower),
  },
  {
    intent: "morning_briefing",
    score: 0.9,
    test: (lower) =>
      /\bbriefing\b/.test(lower) ||
      /\bwhat\s+needs\s+attention\b/.test(lower) ||
      /\bpriorit/.test(lower) ||
      /\bsummary\b/.test(lower),
  },
  {
    intent: "show_compliance",
    score: 0.85,
    test: (lower) => /\bcompliance\b|\bsafety\b|\bdot\b/.test(lower),
  },
  {
    intent: "open_settings",
    score: 0.85,
    test: (lower) => /\bsettings?\b|\bpreferences?\b/.test(lower),
  },
  {
    intent: "show_brokers",
    score: 0.8,
    test: (lower, entities) =>
      /\bbrokers?\b/.test(lower) &&
      !entities.brokerName &&
      !/\bbest\b|\btop\b|\bwho\b/.test(lower),
  },
  {
    intent: "show_documents",
    score: 0.82,
    test: (lower) =>
      /\bdocuments?\b/.test(lower) && !/\bpod\b/.test(lower) && !/\bhealth\b/.test(lower),
  },
  {
    intent: "show_finance",
    score: 0.8,
    test: (lower) =>
      /\bfinance\b|\bcash\s+flow\b|\brevenue\b/.test(lower) &&
      !/\binvoice/.test(lower) &&
      !/\bpayroll\b/.test(lower),
  },
  {
    intent: "show_analytics",
    score: 0.82,
    test: (lower) => /\banalytics\b|\breports?\b/.test(lower),
  },
  {
    intent: "show_fleet",
    score: 0.78,
    test: (lower, entities) =>
      (/\bfleet\b/.test(lower) || /\btrucks?\b/.test(lower) || /\btrailers?\b/.test(lower)) &&
      !entities.truckUnit &&
      !/\bmaintenance\b/.test(lower) &&
      !/\breplay\b/.test(lower) &&
      !/\bprofit\b/.test(lower),
  },
  {
    intent: "open_workforce_ai",
    score: 0.93,
    test: (lower) =>
      /\bai\s+recruit/.test(lower) ||
      /\balph\s+recruiter\b/.test(lower) ||
      /\brank\s+applicants?\b/.test(lower),
  },
  {
    intent: "find_candidates",
    score: 0.9,
    test: (lower) =>
      (/\bcandidates?\b/.test(lower) ||
        ((/\bhire\b|\bhiring\b|\brecruit/.test(lower)) &&
          /\b(reefer|flatbed|dispatcher|mechanic|driver|hazmat|tanker)\b/.test(
            lower,
          ))) &&
      !/\bai\s+recruit/.test(lower),
  },
  {
    intent: "show_workforce_jobs",
    score: 0.88,
    test: (lower) =>
      (/\bjob\s+postings?\b/.test(lower) ||
        /\bopen\s+jobs?\b/.test(lower) ||
        (/\bjobs?\b/.test(lower) && /\b(workforce|hiring|recruit)/.test(lower))) &&
      !/\bcandidates?\b/.test(lower),
  },
  {
    intent: "show_workforce",
    score: 0.86,
    test: (lower) =>
      /\bworkforce\b/.test(lower) ||
      (/\bhiring\b|\brecruiting\b|\brecruitment\b/.test(lower) &&
        !/\bcandidates?\b/.test(lower) &&
        !/\bjob/.test(lower)),
  },
  {
    intent: "open_wallet_ai",
    score: 0.93,
    test: (lower) =>
      /\bwallet\s+ai\b/.test(lower) ||
      /\bcareer\s+coach\b/.test(lower) ||
      /\bscan\s+(my\s+)?cdl\b/.test(lower) ||
      /\breplace\s+(my\s+)?medical\b/.test(lower),
  },
  {
    intent: "wallet_share",
    score: 0.92,
    test: (lower) =>
      (/\bshare\b/.test(lower) &&
        (/\bcdl\b|\bmedical\b|\bwallet\b|\bpassport\b/.test(lower))) ||
      /\bwallet\s+share\b/.test(lower) ||
      /\brevoke\s+(wallet\s+)?share\b/.test(lower),
  },
  {
    intent: "open_wallet_passport",
    score: 0.91,
    test: (lower) =>
      /\bcareer\s+passport\b/.test(lower) ||
      /\bpassport\s+timeline\b/.test(lower) ||
      (/\bpassport\b/.test(lower) && /\b(wallet|career|professional)\b/.test(lower)),
  },
  {
    intent: "show_wallet",
    score: 0.9,
    test: (lower) =>
      /\b(digital\s+)?professional\s+wallet\b/.test(lower) ||
      (/\bwallet\b/.test(lower) &&
        !/\bfinance\b/.test(lower) &&
        !/\bpayroll\b/.test(lower) &&
        !/\bnetwork\b/.test(lower)),
  },
  {
    intent: "open_network_ai",
    score: 0.94,
    test: (lower) =>
      /\bai\s+networking\b/.test(lower) ||
      /\breefer\s+mechanic/.test(lower) ||
      /\bsafety\s+consultant/.test(lower) ||
      (/\b(hazmat|verified)\s+drivers?\b/.test(lower) &&
        /\b(available|nearby|network|hire)\b/.test(lower)) ||
      (/\bfind\b/.test(lower) &&
        /\b(mechanic|insurance|dispatch|consultant)\b/.test(lower) &&
        /\b(nearby|network|fleet|bilingual)\b/.test(lower)),
  },
  {
    intent: "open_network_identity",
    score: 0.93,
    test: (lower) =>
      /\btranspo\s+id\b/.test(lower) ||
      /\bnetwork\s+identity\b/.test(lower) ||
      /\buniversal\s+verified\s+id\b/.test(lower) ||
      /\bmy\s+identity\b/.test(lower),
  },
  {
    intent: "open_network_directory",
    score: 0.9,
    test: (lower) =>
      /\bnetwork\s+directory\b/.test(lower) ||
      /\bverified\s+directory\b/.test(lower) ||
      (/\bdirectory\b/.test(lower) && /\b(network|verified|industry)\b/.test(lower)),
  },
  {
    intent: "show_network",
    score: 0.88,
    test: (lower) =>
      /\bverified\s+network\b/.test(lower) ||
      /\btranspo\s+network\b/.test(lower) ||
      (/\bnetwork\b/.test(lower) &&
        !/\bsocial\b/.test(lower) &&
        !/\bwifi\b/.test(lower)),
  },
  {
    intent: "open_platform",
    score: 0.94,
    test: (lower) =>
      /\bplatform\b/.test(lower) ||
      /\btranspo\s+platform\b/.test(lower) ||
      (/\becosystem\b/.test(lower) && !/\bmap\b/.test(lower)),
  },
  {
    intent: "start_import",
    score: 0.95,
    test: (lower) =>
      /\bstart\s+(an?\s+)?import\b/.test(lower) ||
      /\bstart\s+(a\s+)?migration\b/.test(lower) ||
      (/\bupload\b/.test(lower) && /\bcsv\b/.test(lower) && /\bimport\b/.test(lower)),
  },
  {
    intent: "open_migration",
    score: 0.94,
    test: (lower) =>
      /\bmigration\s+center\b/.test(lower) ||
      /\bai\s+migration\b/.test(lower) ||
      /\bmigrate\b/.test(lower) ||
      (/\bimport\b/.test(lower) &&
        /\b(data|csv|excel|tms|history|historical)\b/.test(lower)),
  },
  {
    intent: "open_app_store",
    score: 0.93,
    test: (lower) =>
      /\bapp\s+store\b/.test(lower) ||
      /\bpartner\s+apps?\b/.test(lower) ||
      (/\binstall\b/.test(lower) && /\bapp\b/.test(lower)),
  },
  {
    intent: "open_command_center",
    score: 0.92,
    test: (lower) =>
      /\bcommand\s+center\b/.test(lower) ||
      /\bbusiness\s+health\b/.test(lower) ||
      /\bexecutive\s+board\b/.test(lower),
  },
  {
    intent: "create_load",
    score: 0.93,
    test: (lower) =>
      /\bcreate\s+(a\s+)?load\b/.test(lower) ||
      /\bnew\s+load\b/.test(lower) ||
      /\badd\s+(a\s+)?load\b/.test(lower),
  },
  {
    intent: "pay_invoice",
    score: 0.92,
    test: (lower) =>
      /\bpay\s+(an?\s+)?invoice\b/.test(lower) ||
      /\brecord\s+payment\b/.test(lower) ||
      /\bpay\s+bill\b/.test(lower),
  },
  {
    intent: "schedule_maintenance",
    score: 0.91,
    test: (lower) =>
      /\bschedule\s+maintenance\b/.test(lower) ||
      /\bbook\s+(a\s+)?service\b/.test(lower),
  },
  {
    intent: "open_translation",
    score: 0.91,
    test: (lower) =>
      /\btranslat/.test(lower) ||
      (/\blanguage\b/.test(lower) && !/\bprogramming\b/.test(lower)) ||
      /\bspanish\b|\bespañol\b/.test(lower),
  },
  {
    intent: "open_security",
    score: 0.9,
    test: (lower) =>
      (/\bsecurity\b/.test(lower) && !/\bcamera/.test(lower) && !/\bwallet\b/.test(lower)) ||
      /\bmfa\b|\bsso\b|\baudit\s+log\b/.test(lower),
  },
  {
    intent: "open_automation",
    score: 0.9,
    test: (lower) =>
      /\bautomation\b/.test(lower) ||
      (/\brecipes?\b/.test(lower) && /\b(workflow|automat|platform)\b/.test(lower)),
  },
  {
    intent: "exchange_shop",
    score: 0.94,
    test: (lower) =>
      (/\breefer\b/.test(lower) && (/\b45\b/.test(lower) || /\bunder\b/.test(lower))) ||
      (/\bcascadia/.test(lower) && (/\b300\b/.test(lower) || /\bmile/.test(lower))) ||
      (/\bfuel\s*cards?\b/.test(lower) && /\bcompare\b/.test(lower)) ||
      /\boem\s+turbo/.test(lower) ||
      (/\bemergency\b/.test(lower) && /\btire/.test(lower)) ||
      (/\brecommend\b/.test(lower) && /\binsurance\b/.test(lower)) ||
      (/\bcompare\b/.test(lower) && /\bmaintenance\b/.test(lower)),
  },
  {
    intent: "open_exchange_ai",
    score: 0.92,
    test: (lower) =>
      /\bai\s+shopping\b/.test(lower) ||
      /\balph\s+purchasing\b/.test(lower) ||
      (/\bexchange\b/.test(lower) && /\bai\b/.test(lower)),
  },
  {
    intent: "open_exchange",
    score: 0.91,
    test: (lower) =>
      /\btranspo\s+exchange\b/.test(lower) ||
      /\bfreight\s+exchange\b/.test(lower) ||
      (/\bexchange\b/.test(lower) && !/\bstock\b/.test(lower) && !/\bai\b/.test(lower)),
  },
];

function scoreIntent(
  lower: string,
  entities: AlphEntities,
): { intent: AlphIntentId; confidence: number } {
  let best: { intent: AlphIntentId; confidence: number } = {
    intent: "unknown",
    confidence: 0.2,
  };

  for (const rule of INTENT_RULES) {
    if (!rule.test(lower, entities)) {
      continue;
    }
    if (rule.score > best.confidence) {
      best = { intent: rule.intent, confidence: rule.score };
    }
  }

  // Boost when entities reinforce the intent
  if (best.intent === "find_drivers" && entities.city) {
    best.confidence = Math.min(0.98, best.confidence + 0.04);
  }
  if (best.intent === "show_loads" && entities.dateHint === "today") {
    best.confidence = Math.min(0.98, best.confidence + 0.05);
  }
  if (best.intent === "show_loads" && entities.state) {
    best.confidence = Math.min(0.98, best.confidence + 0.05);
  }
  if (
    (best.intent === "replay_truck" || best.intent === "open_truck") &&
    entities.truckUnit
  ) {
    best.confidence = Math.min(0.98, best.confidence + 0.03);
  }
  if (best.intent === "open_driver" && entities.driverName) {
    best.confidence = Math.min(0.98, best.confidence + 0.04);
  }
  if (best.intent === "open_broker" && entities.brokerName) {
    best.confidence = Math.min(0.98, best.confidence + 0.04);
  }

  return best;
}

export function parseAlphCommand(raw: string): AlphParsedCommand {
  const text = normalize(raw);
  const entities = extractEntities(text);
  const lower = text.toLowerCase();
  const { intent, confidence } = scoreIntent(lower, entities);

  return {
    raw: text,
    intent,
    entities,
    confidence,
  };
}
