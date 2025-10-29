"use client";
import { useDialog } from "@/context/DialogContext";
import { useLogGlobal } from "@/context/LogContext";
import { ExerciseType, WorkoutType } from "@/types/workout";
import { MoreHorizontal, Star, X } from "lucide-react";
import { useTheme } from "next-themes";
import React, { useEffect, useMemo, useState } from "react";
import { http, LogAPI } from "@/lib/api";
import Alert from "../ui/Alert";
import { useAuth } from "@/context/AuthContext";

/** ---------- Local, tiny modal ---------- */
function Modal({
  open,
  onClose,
  children,
  title,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[120]">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 flex items-center justify-center px-4 sm:px-6"
        role="dialog"
        aria-modal="true"
      >
        <div className="w-full max-w-3xl rounded-2xl bg-neutral-900 text-white p-4 sm:p-6 border border-neutral-800 shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg sm:text-xl font-semibold">{title}</h2>
            <button
              onClick={onClose}
              className="rounded-lg p-2 hover:bg-neutral-800"
            >
              <X className="size-5" />
            </button>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

interface ExerciseLogLiProps {
  complete: boolean;
  exerciseObject: ExerciseType;
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
  //console.log("Current Log in Li: ", currentWorkoutLog);
  //console.log("Exercise Object: ", exerciseObject);
  const [exercise, setExercise] = useState<ExerciseType | null>(exerciseObject);

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
              (id) => id !== exerciseObject.id
            )
          : [
              ...currentWorkoutLog?.workoutDetails.exercisesCompleted,
              exerciseObject.id,
            ],
      },
    });
    // handle both types
    setIsComplete(!isComplete);
  };

  useEffect(() => {
    setIsComplete(complete);
  }, [complete]);

  useEffect(() => {
    if (
      !exerciseObject.hasOwnProperty("title") ||
      !exerciseObject.hasOwnProperty("name")
    ) {
      // fetch full exercise from api if only id is present
      const fetchExercise = async () => {
        try {
          const fullExercise = await http.get(
            `/exercises/${exerciseObject.id}`
          );
          //console.log("Full Exercise: ", fullExercise);
          setExercise(fullExercise);
        } catch (error) {
          console.error("Error fetching exercise: ", error);
        }
      };
      fetchExercise();
    }
  }, []);

  return (
    <li
      className={`w-full border border-neutral-200 rounded-md h-20 flex items-center justify-between p-2
    
    `}
    >
      <div className="flex items-center gap-4 h-full">
        <div className="aspect-square rounded-sm bg-neutral-200 h-full w-auto"></div>
        <div className="flex flex-col items-start">
          <p className="text-sm sm:text-base">{exercise && exercise.title}</p>
          <p
            className={`p-1 px-2 tracking-wider text-[10px] sm:text-xs rounded-sm border-neutral-200 border ${
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

type PostWorkoutLogProps = {
  isDone: boolean;
};

const PostWorkoutLog: React.FC<PostWorkoutLogProps> = ({ isDone }) => {
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

  useEffect(() => {
    if (isDone) handleReset();
  }, [isDone]);

  const handleReset = () => {
    setStarRating(0);
    setIntensityRating(0);
    setNotes("");
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
                        exercise.id
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

const CustomLog: React.FC<PostWorkoutLogProps> = ({ isDone }) => {
  const { logOpen, setLogOpen, currentWorkoutLog, setCurrentWorkoutLog } =
    useLogGlobal();

  const { user } = useAuth();

  const [selectedWorkout, setSelectedWorkout] = useState<null | WorkoutType>(
    null
  );

  const [pickerOpen, setPickerOpen] = useState(false);
  const [library, setLibrary] = useState<WorkoutType[]>([]);
  const [libLoaded, setLibLoaded] = useState(false);
  const [q, setQ] = useState("");

  const [exercisePickerOpen, setExercisePickerOpen] = useState(false);
  const [exerciseLibrary, setExerciseLibrary] = useState<ExerciseType[]>([]);
  const [exerciseLibLoaded, setExerciseLibLoaded] = useState(false);
  const [exerciseQ, setExerciseQ] = useState("");
  const [selectedExercises, setSelectedExercises] = useState<ExerciseType[]>(
    []
  );

  const exerciseLimitReached = selectedExercises.length >= 10;

  const filteredExercises = useMemo(() => {
    const qq = exerciseQ.trim().toLowerCase();
    console.log("Exercise Library: ", exerciseLibrary);
    if (!qq) return exerciseLibrary;
    return exerciseLibrary.filter((e) => e.title.toLowerCase().includes(qq));
  }, [exerciseLibrary, exerciseQ]);

  const loadExerciseLibrary = async () => {
    try {
      console.log("Entered load exercise library.");
      const data = await http.get<{
        items: ExerciseType[];
        nextCursor: string | null;
      }>("/exercises?scope=all&limit=50");
      // console.log("Data in load library: ", data);
      setExerciseLibrary(data.items);
      setExerciseLibLoaded(true);
    } catch (e: any) {
      setErrorMsg(e?.message || "Could not load exercises.");
    }
  };

  const quickAddExercise = (exercise: ExerciseType) => {
    console.log(exercise);
    if (exerciseLimitReached) return;
    setSelectedExercises([...selectedExercises, exercise]);
    setCurrentWorkoutLog({
      ...currentWorkoutLog!,
      workoutDetails: {
        ...currentWorkoutLog!.workoutDetails,
        exerciseList: [
          ...currentWorkoutLog!.workoutDetails.exerciseList,
          exercise,
        ],
      },
    });
  };

  useEffect(() => {
    if (exercisePickerOpen && !exerciseLibLoaded) loadExerciseLibrary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exercisePickerOpen]);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    console.log("Workout Library: ", library);
    if (!qq) return library;
    return library.filter((e) => e.name.toLowerCase().includes(qq));
  }, [library, q]);

  const limitReached = selectedWorkout === null ? false : true;

  const loadLibrary = async () => {
    try {
      console.log("Entered load library.");
      const data = await http.get<{
        items: WorkoutType[];
        nextCursor: string | null;
      }>("/workouts?scope=all&limit=50");
      // console.log("Data in load library: ", data);
      setLibrary(data.items);
      setSelectedWorkout(null);
      setLibLoaded(true);
    } catch (e: any) {
      setErrorMsg(e?.message || "Could not load workouts.");
    }
  };

  useEffect(() => {
    if (pickerOpen && !libLoaded) loadLibrary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pickerOpen]);

  const quickAdd = (ex: WorkoutType) => {
    console.log(ex);
    if (limitReached) return;
    setSelectedWorkout(ex);
    const now = new Date();
    const logObj = {
      logId: "",
      userId: user?.id ?? "",
      userName: user?.name ?? "",
      title: ex.name ?? "Workout Log",
      workoutDate: now.toISOString(),
      createdOn: now.toISOString(),
      lastUpdated: now.toISOString(),
      description: `Workout completed on ${now.toLocaleDateString()} at ${now.toLocaleTimeString()}`,
      workoutDetails: {
        workoutTimestamp: now.toISOString(),
        workoutTitle: ex.name ?? "",
        workoutId: ex.id ?? "",
        duration: 0,
        exerciseList: ex.blocks?.flatMap((b: any) => b.items ?? []) ?? [],
        exercisesCompleted: [],
        type: ex.type ?? "",
      },
      rating: undefined,
      intensity: undefined,
      notes: "",
    };
    setCurrentWorkoutLog(logObj);
    setPickerOpen(false);
  };

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

  useEffect(() => {
    if (isDone || !logOpen) handleReset();
  }, [isDone, logOpen]);

  const handleReset = () => {
    setStarRating(0);
    setIntensityRating(0);
    setNotes("");
    setSelectedWorkout(null);
    setOneStar(false);
    setTwoStar(false);
    setThreeStar(false);
    setFourStar(false);
    setFiveStar(false);
    setOneIntStar(false);
    setTwoIntStar(false);
    setThreeIntStar(false);
    setFourIntStar(false);
    setFiveIntStar(false);
    setCurrentWorkoutLog(null);
    setSelectedExercises([]);
    setPickerOpen(false);
    setExercisePickerOpen(false);
  };

  const handleCustom = () => {
    setSelectedWorkout({
      name: "",
      tags: [],
      id: "",
      description: "",
      author: user?.id || "unknown",
      type: "",
      isFavorite: false,
      blocks: [
        {
          title: "Main",
          items: [],
        },
      ],
    });
    const now = new Date();
    const logObj = {
      logId: "",
      userId: user?.id ?? "",
      userName: user?.name ?? "",
      title: selectedWorkout?.name ?? "Workout Log",
      workoutDate: now.toISOString(),
      createdOn: now.toISOString(),
      lastUpdated: now.toISOString(),
      description: `Workout completed on ${now.toLocaleDateString()} at ${now.toLocaleTimeString()}`,
      workoutDetails: {
        workoutTimestamp: now.toISOString(),
        workoutTitle: selectedWorkout?.name ?? "",
        workoutId: selectedWorkout?.id ?? "",
        duration: 0,
        exerciseList:
          selectedWorkout?.blocks?.flatMap((b: any) => b.items ?? []) ?? [],
        exercisesCompleted: [],
        type:
          typeof selectedWorkout?.type === "string" ? selectedWorkout.type : "",
      },
      rating: undefined,
      intensity: undefined,
      notes: "",
    };
    setCurrentWorkoutLog(logObj);
  };

  const [newExerciseName, setNewExerciseName] = useState("");
  const [newExerciseSets, setNewExerciseSets] = useState(0);
  const [newExerciseReps, setNewExerciseReps] = useState("");
  const [newExerciseCompleted, setNewExerciseCompleted] = useState(false);

  const handleAddExercise = () => {
    if (!selectedWorkout) return;
    const newExercise: ExerciseType = {
      id: "new-" + Date.now().toString(),
      title: newExerciseName,
      author: user?.name || "unknown",
      type: "strength",
      image: "",
      tags: ["custom"],
      details: {
        sets: newExerciseSets,
        reps: newExerciseReps,
        restSecs: 0,
        equipment: [],
      },
      description: "Custom Exercise",
    };
    // Add to currentWorkoutLog
    if (currentWorkoutLog) {
      setCurrentWorkoutLog({
        ...currentWorkoutLog,
        workoutDetails: {
          ...currentWorkoutLog.workoutDetails,
          exerciseList: [
            ...currentWorkoutLog.workoutDetails.exerciseList,
            newExercise,
          ],
          exercisesCompleted: newExerciseCompleted
            ? [
                ...currentWorkoutLog.workoutDetails.exercisesCompleted,
                newExercise.id,
              ]
            : currentWorkoutLog.workoutDetails.exercisesCompleted,
        },
      });
    }
  };

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [duration, setDuration] = useState(0);

  return (
    <>
      <div className="w-full h-fit flex flex-col py-4 max-w-[500px] mx-0 gap-4 pb-10">
        <Alert
          open={!!errorMsg}
          onClose={() => setErrorMsg(null)}
          title="Oops!"
          message={errorMsg ?? ""}
          variant="error"
          autoCloseMs={4000}
        />
        {!selectedWorkout && (
          <div className="w-full flex flex-col justify-center pb-4 h-full gap-4">
            <button
              onClick={() => setPickerOpen(true)}
              className="w-full max-w-[500px] mx-auto h-12 rounded-2xl bg-black hover:bg-[#1e1e1e] text-white flex items-center justify-center gap-2"
            >
              Select Workout
            </button>
            <button
              onClick={handleCustom}
              className="w-full max-w-[500px] mx-auto h-12 rounded-2xl bg-black hover:bg-[#1e1e1e] text-white flex items-center justify-center gap-2"
            >
              Log Custom Workout
            </button>
          </div>
        )}

        {selectedWorkout && (
          <>
            <ul className="w-full flex flex-col gap-1 border-b border-neutral-200">
              <li className="w-full flex flex-col items-start">
                <p className="font-medium text-neutral-400">Workout Title</p>
                {selectedWorkout.name && selectedWorkout.name !== "" ? (
                  <p className="text-2xl">
                    {currentWorkoutLog?.workoutDetails.workoutTitle}
                  </p>
                ) : (
                  <input
                    type="text"
                    className="border border-neutral-200 rounded-sm p-2 px-2 w-full text-base"
                    placeholder="Enter Workout Title"
                    value={currentWorkoutLog?.workoutDetails.workoutTitle || ""}
                    onChange={(e) =>
                      setCurrentWorkoutLog(
                        currentWorkoutLog
                          ? {
                              ...currentWorkoutLog,
                              workoutDetails: {
                                ...currentWorkoutLog.workoutDetails,
                                workoutTitle: e.target.value,
                              },
                            }
                          : null
                      )
                    }
                  />
                )}
              </li>
              <li className="w-full flex flex-wrap gap-4">
                <div className="w-fit py-4 flex grow flex-col items-start">
                  <p className="font-medium text-sm text-neutral-400">Date</p>
                  <p className="text-base">{dateString}</p>
                </div>
                <div className="w-fit py-4 flex grow flex-col items-start">
                  <p className="font-medium text-sm text-neutral-400">
                    Total Duration (minutes)
                  </p>
                  <input
                    type="string"
                    className="border border-neutral-200 rounded-sm p-1 px-2 text-base flex w-20"
                    placeholder={"0"}
                    value={duration}
                    onChange={(e) => {
                      setDuration(Number(e.target.value));
                      setCurrentWorkoutLog(
                        currentWorkoutLog
                          ? {
                              ...currentWorkoutLog,
                              workoutDetails: {
                                ...currentWorkoutLog.workoutDetails,
                                duration: `${e.target.value}m 0s`,
                              },
                            }
                          : null
                      );
                    }}
                  />
                </div>
                <div className="w-fit py-4 flex grow flex-col items-start">
                  <p className="font-medium text-sm text-neutral-400">
                    Workout DateTime
                  </p>
                  <input
                    type="datetime-local"
                    className="border border-neutral-200 rounded-sm p-2 w-40 text-base grow"
                    value={currentWorkoutLog?.workoutDate?.slice(0, 16) || ""}
                    onChange={(e) => {
                      console.log("New Date Value: ", e.target.value);
                      setCurrentWorkoutLog(
                        currentWorkoutLog
                          ? {
                              ...currentWorkoutLog,
                              workoutDate: e.target.value,
                            }
                          : null
                      );
                    }}
                  />
                </div>
              </li>
            </ul>
            <div className="w-full flex flex-col gap-2 pb-8 border-b border-neutral-200">
              <div className="w-full flex flex-col gap-1">
                <h2 className="font-medium text-neutral-400">
                  Exercise Details
                </h2>
                <div className="w-full ">
                  <button
                    onClick={() => setExercisePickerOpen(true)}
                    className="w-full  mb-4 h-10 rounded-2xl bg-black hover:bg-[#1e1e1e] text-white flex items-center justify-center gap-2"
                  >
                    Add Exercise
                  </button>
                </div>

                <ul className="w-full flex flex-col gap-2">
                  {
                    // Map through currentWorkoutLog?.workoutDetails.exercises to render ExerciseLogLi components
                    currentWorkoutLog?.workoutDetails.exerciseList.map(
                      (exercise, index) => {
                        let isComplete;
                        if (
                          "id" in currentWorkoutLog.workoutDetails.exerciseList
                        ) {
                          //console.log("Exercise List: ", exercise.id);
                          isComplete =
                            currentWorkoutLog.workoutDetails.exercisesCompleted.includes(
                              exercise.id
                            );
                        } else {
                          isComplete =
                            currentWorkoutLog.workoutDetails.exercisesCompleted.includes(
                              exercise.id
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
                          oneStar
                            ? () => handleRating(0)
                            : () => handleRating(1)
                        }
                        className={`${
                          oneStar ? "fill fill-lime-700" : "fill-transparent"
                        } size-8`}
                      />
                      <Star
                        onClick={
                          twoStar
                            ? () => handleRating(0)
                            : () => handleRating(2)
                        }
                        className={`${
                          twoStar ? "fill fill-lime-700" : "fill-transparent"
                        } size-8`}
                      />
                      <Star
                        onClick={
                          threeStar
                            ? () => handleRating(0)
                            : () => handleRating(3)
                        }
                        className={`${
                          threeStar ? "fill fill-lime-700" : "fill-transparent"
                        } size-8`}
                      />
                      <Star
                        onClick={
                          fourStar
                            ? () => handleRating(0)
                            : () => handleRating(4)
                        }
                        className={`${
                          fourStar ? "fill fill-lime-700" : "fill-transparent"
                        } size-8`}
                      />
                      <Star
                        onClick={
                          fiveStar
                            ? () => handleRating(0)
                            : () => handleRating(5)
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
                          threeIntStar
                            ? "fill fill-lime-700"
                            : "fill-transparent"
                        } size-8`}
                      />
                      <Star
                        onClick={
                          fourIntStar
                            ? () => handleIntensity(0)
                            : () => handleIntensity(4)
                        }
                        className={`${
                          fourIntStar
                            ? "fill fill-lime-700"
                            : "fill-transparent"
                        } size-8`}
                      />
                      <Star
                        onClick={
                          fiveIntStar
                            ? () => handleIntensity(0)
                            : () => handleIntensity(5)
                        }
                        className={`${
                          fiveIntStar
                            ? "fill fill-lime-700"
                            : "fill-transparent"
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
          </>
        )}
      </div>
      {/* Picker modal */}
      <Modal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        title="Choose Workout"
      >
        <div className="flex flex-col gap-3">
          <div className="flex gap-2">
            <input
              className="flex-1 h-10 rounded-xl border border-neutral-700 bg-neutral-800 px-3"
              placeholder="Search by title…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto pr-1">
            {filtered.map((workout) => {
              //const already = selectedWorkout ? !!selectedWorkout.find((s) => s.id === workout.id)  : false;
              //const disabled = already || limitReached;
              const disabled = limitReached;
              return (
                <div
                  key={workout.id}
                  className="flex items-center gap-3 border border-neutral-800 rounded-xl p-3 bg-neutral-900"
                >
                  <div className="w-14 h-14 bg-neutral-200 rounded-lg overflow-hidden">
                    {workout.image ? (
                      <img
                        src={workout.image}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-neutral-300" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {workout.name}
                    </p>
                    <p className="text-[11px] text-neutral-400 truncate">
                      {workout.tags?.slice(0, 3).join(" · ")}
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => quickAdd(workout)}
                    className={`h-8 px-3 rounded-lg text-xs ${
                      disabled
                        ? "bg-neutral-700 text-neutral-400 cursor-not-allowed"
                        : "bg-lime-600 hover:bg-lime-500 text-white"
                    }`}
                  >
                    Add
                  </button>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setPickerOpen(false)}
              className="h-10 px-4 rounded-xl bg-neutral-700 hover:bg-neutral-600 text-white text-sm"
            >
              Done
            </button>
          </div>
        </div>
      </Modal>
      <Modal
        open={exercisePickerOpen}
        onClose={() => setExercisePickerOpen(false)}
        title="Choose Exercises"
      >
        <div className="flex flex-col gap-3">
          <div className="flex gap-2">
            <input
              className="flex-1 h-10 rounded-xl border border-neutral-700 bg-neutral-800 px-3"
              placeholder="Search by title…"
              value={exerciseQ}
              onChange={(e) => setExerciseQ(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto pr-1">
            {filteredExercises.map((exercise) => {
              const already = selectedExercises
                ? !!selectedExercises.find((s) => s.id === exercise.id)
                : false;
              const disabled = already || exerciseLimitReached;

              return (
                <div
                  key={exercise.id}
                  className="flex items-center gap-3 border border-neutral-800 rounded-xl p-3 bg-neutral-900"
                >
                  <div className="w-14 h-14 bg-neutral-200 rounded-lg overflow-hidden">
                    {exercise.image ? (
                      <img
                        src={exercise.image}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-neutral-300" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {exercise.title}
                    </p>
                    <p className="text-[11px] text-neutral-400 truncate">
                      {exercise.tags?.slice(0, 3).join(" · ")}
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => quickAddExercise(exercise)}
                    className={`h-8 px-3 rounded-lg text-xs ${
                      disabled
                        ? "bg-neutral-700 text-neutral-400 cursor-not-allowed"
                        : "bg-lime-600 hover:bg-lime-500 text-white"
                    }`}
                  >
                    Add
                  </button>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setExercisePickerOpen(false)}
              className="h-10 px-4 rounded-xl bg-neutral-700 hover:bg-neutral-600 text-white text-sm"
            >
              Done
            </button>
          </div>
        </div>
      </Modal>
    </>
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

  const [isDone, setIsDone] = useState(false);

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
      setIsDone(true);
    }
    // else do nothing, stay in log
  };

  const handleSave = async () => {
    console.log("Current workout log object: ", currentWorkoutLog);
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
      setIsDone(true);
      setCurrentWorkoutLog(null); // Clear the log after saving
      setLogOpen(false);
    }
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
        {isPostWorkoutLog ? (
          <PostWorkoutLog isDone={isDone} />
        ) : (
          <CustomLog isDone={isDone} />
        )}
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
