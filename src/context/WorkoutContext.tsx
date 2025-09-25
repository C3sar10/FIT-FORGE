"use client";
import React, { ReactNode, createContext, useContext, useState } from "react";

interface WorkoutContextType {
  isWorkoutPlayerOpen: boolean;
  setIsWorkoutPlayerOpen: (val: boolean) => void;
  toggleWorkoutPlayer: () => void;
  currWorkoutId: string | null;
  setCurrWorkoutId: (arg0: string | null) => void;
  playerState: "play" | "pause" | "inactive";
  setPlayerState: (arg0: "play" | "pause" | "inactive") => void;
  timerStartTime: string | null;
  setTimerStartTime: (arg0: string | null) => void;
  timerPauseTime: string | null;
  setTimerPauseTime: (arg0: string | null) => void;
}

const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);

export function WorkoutProvider({ children }: { children: ReactNode }) {
  const [isWorkoutPlayerOpen, setIsWorkoutPlayerOpen] = useState(false);
  const [currWorkoutId, setCurrWorkoutId] = useState<string | null>(null);
  const [playerState, setPlayerState] = useState<"play" | "pause" | "inactive">(
    "inactive"
  );
  const [timerStartTime, setTimerStartTime] = useState<string | null>(null);
  const [timerPauseTime, setTimerPauseTime] = useState<string | null>(null);

  const toggleWorkoutPlayer = () => {
    setIsWorkoutPlayerOpen(!isWorkoutPlayerOpen);
  };

  return (
    <WorkoutContext.Provider
      value={{
        isWorkoutPlayerOpen,
        toggleWorkoutPlayer,
        currWorkoutId,
        setCurrWorkoutId,
        playerState,
        setPlayerState,
        timerStartTime,
        setTimerStartTime,
        timerPauseTime,
        setTimerPauseTime,
        setIsWorkoutPlayerOpen,
      }}
    >
      {children}
    </WorkoutContext.Provider>
  );
}

export function useWorkoutGlobal() {
  const context = useContext(WorkoutContext);
  if (!context) {
    throw new Error("useMenu must be used within a WorkoutProvider");
  }
  return context;
}
