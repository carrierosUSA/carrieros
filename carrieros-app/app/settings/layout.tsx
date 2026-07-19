import SettingsWorkspaceNav from "@/components/settings/SettingsWorkspaceNav";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      <SettingsWorkspaceNav />
      {children}
    </div>
  );
}
