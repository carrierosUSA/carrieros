import type { Load } from "@/lib/types";

export type AlphFixAction =
  | "callDriver"
  | "messageDriver"
  | "openTracking"
  | "requestPod"
  | "emailBroker"
  | "uploadDocument"
  | "requestFromDriver"
  | "requestFromBroker"
  | "markException"
  | "ignoreIssue";

export type AlphIssueSeverity = "warning" | "critical";

export type AlphIssue = {
  id: string;
  severity: AlphIssueSeverity;
  message: string;
  fixLabel: string;
  fixAction: AlphFixAction;
  viewTarget?: string;
};

export type AlphUrgency = "normal" | "urgent" | "critical";

export type AlphIssueContext = {
  load: Load;
  hasPod: boolean;
  hasDriver: boolean;
  isReefer: boolean;
  isLate: boolean;
};

function hashIndex(seed: string, size: number): number {
  let hash = 0;

  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash + seed.charCodeAt(index) * (index + 1)) % size;
  }

  return hash;
}

function isActiveLoad(status: Load["status"]): boolean {
  return (
    status === "dispatched" ||
    status === "picked_up" ||
    status === "in_transit"
  );
}

function getCheckInHoursAgo(loadId: string): number {
  if (loadId === "load-24019") {
    return 3;
  }

  if (loadId === "load-24010") {
    return 4;
  }

  return 1 + hashIndex(`${loadId}-checkin`, 5);
}

function getTemperatureStaleHours(loadId: string): number {
  if (loadId === "load-24019") {
    return 2;
  }

  return 1 + hashIndex(`${loadId}-temp`, 4);
}

function brokerRequestedPod(load: Load, hasPod: boolean): boolean {
  if (hasPod || load.status === "pending" || load.status === "cancelled") {
    return false;
  }

  if (load.status === "delivered" && load.complianceStatus === "attention") {
    return true;
  }

  if (load.status === "in_transit" && hashIndex(`${load.id}-broker-pod`, 5) === 0) {
    return true;
  }

  return load.id === "load-24013";
}

function detectMissedCheckIn(context: AlphIssueContext): AlphIssue | null {
  const { load, hasDriver } = context;

  if (!hasDriver || !isActiveLoad(load.status)) {
    return null;
  }

  const hoursAgo = getCheckInHoursAgo(load.id);

  if (hoursAgo < 3) {
    return null;
  }

  return {
    id: "check-in-missed",
    severity: hoursAgo >= 4 ? "critical" : "warning",
    message: `Driver hasn't checked in for ${hoursAgo} hours`,
    fixLabel: "Fix Now",
    fixAction: "callDriver",
    viewTarget: "load-tracking",
  };
}

function detectLateEta(context: AlphIssueContext): AlphIssue | null {
  const { load, isLate } = context;

  if (!isLate || !isActiveLoad(load.status)) {
    return null;
  }

  return {
    id: "eta-late",
    severity: "warning",
    message: "ETA may be late",
    fixLabel: "Fix Now",
    fixAction: "openTracking",
    viewTarget: "load-tracking",
  };
}

function detectStaleTemperature(context: AlphIssueContext): AlphIssue | null {
  const { load, isReefer } = context;

  if (!isReefer || load.status !== "in_transit") {
    return null;
  }

  const hoursAgo = getTemperatureStaleHours(load.id);

  if (hoursAgo < 2) {
    return null;
  }

  return {
    id: "temperature-stale",
    severity: hoursAgo >= 3 ? "critical" : "warning",
    message: "Temperature not updated",
    fixLabel: "Fix Now",
    fixAction: "messageDriver",
    viewTarget: "load-tracking",
  };
}

function detectBrokerPodRequest(context: AlphIssueContext): AlphIssue | null {
  const { load, hasPod } = context;

  if (!brokerRequestedPod(load, hasPod)) {
    return null;
  }

  return {
    id: "broker-pod-request",
    severity: "critical",
    message: "Broker requested POD",
    fixLabel: "Fix Now",
    fixAction: "requestPod",
    viewTarget: "load-carrier-documents",
  };
}

function detectMissingPod(context: AlphIssueContext): AlphIssue | null {
  const { load, hasPod } = context;

  if (
    hasPod ||
    load.status === "pending" ||
    load.status === "cancelled" ||
    brokerRequestedPod(load, hasPod)
  ) {
    return null;
  }

  if (load.status === "delivered" || load.status === "in_transit") {
    return {
      id: "pod-missing",
      severity: "warning",
      message: "POD missing",
      fixLabel: "Fix Now",
      fixAction: "requestPod",
      viewTarget: "load-carrier-documents",
    };
  }

  return null;
}

const ISSUE_DETECTORS = [
  detectMissedCheckIn,
  detectLateEta,
  detectStaleTemperature,
  detectBrokerPodRequest,
  detectMissingPod,
] as const;

export function detectAlphIssues(context: AlphIssueContext): AlphIssue[] {
  const issues: AlphIssue[] = [];
  const seen = new Set<string>();

  for (const detect of ISSUE_DETECTORS) {
    const issue = detect(context);

    if (issue && !seen.has(issue.id)) {
      seen.add(issue.id);
      issues.push(issue);
    }
  }

  return issues.sort((left, right) => {
    if (left.severity === right.severity) {
      return 0;
    }

    return left.severity === "critical" ? -1 : 1;
  });
}

export function getAlphUrgency(issues: AlphIssue[]): AlphUrgency {
  if (issues.some((issue) => issue.severity === "critical")) {
    return "critical";
  }

  if (issues.length > 0) {
    return "urgent";
  }

  return "normal";
}

/** @deprecated Use detectAlphIssues instead */
export type AlphSuggestion = {
  id: string;
  icon: "warning" | "success";
  message: string;
  viewTarget?: string;
};

/** @deprecated Use detectAlphIssues instead */
export function buildAlphSuggestions(
  load: Load,
  hasPod: boolean,
  isLate: boolean,
): AlphSuggestion[] {
  const issues = detectAlphIssues({
    load,
    hasPod,
    hasDriver: Boolean(load.driverId),
    isReefer: load.customerId === "customer-gulf-foods",
    isLate,
  });

  return issues.map((issue) => ({
    id: issue.id,
    icon: "warning" as const,
    message: issue.message,
    viewTarget: issue.viewTarget,
  }));
}
