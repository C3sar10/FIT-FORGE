// src/context/TimerContext.tsx
"use client";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type TimerStatus = "idle" | "running" | "paused";

type TimerState = {
  status: TimerStatus;
  workoutId: string | null;
  startedAt: number | null; // epoch ms when Start was hit
  pausedAccumMs: number; // total ms spent paused
  lastPausedAt: number | null; // epoch ms when paused was pressed
  nowSec: number; // integer seconds heartbeat
};

type TimerActions = {
  start: (workoutId: string) => void;
  pause: () => void;
  resume: () => void;
  end: () => void;

  getElapsedMs: () => number;
};

const TimerContext = createContext<(TimerState & TimerActions) | null>(null);

function loadPersisted() {
  try {
    const raw = localStorage.getItem("fitforge-timer");
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function persist(state: Partial<TimerState>) {
  try {
    const raw = localStorage.getItem("fitforge-timer");
    const prev = raw ? JSON.parse(raw) : {};
    localStorage.setItem(
      "fitforge-timer",
      JSON.stringify({ ...prev, ...state })
    );
  } catch {}
}

export function TimerProvider({ children }: { children: React.ReactNode }) {
  const persisted = useRef(loadPersisted());

  const [status, setStatus] = useState<TimerStatus>(
    persisted.current?.status ?? "idle"
  );
  const [workoutId, setWorkoutId] = useState<string | null>(
    persisted.current?.workoutId ?? null
  );
  const [startedAt, setStartedAt] = useState<number | null>(
    persisted.current?.startedAt ?? null
  );
  const [pausedAccumMs, setPausedAccumMs] = useState<number>(
    persisted.current?.pausedAccumMs ?? 0
  );
  const [lastPausedAt, setLastPausedAt] = useState<number | null>(
    persisted.current?.lastPausedAt ?? null
  );

  // 1Hz heartbeat, aligned to second boundaries, single source of re-render
  const [nowSec, setNowSec] = useState<number>(() =>
    Math.floor(Date.now() / 1000)
  );
  useEffect(() => {
    let tId: any, iId: any;
    const align = () => {
      const ms = Date.now();
      const wait = 1000 - (ms % 1000);
      tId = setTimeout(() => {
        setNowSec(Math.floor(Date.now() / 1000));
        iId = setInterval(() => setNowSec(Math.floor(Date.now() / 1000)), 1000);
      }, wait);
    };
    align();
    return () => {
      clearTimeout(tId);
      clearInterval(iId);
    };
  }, []);

  // Persist minimal state whenever core fields change
  useEffect(() => {
    persist({ status, workoutId, startedAt, pausedAccumMs, lastPausedAt });
  }, [status, workoutId, startedAt, pausedAccumMs, lastPausedAt]);

  const getElapsedMs = useCallback(() => {
    if (!startedAt) return 0;
    if (status === "running") return Date.now() - startedAt - pausedAccumMs;
    if (status === "paused" && lastPausedAt)
      return lastPausedAt - startedAt - pausedAccumMs;
    return 0;
  }, [status, startedAt, pausedAccumMs, lastPausedAt]);

  const start = useCallback((id: string) => {
    setWorkoutId(id);
    setStatus("running");
    const now = Date.now();
    setStartedAt(now);
    setPausedAccumMs(0);
    setLastPausedAt(null);
  }, []);

  const pause = useCallback(() => {
    setStatus((s) => {
      if (s !== "running") return s;
      setLastPausedAt(Date.now());
      return "paused";
    });
  }, []);

  const resume = useCallback(() => {
    setStatus((s) => {
      if (s !== "paused") return s;
      setPausedAccumMs((acc) => {
        if (!lastPausedAt) return acc;
        return acc + (Date.now() - lastPausedAt);
      });
      setLastPausedAt(null);
      return "running";
    });
  }, [lastPausedAt]);

  const end = useCallback(() => {
    // If later you need finalElapsedMs for logging, compute it here using getElapsedMs()
    setStatus("idle");
    setWorkoutId(null);
    setStartedAt(null);
    setPausedAccumMs(0);
    setLastPausedAt(null);
  }, []);

  const value = useMemo(
    () => ({
      status,
      workoutId,
      startedAt,
      pausedAccumMs,
      lastPausedAt,
      nowSec,
      start,
      pause,
      resume,
      end,
      getElapsedMs,
    }),
    [
      status,
      workoutId,
      startedAt,
      pausedAccumMs,
      lastPausedAt,
      nowSec,
      start,
      pause,
      resume,
      end,
      getElapsedMs,
    ]
  );

  return (
    <TimerContext.Provider value={value}>{children}</TimerContext.Provider>
  );
}

export function useTimer() {
  const ctx = useContext(TimerContext);
  if (!ctx) throw new Error("useTimer must be used within TimerProvider");
  return ctx;
}
