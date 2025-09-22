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
}: {
  workoutId?: string; // required when starting
  className?: string;
  labels?: { start: string; pause: string; play: string; end: string };
}) {
  const { status, start, pause, resume, end } = useTimer();

  return (
    <div className={`w-full flex items-center gap-2 ${className}`}>
      {status === "idle" && (
        <button
          className="w-full flex items-center justify-center text-center h-[64px] rounded-2xl bg-black text-white cursor-pointer"
          onClick={() => workoutId && start(workoutId)}
        >
          <Play className="size-6 mr-2" fill="white" />
          {labels.start}
        </button>
      )}
      {status === "running" && (
        <button
          className="w-full h-[54px] rounded-2xl bg-black text-white cursor-pointer"
          onClick={pause}
        >
          {labels.pause}
        </button>
      )}
      {status === "paused" && (
        <button
          className="w-full h-[54px] rounded-2xl bg-black text-white cursor-pointer"
          onClick={resume}
        >
          {labels.play}
        </button>
      )}
      {(status === "running" || status === "paused") && (
        <button
          className="w-full h-[54px] rounded-2xl bg-red-800 text-white cursor-pointer"
          onClick={end}
        >
          {labels.end}
        </button>
      )}
    </div>
  );
}
