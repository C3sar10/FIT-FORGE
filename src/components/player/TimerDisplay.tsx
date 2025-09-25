"use client";
import { useWorkoutElapsed } from "@/hooks/useWorkoutElapsed";
import { useTimer } from "@/context/TimerContext";
import { Play } from "lucide-react";
import { useDialog } from "@/context/DialogContext";
import { useLogGlobal } from "@/context/LogContext";
import { useWorkoutGlobal } from "@/context/WorkoutContext";

export function TimerDisplay({ className = "" }: { className?: string }) {
  const { label } = useWorkoutElapsed();
  return <p className={` tracking-wider ${className}`}>{label}</p>;
}

export function TimerControls({
  workoutId,
  className = "",
  labels = { start: "Start", pause: "Pause", play: "Play", end: "End Workout" },
  onEnd,
}: {
  workoutId?: string;
  className?: string;
  labels?: { start: string; pause: string; play: string; end: string };
  onEnd?: () => void;
}) {
  const { state, start, pause, resume, end, getElapsedMs } = useTimer();
  const {
    currentWorkoutLog,
    setCurrentWorkoutLog,
    setLogOpen,
    setIsPostWorkoutLog,
    updateExercisesCompleted,
  } = useLogGlobal();
  const { toggleWorkoutPlayer, setPlayerState, setIsWorkoutPlayerOpen } =
    useWorkoutGlobal();

  const { showDialog } = useDialog();

  const handleEnd = async () => {
    const res = await showDialog({
      title: "End workout?",
      message: "Your workout timer will stop and reset.",
      actions: [
        { id: "cancel", label: "Cancel", variant: "secondary" },
        { id: "end", label: "End Workout", variant: "danger" },
      ],
    });
    if (res === "end") {
      // Update log duration
      if (currentWorkoutLog) {
        const ms = getElapsedMs();
        const min = Math.floor(ms / 60000);
        const sec = Math.floor((ms % 60000) / 1000);
        const updatedLog = {
          ...currentWorkoutLog,
          workoutDetails: {
            ...currentWorkoutLog.workoutDetails,
            duration: `${min}m ${sec}s`,
          },
        };
        setCurrentWorkoutLog(updatedLog);
        console.log("WorkoutLog:", updatedLog);
        setIsPostWorkoutLog(true);
        setLogOpen(true);
      }
      setPlayerState("inactive");
      setIsWorkoutPlayerOpen(false);
      // End timer
      end();
    }
    onEnd?.(); // your bridge will close players, etc.
  };

  return (
    <div className={`w-full flex items-center gap-2 ${className}`}>
      {state.status === "idle" && (
        <button
          className="w-full h-[54px] rounded-2xl bg-black text-white"
          onClick={() => workoutId && start(workoutId)}
        >
          {labels.start}
        </button>
      )}
      {state.status === "running" && (
        <button
          className="w-full h-[54px] rounded-2xl bg-black text-white"
          onClick={pause}
        >
          {labels.pause}
        </button>
      )}
      {state.status === "paused" && (
        <button
          className="w-full h-[54px] rounded-2xl bg-black text-white"
          onClick={resume}
        >
          {labels.play}
        </button>
      )}
      {(state.status === "running" || state.status === "paused") && (
        <button
          className="w-full h-[54px] rounded-2xl bg-red-800 text-white"
          onClick={handleEnd}
        >
          {labels.end}
        </button>
      )}
    </div>
  );
}
