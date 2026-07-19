import { redirect } from "next/navigation";

/** Canonical settings entry for company AI preferences. */
export default function SettingsAiPolicyPage() {
  redirect("/settings?section=ai-policy");
}
