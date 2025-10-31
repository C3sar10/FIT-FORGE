"use client";
import { useDialog } from "@/context/DialogContext";
import { LogAPI } from "@/lib/api";
import { WorkoutBlockItem } from "@/types/workout";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, DumbbellIcon, Flame, Star, Timer } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useMemo } from "react";

interface ExerProps {
  exercise: WorkoutBlockItem;
  completed?: boolean;
  completedList?: string[];
  setCompletedList?: (ids: string[]) => void;
}

const ExerLi = ({
  exercise,
  completed,
  setCompletedList,
  completedList,
}: ExerProps) => {
  const handleToggle = () => {
    if (!setCompletedList || !completedList) return;
    if (completed) {
      //remove from completed list
      const newList = completedList.filter(
        (id: string) => id !== exercise.exerciseId
      );
      setCompletedList(newList);
    } else {
      //add to completed list
      const newList = [...completedList, exercise.exerciseId];
      setCompletedList(newList);
    }
  };

  return (
    <li
      className={`w-full cursor-pointer max-w-[600px] mx-auto p-2 border ${
        completed ? "border-lime-500" : "border-red-500"
      } rounded-md flex items-center justify-between`}
    >
      <div className="mr-2">{exercise.name}</div>
      <div
        onClick={handleToggle}
        className={`p-2 text-xs bg-black text-white hover:bg-neutral-400  rounded-sm flex items-center justify-center`}
      >
        Mark {completed ? "Incomplete" : "Complete"}
      </div>
    </li>
  );
};

type Props = {};

const page = (props: Props) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { logId } = useParams();
  const [exercisesCompleted, setExercisesCompleted] = React.useState<
    WorkoutBlockItem[]
  >([]);
  const [exercisesNotCompleted, setExercisesNotCompleted] = React.useState<
    WorkoutBlockItem[]
  >([]);

  const [editMode, setEditMode] = React.useState<boolean>(false);
  //edit mode changes
  const [editedTitle, setEditedTitle] = React.useState<string>("");
  const [editedDescription, setEditedDescription] = React.useState<string>("");
  const [editedNotes, setEditedNotes] = React.useState<string>("");
  const [editedRating, setEditedRating] = React.useState<number | null>(null);
  const [editedIntensity, setEditedIntensity] = React.useState<number | null>(
    null
  );
  const [editedWorkoutDate, setEditedWorkoutDate] = React.useState<
    string | null
  >("");
  const [editedMinutes, setEditedMinutes] = React.useState<number | null>(null);
  const [editedSeconds, setEditedSeconds] = React.useState<number | null>(null);
  const [editedExercisesCompleted, setEditedExercisesCompleted] =
    React.useState<string[]>([]);

  const { showDialog, closeDialog } = useDialog();

  const handleDelete = async () => {
    // Implement delete functionality
    const result = await showDialog({
      title: "Delete Workout Log?",
      message: `Are you sure you want to delete your workout log ${data?.title}? This action cannot be undone.`,
      actions: [
        { id: "cancel", label: "Cancel", variant: "secondary" },
        { id: "delete", label: "Delete Log", variant: "danger" },
      ],
    });

    if (result === "delete") {
      // Call API to delete log
      try {
        await LogAPI.deleteLog(data?.logId as string);
        // Optionally, refresh the list or provide feedback
        queryClient.invalidateQueries({ queryKey: ["workoutLogs"] });
      } catch (error) {
        console.error("Failed to delete workout log:", error);
      } finally {
        closeDialog();
        router.back();
      }
    }
  };

  const handleSaveChanges = async () => {
    // Save changes to the workout log
    const newWorkoutTimestamp =
      editedWorkoutDate !== null && editedWorkoutDate !== ""
        ? new Date(editedWorkoutDate).toISOString()
        : null;
    const newDuration =
      editedMinutes !== null || editedSeconds !== null
        ? `${editedMinutes || 0}m ${editedSeconds || 0}s`
        : null;
    const now = new Date();
    console.log("new duration: ", newDuration);
    console.log("edited exercises completed: ", editedExercisesCompleted);
    const updatedLog = {
      logId: data?.logId,
      userId: data?.userId,
      createdOn: data?.createdOn,
      lastUpdated: now.toISOString(),

      title: editedTitle || data?.title,
      description: editedDescription || data?.description,
      notes: editedNotes || data?.notes,
      rating: editedRating || data?.rating,
      intensity: editedIntensity || data?.intensity,
      workoutDate: editedWorkoutDate || data?.workoutDate,
      workoutDetails: {
        duration:
          editedMinutes !== null || editedSeconds !== null
            ? newDuration
            : data?.workoutDetails.duration,
        exercisesCompleted:
          editedExercisesCompleted || data?.exercisesCompleted,
        exerciseList: data?.workoutDetails.exerciseList,
        type: data?.workoutDetails.type,
        workoutTimestamp:
          newWorkoutTimestamp || data?.workoutDetails.workoutTimestamp,
        workoutId: data?.workoutDetails.workoutId,
        workoutTitle: data?.workoutDetails.workoutTitle,
      },
    };
    // Call API to save updated log
    console.log("Updated Log: ", updatedLog);
    try {
      await LogAPI.updateLog(data?.logId, updatedLog);
      setEditMode(false);
      queryClient.invalidateQueries({ queryKey: ["workoutLog", logId] });
    } catch (error) {
      console.error("Error updating log: ", error);
    }
  };

  if (!logId) {
    return <p>Log ID does not exist.</p>;
  }

  const { data, isLoading, error } = useQuery({
    queryKey: ["workoutLog", logId],
    queryFn: async () => {
      // Fetch workout log details from API
      const res = await LogAPI.getLog(logId as string);
      return res;
    },
  }); // Placeholder for data fetching logic

  useEffect(() => {
    if (data) {
      const exercisesCompleted = data.workoutDetails.exerciseList.filter(
        (exercise: WorkoutBlockItem) =>
          data.workoutDetails.exercisesCompleted.includes(exercise.exerciseId)
      );
      setEditedExercisesCompleted(data.workoutDetails.exercisesCompleted);
      setExercisesCompleted(exercisesCompleted);
      const exercisesNotCompleted = data.workoutDetails.exerciseList.filter(
        (exercise: WorkoutBlockItem) =>
          !data.workoutDetails.exercisesCompleted.includes(exercise.exerciseId)
      );
      setExercisesNotCompleted(exercisesNotCompleted);
      console.log("Data: ", data);
      setEditedNotes(data.notes || "");
      setEditedIntensity(data.intensity || 0);
      setEditedRating(data.rating || 0);
    }
  }, [data]);

  return (
    <div className="w-full h-full flex flex-col items-start">
      <div className="flex w-full p-4 items-center">
        <ArrowLeft
          className="cursor-pointer hover:text-lime-500"
          size={24}
          onClick={() => router.back()}
        />
      </div>
      <div className="w-full flex flex-col p-4">
        <div className="w-full flex flex-wrap gap-2 pb-4 border-b border-neutral-200">
          <div className="flex flex-col grow">
            {editMode ? (
              <input
                placeholder="Log Title"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                className="border border-neutral-300 p-2 rounded-md w-full text-3xl mb-2"
              />
            ) : (
              <h1 className="text-3xl md:text-4xl font-semibold">
                {data?.title || "Untitled Workout"}
              </h1>
            )}
            {editMode ? (
              <textarea
                placeholder="Log Description"
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
                className="border border-neutral-300 p-2 rounded-md w-full text-base md:text-lg mb-2"
                rows={3}
              />
            ) : (
              <p className="text-base md:text-lg text-neutral-400 mb-2">
                {data?.description || "No description provided."}
              </p>
            )}

            <p className="text-sm text-neutral-400 mb-2">Log ID: {logId}</p>

            <div className="flex flex-wrap gap-4 grow w-full">
              <div className="flex flex-col items-center">
                <p className="text-sm font-medium">Created On</p>
                <p className="text-neutral-400 text-sm">
                  {new Date(data?.createdOn).toLocaleDateString()}
                </p>
              </div>
              <div className="flex flex-col items-center">
                <p className="text-sm font-medium">Last Updated</p>
                <p className="text-neutral-400 text-sm">
                  {new Date(data?.lastUpdated).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center gap-4">
            {editMode ? (
              <>
                <div
                  onClick={handleSaveChanges}
                  className="cursor-pointer w-full max-w-[200px] px-4 py-2 border border-neutral-200 hover:bg-neutral-200 hover:text-black rounded-sm flex items-center justify-center text-xs"
                >
                  Save Changes
                </div>
                <div
                  onClick={() => setEditMode(false)}
                  className="cursor-pointer w-full max-w-[200px] px-4 py-2 border border-neutral-200 hover:bg-neutral-200 hover:text-black rounded-sm flex items-center justify-center text-xs"
                >
                  Discard Changes
                </div>
              </>
            ) : (
              <div
                onClick={() => setEditMode(true)}
                className="cursor-pointer w-full max-w-[200px] px-4 py-2 border border-neutral-200 hover:bg-neutral-200 hover:text-black rounded-sm flex items-center justify-center text-xs"
              >
                Edit Log
              </div>
            )}

            <div
              onClick={handleDelete}
              className="cursor-pointer w-full max-w-[200px] px-4 py-2 border border-red-500 text-red-500 hover:bg-red-500 hover:text-white rounded-sm flex items-center justify-center text-xs"
            >
              Delete Log
            </div>
          </div>
        </div>
        <div className="w-full flex flex-col py-4">
          <div className="w-full flex items-center grow justify-between mb-4">
            <h2 className="text-base md:text-lg font-medium">
              Workout Details
            </h2>
            {editMode ? (
              <input
                type="date"
                value={editedWorkoutDate || ""}
                onChange={(e) => setEditedWorkoutDate(e.target.value)}
                className="border border-neutral-300 p-2 rounded-md w-full max-w-[200px] text-base"
              />
            ) : (
              <p className="text-base text-neutral-400">
                {new Date(data?.workoutDate).toLocaleDateString()}
              </p>
            )}
          </div>
          <h3 className="text-2xl md:text-3xl font-medium">
            {data?.workoutDetails?.workoutTitle}
          </h3>
          <p className="text-base md:text-lg mb-4">
            {data?.workoutDetails?.description ||
              "No workout description provided."}
          </p>
          <div className="w-full flex items-center flex-wrap gap-4 mb-4">
            <div className="flex grow p-4 border border-neutral-200 rounded-md">
              <Timer className="mr-2" size={24} />
              <div className="flex flex-col">
                <p className="text-base font-medium">Duration</p>
                {editMode ? (
                  <div className="flex items-center gap-2">
                    <div className="flex w-fit items-start gap-2">
                      <p className="text-sm">Min</p>
                      <input
                        type="number"
                        value={editedMinutes || 0}
                        onChange={(e) =>
                          setEditedMinutes(parseInt(e.target.value))
                        }
                        className="p-2 w-20 border border-neutral-200 rounded-md text-sm"
                      />
                    </div>
                    <div className="flex w-fit items-start gap-2">
                      <p className="text-sm">Sec</p>
                      <input
                        type="number"
                        value={editedSeconds || 0}
                        onChange={(e) =>
                          setEditedSeconds(parseInt(e.target.value))
                        }
                        className="p-2 w-20 border border-neutral-200 rounded-md text-sm"
                      />
                    </div>
                  </div>
                ) : (
                  <p className="text-neutral-400 text-base">
                    {data?.workoutDetails?.duration}
                  </p>
                )}
              </div>
            </div>
            {!editMode && (
              <div className="flex grow border border-neutral-200 rounded-md p-4">
                <DumbbellIcon className="mr-2" size={24} />
                <div className="flex flex-col">
                  <p className="text-base font-medium">Type</p>
                  <p className="text-neutral-400 text-base">
                    {data?.workoutDetails?.type}
                  </p>
                </div>
              </div>
            )}

            <div className="flex grow p-4 border border-neutral-200 rounded-md">
              <Star className="mr-2" size={24} />
              <div className="flex flex-col">
                <p className="text-base font-medium">Rating</p>
                {editMode ? (
                  <>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      step="1"
                      list="tickmarks"
                      defaultValue={editedRating || data?.rating}
                      onChange={(e) => setEditedRating(+e.target.value)}
                      className="slider bg-lime-500 accent-lime-500 p-2"
                    />
                    <datalist id="tickmarks">
                      <option value="1" label="1"></option>
                      <option value="2" label="2"></option>
                      <option value="3" label="3"></option>
                      <option value="4" label="4"></option>
                      <option value="5" label="5"></option>
                    </datalist>
                  </>
                ) : (
                  <p className="text-neutral-400 text-base">
                    {data?.rating + " / 5" || "N/A"}
                  </p>
                )}
              </div>
            </div>
            <div className="flex grow p-4 border border-neutral-200 rounded-md">
              <Flame className="mr-2" size={24} />
              <div className="flex flex-col">
                <p className="text-base font-medium">Intensity</p>
                {editMode ? (
                  <>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      step="1"
                      list="tickmarks"
                      defaultValue={editedIntensity || data?.intensity}
                      onChange={(e) => setEditedIntensity(+e.target.value)}
                      className="slider bg-lime-500 accent-lime-500 p-2"
                    />
                    <datalist id="tickmarks">
                      <option value="1" label="1"></option>
                      <option value="2" label="2"></option>
                      <option value="3" label="3"></option>
                      <option value="4" label="4"></option>
                      <option value="5" label="5"></option>
                    </datalist>
                  </>
                ) : (
                  <p className="text-neutral-400 text-base">
                    {data?.intensity + " / 5" || "N/A"}
                  </p>
                )}
              </div>
            </div>
          </div>
          {editMode ? (
            <div className="w-full flex flex-col gap-2 mb-4">
              <h2 className="text-base md:text-lg font-medium">
                Exercise List
              </h2>
              <ul className="pl-4 flex flex-col gap-2">
                {data?.workoutDetails?.exerciseList.map(
                  (exercise: WorkoutBlockItem) => (
                    <ExerLi
                      key={exercise.exerciseId}
                      exercise={exercise}
                      completed={editedExercisesCompleted.includes(
                        exercise.exerciseId
                      )}
                      setCompletedList={setEditedExercisesCompleted}
                      completedList={editedExercisesCompleted}
                    />
                  )
                )}
              </ul>
            </div>
          ) : (
            <>
              <div className="w-full flex flex-col gap-2 mb-4">
                <h2 className="text-base md:text-lg font-medium">
                  Exercises Completed
                </h2>
                <ul className="pl-4 flex flex-col gap-1 list-disc">
                  {exercisesCompleted && exercisesCompleted.length > 0 ? (
                    exercisesCompleted.map((exercise: WorkoutBlockItem) => (
                      <li key={exercise.exerciseId}>{exercise.name}</li>
                    ))
                  ) : (
                    <p className="text-neutral-400 text-sm">
                      No exercises completed in this workout.
                    </p>
                  )}
                </ul>
              </div>
              <div className="w-full flex flex-col gap-2 mb-4">
                <h2 className="text-base md:text-lg font-medium">
                  Exercises Not Completed
                </h2>
                <ul className="pl-4 flex flex-col gap-1 list-disc">
                  {exercisesNotCompleted && exercisesNotCompleted.length > 0 ? (
                    exercisesNotCompleted.map(
                      (exercise: WorkoutBlockItem, index: number) => (
                        <li key={index}>{exercise.name}</li>
                      )
                    )
                  ) : (
                    <p className="text-neutral-400 text-sm">None.</p>
                  )}
                </ul>
              </div>
            </>
          )}

          <div className="w-full flex flex-col gap-2">
            <h2 className="text-base md:text-lg font-medium">Notes</h2>
            {editMode ? (
              <textarea
                placeholder="Additional notes about the workout"
                value={editedNotes}
                onChange={(e) => setEditedNotes(e.target.value)}
                className="border border-neutral-300 p-2 rounded-md w-full text-base md:text-lg mb-2"
                rows={4}
              />
            ) : (
              <p className="text-neutral-400 text-base">
                {data?.notes || "No notes provided."}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default page;
