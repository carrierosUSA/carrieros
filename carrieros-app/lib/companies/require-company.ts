import { notFound } from "next/navigation";
import { getCompanyById } from "@/lib/data/companies";
import type { DirectoryCompany } from "@/lib/types/company";

export function requireCompany(id: string): DirectoryCompany {
  const company = getCompanyById(id);

  if (!company) {
    notFound();
  }

  return company;
}
