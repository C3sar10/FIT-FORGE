import { ExerciseType } from "@/types/workout";
import { Check, ChevronRightIcon } from "lucide-react";
import React from "react";

type Props = {};

interface ExerciseLiProps {
  exerciseObj: ExerciseType;
}

const ExerciseLi: React.FC<ExerciseLiProps> = ({ exerciseObj }) => {
  return (
    <li className="w-full p-2 rounded-md border border-neutral-200 bg-black/50 hover:bg-black/90 cursor-pointer flex items-center justify-between">
      <div className="flex items-center">
        <Check size={28} className="mr-4" />
        <div className="flex flex-col items-start">
          <h2 className="text-base font-medium">{exerciseObj.name}</h2>
          <div className="flex items-center gap-1 text-sm">
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

export default ExerciseLi;
