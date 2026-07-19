import AlphCopilotHome from "@/components/alph-copilot/AlphCopilotHome";
import { getCurrentSession } from "@/lib/auth/session";

export default function AlphCopilotHomePage() {
  const session = getCurrentSession();

  return (
    <AlphCopilotHome sessionRole={session.role} userName={session.name} />
  );
}
