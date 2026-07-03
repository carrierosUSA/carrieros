import PageHeader from "@/components/PageHeader";
import NovaAlert from "@/components/NovaAlert";

export default function AnalyticsPage() {
  return (
    <>
      <PageHeader
        title="Analytics"
        subtitle="Alpha placeholder for performance, revenue, profit, and business insights."
      />
      <NovaAlert
        title="Alpha Placeholder"
        message="Analytics is intentionally labeled as a future alpha area. Use Command Center, Dispatch, Documents, and Finance Alpha for today's test workflow."
        actionHref="/"
        actionLabel="Back to Command Center"
      />
    </>
  );
}
