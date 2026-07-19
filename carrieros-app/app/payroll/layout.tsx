import FinanceWorkspaceSubNav from "@/components/finance/FinanceWorkspaceSubNav";

export default function PayrollLayout({
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
