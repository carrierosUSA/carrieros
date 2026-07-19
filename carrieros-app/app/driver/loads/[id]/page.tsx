import { redirect } from "next/navigation";

type PageProps = {
  params: Promise<{ id: string }>;
};

/** Legacy path — redirect into Trips */
export default async function DriverLoadRedirect({ params }: PageProps) {
  const { id } = await params;
  redirect(`/driver/trips/${id}`);
}
