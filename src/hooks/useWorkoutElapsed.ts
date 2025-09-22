// src/hooks/useWorkoutElapsed.ts
import { useMemo } from "react";
import { useTimer } from "@/context/TimerContext";

export function useWorkoutElapsed() {
  const { state, getElapsedMs } = useTimer();
  const elapsedMs = useMemo(
    () => getElapsedMs(),
    [
      state.nowSec,
      state.status,
      state.startedAt,
      state.pausedAccumMs,
      state.lastPausedAt,
    ]
  );
  return { status: state.status, elapsedMs, label: msToHMS(elapsedMs) };
}

function msToHMS(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}
