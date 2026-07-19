import {
  ELD_REJECTION_REASON_LABELS,
  ELD_REQUEST_STATUS_LABELS,
  ELD_REQUEST_STATUS_ORDER,
  type EldIntegrationRequest,
  type EldRequestStatus,
} from "@/lib/eld/types";

type EldRequestStatusTimelineProps = {
  request: EldIntegrationRequest;
};

function stepReached(
  request: EldIntegrationRequest,
  step: EldRequestStatus,
): boolean {
  if (request.status === "rejected") {
    const submittedIdx = ELD_REQUEST_STATUS_ORDER.indexOf("submitted");
    const stepIdx = ELD_REQUEST_STATUS_ORDER.indexOf(step);
    const lastOpen = request.statusHistory
      .map((h) => h.status)
      .filter((s) => s !== "rejected")
      .pop();
    const lastIdx = lastOpen
      ? ELD_REQUEST_STATUS_ORDER.indexOf(lastOpen)
      : submittedIdx;
    return stepIdx <= Math.max(submittedIdx, lastIdx);
  }
  const currentIdx = ELD_REQUEST_STATUS_ORDER.indexOf(request.status);
  const stepIdx = ELD_REQUEST_STATUS_ORDER.indexOf(step);
  return stepIdx <= currentIdx;
}

export default function EldRequestStatusTimeline({
  request,
}: EldRequestStatusTimelineProps) {
  return (
    <div className="space-y-4">
      <ol className="space-y-0">
        {ELD_REQUEST_STATUS_ORDER.map((step, index) => {
          const reached = stepReached(request, step);
          const current = request.status === step;
          const history = request.statusHistory.find((h) => h.status === step);
          return (
            <li key={step} className="flex gap-3">
              <div className="flex flex-col items-center">
                <span
                  className={`mt-0.5 h-2.5 w-2.5 rounded-full ${
                    current
                      ? "bg-[#2563EB]"
                      : reached
                        ? "bg-[#16A34A]"
                        : "bg-[#E2E8F0]"
                  }`}
                />
                {index < ELD_REQUEST_STATUS_ORDER.length - 1 ? (
                  <span
                    className={`my-1 w-px flex-1 min-h-[20px] ${
                      reached ? "bg-[#BBF7D0]" : "bg-[#E2E8F0]"
                    }`}
                  />
                ) : null}
              </div>
              <div className="pb-4">
                <p
                  className={`text-[13px] font-semibold ${
                    current
                      ? "text-[#2563EB]"
                      : reached
                        ? "text-slate-800"
                        : "text-slate-400"
                  }`}
                >
                  {ELD_REQUEST_STATUS_LABELS[step]}
                </p>
                {history ? (
                  <p className="mt-0.5 text-[12px] text-slate-500">
                    {new Date(history.at).toLocaleString()}
                    {history.note ? ` · ${history.note}` : ""}
                  </p>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>

      {request.status === "rejected" ? (
        <div className="rounded-[12px] bg-[#FEF2F2] px-4 py-3 text-[13px] text-[#991B1B]">
          <p className="font-semibold">Rejected</p>
          <p className="mt-1">
            {request.rejectionReason
              ? ELD_REJECTION_REASON_LABELS[request.rejectionReason]
              : "This request was rejected."}
            {request.rejectionDetail ? ` — ${request.rejectionDetail}` : ""}
          </p>
        </div>
      ) : null}
    </div>
  );
}
