import { ExerciseType } from "@/types/workout";
import { Check, ChevronRightIcon, Target } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

interface ExerciseLiProps {
  exerciseObj: ExerciseType;
}

const ExerciseLi: React.FC<ExerciseLiProps> = ({ exerciseObj }) => {
  const router = useRouter();
  const handleExerDetails = () => {
    router.push(`/exercisepreview/${exerciseObj.id}`);
  };

  // Helper function to format rep display based on repType
  const formatRepDisplay = () => {
    const details = exerciseObj.details;
    if (!details) return "N/A";

    const repType = details.repType || "number";

    switch (repType) {
      case "repRange":
        if (details.repRange?.min && details.repRange?.max) {
          return `${details.repRange.min}-${details.repRange.max}`;
        }
        return details.reps || "N/A";

      case "duration":
        if (details.repDuration?.time && details.repDuration?.unit) {
          return `${details.repDuration.time} ${details.repDuration.unit}`;
        }
        return details.reps || "N/A";

      case "distance":
        if (details.repDistance?.distance && details.repDistance?.unit) {
          return `${details.repDistance.distance} ${details.repDistance.unit}`;
        }
        return details.reps || "N/A";

      case "time":
        if (details.repDuration?.time && details.repDuration?.unit) {
          return `${details.repDuration.time} ${details.repDuration.unit}`;
        }
        return details.reps || "N/A";

      case "timeRange":
        if (details.timeRange?.min?.time && details.timeRange?.max?.time) {
          const minUnit = details.timeRange.min.unit || "sec";
          const maxUnit = details.timeRange.max.unit || "sec";
          return `${details.timeRange.min.time} ${minUnit} - ${details.timeRange.max.time} ${maxUnit}`;
        }
        return details.reps || "N/A";

      case "number":
      default:
        if (details.repNumber) {
          return details.repNumber.toString();
        }
        return details.reps || "N/A";
    }
  };

  // Helper function to format target metric display
  const formatTargetMetric = () => {
    const targetMetric = exerciseObj.details?.targetMetric;
    if (!targetMetric?.number || !targetMetric?.unit) return null;

    return `${targetMetric.number} ${targetMetric.unit}`;
  };

  const targetMetricDisplay = formatTargetMetric();

  return (
    <li
      onClick={handleExerDetails}
      className="w-full p-3 rounded-md border border-neutral-200 bg-black/50 hover:bg-black/90 cursor-pointer flex items-center justify-between transition-colors"
    >
      <div className="flex items-center">
        <Check size={28} className="mr-4 text-lime-400" />
        <div className="flex flex-col items-start gap-1">
          <h2 className="text-base font-medium">{exerciseObj.title}</h2>
          <div className="flex items-center gap-2 text-sm text-neutral-300">
            {exerciseObj.details?.sets && (
              <>
                <span>Sets {exerciseObj.details.sets}</span>
                <span className="text-neutral-500">•</span>
              </>
            )}
            <span>Reps {formatRepDisplay()}</span>
            {exerciseObj.details?.restTimeSets?.time && (
              <>
                <span className="text-neutral-500">•</span>
                <span>
                  Rest {exerciseObj.details?.restTimeSets?.time}{" "}
                  {exerciseObj.details?.restTimeSets?.unit?.slice(0, 3) || "s"}
                </span>
              </>
            )}
          </div>
          {targetMetricDisplay && (
            <div className="flex items-center gap-2 text-xs bg-lime-900/30 text-lime-300 px-2 py-1 rounded-md">
              <Target size={12} />
              <span>Target: {targetMetricDisplay}</span>
            </div>
          )}
        </div>
      </div>
      <ChevronRightIcon className="justify-self-end justify-items-end size-4 text-neutral-400" />
    </li>
  );
};

export default ExerciseLi;
