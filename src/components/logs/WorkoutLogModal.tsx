"use client";
import { useDialog } from "@/context/DialogContext";
import { useLogGlobal } from "@/context/LogContext";
import { ExerciseApiType, ExerciseType } from "@/types/workout";
import { MoreHorizontal, Star, X } from "lucide-react";
import { useTheme } from "next-themes";
import React, { useEffect, useState } from "react";
import { LogAPI } from "@/lib/api";

interface ExerciseLogLiProps {
  complete: boolean;
  exerciseObject: ExerciseApiType | ExerciseType;
}

const ExerciseLogLi: React.FC<ExerciseLogLiProps> = ({
  complete,
  exerciseObject,
}) => {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [isLight, setIsLight] = useState(theme === "light");
  const [showMenu, setShowMenu] = useState(false);
  const [isComplete, setIsComplete] = useState(complete);
  const { setCurrentWorkoutLog, currentWorkoutLog } = useLogGlobal();

  useEffect(() => {
    if (isLight !== (theme === "light")) {
      setIsLight(theme === "light");
    }
  }, [theme, isLight]);

  const toggleComplete = () => {
    if (!currentWorkoutLog) return;
    setCurrentWorkoutLog({
      ...currentWorkoutLog,
      workoutDetails: {
        ...currentWorkoutLog.workoutDetails,
        exercisesCompleted: isComplete
          ? currentWorkoutLog?.workoutDetails.exercisesCompleted.filter(
              (id) =>
                id !==
                ("id" in exerciseObject
                  ? exerciseObject.id
                  : exerciseObject.exerciseId)
            )
          : [
              ...currentWorkoutLog?.workoutDetails.exercisesCompleted,
              "id" in exerciseObject
                ? exerciseObject.id
                : exerciseObject.exerciseId,
            ],
      },
    });
    // handle both types
    setIsComplete(!isComplete);
  };

  useEffect(() => {
    setIsComplete(complete);
  }, [complete]);

  return (
    <li
      className={`w-full border border-neutral-200 rounded-md h-20 flex items-center justify-between p-2
    
    `}
    >
      <div className="flex items-center gap-4 h-full">
        <div className="aspect-square rounded-sm bg-neutral-200 h-full w-auto"></div>
        <div className="flex flex-col items-start">
          <p className="text-base">
            {"title" in exerciseObject
              ? exerciseObject.title
              : exerciseObject.name}
          </p>
          <p
            className={`p-1 px-2 tracking-wider text-xs rounded-sm border-neutral-200 border ${
              isComplete
                ? "text-lime-400 bg-lime-900"
                : "text-red-400 bg-red-950"
            }`}
          >
            {isComplete ? "Complete" : "Incomplete"}
          </p>
        </div>
      </div>
      <button className="p-1 px-2 rounded-sm flex items-center justify-center text-neutral-200 relative">
        <MoreHorizontal onClick={() => setShowMenu(true)} size={16} />
        <div
          className={` 
          ${showMenu ? "" : "hidden"}
          absolute bottom-0 right-0 flex flex-col items-startw-fit min-w-[200px] border p-1 rounded-2xl border-neutral-200 ${
            isLight ? "bg-white" : "bg-[#121212]"
          }`}
        >
          <X
            onClick={() => setShowMenu(false)}
            size={14}
            className="text-neutral-200 hover:text-neutral-400 absolute right-2 top-2"
          />
          <p onClick={toggleComplete} className="text-sm w-full p-2 text-left">
            {isComplete ? "Set incomplete" : "Set complete"}
          </p>
          <p className="text-sm w-full p-2 text-left border-t border-neutral-200">
            Adjust Exerise Details
          </p>
        </div>
      </button>
    </li>
  );
};

const PostWorkoutLog = () => {
  const { logOpen, setLogOpen, currentWorkoutLog, setCurrentWorkoutLog } =
    useLogGlobal();

  const date = new Date();
  const dateString = date.toDateString();
  let hours: string | number = date.getHours();
  let minutes: string | number = date.getMinutes();
  let seconds: string | number = date.getSeconds();

  // Add leading zeros if the number L less than 10
  hours = hours < 10 ? "0" + hours : hours;
  minutes = minutes < 10 ? "0" + minutes : minutes;
  seconds = seconds < 10 ? "0" + seconds : seconds;

  const currentTime = `${hours}:${minutes}:${seconds}`;

  const [starRating, setStarRating] = useState(0);
  const [oneStar, setOneStar] = useState(false);
  const [twoStar, setTwoStar] = useState(false);
  const [threeStar, setThreeStar] = useState(false);
  const [fourStar, setFourStar] = useState(false);
  const [fiveStar, setFiveStar] = useState(false);
  const [intensityRating, setIntensityRating] = useState(0);
  const [oneIntStar, setOneIntStar] = useState(false);
  const [twoIntStar, setTwoIntStar] = useState(false);
  const [threeIntStar, setThreeIntStar] = useState(false);
  const [fourIntStar, setFourIntStar] = useState(false);
  const [fiveIntStar, setFiveIntStar] = useState(false);

  const handleRating = (starNumber: number) => {
    //rating
    setStarRating(starNumber);
    if (currentWorkoutLog) {
      setCurrentWorkoutLog({ ...currentWorkoutLog, rating: starNumber });
    }
    if (starNumber === 5) {
      setFiveStar(true);
      setFourStar(true);
      setThreeStar(true);
      setTwoStar(true);
      setOneStar(true);
    }
    if (starNumber === 4) {
      setFiveStar(false);
      setFourStar(true);
      setThreeStar(true);
      setTwoStar(true);
      setOneStar(true);
    }
    if (starNumber === 3) {
      setFiveStar(false);
      setFourStar(false);
      setThreeStar(true);
      setTwoStar(true);
      setOneStar(true);
    }
    if (starNumber === 2) {
      setFiveStar(false);
      setFourStar(false);
      setThreeStar(false);
      setTwoStar(true);
      setOneStar(true);
    }
    if (starNumber === 1) {
      setFiveStar(false);
      setFourStar(false);
      setThreeStar(false);
      setTwoStar(false);
      setOneStar(true);
    }
    if (starNumber === 0) {
      setFiveStar(false);
      setFourStar(false);
      setThreeStar(false);
      setTwoStar(false);
      setOneStar(false);
    }
  };

  const handleIntensity = (starNumber: number) => {
    //rating
    setIntensityRating(starNumber);
    if (currentWorkoutLog) {
      setCurrentWorkoutLog({ ...currentWorkoutLog, intensity: starNumber });
    }
    if (starNumber === 5) {
      setFiveIntStar(true);
      setFourIntStar(true);
      setThreeIntStar(true);
      setTwoIntStar(true);
      setOneIntStar(true);
    }
    if (starNumber === 4) {
      setFiveIntStar(false);
      setFourIntStar(true);
      setThreeIntStar(true);
      setTwoIntStar(true);
      setOneIntStar(true);
    }
    if (starNumber === 3) {
      setFiveIntStar(false);
      setFourIntStar(false);
      setThreeIntStar(true);
      setTwoIntStar(true);
      setOneIntStar(true);
    }
    if (starNumber === 2) {
      setFiveIntStar(false);
      setFourIntStar(false);
      setThreeIntStar(false);
      setTwoIntStar(true);
      setOneIntStar(true);
    }
    if (starNumber === 1) {
      setFiveIntStar(false);
      setFourIntStar(false);
      setThreeIntStar(false);
      setTwoIntStar(false);
      setOneIntStar(true);
    }
    if (starNumber === 0) {
      setFiveIntStar(false);
      setFourIntStar(false);
      setThreeIntStar(false);
      setTwoIntStar(false);
      setOneIntStar(false);
    }
  };

  const [notes, setNotes] = useState("");

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNotes(e.target.value);
    if (currentWorkoutLog) {
      setCurrentWorkoutLog({ ...currentWorkoutLog, notes: e.target.value });
    }
  };

  return (
    <div className="w-full flex flex-col py-4 max-w-[500px] mx-0 gap-4 pb-10">
      <ul className="w-full flex flex-col gap-1 border-b border-neutral-200">
        <li className="w-full flex flex-col items-start">
          <p className="font-medium text-neutral-400">Workout Title</p>
          <p className="text-2xl">
            {currentWorkoutLog?.workoutDetails.workoutTitle}
          </p>
        </li>
        <li className="w-full flex flex-wrap ">
          <div className="w-fit py-4 flex grow flex-col items-start">
            <p className="font-medium text-sm text-neutral-400">Date</p>
            <p className="text-base">{dateString}</p>
          </div>
          <div className="w-fit py-4 flex grow flex-col items-start">
            <p className="font-medium text-sm text-neutral-400">
              Total Duration
            </p>
            <p className="text-base">
              {currentWorkoutLog?.workoutDetails.duration}
            </p>
          </div>
          <div className="w-fit py-4 flex grow flex-col items-start">
            <p className="font-medium text-sm text-neutral-400">Current Time</p>
            <p className="text-base">{currentTime}</p>
          </div>
        </li>
      </ul>
      <div className="w-full flex flex-col gap-2 pb-8 border-b border-neutral-200">
        <div className="w-full flex flex-col gap-1">
          <h2 className="font-medium text-neutral-400">Exercise Details</h2>
          <ul className="w-full flex flex-col gap-2">
            {
              // Map through currentWorkoutLog?.workoutDetails.exercises to render ExerciseLogLi components
              currentWorkoutLog?.workoutDetails.exerciseList.map(
                (exercise, index) => {
                  let isComplete;
                  if ("id" in currentWorkoutLog.workoutDetails.exerciseList) {
                    //console.log("Exercise List: ", exercise.id);
                    isComplete =
                      currentWorkoutLog.workoutDetails.exercisesCompleted.includes(
                        exercise.id
                      );
                    //console.log("Exer is complete: ", isComplete);
                  } else {
                    //console.log("Exercise List: ", exercise.exerciseId);
                    isComplete =
                      currentWorkoutLog.workoutDetails.exercisesCompleted.includes(
                        exercise.exerciseId
                      );
                    //console.log("Exer is complete: ", isComplete);
                  }

                  return (
                    <ExerciseLogLi
                      key={index}
                      complete={isComplete}
                      exerciseObject={exercise}
                    />
                  );
                }
              )
            }
          </ul>
        </div>
      </div>
      <div className="w-full flex flex-col gap-2 h-full">
        <div className="w-full flex flex-col gap-1">
          <h2 className="font-medium text-neutral-400">Last Details</h2>
          <ul className="w-full flex flex-col gap-4">
            <li className="w-full flex flex-col items-start">
              <p className="font-medium ">
                What Rating do you give this workout?{" "}
                <span className="text-sm italic">(1 - 5)</span>{" "}
              </p>
              <div className="flex items-center gap-2">
                <Star
                  onClick={
                    oneStar ? () => handleRating(0) : () => handleRating(1)
                  }
                  className={`${
                    oneStar ? "fill fill-lime-700" : "fill-transparent"
                  } size-8`}
                />
                <Star
                  onClick={
                    twoStar ? () => handleRating(0) : () => handleRating(2)
                  }
                  className={`${
                    twoStar ? "fill fill-lime-700" : "fill-transparent"
                  } size-8`}
                />
                <Star
                  onClick={
                    threeStar ? () => handleRating(0) : () => handleRating(3)
                  }
                  className={`${
                    threeStar ? "fill fill-lime-700" : "fill-transparent"
                  } size-8`}
                />
                <Star
                  onClick={
                    fourStar ? () => handleRating(0) : () => handleRating(4)
                  }
                  className={`${
                    fourStar ? "fill fill-lime-700" : "fill-transparent"
                  } size-8`}
                />
                <Star
                  onClick={
                    fiveStar ? () => handleRating(0) : () => handleRating(5)
                  }
                  className={`${
                    fiveStar ? "fill fill-lime-700" : "fill-transparent"
                  } size-8`}
                />
              </div>
            </li>
            <li className="w-full flex flex-col items-start">
              <p className="font-medium ">
                What was the intensity level for this workout?{" "}
                <span className="text-sm italic">(1 - 5)</span>{" "}
              </p>
              <div className="flex items-center gap-2">
                <Star
                  onClick={
                    oneIntStar
                      ? () => handleIntensity(0)
                      : () => handleIntensity(1)
                  }
                  className={`${
                    oneIntStar ? "fill fill-lime-700" : "fill-transparent"
                  } size-8`}
                />
                <Star
                  onClick={
                    twoIntStar
                      ? () => handleIntensity(0)
                      : () => handleIntensity(2)
                  }
                  className={`${
                    twoIntStar ? "fill fill-lime-700" : "fill-transparent"
                  } size-8`}
                />
                <Star
                  onClick={
                    threeIntStar
                      ? () => handleIntensity(0)
                      : () => handleIntensity(3)
                  }
                  className={`${
                    threeIntStar ? "fill fill-lime-700" : "fill-transparent"
                  } size-8`}
                />
                <Star
                  onClick={
                    fourIntStar
                      ? () => handleIntensity(0)
                      : () => handleIntensity(4)
                  }
                  className={`${
                    fourIntStar ? "fill fill-lime-700" : "fill-transparent"
                  } size-8`}
                />
                <Star
                  onClick={
                    fiveIntStar
                      ? () => handleIntensity(0)
                      : () => handleIntensity(5)
                  }
                  className={`${
                    fiveIntStar ? "fill fill-lime-700" : "fill-transparent"
                  } size-8`}
                />
              </div>
            </li>
            <li className="w-full flex flex-col items-start">
              <p className="font-medium ">Notes</p>
              <textarea
                name="notes"
                id="notes"
                onChange={handleNotesChange}
                cols={30}
                rows={4}
                className="w-full border border-neutral-200 rounded-sm p-4"
              ></textarea>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

type Props = {};

const WorkoutLogModal: React.FC<Props> = () => {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [isLight, setIsLight] = useState(theme === "light");
  const {
    logOpen,
    setLogOpen,
    isPostWorkoutLog,
    currentWorkoutLog,
    setCurrentWorkoutLog,
  } = useLogGlobal();
  const { showDialog } = useDialog();

  useEffect(() => {
    if (isLight !== (theme === "light")) {
      setIsLight(theme === "light");
    }
  }, [theme, isLight]);

  const handleDiscard = async () => {
    const result = await showDialog({
      title: "Discard Workout Log?",
      message: "Are you sure you want to leave? Your log will not be saved.",
      actions: [
        { id: "stay", label: "Stay", variant: "secondary" },
        { id: "confirm", label: "Discard", variant: "danger" },
      ],
    });
    if (result === "confirm") {
      setCurrentWorkoutLog(null);
      setLogOpen(false);
    }
    // else do nothing, stay in log
  };

  const handleSave = async () => {
    const result = await showDialog({
      title: "Save Workout Log?",
      message: "Are you sure you want to save your workout log?",
      actions: [
        { id: "cancel", label: "Cancel", variant: "secondary" },
        { id: "save", label: "Save Log", variant: "primary" },
      ],
    });
    if (result === "save") {
      if (currentWorkoutLog) {
        try {
          await LogAPI.createLog(currentWorkoutLog);
          console.log("Workout log saved to DB:", currentWorkoutLog);
        } catch (err) {
          console.error("Error saving workout log:", err);
        }
      }
      setLogOpen(false);
      setCurrentWorkoutLog(null); // Clear the log after saving
    }
    // else do nothing, stay in log
  };

  return (
    <div
      className={`${
        logOpen ? "block" : "hidden"
      } w-screen h-screen fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50`}
    >
      <div
        className={`flex flex-col items-center w-full max-w-[600px] h-[80vh] min-h-[600px] p-4 py-8 rounded-2xl border-neutral-200 overflow-y-scroll
            ${isLight ? "bg-white" : "bg-[#121212]"}
        `}
      >
        <h1 className="text-2xl font-medium md:text-4xl">Log Workout</h1>
        {isPostWorkoutLog && <PostWorkoutLog />}
        <div className="w-full p-4 flex items-center gap-4 justify-end">
          <button
            className="p-4 px-6 rounded-md bg-red-700 text-white tracking-wider  hover:bg-red-900"
            onClick={handleDiscard}
          >
            Discard Log
          </button>
          <button
            onClick={handleSave}
            className="p-4 px-6 rounded-md bg-lime-700 text-white tracking-wider  hover:bg-lime-500"
          >
            Save Log
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorkoutLogModal;
