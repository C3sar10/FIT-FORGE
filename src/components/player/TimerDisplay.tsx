"use client";
import { useWorkoutElapsed } from "@/hooks/useWorkoutElapsed";
import { useTimer } from "@/context/TimerContext";
import { Play } from "lucide-react";

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
  const { state, start, pause, resume, end } = useTimer();

  const handleEnd = () => {
    end();
    onEnd?.();
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
