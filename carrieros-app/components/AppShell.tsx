import Sidebar from "@/components/Sidebar";

type AppShellProps = {
  children: React.ReactNode;
};

export default function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Sidebar />
      <main className="min-h-screen px-4 py-6 sm:px-6 lg:ml-72 lg:px-10 lg:py-10">
        {children}
      </main>
    </div>
  );
}
