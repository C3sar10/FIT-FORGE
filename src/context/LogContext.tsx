"use client";
import React, { ReactNode, createContext, useContext, useState } from "react";
import { WorkoutLogType } from "../types/progress";

interface LogContextType {
  isPostWorkoutLog: boolean;
  setIsPostWorkoutLog: (val: boolean) => void;
  currentWorkoutLog: WorkoutLogType | null;
  setCurrentWorkoutLog: (log: WorkoutLogType | null) => void;
  completedExercises: string[];
  setCompletedExercises: (ids: string[]) => void;
  incompleteExercises: string[];
  setIncompleteExercises: (ids: string[]) => void;
  logOpen: boolean;
  setLogOpen: (val: boolean) => void;
  updateExercisesCompleted?: () => void;
}

const LogContext = createContext<LogContextType | undefined>(undefined);

export function LogProvider({ children }: { children: ReactNode }) {
  const [isPostWorkoutLog, setIsPostWorkoutLog] = useState(false);
  const [currentWorkoutLog, setCurrentWorkoutLog] =
    useState<WorkoutLogType | null>(null);
  const [completedExercises, setCompletedExercises] = useState<string[]>([]);
  const [incompleteExercises, setIncompleteExercises] = useState<string[]>([]);
  const [logOpen, setLogOpen] = useState(false);

  // This will be set by the workout player
  const [updateExercisesCompleted, setUpdateExercisesCompleted] = useState<(() => void) | undefined>(undefined);

  return (
    <LogContext.Provider
      value={{
        isPostWorkoutLog,
        setIsPostWorkoutLog,
        currentWorkoutLog,
        setCurrentWorkoutLog,
        completedExercises,
        setCompletedExercises,
        incompleteExercises,
        setIncompleteExercises,
        logOpen,
        setLogOpen,
  updateExercisesCompleted,
      }}
    >
      {children}
    </LogContext.Provider>
  );
}

export function useLogGlobal() {
  const context = useContext(LogContext);
  if (!context) {
    throw new Error("useLogGlobal must be used within a LogProvider");
  }
  return context;
}
