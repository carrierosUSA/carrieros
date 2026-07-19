import DirectoryCard from "@/components/network/DirectoryCard";
import EmptyState from "@/components/ui/EmptyState";
import type { NetworkMember, ProfessionalPassport } from "@/lib/network/types";

export default function ProfessionalListClient({
  people,
  passports,
}: {
  people: NetworkMember[];
  passports: ProfessionalPassport[];
}) {
  if (!people.length) {
    return (
      <EmptyState
        title="No professional passports"
        description="Drivers, dispatchers, mechanics, and other professionals appear here."
        actionLabel="Browse directory"
        actionHref="/network/directory"
      />
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-[14px] text-[#6B7280]">
        Career Passports reuse Professional Wallet employment, skills, and badges when
        linked — permanent verified professional identity.
      </p>
      <div className="grid gap-3 lg:grid-cols-2">
        {people.map((p) => {
          const passport = passports.find((x) => x.memberId === p.id);
          return (
            <div key={p.id} className="space-y-2">
              <DirectoryCard member={p} />
              {passport?.walletPassportLinked ? (
                <p className="px-1 text-[12px] font-medium text-[#2563EB]">
                  Synced with Professional Wallet Career Passport
                </p>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
