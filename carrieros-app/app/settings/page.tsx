import PageHeader from "@/components/PageHeader";
import NovaAlert from "@/components/NovaAlert";
import { getCurrentSession } from "@/lib/auth/session";

export default function SettingsPage() {
  const session = getCurrentSession();

  return (
    <>
      <PageHeader
        title="Settings"
        subtitle="Alpha placeholder for workspace, users, roles, permissions, and preferences."
      />
      <NovaAlert
        title="Alpha Placeholder"
        message={`Settings is labeled as a future alpha area. Current placeholder role: ${session.role}. No production user management is enabled yet.`}
        actionHref="/"
        actionLabel="Back to Command Center"
      />
    </>
  );
}
