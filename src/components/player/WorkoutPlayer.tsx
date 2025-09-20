"use client";
import { ExerciseType, WorkoutType } from "@/types/workout";
import {
  ChevronDown,
  ChevronRightIcon,
  MoreHorizontal,
  Pause,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import ExerciseLi from "../workouts/ExerciseLi";
import { useWorkoutGlobal } from "@/context/WorkoutContext";
import { api } from "@/lib/api";

interface ExerciseLiProps {
  exerciseObj: ExerciseType;
}

const LiveExerciseLi: React.FC<ExerciseLiProps> = ({ exerciseObj }) => {
  const [checked, setChecked] = useState(false);

  return (
    <li className="w-full p-2 rounded-md border border-neutral-200 bg-black/50 hover:bg-black/90 cursor-pointer flex items-center justify-between">
      <div className="flex items-center">
        <input
          checked={checked}
          onChange={() => setChecked(!checked)}
          type="checkbox"
          className="size-6 mr-4 bg-transparent border-white"
        />
        <div className="flex flex-col items-start">
          <h2
            className={`${
              checked && "line-through text-neutral-400"
            } text-base font-medium`}
          >
            {exerciseObj.name}
          </h2>
          <div
            className={`${
              checked && "line-through text-neutral-500"
            } flex items-center gap-1 text-sm`}
          >
            <p>Sets {exerciseObj.sets.toLocaleString()}</p>
            <p>|</p>
            <p>Reps {exerciseObj.reps}</p>
          </div>
        </div>
      </div>
      <ChevronRightIcon className="justify-self-end justify-items-end size-4" />
    </li>
  );
};

type Props = {};

const WorkoutPlayer = (props: Props) => {
  const { isWorkoutPlayerOpen, toggleWorkoutPlayer, currWorkoutId } =
    useWorkoutGlobal();
  const [isVisible, setIsVisible] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  const [workoutData, setWorkoutData] = useState<WorkoutType | null>(null);
  const [playerOpen, setPlayerOpen] = useState(false);

  const handleAnimatedEnd = () => {
    if (!isWorkoutPlayerOpen) {
      setIsVisible(false);
    }
  };

  const hideDivWithDelay = () => {
    toggleWorkoutPlayer();
    // Start the fade-out animation
    // The 'opacity-0' class in Tailwind will handle the 300ms duration
    // The actual hiding (display: none) will happen after the animation duration + delay
    setTimeout(() => {
      setIsVisible(false);
    }, 500); // 300ms animation duration
  };

  const [exerciseList, setExerciseList] = useState<ExerciseType[]>([
    {
      exerciseId: "1",
      name: "Exer Name",
      sets: 3,
      reps: "6-8",
      restSecs: 180,
    },
    {
      exerciseId: "2",
      name: "Exer Name",
      sets: 3,
      reps: "6-8",
      restSecs: 180,
    },
    {
      exerciseId: "3",
      name: "Exer Name",
      sets: 3,
      reps: "6-8",
      restSecs: 180,
    },
    {
      exerciseId: "4",
      name: "Exer Name",
      sets: 3,
      reps: "6-8",
      restSecs: 180,
    },
  ]);

  useEffect(() => {
    if (currWorkoutId) {
      fetchWorkoutDetails(currWorkoutId);
    }
  }, [currWorkoutId]);

  useEffect(() => {
    console.log("workout player open: ", isWorkoutPlayerOpen);
    if (isWorkoutPlayerOpen) {
      setIsVisible(true);
      setPlayerOpen(true);
    }
  }, [isWorkoutPlayerOpen]);

  const fetchWorkoutDetails = async (id: string) => {
    const res = await api(`/workouts/${id}`); // uses your existing route
    const data = await res.json();
    console.log("Workout data: ", data);
    setWorkoutData(data);
    const exerciseList = [...data.blocks[0].items, ...data.blocks[1].items];
    setExerciseList(exerciseList);
  };

  return (
    <div
      className={`fixed w-full h-full overflow-y-scroll no-scrollbar bg-linear-180 from-lime-900 to-lime-500 z-[100] flex-col max-w-[600px] left-0 right-0 mx-auto pt-8
        ${
          playerOpen
            ? "translate-y-0 flex"
            : "translate-y-[100vh] transition-all duration-400 ease-out"
        }
        ${!isVisible && "hidden"}
        
    `}
    >
      <ChevronDown
        size={24}
        className=" absolute top-2 left-0 right-0 mx-auto shadow-2xl cursor-pointer"
        onClick={hideDivWithDelay}
      />
      <div className="w-full aspect-square object-cover p-4 ">
        {workoutData && workoutData.image ? (
          <img
            src={workoutData.image}
            className="object-cover w-full h-full rounded-2xl"
          />
        ) : (
          <div className="w-full h-full bg-lime-900 rounded-2xl"></div>
        )}
      </div>
      <div className="w-full h-full flex flex-col">
        <div className="w-full p-4 flex flex-col items-center">
          <div className="w-full flex items-center justify-between">
            <div className="flex flex-col items-start">
              {workoutData ? (
                <h1 className="text-xl font-medium">{workoutData?.name}</h1>
              ) : (
                <div className="w-full max-w-[500px] h-6 rounded-2xl bg-neutral-400 animate-pulse mb-1"></div>
              )}
              {workoutData ? (
                <p className="text-xs italic space-x-1">
                  {workoutData.tags.map((tag, index) => (
                    <span key={index} className="">
                      #{tag}
                    </span>
                  ))}
                </p>
              ) : (
                <div className="w-full max-w-[160px] h-4 rounded-2xl bg-neutral-400 animate-pulse mb-1"></div>
              )}
            </div>
            <MoreHorizontal size={20} />
          </div>
        </div>
        <div className="w-full flex flex-col items-center gap-2 p-4">
          <p className="text-2xl tracking-wider">00:00:00</p>
          <div className="w-full flex items-center gap-2">
            <button className="w-full h-[54px] rounded-2xl bg-black text-white flex items-center justify-center">
              <Pause fill="white" />
            </button>
            <button className="w-full h-[54px] rounded-2xl bg-red-800 text-white">
              End Workout
            </button>
          </div>
        </div>
        <div className="w-full h-full p-4 flex flex-col gap-4">
          <div className="w-full flex flex-col gap-2">
            <h2 className="text-sm md:text-base font-medium">Exercise List</h2>
            <ul className="w-full flex flex-col gap-2">
              {exerciseList.map((exercise) => (
                <LiveExerciseLi
                  exerciseObj={exercise}
                  key={exercise.exerciseId}
                />
              ))}
            </ul>
          </div>
          <div className="w-full mt-4  h-[64px] flex items-center gap-1">
            <button className="w-full h-full rounded-l-2xl bg-black text-white hover:bg-[#1e1e1e] cursor-pointer shadow-2xl">
              Manage Workout
            </button>
            <button className="w-14 h-full bg-black text-white flex items-center justify-center rounded-r-2xl hover:bg-[#1e1e1e] cursor-pointer shadow-2xl">
              <ChevronDown size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkoutPlayer;
