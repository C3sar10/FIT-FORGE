"use client";
import { LogAPI } from "@/lib/api";
import { WorkoutBlockItem } from "@/types/workout";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, DumbbellIcon, Flame, Star, Timer } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useMemo } from "react";

type Props = {};

const page = (props: Props) => {
  const router = useRouter();
  const { logId } = useParams();
  const [exercisesCompleted, setExercisesCompleted] = React.useState<
    WorkoutBlockItem[]
  >([]);
  const [exercisesNotCompleted, setExercisesNotCompleted] = React.useState<
    WorkoutBlockItem[]
  >([]);

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

  /*
  const exercisesCompleted = useMemo(() => {
    return (
      data?.workoutDetails.exerciseList?.filter((exercise: WorkoutBlockItem) =>
        data?.workoutDetails.exercisesCompleted.includes(exercise.exerciseId)
      ) || []
    );
  }, [data]);

  const exercisesNotCompleted = useMemo(() => {
    return (
      data?.workoutDetails.exerciseList?.filter(
        (exercise: WorkoutBlockItem) =>
          !data?.workoutDetails.exercisesCompleted.includes(exercise.exerciseId)
      ) || []
    );
  }, [data]);*/

  useEffect(() => {
    if (data) {
      const exercisesCompleted = data.workoutDetails.exerciseList.filter(
        (exercise: WorkoutBlockItem) =>
          data.workoutDetails.exercisesCompleted.includes(exercise.exerciseId)
      );
      setExercisesCompleted(exercisesCompleted);

      const exercisesNotCompleted = data.workoutDetails.exerciseList.filter(
        (exercise: WorkoutBlockItem) =>
          !data.workoutDetails.exercisesCompleted.includes(exercise.exerciseId)
      );
      setExercisesNotCompleted(exercisesNotCompleted);
      console.log("Data: ", data);
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
            <h1 className="text-3xl md:text-4xl font-semibold">
              {data?.title || "Untitled Workout"}
            </h1>
            <p className="text-sm text-neutral-400">Log ID: {logId}</p>
            <p className="text-base md:text-lg text-neutral-400 mb-2">
              {data?.description || "No description provided."}
            </p>
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
            <div className="cursor-pointer w-full max-w-[200px] px-4 py-2 border border-neutral-200 hover:bg-neutral-200 hover:text-black rounded-sm flex items-center justify-center text-xs">
              Edit Log
            </div>
            <div className="cursor-pointer w-full max-w-[200px] px-4 py-2 border border-red-500 text-red-500 hover:bg-red-500 hover:text-white rounded-sm flex items-center justify-center text-xs">
              Delete Log
            </div>
          </div>
        </div>
        <div className="w-full flex flex-col py-4">
          <div className="w-full flex items-center grow justify-between mb-4">
            <h2 className="text-base md:text-lg font-medium">
              Workout Details
            </h2>
            <p className="text-base text-neutral-400">
              {new Date(data?.workoutDate).toLocaleDateString()}
            </p>
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
                <p className="text-neutral-400 text-base">
                  {data?.workoutDetails?.duration}
                </p>
              </div>
            </div>
            <div className="flex grow border border-neutral-200 rounded-md p-4">
              <DumbbellIcon className="mr-2" size={24} />
              <div className="flex flex-col">
                <p className="text-base font-medium">Type</p>
                <p className="text-neutral-400 text-base">
                  {data?.workoutDetails?.type}
                </p>
              </div>
            </div>
            <div className="flex grow p-4 border border-neutral-200 rounded-md">
              <Star className="mr-2" size={24} />
              <div className="flex flex-col">
                <p className="text-base font-medium">Rating</p>
                <p className="text-neutral-400 text-base">
                  {data?.rating || "N/A"}
                </p>
              </div>
            </div>
            <div className="flex grow p-4 border border-neutral-200 rounded-md">
              <Flame className="mr-2" size={24} />
              <div className="flex flex-col">
                <p className="text-base font-medium">Intensity</p>
                <p className="text-neutral-400 text-base">
                  {data?.intensity || "N/A"}
                </p>
              </div>
            </div>
          </div>
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
          <div className="w-full flex flex-col gap-2">
            <h2 className="text-base md:text-lg font-medium">Notes</h2>
            <p className="text-neutral-400 text-base">
              {data?.notes || "No notes provided."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default page;
