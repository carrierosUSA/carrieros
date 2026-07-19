import Link from "next/link";
import WorkforceStatusBadge from "@/components/workforce/WorkforceStatusBadge";
import type {
  ProfessionalProfile,
  TrainingCourse,
  TrainingProgress,
} from "@/lib/types/workforce";
import { PROFESSIONAL_ROLE_LABELS } from "@/lib/types/workforce";
import { candidateFullName } from "@/lib/workforce/board";
import { TRANSPO_COLORS } from "@/lib/design-system/colors";

export default function TrainingClient({
  courses,
  progress,
  candidates,
}: {
  courses: TrainingCourse[];
  progress: TrainingProgress[];
  candidates: ProfessionalProfile[];
}) {
  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <h2 className="text-[15px] font-semibold text-[#111827]">Courses</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {courses.map((course) => (
            <div key={course.id} className="rounded-[16px] bg-[#F8F9FB] p-4">
              <p className="text-[15px] font-semibold text-[#111827]">{course.title}</p>
              <p className="mt-1 text-[13px] text-[#6B7280]">
                {course.category} · {course.durationHours}h
              </p>
              <p className="mt-2 text-[14px] text-[#334155]">{course.description}</p>
              <p className="mt-3 text-[12px] text-[#6B7280]">
                For:{" "}
                {course.requiredForRoles
                  .map((r) => PROFESSIONAL_ROLE_LABELS[r])
                  .join(", ")}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-[15px] font-semibold text-[#111827]">Progress</h2>
        <div className="space-y-2">
          {progress.map((p) => {
            const course = courses.find((c) => c.id === p.courseId);
            const candidate = candidates.find((c) => c.id === p.candidateId);
            return (
              <div
                key={p.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-[12px] bg-[#F8F9FB] px-4 py-3"
              >
                <div>
                  <p className="text-[14px] font-semibold text-[#111827]">
                    {course?.title}
                  </p>
                  <p className="text-[13px] text-[#6B7280]">
                    {candidate ? (
                      <Link
                        href={`/workforce/candidates/${candidate.id}`}
                        className="text-[#2563EB]"
                      >
                        {candidateFullName(candidate)}
                      </Link>
                    ) : (
                      "Candidate"
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-28">
                    <div className="h-1.5 overflow-hidden rounded-full bg-white">
                      <div
                        className="h-full rounded-full bg-[#2563EB]"
                        style={{ width: `${p.progress}%` }}
                      />
                    </div>
                    <p className={`mt-1 text-[12px] font-medium ${TRANSPO_COLORS.info.text}`}>
                      {p.progress}%
                    </p>
                  </div>
                  <WorkforceStatusBadge status={p.status} />
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
