"use client";

import { useWorkoutGlobal } from "@/context/WorkoutContext";
import { CheckSquareIcon, MoreHorizontal, Pause } from "lucide-react";
import React, { useEffect, useState } from "react";

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

  useEffect(() => {}, []);

  if (isWorkoutPlayerOpen || currWorkoutId === null) {
    return null;
  }

  return (
    <div
      onClick={handleMiniClick}
      className={`fixed top-[-80px] z-[50] w-full bg-black/90 text-white p-4 border-b border-neutral-200 flex items-center justify-between h-[80px]
        ${
          isVisible
            ? "opacity-100"
            : "opacity-0 transition-opacity duration-300 ease-out"
        }
    `}
    >
      <div className="flex h-full items-center gap-4">
        <div className="aspect-square h-full rounded-sm w-auto bg-neutral-200"></div>
        <div className="flex flex-col items-start">
          <h2 className="text-lg">Workout Name</h2>
          <p className="text-sm tracking-wider">00:00:00</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <Pause size={24} fill="white" className="hover:text-lime-500" />
        <CheckSquareIcon size={24} className="hover:text-lime-500" />
        <MoreHorizontal size={24} className="hover:text-lime-500" />
      </div>
    </div>
  );
};

export default WorkoutMiniPlayer;
