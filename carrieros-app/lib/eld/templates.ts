export type EldContactTemplateInput = {
  carrierCompany: string;
  mcNumber: string;
  dotNumber: string;
  eldProviderName: string;
  contactName?: string;
  truckCount?: number;
};

export function buildEldProviderEmailSubject(
  input: EldContactTemplateInput,
): string {
  return `API / Integration Partnership Request — ${input.carrierCompany} (${input.mcNumber}) × Transpo.ai`;
}

export function buildEldProviderEmailBody(
  input: EldContactTemplateInput,
): string {
  const trucks =
    input.truckCount != null
      ? `${input.truckCount} power units`
      : "our fleet";
  const greeting = input.contactName
    ? `Hello ${input.contactName},`
    : "Hello Partnerships / API Team,";

  return `${greeting}

We operate ${input.carrierCompany} (MC ${input.mcNumber}, DOT ${input.dotNumber}) and run ${trucks} on ${input.eldProviderName}.

We use Transpo.ai as our operations platform and would like to enable a live data connection for:
• Live GPS / vehicle location
• Vehicle and state mileage (IFTA)
• Driver HOS and duty status
• Engine hours, fuel, and fault codes (where available)
• Truck / trailer information and camera events (where available)

Please share:
1. Whether a public or partner API is available
2. How we request developer / partner credentials
3. API documentation, sandbox access, and any partnership agreement
4. The best technical contact for integration questions

Transpo.ai’s Integration Team can complete technical review once we have documentation. Reply to this email or CC our ops contact so we can keep the request moving.

Thank you,
${input.carrierCompany}
MC ${input.mcNumber} · DOT ${input.dotNumber}
`;
}

export function buildEldProviderRequestLetter(
  input: EldContactTemplateInput,
): string {
  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return `INTEGRATION REQUEST LETTER
${today}

To: ${input.eldProviderName} — Partnerships / API Team
From: ${input.carrierCompany}
MC: ${input.mcNumber}
DOT: ${input.dotNumber}

Re: Request for API access and integration partnership with Transpo.ai

${input.carrierCompany} requests authorization to connect our ${input.eldProviderName} account to Transpo.ai for operational telematics and compliance workflows.

We are prepared to:
• Complete any required partner or security questionnaires
• Limit scopes to fleet data we already own as the motor carrier
• Provide MC/DOT verification and a technical contact
• Coordinate testing with a small pilot fleet before full rollout

Please provide API documentation, credential onboarding steps, and a partnership contact.

Respectfully,
${input.carrierCompany}
`;
}

export function buildEldIntegrationRequestCopy(input: {
  carrierCompany: string;
  mcNumber: string;
  dotNumber: string;
  eldProviderName: string;
  features: string[];
  truckCount?: number;
  notes?: string;
}): string {
  const features =
    input.features.length > 0
      ? input.features.map((f) => `• ${f}`).join("\n")
      : "• Live GPS, mileage, HOS (standard package)";

  return `Transpo.ai ELD Integration Request
Provider: ${input.eldProviderName}
Carrier: ${input.carrierCompany}
MC: ${input.mcNumber}
DOT: ${input.dotNumber}
Trucks: ${input.truckCount ?? "—"}

Features needed:
${features}

${input.notes ? `Notes:\n${input.notes}\n` : ""}
Submitted via Transpo.ai ELD Directory.
`;
}

export const UNSUPPORTED_ELD_STEPS = [
  {
    title: "Submit a connection request",
    detail:
      "Tell us your ELD, fleet size, and the data you need. We track every request.",
  },
  {
    title: "Contact your ELD provider",
    detail:
      "Use our ready-made email or letter so they know you want Transpo.ai access.",
  },
  {
    title: "Share API docs when you get them",
    detail:
      "Upload partner docs, sandbox notes, or portal export guides — nothing is a dead end.",
  },
  {
    title: "Use a fallback until live sync is ready",
    detail:
      "Import CSV/Excel mileage, fuel reports, or scheduled email dumps for IFTA and ops.",
  },
] as const;
