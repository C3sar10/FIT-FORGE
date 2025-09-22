// src/hooks/useWorkoutElapsed.ts
import { useMemo } from "react";
import { useTimer } from "@/context/TimerContext";

export function useWorkoutElapsed() {
  const { status, getElapsedMs, nowSec } = useTimer();
  // nowSec makes this recompute at most once per second
  const elapsedMs = useMemo(
    () => getElapsedMs(),
    [getElapsedMs, nowSec, status]
  );
  return { status, elapsedMs, label: msToHMS(elapsedMs) };
}

function msToHMS(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}
