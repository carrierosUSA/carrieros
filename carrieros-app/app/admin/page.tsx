import { Suspense } from "react";
import AdminShell from "@/components/admin/AdminShell";
import AdminSkeleton from "@/components/admin/AdminSkeleton";

export default function AdminPage() {
  return (
    <Suspense fallback={<AdminSkeleton />}>
      <AdminShell />
    </Suspense>
  );
}
