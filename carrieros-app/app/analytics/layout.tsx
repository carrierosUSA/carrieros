import ReportsSubNav from "@/components/reports/ReportsSubNav";

export default function AnalyticsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      <ReportsSubNav />
      {children}
    </div>
  );
}
