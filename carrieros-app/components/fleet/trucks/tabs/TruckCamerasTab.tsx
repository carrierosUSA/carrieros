import { CARRIEROS_COLORS } from "@/lib/design-system/colors";
import type { TruckCameraChannel } from "@/lib/types";

type TruckCamerasTabProps = {
  cameras: TruckCameraChannel[];
  providerLabel: string;
};

export default function TruckCamerasTab({
  cameras,
  providerLabel,
}: TruckCamerasTabProps) {
  return (
    <div className="space-y-4">
      <p className="text-[14px] text-slate-600">
        Camera channels via {providerLabel}. Live video connects when a telematics
        adapter is configured.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        {cameras.map((camera) => (
          <div
            key={camera.id}
            className="overflow-hidden rounded-[16px] bg-white ring-1 ring-[#EAEAEA]"
          >
            <div className="flex h-36 items-center justify-center bg-gradient-to-br from-[#EFF6FF] via-[#F8FAFC] to-[#EEF2FF]">
              <p className="text-[13px] font-semibold text-slate-500">
                {camera.online ? "Camera ready" : "Offline"}
              </p>
            </div>
            <div className="flex items-center justify-between gap-3 px-4 py-3">
              <div>
                <p className="text-[14px] font-semibold text-slate-950">
                  {camera.label}
                </p>
                <p className="text-[12px] text-slate-500 capitalize">
                  {camera.position}
                  {camera.lastFrameAt
                    ? ` · ${new Date(camera.lastFrameAt).toLocaleString()}`
                    : ""}
                </p>
              </div>
              <span
                className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${
                  camera.online
                    ? `${CARRIEROS_COLORS.success.bg} ${CARRIEROS_COLORS.success.text} ${CARRIEROS_COLORS.success.border}`
                    : `${CARRIEROS_COLORS.disabled.bg} ${CARRIEROS_COLORS.disabled.text} ${CARRIEROS_COLORS.disabled.border}`
                }`}
              >
                {camera.online ? "Online" : "Offline"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
