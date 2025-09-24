"use client";
import {
  ExerciseApiType,
  ExerciseType,
  WorkoutApiType,
  WorkoutType,
} from "@/types/workout";
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
import { TimerControls, TimerDisplay } from "./TimerDisplay";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query"; // Add this

interface ExerciseLiProps {
  exerciseObj: ExerciseType;
}

const LiveExerciseLi: React.FC<ExerciseLiProps> = ({ exerciseObj }) => {
  const [checked, setChecked] = useState(false);

  const router = useRouter();

  if (!exerciseObj)
    return (
      <li className="w-full p-2 rounded-md bg-neutral-800 text-neutral-500">
        Loading exercise...
      </li>
    );

  return (
    <li className="w-full p-2 rounded-md border border-neutral-200 bg-black/50 hover:bg-black/90 cursor-pointer flex items-center justify-between">
      <div className="flex items-center">
        <input
          checked={checked}
          onChange={() => setChecked(!checked)}
          type="checkbox"
          className="size-6 mr-4 bg-transparent border-white"
        />
        <div
          onClick={() =>
            router.push(`/exercisepreview/${exerciseObj.exerciseId}`)
          }
          className="flex flex-col items-start"
        >
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
      <ChevronRightIcon
        onClick={() =>
          router.push(`/exercisepreview/${exerciseObj.exerciseId}`)
        }
        className="justify-self-end justify-items-end size-4"
      />
    </li>
  );
};

type Props = {};

const WorkoutPlayer = (props: Props) => {
  const { isWorkoutPlayerOpen, toggleWorkoutPlayer, currWorkoutId } =
    useWorkoutGlobal();
  const [isVisible, setIsVisible] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  const [workoutData, setWorkoutData] = useState<WorkoutApiType | null>(null);
  const [playerOpen, setPlayerOpen] = useState(false);
  const queryClient = useQueryClient(); // To access cache
  const [exerciseList, setExerciseList] = useState<ExerciseType[]>([]);
  const [isLoadingExercises, setIsLoadingExercises] = useState(false); // Add for loading state
  const router = useRouter();

  // Fetch workout from cache or API
  const {
    data: workout,
    isLoading: workoutLoading,
    error,
  } = useQuery<WorkoutApiType, Error>({
    queryKey: ["workout", currWorkoutId],
    queryFn: async () => {
      if (!currWorkoutId) throw new Error("No workout ID");
      const res = await api(`/workouts/${currWorkoutId}`);
      return await res.json();
    },
    enabled: !!currWorkoutId, // Prevent fetch until ID is set
  });

  // Get exercises from cache or fallback fetch
  useEffect(() => {
    if (workout && currWorkoutId) {
      setWorkoutData(workout);
      setIsLoadingExercises(true);
      const flatIds = (workout.blocks ?? []).flatMap((b: any) =>
        (b.items ?? []).map((i: any) => i.exerciseId)
      );
      const uniqueIds = [...new Set(flatIds)];
      const cachedExercises = uniqueIds
        .map((id) =>
          queryClient.getQueryData<ExerciseApiType>(["exercise", id])
        )
        .filter((e): e is ExerciseApiType => !!e); // Type guard
      if (cachedExercises.length === uniqueIds.length) {
        // All cached - map to list
        const exerciseMap = new Map(cachedExercises.map((e) => [e.id, e]));
        const fullList = flatIds.map((id) => ({
          exerciseId: id,
          name: exerciseMap.get(id)?.title ?? "",
          sets: exerciseMap.get(id)?.details.sets ?? 0,
          reps: exerciseMap.get(id)?.details.reps ?? "",
          restSecs: exerciseMap.get(id)?.details.restSecs ?? 0,
          image: exerciseMap.get(id)?.image ?? "",
        }));
        setExerciseList(fullList);
        setIsLoadingExercises(false);
      } else {
        // Fallback fetch missing exercises
        const fetchMissing = async () => {
          try {
            const missingIds = uniqueIds.filter(
              (id) => !queryClient.getQueryData(["exercise", id])
            );
            const newExercises = await Promise.all(
              missingIds.map(async (id) => {
                try {
                  const data = await queryClient.fetchQuery<ExerciseApiType>({
                    queryKey: ["exercise", id],
                    queryFn: async () => {
                      const res = await api(`/exercises/${id}`);
                      if (!res.ok)
                        throw new Error(`Failed to fetch exercise ${id}`);
                      return await res.json();
                    },
                  });
                  return data;
                } catch (err) {
                  console.error(`Error fetching exercise ${id}:`, err);
                  return null; // Handle missing exercises
                }
              })
            );
            // Combine cached and new exercises
            const allExercises = [
              ...cachedExercises,
              ...newExercises.filter((e): e is ExerciseApiType => e !== null),
            ];
            const exerciseMap = new Map(allExercises.map((e) => [e.id, e]));
            const fullList = flatIds.map((id) => ({
              exerciseId: id,
              name: exerciseMap.get(id)?.title ?? "Unknown Exercise",
              sets: exerciseMap.get(id)?.details.sets ?? 0,
              reps: exerciseMap.get(id)?.details.reps ?? "N/A",
              restSecs: exerciseMap.get(id)?.details.restSecs ?? 0,
              image: exerciseMap.get(id)?.image ?? "",
            }));
            setExerciseList(fullList);
          } catch (err) {
            console.error("Fallback fetch error:", err);
            setExerciseList([]); // Fallback to empty list
          } finally {
            setIsLoadingExercises(false);
          }
        };
        fetchMissing();
      }
    }
  }, [workout, currWorkoutId, queryClient]);

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

  useEffect(() => {
    console.log("workout player open: ", isWorkoutPlayerOpen);
    if (isWorkoutPlayerOpen) {
      setIsVisible(true);
      setPlayerOpen(true);
    }
  }, [isWorkoutPlayerOpen]);

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
          <TimerDisplay className="text-2xl md:text-4xl" />
          <TimerControls workoutId={currWorkoutId ?? undefined} />
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
