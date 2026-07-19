import { redirect } from "next/navigation";

type PageProps = { params: Promise<{ id: string }> };

export default async function DriverAssignmentRedirect({ params }: PageProps) {
  const { id } = await params;
  redirect(`/drivers/${id}?tab=loads`);
}
