import PermissionsSettingsClient from "@/components/permissions/PermissionsSettingsClient";

type PageProps = {
  searchParams: Promise<{ tab?: string }>;
};

function parseTab(value: string | undefined): "roles" | "users" | "audit" {
  if (value === "users" || value === "audit" || value === "roles") return value;
  return "roles";
}

export default async function PermissionsSettingsPage({
  searchParams,
}: PageProps) {
  const params = await searchParams;
  return <PermissionsSettingsClient initialTab={parseTab(params.tab)} />;
}
