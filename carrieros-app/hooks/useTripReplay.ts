"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  DEFAULT_TRIP_REPLAY_FILTERS,
  deriveReplayStats,
  filterReplayEvents,
  interpolateGpsAtTime,
  progressToTimestamp,
  timestampToProgress,
  type TripReplayData,
  type TripReplayEvent,
  type TripReplayFilters,
  type TripReplaySpeed,
  type TripReplayStats,
} from "@/lib/tracking/trip-replay";

type UseTripReplayOptions = {
  data: TripReplayData;
  etaLabel: string;
  initialTimestampMs?: number;
};

type UseTripReplayResult = {
  currentTimeMs: number;
  progress: number;
  isPlaying: boolean;
  speed: TripReplaySpeed;
  filters: TripReplayFilters;
  stats: TripReplayStats;
  visibleEvents: TripReplayEvent[];
  activeEventId: string | null;
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  setSpeed: (speed: TripReplaySpeed) => void;
  seek: (timestampMs: number) => void;
  seekProgress: (progress: number) => void;
  stepForward: () => void;
  stepBackward: () => void;
  jumpToEvent: (eventId: string) => void;
  setFilters: (filters: TripReplayFilters) => void;
  toggleFilter: (key: keyof TripReplayFilters) => void;
};

const STEP_MS = 5 * 60 * 1000;

export function useTripReplay({
  data,
  etaLabel,
  initialTimestampMs,
}: UseTripReplayOptions): UseTripReplayResult {
  const startMs = new Date(data.startTime).getTime();
  const endMs = new Date(data.endTime).getTime();

  const [currentTimeMs, setCurrentTimeMs] = useState(
    initialTimestampMs ?? startMs,
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeedState] = useState<TripReplaySpeed>(1);
  const [filters, setFilters] = useState<TripReplayFilters>(
    DEFAULT_TRIP_REPLAY_FILTERS,
  );

  const rafRef = useRef<number | null>(null);
  const lastFrameRef = useRef<number | null>(null);

  const visibleEvents = useMemo(
    () => filterReplayEvents(data.events, filters),
    [data.events, filters],
  );

  const stats = useMemo(
    () => deriveReplayStats(data, currentTimeMs, etaLabel),
    [currentTimeMs, data, etaLabel],
  );

  const progress = useMemo(
    () => timestampToProgress(data, currentTimeMs),
    [currentTimeMs, data],
  );

  const activeEventId = useMemo(() => {
    const currentEvents = visibleEvents.filter(
      (event) => new Date(event.timestamp).getTime() <= currentTimeMs,
    );

    return currentEvents.length > 0
      ? currentEvents[currentEvents.length - 1].id
      : null;
  }, [currentTimeMs, visibleEvents]);

  const clampTime = useCallback(
    (timestampMs: number) => Math.min(endMs, Math.max(startMs, timestampMs)),
    [endMs, startMs],
  );

  const seek = useCallback(
    (timestampMs: number) => {
      setCurrentTimeMs(clampTime(timestampMs));
    },
    [clampTime],
  );

  const seekProgress = useCallback(
    (nextProgress: number) => {
      seek(progressToTimestamp(data, nextProgress));
    },
    [data, seek],
  );

  const play = useCallback(() => setIsPlaying(true), []);
  const pause = useCallback(() => setIsPlaying(false), []);
  const togglePlay = useCallback(() => setIsPlaying((current) => !current), []);

  const setSpeed = useCallback((nextSpeed: TripReplaySpeed) => {
    setSpeedState(nextSpeed);
  }, []);

  const jumpToEvent = useCallback(
    (eventId: string) => {
      const event = data.events.find((item) => item.id === eventId);

      if (event) {
        seek(new Date(event.timestamp).getTime());
      }
    },
    [data.events, seek],
  );

  const stepForward = useCallback(() => {
    const nextEvent = visibleEvents.find(
      (event) => new Date(event.timestamp).getTime() > currentTimeMs + 1000,
    );

    if (nextEvent) {
      seek(new Date(nextEvent.timestamp).getTime());
      return;
    }

    seek(Math.min(endMs, currentTimeMs + STEP_MS));
  }, [currentTimeMs, endMs, seek, visibleEvents]);

  const stepBackward = useCallback(() => {
    const previousEvents = visibleEvents.filter(
      (event) => new Date(event.timestamp).getTime() < currentTimeMs - 1000,
    );

    if (previousEvents.length > 0) {
      seek(
        new Date(previousEvents[previousEvents.length - 1].timestamp).getTime(),
      );
      return;
    }

    seek(Math.max(startMs, currentTimeMs - STEP_MS));
  }, [currentTimeMs, seek, startMs, visibleEvents]);

  const toggleFilter = useCallback((key: keyof TripReplayFilters) => {
    setFilters((current) => ({
      ...current,
      [key]: !current[key],
    }));
  }, []);

  useEffect(() => {
    if (!isPlaying) {
      lastFrameRef.current = null;

      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }

      return;
    }

    const tick = (frameTime: number) => {
      if (lastFrameRef.current !== null) {
        const deltaMs = frameTime - lastFrameRef.current;
        setCurrentTimeMs((current) => {
          const next = current + deltaMs * speed;

          if (next >= endMs) {
            setIsPlaying(false);
            return endMs;
          }

          return next;
        });
      }

      lastFrameRef.current = frameTime;
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }

      lastFrameRef.current = null;
    };
  }, [endMs, isPlaying, speed]);

  useEffect(() => {
    if (!interpolateGpsAtTime(data.gpsPoints, currentTimeMs)) {
      setCurrentTimeMs(startMs);
    }
  }, [currentTimeMs, data.gpsPoints, startMs]);

  return {
    currentTimeMs,
    progress,
    isPlaying,
    speed,
    filters,
    stats,
    visibleEvents,
    activeEventId,
    play,
    pause,
    togglePlay,
    setSpeed,
    seek,
    seekProgress,
    stepForward,
    stepBackward,
    jumpToEvent,
    setFilters,
    toggleFilter,
  };
}
