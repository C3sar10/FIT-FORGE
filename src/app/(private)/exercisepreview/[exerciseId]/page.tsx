"use client";
import PageContainer from "@/components/ui/PageContainer";
import ExerciseLi from "@/components/workouts/ExerciseLi";
import { useAuth } from "@/context/AuthContext";
import { useTimer } from "@/context/TimerContext";
import { useWorkoutGlobal } from "@/context/WorkoutContext";
import { api, http } from "@/lib/api";
import { ExerciseApiType, ExerciseType, WorkoutType } from "@/types/workout";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  ChevronRightIcon,
  ChevronRightSquare,
  Download,
  Heart,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

type Props = {};

interface HeaderProps {
  title: string;
  tags: string[];
  imageUrl?: string;
  id: string;
  description: string;
  author: string;
}

const StartExerciseHeader: React.FC<HeaderProps> = ({
  title = "Workout",
  tags = ["strength", "fitness", "health"],
  imageUrl,
  id,
  description = "This workout will push your strength and fitness and is designed to be used any day, anytime.",
  author = "FitForge",
}) => {
  const router = useRouter();

  return (
    <div className="w-full h-auto aspect-square md:aspect-video bg-neutral-200 flex flex-col justify-end relative">
      {imageUrl && (
        <img
          src={imageUrl}
          className="absolute w-full h-full object-cover -z-0 "
          alt="image"
        />
      )}
      <ArrowLeft
        onClick={() => router.back()}
        className="absolute z-20 top-4 left-4 size-7 cursor-pointer hover:text-black"
      />
      <div className="absolute w-full h-full z-0 bg-linear-180 from-black/0 to-black/90"></div>
      <div className="w-full p-4 flex flex-col z-20 gap-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-medium line-clamp-2">
            {title}
          </h1>
          <div className="flex flex-col gap-2">
            <p className="text-base md:text-2xl font-medium">
              Created by {author}
            </p>
            <div className="w-full max-w-[350px] md:max-w-[500px] flex flex-wrap gap-1">
              {tags &&
                tags.slice(0, 3).map((tag, index) => (
                  <span
                    key={index}
                    className="capitalize text-xs sm:text-sm font-medium text-white px-2 py-1 bg-[#1e1e1e] rounded-md border border-neutral-200"
                  >
                    {tag}
                  </span>
                ))}
            </div>
          </div>
          <div className="flex flex-col w-full max-w-[350px] md:max-w-[500px]">
            <h2 className="text-base font-medium">Description</h2>
            <p className="text-sm md:text-base line-clamp-3">{description}</p>
          </div>
        </div>
        <div className="flex items-center flex-wrap gap-4">
          <span>
            <Heart size={24} />
          </span>
          <span>
            <Download size={24} />
          </span>
        </div>
      </div>
    </div>
  );
};

interface BodyProps {
  details: {
    sets: number;
    reps: String;
    restSecs: number;
    equipment: String[];
  };
  exerciseId: String;
}

const StartExerciseBody: React.FC<BodyProps> = ({ details, exerciseId }) => {
  return (
    <div className="w-full h-full p-4 py-8 flex flex-col gap-4 bg-linear-180 from-lime-950 to-lime-400">
      <div className="w-full max-w-[600px] mx-auto h-auto aspect-video bg-neutral-500 rounded-2xl"></div>
      <div className="w-full flex flex-col gap-2">
        <h2 className="text-sm md:text-base font-medium">Exercise Details</h2>
        <ul className="w-full flex flex-wrap gap-4">
          <li className="w-fit grow min-w-[250px] flex flex-col gap-1 p-4 bg-black border border-neutral-200 rounded-2xl text-white">
            <p className="font-medium">Number of Sets</p>
            <p className="font-semibold text-4xl">{details.sets}</p>
          </li>
          <li className="w-fit grow min-w-[250px] flex flex-col gap-1 p-4 bg-black border border-neutral-200 rounded-2xl text-white">
            <p className="font-medium ">Reps</p>
            <p className="text-4xl">{details.reps}</p>
          </li>
          <li className="w-fit grow min-w-[250px] flex flex-col gap-1 p-4 bg-black border border-neutral-200 rounded-2xl text-white">
            <p className="font-medium">Rest time in between</p>
            <p className="text-4xl">{details.restSecs}s</p>
          </li>
          <li className="w-full flex flex-col gap-1">
            <p className="font-medium">Equipment You Will need</p>
            <ul className="list-disc flex flex-col pl-4">
              {details.equipment.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </li>
        </ul>
      </div>
      <div className="w-full mt-4  h-[64px] flex items-center gap-1">
        <button className="w-full h-full rounded-l-2xl bg-black text-white hover:bg-[#1e1e1e] cursor-pointer shadow-2xl">
          Edit Exercise
        </button>
        <button className="w-14 h-full bg-black text-white flex items-center justify-center rounded-r-2xl hover:bg-[#1e1e1e] cursor-pointer shadow-2xl">
          <ChevronDown size={14} />
        </button>
      </div>
    </div>
  );
};

const Page = (props: Props) => {
  const params = useParams();
  // Next.js can give string | string[]
  const paramId = (params?.exerciseId ?? params?.id) as
    | string
    | string[]
    | undefined;
  const exerciseId =
    typeof paramId === "string"
      ? paramId
      : Array.isArray(paramId)
      ? paramId[0]
      : undefined;

  const [currExercise, setCurrExercise] = useState<ExerciseApiType | null>(
    null
  );
  const [mount, setMount] = useState(false);
  const { user } = useAuth();

  const fetchCurrExercise = async (id: string) => {
    // 1) Try direct endpoint (if you add /exercises/:id on server this will work)
    try {
      const data = await http.get<ExerciseApiType>(`/exercises/${id}`);
      setCurrExercise(data);
      return;
    } catch {
      // 2) Fallback: fetch a page from the list and find by id
      console.log("Went into fallback");
      const resp = await http.get<{
        items: ExerciseApiType[];
        nextCursor: string | null;
      }>(`/exercises?scope=all&limit=50`);
      const found = resp.items.find((x) => x.id === id) || null;
      setCurrExercise(found);
    }
  };

  useEffect(() => {
    setMount(true);
    if (exerciseId) fetchCurrExercise(exerciseId);
  }, [exerciseId]);

  if (!mount) return null;

  return (
    <PageContainer>
      <main className="w-full h-full min-h-dvh relative">
        {currExercise && (
          <StartExerciseHeader
            title={currExercise.title}
            tags={currExercise.tags}
            imageUrl={currExercise.image ?? null}
            id={currExercise.id}
            description={currExercise.description ?? ""}
            author={currExercise.author ?? user?.name ?? ""}
          />
        )}
        {currExercise && (
          <StartExerciseBody
            exerciseId={currExercise.id}
            details={currExercise.details}
          />
        )}
      </main>
    </PageContainer>
  );
};

export default Page;
