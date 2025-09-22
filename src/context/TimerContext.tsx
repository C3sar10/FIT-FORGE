// src/context/TimerContext.tsx
"use client";
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from "react";

type TimerStatus = "idle" | "running" | "paused";

type TimerState = {
  status: TimerStatus;
  workoutId: string | null;

  startedAt: number | null; // epoch ms
  pausedAccumMs: number; // total paused ms so far
  lastPausedAt: number | null; // epoch ms when pause started (if paused)

  nowSec: number; // integer seconds heartbeat (for throttled renders)
};

type Action =
  | { type: "TICK"; nowSec: number }
  | { type: "START"; workoutId: string; now: number }
  | { type: "PAUSE"; now: number }
  | { type: "RESUME"; now: number }
  | { type: "END" }
  | { type: "HYDRATE"; payload: Partial<TimerState> };

const initialState: TimerState = {
  status: "idle",
  workoutId: null,
  startedAt: null,
  pausedAccumMs: 0,
  lastPausedAt: null,
  nowSec: Math.floor(Date.now() / 1000),
};

function reducer(state: TimerState, action: Action): TimerState {
  switch (action.type) {
    case "TICK":
      return { ...state, nowSec: action.nowSec };

    case "START":
      return {
        ...state,
        status: "running",
        workoutId: action.workoutId,
        startedAt: action.now,
        pausedAccumMs: 0,
        lastPausedAt: null,
      };

    case "PAUSE":
      if (state.status !== "running") return state;
      return { ...state, status: "paused", lastPausedAt: action.now };

    case "RESUME":
      if (state.status !== "paused") return state;
      if (!state.lastPausedAt)
        return { ...state, status: "running", lastPausedAt: null };
      return {
        ...state,
        status: "running",
        pausedAccumMs: state.pausedAccumMs + (action.now - state.lastPausedAt),
        lastPausedAt: null,
      };

    case "END":
      return {
        ...state,
        status: "idle",
        workoutId: null,
        startedAt: null,
        pausedAccumMs: 0,
        lastPausedAt: null,
      };

    case "HYDRATE":
      return { ...state, ...action.payload };

    default:
      return state;
  }
}

const TimerContext = createContext<{
  state: TimerState;
  start: (workoutId: string) => void;
  pause: () => void;
  resume: () => void;
  end: () => void;
  getElapsedMs: () => number;
} | null>(null);

const STORAGE_KEY = "fitforge-timer";

function loadPersisted(): Partial<TimerState> | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function persistState(state: TimerState) {
  // persist only durable fields (not nowSec)
  const { status, workoutId, startedAt, pausedAccumMs, lastPausedAt } = state;
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        status,
        workoutId,
        startedAt,
        pausedAccumMs,
        lastPausedAt,
      })
    );
  } catch {}
}

export function TimerProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Hydrate once on mount
  useEffect(() => {
    const persisted = loadPersisted();
    if (persisted) dispatch({ type: "HYDRATE", payload: persisted });
  }, []);

  // Persist on important changes
  useEffect(() => {
    persistState(state);
  }, [
    state.status,
    state.workoutId,
    state.startedAt,
    state.pausedAccumMs,
    state.lastPausedAt,
  ]);

  // 1 Hz heartbeat aligned to the next second
  useEffect(() => {
    let tId: any, iId: any;
    const align = () => {
      const ms = Date.now();
      const wait = 1000 - (ms % 1000);
      tId = setTimeout(() => {
        dispatch({ type: "TICK", nowSec: Math.floor(Date.now() / 1000) });
        iId = setInterval(() => {
          dispatch({ type: "TICK", nowSec: Math.floor(Date.now() / 1000) });
        }, 1000);
      }, wait);
    };
    align();
    return () => {
      clearTimeout(tId);
      clearInterval(iId);
    };
  }, []);

  // Actions (use reducer so no stale closures)
  const start = (workoutId: string) =>
    dispatch({ type: "START", workoutId, now: Date.now() });
  const pause = () => dispatch({ type: "PAUSE", now: Date.now() });
  const resume = () => dispatch({ type: "RESUME", now: Date.now() });
  const end = () => dispatch({ type: "END" });

  // Derived elapsed (using current state only)
  const getElapsedMs = () => {
    const { status, startedAt, pausedAccumMs, lastPausedAt } = state;
    if (!startedAt) return 0;
    if (status === "running") return Date.now() - startedAt - pausedAccumMs;
    if (status === "paused" && lastPausedAt)
      return lastPausedAt - startedAt - pausedAccumMs;
    return 0;
  };

  const value = useMemo(
    () => ({ state, start, pause, resume, end, getElapsedMs }),
    [state]
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
