import Link from "next/link";
import DirectoryCard from "@/components/network/DirectoryCard";
import EmptyState from "@/components/ui/EmptyState";
import type { NetworkMember } from "@/lib/network/types";
import type { BusinessPassport } from "@/lib/network/types";

export default function BusinessListClient({
  companies,
  passports,
}: {
  companies: NetworkMember[];
  passports: BusinessPassport[];
}) {
  if (!companies.length) {
    return (
      <EmptyState
        title="No business passports yet"
        description="Verified companies appear here with authority, insurance, and trust signals."
        actionLabel="Browse directory"
        actionHref="/network/directory"
      />
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-[14px] text-[#6B7280]">
        Business Passports show company timeline, DOT/MC, fleet, safety, insurance,
        and verified partner signals — decision support only.
      </p>
      <div className="grid gap-3 lg:grid-cols-2">
        {companies.map((c) => {
          const passport = passports.find((p) => p.memberId === c.id);
          return (
            <div key={c.id} className="space-y-2">
              <DirectoryCard member={c} />
              {passport ? (
                <div className="flex flex-wrap gap-3 px-1 text-[12px] text-[#64748B]">
                  {passport.dotNumber ? <span>{passport.dotNumber}</span> : null}
                  {passport.mcNumber ? <span>{passport.mcNumber}</span> : null}
                  <span>{passport.fleetSize} trucks</span>
                  <span>{passport.yearsInBusiness} yrs in business</span>
                  <Link
                    href={`/network/business/${c.id}`}
                    className="font-medium text-[#2563EB]"
                  >
                    Full Business Passport
                  </Link>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
