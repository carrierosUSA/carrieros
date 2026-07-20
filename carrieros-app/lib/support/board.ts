import type { SupportIssue, SupportStoreSnapshot } from "@/lib/support/types";

export type SupportDashboardStats = {
  openIssues: number;
  criticalIssues: number;
  autoResolved: number;
  waitingForCarrier: number;
  waitingForCarrierOs: number;
  waitingForProvider: number;
  resolvedToday: number;
  recurring: number;
};

export function buildSupportStats(store: SupportStoreSnapshot): SupportDashboardStats {
  const today = "2026-07-17";
  const open = store.issues.filter((i) => !["resolved", "closed"].includes(i.status));
  return {
    openIssues: open.length,
    criticalIssues: open.filter((i) => i.severity === "critical").length,
    autoResolved: store.issues.filter(
      (i) =>
        (i.status === "resolved" || i.status === "closed") &&
        i.repairAttempts.some((r) => r.result === "success") &&
        i.timeline.some((t) => t.actor === "alph" && t.kind === "resolved"),
    ).length,
    waitingForCarrier: open.filter((i) => i.status === "waiting_for_user").length,
    waitingForCarrierOs: open.filter((i) =>
      ["escalated", "assigned", "in_progress", "testing"].includes(i.status),
    ).length,
    waitingForProvider: open.filter((i) => i.status === "waiting_for_third_party")
      .length,
    resolvedToday: store.issues.filter(
      (i) => i.resolvedAt?.startsWith(today),
    ).length,
    recurring: store.productImprovements.length,
  };
}

/** Platform demo seeds that must not look like a live app failure in the shell. */
const DEMO_BANNER_EXCLUDED_IDS = new Set([
  "issue-eld-token",
  "issue-email-lane",
  "issue-resolved-demo",
]);

export function activeIssueBanner(issues: SupportIssue[]): SupportIssue | null {
  const open = issues
    .filter(
      (i) =>
        i.carrierVisible &&
        i.surfaceInBanner !== false &&
        !DEMO_BANNER_EXCLUDED_IDS.has(i.id) &&
        !["resolved", "closed"].includes(i.status),
    )
    .sort((a, b) => severityRank(b.severity) - severityRank(a.severity));
  return open[0] ?? null;
}

function severityRank(s: SupportIssue["severity"]): number {
  switch (s) {
    case "critical":
      return 5;
    case "high":
      return 4;
    case "medium":
      return 3;
    case "low":
      return 2;
    default:
      return 1;
  }
}

export function alphHelpAnswer(question: string, store: SupportStoreSnapshot): {
  title: string;
  body: string;
  technical?: string;
  href?: string;
} {
  const q = question.toLowerCase();
  const open = store.issues.filter((i) => !["resolved", "closed"].includes(i.status));
  const eld = open.find((i) => i.integration?.toLowerCase().includes("samsara") || i.id.includes("eld"));
  const setup = store.setup;

  if (q.includes("setup") || q.includes("finish company")) {
    return {
      title: "Company setup progress",
      body: `Your company setup is ${setup.percent}% complete. ${setup.requiredMissing} critical step${setup.requiredMissing === 1 ? "" : "s"} still need attention. Alph can walk you through each missing item.`,
      href: "/setup",
      technical: `requiredMissing=${setup.requiredMissing}; steps=${setup.total}`,
    };
  }

  if (q.includes("eld") || q.includes("disconnected") || q.includes("sync")) {
    return {
      title: eld ? eld.title : "ELD status",
      body: eld
        ? `${eld.humanMessage} Diagnosis: ${eld.alphDiagnosis}`
        : "No open ELD issues right now. Your primary ELD connection looks healthy.",
      href: eld ? `/support?issue=${eld.id}` : "/integrations/eld",
      technical: eld?.errorMessage,
    };
  }

  if (q.includes("invoice") || q.includes("upload") || q.includes("document") || q.includes("pod")) {
    const doc = open.find((i) => i.category === "documents" || i.category === "billing");
    return {
      title: doc?.title ?? "Document & invoice health",
      body: doc
        ? doc.humanMessage
        : "No open document or invoice failures. Check Document Health if you expect a missing POD.",
      href: doc ? `/support?issue=${doc.id}` : "/documents/health",
      technical: doc?.errorMessage,
    };
  }

  if (q.includes("resolved") || q.includes("fixed") || q.includes("change")) {
    const resolved = store.issues.find((i) => i.status === "resolved" || i.status === "closed");
    return {
      title: resolved ? `Resolved: ${resolved.title}` : "No recent resolutions",
      body: resolved
        ? `${resolved.resolutionSummary ?? "Alph completed a safe repair."} You can confirm or reopen from Support.`
        : "There are no recently resolved tickets to show.",
      href: resolved ? `/support?issue=${resolved.id}` : "/support",
      technical: resolved?.changesMade,
    };
  }

  if (q.includes("reopen")) {
    return {
      title: "Reopen an issue",
      body: "Open Support, select the ticket, and choose Reopen Issue. Alph will escalate it back to the Transpo.ai team.",
      href: "/support",
    };
  }

  if (q.includes("why") || q.includes("not working") || q.includes("fix")) {
    const top = open[0];
    return {
      title: top ? top.title : "Everything looks stable",
      body: top
        ? `${top.humanMessage} Status: ${top.status.replaceAll("_", " ")}. ${top.workaround ? `Temporary option: ${top.workaround}` : "Alph can attempt a safe repair or escalate."}`
        : "Alph does not see an open problem on your account right now.",
      href: top ? `/support?issue=${top.id}` : "/support",
      technical: top ? `diagnosis=${top.alphDiagnosis}; attempts=${top.repairAttempts.length}` : undefined,
    };
  }

  if (q.includes("missing")) {
    const missing = setup.steps.filter((s) => s.status === "missing" || s.status === "needs_review");
    return {
      title: "Missing information",
      body:
        missing.length > 0
          ? `Still needed: ${missing.map((m) => m.title).join(", ")}.`
          : "No missing setup fields are flagged.",
      href: "/setup",
    };
  }

  return {
    title: "Alph Help",
    body: "Ask about setup, ELD sync, invoices, documents, or whether an issue was resolved. Open Support to see live tickets.",
    href: "/support",
  };
}
