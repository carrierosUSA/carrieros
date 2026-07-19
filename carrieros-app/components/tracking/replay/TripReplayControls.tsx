"use client";

import type { TripReplaySpeed } from "@/lib/tracking/trip-replay";

type TripReplayControlsProps = {
  isPlaying: boolean;
  speed: TripReplaySpeed;
  onTogglePlay: () => void;
  onStepBackward: () => void;
  onStepForward: () => void;
  onSpeedChange: (speed: TripReplaySpeed) => void;
};

const SPEEDS: TripReplaySpeed[] = [1, 2, 5, 10];

function ControlButton({
  label,
  onClick,
  active = false,
  ariaLabel,
}: {
  label: string;
  onClick: () => void;
  active?: boolean;
  ariaLabel: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={`inline-flex h-10 min-w-10 items-center justify-center rounded-full border px-3 text-[14px] font-semibold transition ${
        active
          ? "border-[#2563EB] bg-[#EFF6FF] text-[#1D4ED8]"
          : "border-[#EAEAEA] bg-white text-slate-800 hover:border-[#CBD5E1] hover:bg-[#F8FAFC]"
      }`}
    >
      {label}
    </button>
  );
}

export default function TripReplayControls({
  isPlaying,
  speed,
  onTogglePlay,
  onStepBackward,
  onStepForward,
  onSpeedChange,
}: TripReplayControlsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <ControlButton
        label="⏪"
        onClick={onStepBackward}
        ariaLabel="Step backward"
      />
      <ControlButton
        label={isPlaying ? "⏸" : "▶"}
        onClick={onTogglePlay}
        active={isPlaying}
        ariaLabel={isPlaying ? "Pause replay" : "Play replay"}
      />
      <ControlButton
        label="⏩"
        onClick={onStepForward}
        ariaLabel="Step forward"
      />

      <div className="ml-1 flex items-center gap-1.5 rounded-full border border-[#EAEAEA] bg-white p-1">
        {SPEEDS.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onSpeedChange(option)}
            className={`rounded-full px-2.5 py-1.5 text-[12px] font-semibold transition ${
              speed === option
                ? "bg-[#2563EB] text-white shadow-sm"
                : "text-slate-600 hover:bg-[#F8FAFC]"
            }`}
          >
            {option}x
          </button>
        ))}
      </div>
    </div>
  );
}
