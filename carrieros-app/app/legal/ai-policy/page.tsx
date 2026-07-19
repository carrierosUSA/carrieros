import { redirect } from "next/navigation";
import { AI_POLICY_HREF } from "@/lib/ai-safety";

/** Canonical policy lives under Platform; keep /legal as a stable alias. */
export default function LegalAiPolicyPage() {
  redirect(AI_POLICY_HREF);
}
