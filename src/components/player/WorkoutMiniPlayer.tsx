"use client";

import { useWorkoutGlobal } from "@/context/WorkoutContext";
import { useWorkoutElapsed } from "@/hooks/useWorkoutElapsed";
import { api } from "@/lib/api";
import { ExerciseType, WorkoutType } from "@/types/workout";
import { CheckSquareIcon, MoreHorizontal, Pause } from "lucide-react";
import React, { useEffect, useState } from "react";
import { TimerDisplay } from "./TimerDisplay";

type Props = {};

const WorkoutMiniPlayer = (props: Props) => {
  const {
    currWorkoutId,
    toggleWorkoutPlayer,
    isWorkoutPlayerOpen,
    playerState,
    setPlayerState,
  } = useWorkoutGlobal();

  const [isVisible, setIsVisible] = useState(true);
  const [workoutData, setWorkoutData] = useState<WorkoutType | null>(null);

  const { label } = useWorkoutElapsed();

  const handleMiniClick = () => {
    console.log("Mini player open: ", isWorkoutPlayerOpen);
    if (playerState != "inactive") {
      hideBlock();
    }
  };

  const hideBlock = () => {
    setIsVisible(false);
    // Start the fade-out animation
    // The 'opacity-0' class in Tailwind will handle the 300ms duration
    // The actual hiding (display: none) will happen after the animation duration + delay
    setTimeout(() => {
      toggleWorkoutPlayer();
      setIsVisible(true);
    }, 300); // 300ms animation duration
  };

  const fetchWorkoutDetails = async (id: string) => {
    const res = await api(`/workouts/${id}`); // uses your existing route
    const data = await res.json();
    console.log("Workout data: ", data);
    setWorkoutData(data);
  };

  useEffect(() => {
    if (!isWorkoutPlayerOpen && currWorkoutId) {
      fetchWorkoutDetails(currWorkoutId);
    }
  }, [isWorkoutPlayerOpen, currWorkoutId]);

  if (isWorkoutPlayerOpen || currWorkoutId === null) {
    return null;
  }

  return (
    <div
      className={`fixed top-[-80px] z-[50] w-full bg-black/90 text-white p-4 border-b border-neutral-200 flex items-center justify-between h-[80px]
        ${
          isVisible
            ? "opacity-100"
            : "opacity-0 transition-opacity duration-300 ease-out"
        }
    `}
    >
      <div
        onClick={handleMiniClick}
        className="flex w-full h-full items-center gap-4"
      >
        <div className="aspect-square h-full rounded-sm w-auto bg-neutral-200">
          {workoutData?.image && (
            <img
              src={workoutData.image}
              className="w-full h-full object-cover"
            />
          )}
        </div>
        <div className="flex flex-col items-start">
          <h2 className="text-base sm:text-lg">{workoutData?.name}</h2>
          <TimerDisplay />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Pause size={20} fill="white" className="hover:text-lime-500" />
        <CheckSquareIcon size={20} className="hover:text-lime-500" />
        <MoreHorizontal size={20} className="hover:text-lime-500" />
      </div>
    </div>
  );
};

export default WorkoutMiniPlayer;
