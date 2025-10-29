"use client";
import { ExerciseType, WorkoutType } from "@/types/workout";
import {
  ChevronDown,
  ChevronRightIcon,
  MoreHorizontal,
  Pause,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useLogGlobal } from "@/context/LogContext";
import { AuthAPI } from "@/lib/api";
import { useWorkoutGlobal } from "@/context/WorkoutContext";
import { api } from "@/lib/api";
import { TimerControls, TimerDisplay } from "./TimerDisplay";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query"; // Add this
import { WorkoutLogType } from "@/types/progress";

interface ExerciseLiProps {
  exerciseObj: ExerciseType;
  setCurrentWorkoutLog?: (arg0: WorkoutLogType | null) => void;
  currentWorkoutLog?: WorkoutLogType | null;
}

const LiveExerciseLi: React.FC<ExerciseLiProps> = ({
  exerciseObj,
  setCurrentWorkoutLog,
  currentWorkoutLog,
}) => {
  const router = useRouter();
  const [isChecked, setIsChecked] = useState(false);

  if (!exerciseObj)
    return (
      <li className="w-full p-2 rounded-md bg-neutral-800 text-neutral-500">
        Loading exercise...
      </li>
    );

  const handleCheck = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newCheckedState = event.target.checked;
    setIsChecked(newCheckedState);
    if (!setCurrentWorkoutLog || !currentWorkoutLog) return;
    if (setCurrentWorkoutLog && newCheckedState && currentWorkoutLog != null) {
      setCurrentWorkoutLog({
        ...currentWorkoutLog,
        workoutDetails: {
          ...currentWorkoutLog.workoutDetails,
          exercisesCompleted: [
            ...currentWorkoutLog.workoutDetails.exercisesCompleted,
            exerciseObj.id,
          ],
        },
      });
    } else {
      setCurrentWorkoutLog({
        ...currentWorkoutLog,
        workoutDetails: {
          ...currentWorkoutLog.workoutDetails,
          exercisesCompleted:
            currentWorkoutLog.workoutDetails.exercisesCompleted.filter(
              (id) => id !== exerciseObj.id
            ),
        },
      });
    }
  };

  return (
    <li className="w-full p-2 rounded-md border border-neutral-200 bg-black/50 hover:bg-black/90 cursor-pointer flex items-center justify-between">
      <div className="flex items-center">
        <input
          checked={isChecked}
          onChange={handleCheck}
          type="checkbox"
          className="size-6 mr-4 bg-transparent border-white"
        />
        <div
          onClick={() => router.push(`/exercisepreview/${exerciseObj.id}`)}
          className="flex flex-col items-start"
        >
          <h2
            className={`${
              isChecked ? "line-through text-neutral-400" : ""
            } text-base font-medium`}
          >
            {exerciseObj.title}
          </h2>
          <div
            className={`${
              isChecked ? "line-through text-neutral-500" : ""
            } flex items-center gap-1 text-sm`}
          >
            <p>Sets {exerciseObj.details.sets.toLocaleString()}</p>
            <p>|</p>
            <p>Reps {exerciseObj.details.reps}</p>
          </div>
        </div>
      </div>
      <ChevronRightIcon
        onClick={() => router.push(`/exercisepreview/${exerciseObj.id}`)}
        className="justify-self-end justify-items-end size-4"
      />
    </li>
  );
};

type Props = {};

const WorkoutPlayer = (props: Props) => {
  const {
    isWorkoutPlayerOpen,
    toggleWorkoutPlayer,
    currWorkoutId,
    playerState,
  } = useWorkoutGlobal();
  const { setCurrentWorkoutLog, setIsPostWorkoutLog, currentWorkoutLog } =
    useLogGlobal();
  const [isVisible, setIsVisible] = useState(true);
  const [workoutData, setWorkoutData] = useState<WorkoutType | null>(null);
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
  } = useQuery<WorkoutType, Error>({
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
        .map((id) => queryClient.getQueryData<ExerciseType>(["exercise", id]))
        .filter((e): e is ExerciseType => !!e); // Type guard
      if (cachedExercises.length === uniqueIds.length) {
        // All cached - map to list
        const exerciseMap = new Map(cachedExercises.map((e) => [e.id, e]));
        const fullList = flatIds.map((id) => ({
          id,
          title: exerciseMap.get(id)?.title ?? "",
          tags: exerciseMap.get(id)?.tags ?? [],
          image: exerciseMap.get(id)?.image ?? "",
          type: exerciseMap.get(id)?.type ?? "",
          author: exerciseMap.get(id)?.author ?? "",
          description: exerciseMap.get(id)?.description ?? "",
          details: exerciseMap.get(id)?.details ?? {
            sets: exerciseMap.get(id)?.details.sets ?? 0,
            reps: exerciseMap.get(id)?.details.reps ?? "N/A",
            restSecs: exerciseMap.get(id)?.details.restSecs ?? 0,
            equipment: exerciseMap.get(id)?.details.equipment ?? [],
          },
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
                  const data = await queryClient.fetchQuery<ExerciseType>({
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
              ...newExercises.filter((e): e is ExerciseType => e !== null),
            ];
            const exerciseMap = new Map(allExercises.map((e) => [e.id, e]));
            const fullList = flatIds.map((id) => ({
              id,
              title: exerciseMap.get(id)?.title ?? "",
              tags: exerciseMap.get(id)?.tags ?? [],
              image: exerciseMap.get(id)?.image ?? "",
              type: exerciseMap.get(id)?.type ?? "",
              author: exerciseMap.get(id)?.author ?? "",
              description: exerciseMap.get(id)?.description ?? "",
              details: exerciseMap.get(id)?.details ?? {
                sets: exerciseMap.get(id)?.details.sets ?? 0,
                reps: exerciseMap.get(id)?.details.reps ?? "N/A",
                restSecs: exerciseMap.get(id)?.details.restSecs ?? 0,
                equipment: exerciseMap.get(id)?.details.equipment ?? [],
              },
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
    if (
      isWorkoutPlayerOpen &&
      playerState !== "inactive" &&
      !currentWorkoutLog &&
      workoutData &&
      currWorkoutId
    ) {
      setIsPostWorkoutLog(true);
      let user = null;
      (async () => {
        try {
          user = await AuthAPI.me();
        } catch {}
        if (user) {
          const now = new Date();
          const logObj = {
            logId: "",
            userId: user?.id ?? "",
            userName: user?.name ?? "",
            title: workoutData.name ?? "Workout Log",
            workoutDate: now.toISOString(),
            createdOn: now.toISOString(),
            lastUpdated: now.toISOString(),
            description: `Workout completed on ${now.toLocaleDateString()} at ${now.toLocaleTimeString()}`,
            workoutDetails: {
              workoutTimestamp: now.toISOString(),
              workoutTitle: workoutData.name ?? "",
              workoutId: currWorkoutId,
              duration: 0,
              exerciseList:
                workoutData.blocks?.flatMap((b: any) => b.items ?? []) ?? [],
              exercisesCompleted: [],
              type:
                typeof workoutData.type === "string" ? workoutData.type : "",
            },
            rating: undefined,
            intensity: undefined,
            notes: "",
          };
          setCurrentWorkoutLog(logObj);
        }
      })();
    }
    if (isWorkoutPlayerOpen && playerState !== "inactive") {
      setIsVisible(true);
      setPlayerOpen(true);
    }
  }, [isWorkoutPlayerOpen, workoutData, currWorkoutId, playerState]);

  useEffect(() => {
    if (!isWorkoutPlayerOpen && playerState === "inactive") {
      handleAnimatedEnd();
    }
  }, [playerState, isWorkoutPlayerOpen]);

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
                  key={exercise.id}
                  currentWorkoutLog={currentWorkoutLog}
                  setCurrentWorkoutLog={setCurrentWorkoutLog}
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
