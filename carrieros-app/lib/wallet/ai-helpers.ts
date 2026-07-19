import { getCareerPassport, listExpiringDocuments, listWalletDocuments } from "@/lib/wallet/store";
import type { WalletDocument, WalletDocumentCategory } from "@/lib/wallet/types";
import { WALLET_DOCUMENT_CATEGORY_LABELS } from "@/lib/wallet/types";

export type DocAssistActionId =
  | "upload_cdl"
  | "replace_medical"
  | "scan_certificate"
  | "verify_quality"
  | "ocr_extract"
  | "translate"
  | "summarize"
  | "expiration_notify";

export type DocAssistResult = {
  title: string;
  body: string;
  extracted?: Record<string, string>;
  suggestedHref?: string;
};

function guessCategoryFromFilename(fileName: string): WalletDocumentCategory {
  const lower = fileName.toLowerCase();
  if (lower.includes("cdl")) return "cdl";
  if (lower.includes("medical") || lower.includes("dot")) return "medical";
  if (lower.includes("twic")) return "twic";
  if (lower.includes("mvr") || lower.includes("background")) return "background_mvr";
  if (lower.includes("drug")) return "drug_test";
  if (lower.includes("insurance") || lower.includes("coi")) return "insurance";
  if (lower.includes("passport")) return "passport";
  if (lower.includes("hazmat") || lower.includes("cert")) return "safety_training";
  return "upload";
}

/** Heuristic OCR / extract from filename + known document type (demo). */
export function extractFromDocument(
  fileName: string,
  categoryHint?: WalletDocumentCategory,
): Record<string, string> {
  const category = categoryHint ?? guessCategoryFromFilename(fileName);
  const baseName = fileName.replace(/\.[^.]+$/, "").replace(/[-_]/g, " ");
  return {
    detectedType: WALLET_DOCUMENT_CATEGORY_LABELS[category],
    fileName,
    holderHint: baseName.includes("jordan") || baseName.includes("reyes")
      ? "Jordan Reyes"
      : "Name not detected — review manually",
    issuedHint: "See document scan for issue date",
    expiresHint:
      category === "medical"
        ? "Likely 24-month DOT medical window"
        : category === "cdl"
          ? "Aligns with state CDL renewal cycle"
          : "Check printed expiration",
    confidence: "Demo extract — confirm before sharing",
  };
}

export function runDocumentAssistant(
  action: DocAssistActionId,
  opts?: { fileName?: string; documentId?: string },
): DocAssistResult {
  const docs = listWalletDocuments();
  const medical = docs.find((d) => d.category === "medical");
  const cdl = docs.find((d) => d.category === "cdl");
  const fileName = opts?.fileName ?? "upload.pdf";

  switch (action) {
    case "upload_cdl":
      return {
        title: "Ready to add CDL",
        body: cdl
          ? `You already have “${cdl.title}” (${cdl.status}). Upload a clearer scan to replace it, or keep the verified copy.`
          : "Upload a clear photo or PDF of both sides of your CDL. Alph will classify it and mark it pending review.",
        suggestedHref: cdl ? `/wallet/documents/${cdl.id}` : "/wallet/documents",
      };
    case "replace_medical":
      return {
        title: "Replace medical certificate",
        body: medical
          ? `Current medical expires ${medical.expiresAt ?? "soon"}. Upload the new examiner certificate to keep dispatch ready.`
          : "No medical card on file. Upload your DOT medical examiner certificate.",
        suggestedHref: medical ? `/wallet/documents/${medical.id}` : "/wallet/documents",
      };
    case "scan_certificate": {
      const extracted = extractFromDocument(fileName);
      return {
        title: "Certificate scan complete",
        body: `Detected ${extracted.detectedType}. Review extracted fields, then save to your wallet.`,
        extracted,
        suggestedHref: "/wallet/documents",
      };
    }
    case "verify_quality":
      return {
        title: "Document quality check",
        body:
          fileName.toLowerCase().endsWith(".pdf")
            ? "Looks like a PDF — good for sharing. Ensure all four corners are visible and text is readable."
            : "Image upload detected. Prefer a flat, well-lit scan without glare. Avoid cropped edges.",
        suggestedHref: "/wallet/documents",
      };
    case "ocr_extract": {
      const doc = opts?.documentId
        ? docs.find((d) => d.id === opts.documentId)
        : undefined;
      const extracted = extractFromDocument(
        fileName || doc?.fileName || "document.pdf",
        doc?.category,
      );
      return {
        title: "OCR extract (demo)",
        body: "Fields below are heuristic from filename and document type. Confirm before sharing with employers.",
        extracted,
        suggestedHref: doc ? `/wallet/documents/${doc.id}` : "/wallet/documents",
      };
    }
    case "translate":
      return {
        title: "Translation assist",
        body: "Alph can produce an English summary of certificate text for hiring packets. Original documents stay access-controlled in your wallet — this does not create a new legal translation.",
        suggestedHref: "/wallet/documents",
      };
    case "summarize": {
      const target =
        (opts?.documentId && docs.find((d) => d.id === opts.documentId)) ||
        docs[0];
      return {
        title: "Document summary",
        body: target
          ? `${target.title}: ${target.summary} Status: ${target.status.replace(/_/g, " ")}.`
          : "No documents to summarize yet.",
        suggestedHref: target ? `/wallet/documents/${target.id}` : "/wallet/documents",
      };
    }
    case "expiration_notify": {
      const expiring = listExpiringDocuments(90);
      return {
        title: "Expiration outlook",
        body:
          expiring.length === 0
            ? "Nothing expiring in the next 90 days. You’re in good shape."
            : `${expiring.length} item(s) need attention: ${expiring
                .slice(0, 4)
                .map((d) => d.title)
                .join(", ")}.`,
        suggestedHref: "/wallet/notifications",
      };
    }
    default:
      return {
        title: "Alph document assist",
        body: "Choose an action to continue.",
      };
  }
}

export type CareerCoachChipId =
  | "recommend_jobs"
  | "recommend_certs"
  | "salary"
  | "training"
  | "missing_quals"
  | "interview_prep"
  | "resume_improve"
  | "profile_build"
  | "opportunities";

export type CareerCoachAdvice = {
  title: string;
  body: string;
  bullets: string[];
  href?: string;
};

export function runCareerCoach(chip: CareerCoachChipId): CareerCoachAdvice {
  const passport = getCareerPassport();
  const docs = listWalletDocuments();
  const hasHazmat = docs.some(
    (d) => d.endorsement === "hazmat" && d.status === "valid",
  );
  const medicalOk = docs.some(
    (d) => d.category === "medical" && (d.status === "valid" || d.status === "expiring"),
  );

  switch (chip) {
    case "recommend_jobs":
      return {
        title: "Job recommendations",
        body: `With ${passport.identity.yearsExperience} years and ${passport.identity.trailerExperience.join(", ")} experience, focus on roles that value hazmat/tanker reliability.`,
        bullets: [
          "Regional hazmat dedicated — home weekends",
          "Tanker liquid bulk — premium CPM lanes",
          "Reefer regional with bilingual dispatch preference",
        ],
        href: "/workforce/jobs",
      };
    case "recommend_certs":
      return {
        title: "Certification suggestions",
        body: "Close gaps that hiring managers filter on first.",
        bullets: [
          medicalOk
            ? "Renew DOT medical before it lapses"
            : "Add a current DOT medical certificate",
          "Complete hazmat awareness refresher (expiring soon)",
          hasHazmat
            ? "Consider tanker liquid specialty training"
            : "Pursue hazmat endorsement if targeting chemical lanes",
        ],
        href: "/wallet/documents",
      };
    case "salary":
      return {
        title: "Salary guidance (demo)",
        body: "Based on your endorsements and tenure in TX/OK/LA lanes — not a formal offer.",
        bullets: [
          "Hazmat/tanker dedicated: typically higher CPM than dry van",
          "Bilingual drivers often see faster dispatch preference",
          "Verify local market rates before accepting — Trust Score is not pay advice",
        ],
        href: "/workforce/jobs",
      };
    case "training":
      return {
        title: "Training path",
        body: "Keep compliance fresh and stack specialty skills.",
        bullets: passport.trainingHighlights.map(
          (t) => `Maintain: ${t}`,
        ),
        href: "/workforce/training",
      };
    case "missing_quals":
      return {
        title: "Missing qualifications",
        body: "Items that may block enterprise onboarding if left unresolved.",
        bullets: [
          ...(!docs.some((d) => d.category === "background_mvr" && d.consentGranted)
            ? ["Background/MVR consent not granted — required only when you authorize"]
            : []),
          ...docs
            .filter((d) => d.status === "expiring" || d.status === "expired")
            .slice(0, 3)
            .map((d) => `${d.title} needs renewal`),
          ...docs
            .filter((d) => d.status === "pending_review")
            .slice(0, 2)
            .map((d) => `${d.title} awaiting verification`),
        ],
        href: "/wallet/documents",
      };
    case "interview_prep":
      return {
        title: "Interview prep",
        body: "Lead with verified safety and equipment breadth.",
        bullets: [
          `Open with ${passport.achievements[0]} and million-mile recognition`,
          "Have CDL + medical share link ready (read-only, short expiry)",
          "Prepare a 60-second story on hazmat load handling and HOS discipline",
        ],
        href: "/wallet/sharing",
      };
    case "resume_improve":
      return {
        title: "Resume / passport polish",
        body: "Your Career Passport already carries verified employment — tighten the headline.",
        bullets: [
          `Headline idea: “${passport.identity.headline}”`,
          "Lead with endorsements and states driven, not raw IDs",
          "Attach recommendation letter in certifications scope — not entire wallet",
        ],
        href: "/wallet/passport",
      };
    case "profile_build":
      return {
        title: "Profile build checklist",
        body: "Make the first screen answer who you are in two seconds.",
        bullets: [
          "Photo + headline + years experience",
          "Verified companies worked",
          "Badges strip (Verified Driver, Safe Driver, Million Mile)",
          "Languages and special skills",
        ],
        href: "/wallet/passport",
      };
    case "opportunities":
      return {
        title: "Career opportunities",
        body: "Adjacent paths that leverage your verified history.",
        bullets: [
          "Lead driver / trainer at current fleet",
          "Owner-operator with hazmat niche (authority packet pending review)",
          "Safety mentor roles once training certs stay current",
        ],
        href: "/workforce",
      };
    default:
      return {
        title: "Career coach",
        body: "Pick a topic to get tailored advice from your passport.",
        bullets: [],
      };
  }
}

export function summarizeDocumentForShare(doc: WalletDocument): string {
  return `${doc.title} · ${WALLET_DOCUMENT_CATEGORY_LABELS[doc.category]} · ${doc.status.replace(/_/g, " ")}`;
}
