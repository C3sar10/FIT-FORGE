// src/hooks/useSyncTimerToUI.ts
"use client";
import { useEffect, useRef } from "react";
import { useTimer } from "@/context/TimerContext";
import { useWorkoutGlobal } from "@/context/WorkoutContext";

export function useSyncTimerToUI() {
  const { state } = useTimer();
  const {
    isWorkoutPlayerOpen,
    toggleWorkoutPlayer,
    setCurrWorkoutId,
    setPlayerState,
  } = useWorkoutGlobal();

  const prev = useRef(state.status);

  useEffect(() => {
    const ended = prev.current !== "idle" && state.status === "idle"; // <-- only on end
    prev.current = state.status;

    if (!ended) return;

    // Timer ended -> globally close/reset workout UI
    setPlayerState("inactive");
    setCurrWorkoutId(null);
    if (isWorkoutPlayerOpen) toggleWorkoutPlayer();
  }, [
    state.status,
    isWorkoutPlayerOpen,
    toggleWorkoutPlayer,
    setCurrWorkoutId,
    setPlayerState,
  ]);
}
