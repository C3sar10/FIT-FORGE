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
import { useAuth } from "@/context/AuthContext";

interface ExerciseLiProps {
  exerciseObj: ExerciseType;
  setCurrentWorkoutLog?: (arg0: WorkoutLogType | null) => void;
  currentWorkoutLog?: WorkoutLogType | null;
  exerciseLogEntry?: import("@/types/progress").ExerciseLogEntry;
}

const LiveExerciseLi: React.FC<ExerciseLiProps> = ({
  exerciseObj,
  setCurrentWorkoutLog,
  currentWorkoutLog,
  exerciseLogEntry,
}) => {
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isChecked, setIsChecked] = useState(false);

  if (!exerciseObj)
    return (
      <li className="w-full p-2 rounded-md bg-neutral-800 text-neutral-500">
        Loading exercise...
      </li>
    );

  // Check if this exercise is completed
  useEffect(() => {
    if (currentWorkoutLog && exerciseLogEntry) {
      setIsChecked(exerciseLogEntry.completed || false);
    }
  }, [currentWorkoutLog, exerciseLogEntry]);

  const handleCheck = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newCheckedState = event.target.checked;
    setIsChecked(newCheckedState);

    if (!setCurrentWorkoutLog || !currentWorkoutLog || !exerciseLogEntry)
      return;

    // Update the exercise completion status in the log entry
    const updatedExerciseList =
      currentWorkoutLog.workoutDetails.exerciseList.map((entry) => {
        if (entry.exerciseId === exerciseObj.id) {
          return { ...entry, completed: newCheckedState };
        }
        return entry;
      });

    // Also update the exercisesCompleted array for backward compatibility
    const exercisesCompleted = newCheckedState
      ? [
          ...currentWorkoutLog.workoutDetails.exercisesCompleted,
          exerciseObj.id || "",
        ]
      : currentWorkoutLog.workoutDetails.exercisesCompleted.filter(
          (id) => id !== exerciseObj.id
        );

    setCurrentWorkoutLog({
      ...currentWorkoutLog,
      workoutDetails: {
        ...currentWorkoutLog.workoutDetails,
        exerciseList: updatedExerciseList,
        exercisesCompleted: exercisesCompleted.filter((id) => id), // Remove empty strings
      },
    });
  };

  const addSet = () => {
    if (!setCurrentWorkoutLog || !currentWorkoutLog || !exerciseLogEntry)
      return;

    const newSetNumber = (exerciseLogEntry.actualSets?.length || 0) + 1;
    const newSet = {
      setNumber: newSetNumber,
      reps: 0,
      weight: 0,
      completed: false,
      restTime: exerciseLogEntry.plannedRestSecs || 60,
    };

    const updatedExerciseList =
      currentWorkoutLog.workoutDetails.exerciseList.map((entry) => {
        if (entry.exerciseId === exerciseObj.id) {
          return {
            ...entry,
            actualSets: [...(entry.actualSets || []), newSet],
          };
        }
        return entry;
      });

    setCurrentWorkoutLog({
      ...currentWorkoutLog,
      workoutDetails: {
        ...currentWorkoutLog.workoutDetails,
        exerciseList: updatedExerciseList,
      },
    });
  };

  const updateSet = (
    setIndex: number,
    field: "reps" | "weight" | "completed",
    value: number | boolean
  ) => {
    if (!setCurrentWorkoutLog || !currentWorkoutLog || !exerciseLogEntry)
      return;

    const updatedExerciseList =
      currentWorkoutLog.workoutDetails.exerciseList.map((entry) => {
        if (entry.exerciseId === exerciseObj.id) {
          const updatedSets = [...(entry.actualSets || [])];
          if (updatedSets[setIndex]) {
            updatedSets[setIndex] = {
              ...updatedSets[setIndex],
              [field]: value,
            };
          }
          return { ...entry, actualSets: updatedSets };
        }
        return entry;
      });

    setCurrentWorkoutLog({
      ...currentWorkoutLog,
      workoutDetails: {
        ...currentWorkoutLog.workoutDetails,
        exerciseList: updatedExerciseList,
      },
    });
  };

  const removeSet = (setIndex: number) => {
    if (!setCurrentWorkoutLog || !currentWorkoutLog || !exerciseLogEntry)
      return;

    const updatedExerciseList =
      currentWorkoutLog.workoutDetails.exerciseList.map((entry) => {
        if (entry.exerciseId === exerciseObj.id) {
          const updatedSets =
            entry.actualSets?.filter((_, index) => index !== setIndex) || [];
          // Renumber sets
          const renumberedSets = updatedSets.map((set, index) => ({
            ...set,
            setNumber: index + 1,
          }));
          return { ...entry, actualSets: renumberedSets };
        }
        return entry;
      });

    setCurrentWorkoutLog({
      ...currentWorkoutLog,
      workoutDetails: {
        ...currentWorkoutLog.workoutDetails,
        exerciseList: updatedExerciseList,
      },
    });
  };

  // Helper to determine if exercise uses weight
  const usesWeight =
    exerciseObj.details?.targetMetric?.type === "weight" ||
    exerciseObj.tags?.some((tag) =>
      ["strength", "barbell", "dumbbell", "plates"].includes(tag.toLowerCase())
    );

  return (
    <li className="w-full rounded-md border border-neutral-200 bg-black/50 overflow-hidden">
      {/* Exercise Header */}
      <div
        className="w-full p-3 flex items-center justify-between hover:bg-black/70 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <input
            checked={isChecked}
            onChange={handleCheck}
            onClick={(e) => e.stopPropagation()}
            type="checkbox"
            className="size-5 bg-transparent border-white"
          />
          <div className="flex flex-col items-start">
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
              } flex items-center gap-1 text-xs text-neutral-300`}
            >
              <span>
                Planned:{" "}
                {exerciseLogEntry?.plannedSets ||
                  exerciseObj.details?.sets ||
                  3}{" "}
                sets
              </span>
              <span>•</span>
              <span>Done: {exerciseLogEntry?.actualSets?.length || 0}</span>
              {exerciseLogEntry?.actualSets &&
                exerciseLogEntry.actualSets.length > 0 && (
                  <>
                    <span>•</span>
                    <span>
                      Completed:{" "}
                      {
                        exerciseLogEntry.actualSets.filter(
                          (s: any) => s.completed
                        ).length
                      }
                    </span>
                  </>
                )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ChevronRightIcon
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/exercisepreview/${exerciseObj.id}`);
            }}
            className="size-4 text-neutral-400"
          />
          <ChevronDown
            className={`size-4 text-neutral-400 transition-transform ${
              isExpanded ? "rotate-180" : ""
            }`}
          />
        </div>
      </div>

      {/* Expanded Set Tracking */}
      {isExpanded && (
        <div className="px-3 pb-3 bg-black/30">
          <div className="space-y-2">
            {exerciseLogEntry?.actualSets?.map((set: any, index: number) => (
              <div
                key={index}
                className="flex items-center gap-2 p-2 bg-neutral-800/50 rounded-lg"
              >
                <span className="text-xs font-medium min-w-[40px]">
                  Set {set.setNumber}:
                </span>

                {/* Reps Input */}
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={set.reps}
                    onChange={(e) =>
                      updateSet(index, "reps", parseInt(e.target.value) || 0)
                    }
                    className="w-16 h-8 px-2 text-xs bg-neutral-700 border border-neutral-600 rounded text-center text-white"
                    placeholder="Reps"
                    min="0"
                  />
                  <span className="text-xs text-neutral-400">reps</span>
                </div>

                {/* Weight Input (if applicable) */}
                {usesWeight && (
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={set.weight || 0}
                      onChange={(e) =>
                        updateSet(
                          index,
                          "weight",
                          parseInt(e.target.value) || 0
                        )
                      }
                      className="w-16 h-8 px-2 text-xs bg-neutral-700 border border-neutral-600 rounded text-center text-white"
                      placeholder="Weight"
                      min="0"
                    />
                    <span className="text-xs text-neutral-400">
                      {exerciseObj.details?.targetMetric?.unit || "lbs"}
                    </span>
                  </div>
                )}

                {/* Set Complete Toggle */}
                <input
                  type="checkbox"
                  checked={set.completed}
                  onChange={(e) =>
                    updateSet(index, "completed", e.target.checked)
                  }
                  className="size-4"
                  title="Mark set as complete"
                />

                {/* Remove Set Button */}
                <button
                  onClick={() => removeSet(index)}
                  className="ml-auto px-2 py-1 text-xs bg-red-600 hover:bg-red-500 rounded text-white"
                  title="Remove set"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          {/* Add Set Button */}
          <button
            onClick={addSet}
            className="w-full mt-2 py-2 text-sm bg-lime-600 hover:bg-lime-500 rounded text-white font-medium"
          >
            + Add Set
          </button>

          {/* Target Metric Display */}
          {exerciseObj.details?.targetMetric?.number && (
            <div className="mt-2 p-2 bg-lime-900/20 border border-lime-600/30 rounded text-xs text-lime-300">
              🎯 Target: {exerciseObj.details.targetMetric.number}{" "}
              {exerciseObj.details.targetMetric.unit}
            </div>
          )}
        </div>
      )}
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
  const { user } = useAuth();

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
            sets: exerciseMap.get(id)?.details?.sets ?? 0,
            reps: exerciseMap.get(id)?.details?.reps ?? "N/A",
            restSecs: exerciseMap.get(id)?.details?.restSecs ?? 0,
            equipment: exerciseMap.get(id)?.details?.equipment ?? [],
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
                sets: exerciseMap.get(id)?.details?.sets ?? 0,
                reps: exerciseMap.get(id)?.details?.reps ?? "N/A",
                restSecs: exerciseMap.get(id)?.details?.restSecs ?? 0,
                equipment: exerciseMap.get(id)?.details?.equipment ?? [],
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

      (async () => {
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
              exerciseList: exerciseList.map((exercise) => ({
                exerciseId: exercise.id,
                name: exercise.title || "",
                plannedSets: exercise.details?.sets || 3,
                plannedReps: exercise.details?.reps || "8-12",
                plannedRestSecs: exercise.details?.restSecs || 60,
                actualSets: [],
                completed: false,
                notes: "",
              })),
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
              {exerciseList.map((exercise) => {
                // Find the corresponding exercise log entry
                const exerciseLogEntry =
                  currentWorkoutLog?.workoutDetails?.exerciseList?.find(
                    (entry) => entry.exerciseId === exercise.id
                  );

                return (
                  <LiveExerciseLi
                    exerciseObj={exercise}
                    key={exercise.id}
                    currentWorkoutLog={currentWorkoutLog}
                    setCurrentWorkoutLog={setCurrentWorkoutLog}
                    exerciseLogEntry={exerciseLogEntry}
                  />
                );
              })}
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
