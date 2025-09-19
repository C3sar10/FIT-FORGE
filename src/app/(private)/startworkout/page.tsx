import PageContainer from "@/components/ui/PageContainer";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  ChevronRightIcon,
  ChevronRightSquare,
  Download,
  Heart,
} from "lucide-react";
import React from "react";

type Props = {};

interface HeaderProps {
  title: string;
  tags: string[];
  imageUrl?: string;
  id: string;
  description: string;
  author: string;
}

const StartWorkoutHeader: React.FC<HeaderProps> = ({
  title = "Workout",
  tags = ["strength", "fitness", "health"],
  imageUrl,
  id,
  description = "This workout will push your strength and fitness and is designed to be used any day, anytime.",
  author = "FitForge",
}) => {
  return (
    <div className="w-full h-auto aspect-square md:aspect-video bg-neutral-200 flex flex-col justify-end relative">
      {imageUrl && (
        <img
          src={imageUrl}
          className="absolute w-full h-full object-cover -z-0 rounded-md"
          alt="image"
        />
      )}
      <ArrowLeft className="absolute z-20 top-4 left-4 size-7 cursor-pointer hover:text-black" />
      <div className="absolute w-full h-full z-0 bg-linear-180 from-black/0 to-black/90"></div>
      <div className="w-full p-4 flex flex-col z-20 gap-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-medium">
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

const ExerciseLi = () => {
  return (
    <li className="w-full p-2 rounded-md border border-neutral-200 bg-black/50 hover:bg-black/90 cursor-pointer flex items-center justify-between">
      <div className="flex items-center">
        <Check size={28} className="mr-4" />
        <div className="flex flex-col items-start">
          <h2 className="text-base font-medium">Bench Press</h2>
          <div className="flex items-center gap-1 text-sm">
            <p>Sets 3</p>
            <p>|</p>
            <p>Reps 8 - 12</p>
          </div>
        </div>
      </div>
      <ChevronRightIcon className="justify-self-end justify-items-end size-4" />
    </li>
  );
};

const StartWorkoutBody = () => {
  return (
    <div className="w-full h-full p-4 py-8 flex flex-col gap-4 bg-linear-180 from-lime-950 to-lime-400">
      <div className="w-full flex flex-col gap-2">
        <h2 className="text-sm md:text-base font-medium">Exercise List</h2>
        <ul className="w-full flex flex-col gap-2">
          <ExerciseLi />
          <ExerciseLi />
          <ExerciseLi />
          <ExerciseLi />
        </ul>
      </div>
      <div className="w-full p-4 h-[100px] flex items-center gap-1">
        <button className="w-full h-full rounded-l-2xl bg-black text-white hover:bg-[#1e1e1e] cursor-pointer shadow-2xl">
          Start Workout
        </button>
        <button className="w-14 h-full bg-black text-white flex items-center justify-center rounded-r-2xl hover:bg-[#1e1e1e] cursor-pointer shadow-2xl">
          <ChevronDown size={14} />
        </button>
      </div>
    </div>
  );
};

const page = (props: Props) => {
  return (
    <PageContainer>
      <main className="w-full h-full min-h-dvh relative">
        <StartWorkoutHeader imageUrl="/running-default.jpg" />
        <StartWorkoutBody />
      </main>
    </PageContainer>
  );
};

export default page;
