import { redirect } from "next/navigation";

type PageProps = { params: Promise<{ id: string }> };

export default async function DriverDocumentsRedirect({ params }: PageProps) {
  const { id } = await params;
  redirect(`/drivers/${id}?tab=documents`);
}
