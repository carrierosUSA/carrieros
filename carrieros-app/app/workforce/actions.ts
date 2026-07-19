"use server";

import {
  applyToJob,
  createJob,
  scheduleInterview,
  sendThreadMessage,
  toggleOnboardingItem,
  updateApplicationStatus,
  updateJob,
} from "@/lib/data/workforce-store";
import type {
  ApplicationStatus,
  InterviewType,
  JobPosting,
  ProfessionalRole,
} from "@/lib/types/workforce";

export async function createJobAction(formData: FormData) {
  const companyId = String(formData.get("companyId") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const role = String(formData.get("role") ?? "cdl_driver") as ProfessionalRole;
  const region = String(formData.get("region") ?? "United States");
  const homeTime = String(formData.get("homeTime") ?? "Flexible");

  if (!companyId || !title || !description) {
    return { ok: false as const, error: "Company, title, and description are required." };
  }

  const job = createJob({
    companyId,
    title,
    role,
    description,
    requirements: ["Relevant experience", "Pass required screens"],
    benefits: ["Competitive pay", "Supportive team"],
    equipment: role === "cdl_driver" ? ["dry_van"] : [],
    payUnit: role === "cdl_driver" ? "cpm" : "salary",
    payMin: role === "cdl_driver" ? 0.6 : 55000,
    payMax: role === "cdl_driver" ? 0.7 : 85000,
    homeTime,
    region,
    routeType: "regional",
    teamOrSolo: "solo",
    experienceYears: 1,
    hiringRadiusMiles: 100,
    languages: ["English"],
    schedule: "Standard",
    employmentType: "full_time",
    remote: false,
    status: "open",
  });

  return { ok: true as const, job };
}

export async function applyToJobAction(jobId: string, candidateId: string) {
  const app = applyToJob(jobId, candidateId);
  if (!app) return { ok: false as const, error: "Could not apply." };
  return { ok: true as const, application: app };
}

export async function updateApplicationStatusAction(
  id: string,
  status: ApplicationStatus,
) {
  const app = updateApplicationStatus(id, status);
  if (!app) return { ok: false as const, error: "Application not found." };
  return { ok: true as const, application: app };
}

export async function scheduleInterviewAction(input: {
  applicationId: string;
  jobId: string;
  candidateId: string;
  companyId: string;
  type: InterviewType;
  scheduledAt: string;
  durationMinutes: number;
  interviewer: string;
  meetingUrl?: string;
  location?: string;
  notes?: string;
}) {
  if (!input.scheduledAt || !input.interviewer.trim()) {
    return { ok: false as const, error: "Schedule time and interviewer are required." };
  }
  const interview = scheduleInterview({
    ...input,
    notes: input.notes ?? "",
    durationMinutes: input.durationMinutes || 45,
  });
  return { ok: true as const, interview };
}

export async function toggleOnboardingItemAction(
  checklistId: string,
  itemId: string,
) {
  const list = toggleOnboardingItem(checklistId, itemId);
  if (!list) return { ok: false as const, error: "Checklist not found." };
  return { ok: true as const, checklist: list };
}

export async function sendMessageAction(threadId: string, body: string) {
  if (!body.trim()) return { ok: false as const, error: "Message cannot be empty." };
  const msg = sendThreadMessage(threadId, body.trim());
  if (!msg) return { ok: false as const, error: "Thread not found." };
  return { ok: true as const, message: msg };
}

export async function updateJobAction(id: string, patch: Partial<JobPosting>) {
  const job = updateJob(id, patch);
  if (!job) return { ok: false as const, error: "Job not found." };
  return { ok: true as const, job };
}
