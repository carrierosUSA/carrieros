import Link from "next/link";
import {
  CONSTITUTION_CANONICAL_NOTICE,
  CONSTITUTION_DOCS,
  CONSTITUTION_INDEX_PATH,
  MASTER_CONSTITUTION_AI_MAY,
  MASTER_CONSTITUTION_AI_MUST_NEVER,
  MASTER_CONSTITUTION_CONFIDENCE,
  MASTER_CONSTITUTION_CONFLICT,
  MASTER_CONSTITUTION_CORE_PRINCIPLES,
  MASTER_CONSTITUTION_CUSTOMER_CONTROL,
  MASTER_CONSTITUTION_DESIGN_PHILOSOPHY,
  MASTER_CONSTITUTION_DOCUMENT_IMPORT,
  MASTER_CONSTITUTION_ENGINEERING_STANDARD,
  MASTER_CONSTITUTION_FILE,
  MASTER_CONSTITUTION_FINAL_RULE,
  MASTER_CONSTITUTION_IMPORT_FEATURES,
  MASTER_CONSTITUTION_INTEGRATIONS,
  MASTER_CONSTITUTION_LOW_MAINTENANCE,
  MASTER_CONSTITUTION_MIGRATION_HREF,
  MASTER_CONSTITUTION_MIGRATION_IMPORTS,
  MASTER_CONSTITUTION_MISSION,
  MASTER_CONSTITUTION_MISSION_STATEMENT,
  MASTER_CONSTITUTION_OVERRIDE,
  MASTER_CONSTITUTION_POST_IMPORT_AI,
  MASTER_CONSTITUTION_PRIORITIES,
  MASTER_CONSTITUTION_PRODUCT_VISION,
  MASTER_CONSTITUTION_ROLE,
  MASTER_CONSTITUTION_SECURITY,
  MASTER_CONSTITUTION_SMART_IMPORT,
  MASTER_CONSTITUTION_TAGLINE,
  MASTER_CONSTITUTION_TITLE,
  MASTER_CONSTITUTION_VERSION,
  MASTER_CONSTITUTION_WHEN_UNCERTAIN,
  PERMANENT_CONSTITUTION_FILE,
  PERMANENT_CONSTITUTION_TAGLINE,
  PERMANENT_CONSTITUTION_TITLE,
} from "@/lib/constitution";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[16px] bg-[#F8FAFC] px-5 py-5 sm:px-6">
      <h3 className="text-[15px] font-semibold tracking-[-0.01em] text-[#0F172A]">
        {title}
      </h3>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function BulletList({ items }: { items: readonly string[] }) {
  return (
    <ul className="space-y-1.5">
      {items.map((item) => (
        <li
          key={item}
          className="text-[14px] leading-relaxed text-[#475569]"
        >
          {item}
        </li>
      ))}
    </ul>
  );
}

export default function GovernanceClient() {
  const otherDocs = CONSTITUTION_DOCS.filter(
    (d) => d.id !== "master-constitution",
  );

  return (
    <div className="space-y-10">
      <section
        id="master-constitution"
        className="scroll-mt-24 space-y-6 rounded-[20px] bg-white px-5 py-6 sm:px-8 sm:py-8"
      >
        <div>
          <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-[#2563EB]">
            Rank 01 · Highest authority · v{MASTER_CONSTITUTION_VERSION}
          </p>
          <h2 className="mt-2 text-[22px] font-bold tracking-[-0.03em] text-[#0F172A] sm:text-[26px]">
            {MASTER_CONSTITUTION_TITLE}
          </h2>
          <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-[#475569]">
            {MASTER_CONSTITUTION_TAGLINE} {CONSTITUTION_CANONICAL_NOTICE}
          </p>
          <p className="mt-2 text-[13px] text-[#64748B]">
            Canonical:{" "}
            <span className="font-medium text-[#334155]">
              {MASTER_CONSTITUTION_FILE}
            </span>{" "}
            · Index:{" "}
            <span className="font-medium text-[#334155]">
              {CONSTITUTION_INDEX_PATH}
            </span>
          </p>
        </div>

        <Section title="Conflict protocol">
          <p className="mb-3 text-[14px] leading-relaxed text-[#334155]">
            If a request conflicts with this Constitution, do not implement it
            directly. Instead:
          </p>
          <BulletList items={MASTER_CONSTITUTION_CONFLICT} />
          <p className="mt-3 text-[14px] font-semibold text-[#0F172A]">
            {MASTER_CONSTITUTION_OVERRIDE}
          </p>
        </Section>

        <Section title="Role">
          <p className="text-[14px] leading-relaxed text-[#475569]">
            {MASTER_CONSTITUTION_ROLE}
          </p>
        </Section>

        <Section title="Priorities">
          <BulletList items={MASTER_CONSTITUTION_PRIORITIES} />
        </Section>

        <Section title="Mission">
          <BulletList items={MASTER_CONSTITUTION_MISSION} />
        </Section>

        <Section title="Core principles">
          <BulletList items={MASTER_CONSTITUTION_CORE_PRINCIPLES} />
        </Section>

        <Section title="Product vision">
          <BulletList items={MASTER_CONSTITUTION_PRODUCT_VISION} />
        </Section>

        <div className="grid gap-4 lg:grid-cols-2">
          <Section title="AI may">
            <BulletList items={MASTER_CONSTITUTION_AI_MAY} />
          </Section>
          <Section title="AI must never">
            <BulletList items={MASTER_CONSTITUTION_AI_MUST_NEVER} />
          </Section>
        </div>

        <Section title="When AI is uncertain">
          <BulletList items={MASTER_CONSTITUTION_WHEN_UNCERTAIN} />
        </Section>

        <Section title="Confidence levels">
          <BulletList items={MASTER_CONSTITUTION_CONFIDENCE} />
        </Section>

        <Section title="Engineering standard">
          <p className="mb-2 text-[14px] leading-relaxed text-[#475569]">
            Every feature must be — and every implementation should reduce
            clicks, repetitive work, and maintenance:
          </p>
          <BulletList items={MASTER_CONSTITUTION_ENGINEERING_STANDARD} />
        </Section>

        <Section title="Design philosophy">
          <BulletList items={MASTER_CONSTITUTION_DESIGN_PHILOSOPHY} />
        </Section>

        <Section title="Security">
          <p className="mb-2 text-[14px] leading-relaxed text-[#475569]">
            Never expose sensitive information.
          </p>
          <BulletList items={MASTER_CONSTITUTION_SECURITY} />
        </Section>

        <Section title="Connected platform">
          <p className="mb-2 text-[14px] leading-relaxed text-[#475569]">
            Prefer integrations over manual entry whenever possible.
          </p>
          <BulletList items={MASTER_CONSTITUTION_INTEGRATIONS} />
        </Section>

        <Section title="AI Migration Center">
          <p className="mb-2 text-[14px] leading-relaxed text-[#475569]">
            Constitutional product requirement. Enterprise migration so
            customers never feel like starting from zero. AI assists; humans
            preview, confirm, and control every import.
          </p>
          <BulletList items={MASTER_CONSTITUTION_MIGRATION_IMPORTS} />
          <div className="mt-3">
            <Link
              href={MASTER_CONSTITUTION_MIGRATION_HREF}
              className="inline-flex h-10 items-center rounded-[12px] bg-[#2563EB] px-4 text-[14px] font-semibold text-white transition hover:bg-[#1D4ED8]"
            >
              Open Migration Center
            </Link>
          </div>
        </Section>

        <Section title="Smart AI import">
          <BulletList items={MASTER_CONSTITUTION_SMART_IMPORT} />
        </Section>

        <Section title="Document import">
          <BulletList items={MASTER_CONSTITUTION_DOCUMENT_IMPORT} />
        </Section>

        <Section title="Import features">
          <BulletList items={MASTER_CONSTITUTION_IMPORT_FEATURES} />
        </Section>

        <Section title="Post-import AI">
          <p className="mb-2 text-[14px] leading-relaxed text-[#475569]">
            Assistive summaries and recommendations — never approvals or
            decisions.
          </p>
          <BulletList items={MASTER_CONSTITUTION_POST_IMPORT_AI} />
        </Section>

        <Section title="Low maintenance">
          <BulletList items={MASTER_CONSTITUTION_LOW_MAINTENANCE} />
        </Section>

        <Section title="Customer control">
          <BulletList items={MASTER_CONSTITUTION_CUSTOMER_CONTROL} />
        </Section>

        <Section title="Long term thinking">
          <p className="text-[14px] leading-relaxed text-[#475569]">
            Every feature should still make sense ten years from now. Build
            Transpo.ai as enterprise software trusted by trucking companies
            worldwide.
          </p>
        </Section>

        <Section title="Final rule">
          <p className="mb-2 text-[14px] leading-relaxed text-[#475569]">
            Before implementing any feature ask — if the answer is NO, stop,
            explain, and recommend a better architecture:
          </p>
          <BulletList items={MASTER_CONSTITUTION_FINAL_RULE} />
        </Section>

        <Section title="Mission statement">
          <BulletList items={MASTER_CONSTITUTION_MISSION_STATEMENT} />
        </Section>
      </section>

      <section className="space-y-4">
        <h2 className="text-[17px] font-semibold tracking-[-0.02em] text-[#0F172A]">
          Supporting constitution documents
        </h2>
        <ol className="space-y-3">
          {otherDocs.map((doc) => (
            <li
              key={doc.id}
              id={doc.id}
              className="scroll-mt-24 rounded-[20px] bg-white px-5 py-5 sm:px-6"
            >
              <div className="flex flex-wrap items-baseline gap-3">
                <span className="text-[13px] font-semibold tabular-nums text-[#2563EB]">
                  {String(doc.rank).padStart(2, "0")}
                </span>
                <h3 className="text-[16px] font-semibold tracking-[-0.02em] text-[#0F172A]">
                  {doc.title}
                </h3>
              </div>
              <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-[#475569]">
                {doc.summary}
              </p>
              <p className="mt-1 text-[13px] text-[#64748B]">
                Canonical:{" "}
                <span className="font-medium text-[#334155]">{doc.file}</span>
              </p>
              <div className="mt-3">
                <Link
                  href={doc.href}
                  className="inline-flex h-10 items-center rounded-[12px] bg-[#2563EB] px-4 text-[14px] font-semibold text-white transition hover:bg-[#1D4ED8]"
                >
                  Open in product
                </Link>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section
        id="permanent-constitution-appendix"
        className="scroll-mt-24 rounded-[20px] bg-white px-5 py-5 sm:px-6"
      >
        <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-[#64748B]">
          Historical appendix
        </p>
        <h3 className="mt-2 text-[16px] font-semibold tracking-[-0.02em] text-[#0F172A]">
          {PERMANENT_CONSTITUTION_TITLE}
        </h3>
        <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-[#475569]">
          {PERMANENT_CONSTITUTION_TAGLINE}
        </p>
        <p className="mt-1 text-[13px] text-[#64748B]">
          Canonical:{" "}
          <span className="font-medium text-[#334155]">
            {PERMANENT_CONSTITUTION_FILE}
          </span>
        </p>
      </section>
    </div>
  );
}
