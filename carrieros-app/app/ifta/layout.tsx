import FinanceWorkspaceSubNav from "@/components/finance/FinanceWorkspaceSubNav";

export default function IftaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      <FinanceWorkspaceSubNav />
      {children}
    </div>
  );
}
