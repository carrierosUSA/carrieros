import Link from "next/link";
import { Video } from "lucide-react";

const CAMERAS = [
  { id: "front", label: "Front Camera", online: true },
  { id: "cabin", label: "Cabin Camera", online: true },
  { id: "trailer", label: "Trailer Camera", online: true },
  { id: "rear", label: "Rear Camera", online: false },
] as const;

type LoadDetailCameraGridProps = {
  loadId: string;
};

function CameraStatusDot({ online }: { online: boolean }) {
  return (
    <span
      className={`h-1.5 w-1.5 shrink-0 rounded-full ${
        online
          ? "bg-emerald-500 shadow-[0_0_4px_rgba(16,185,129,0.8)]"
          : "bg-slate-300"
      }`}
      aria-hidden
    />
  );
}

export default function LoadDetailCameraGrid({ loadId }: LoadDetailCameraGridProps) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {CAMERAS.map((camera) => (
        <Link
          key={camera.id}
          href={`/loads/${loadId}/tracking?view=cameras&cam=${camera.id}`}
          aria-label={`Open ${camera.label} live stream`}
          className="group flex cursor-pointer flex-col gap-1.5 rounded-lg border border-[#EAEAEA] bg-gradient-to-b from-white to-slate-50/80 px-2.5 py-2.5 shadow-sm transition-[border-color,box-shadow,background-color,transform] hover:-translate-y-px hover:border-[#1E3A8A]/40 hover:from-[#F8FBFF] hover:to-blue-50/40 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E3A8A] active:translate-y-0 active:shadow-sm"
        >
          <div className="flex items-center justify-between gap-1">
            <Video
              className="h-3.5 w-3.5 text-slate-400 transition-colors group-hover:text-[#1E3A8A]"
              strokeWidth={2.25}
              aria-hidden
            />
            <CameraStatusDot online={camera.online} />
          </div>
          <p className="text-[10px] font-semibold leading-tight text-slate-800 transition-colors group-hover:text-[#1E3A8A]">
            {camera.label}
          </p>
          <p
            className={`text-[9px] font-medium ${
              camera.online ? "text-emerald-600" : "text-slate-400"
            }`}
          >
            {camera.online ? "Online" : "Offline"}
          </p>
        </Link>
      ))}
    </div>
  );
}
