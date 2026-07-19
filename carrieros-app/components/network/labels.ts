import type { CommunityPostKind } from "@/lib/network/types";

export const COMMUNITY_POST_KIND_LABEL: Record<CommunityPostKind, string> = {
  update: "Update",
  news: "News",
  hiring: "Hiring",
  promotion: "Promotion",
  training: "Training",
  webinar: "Webinar",
  education: "Education",
};
