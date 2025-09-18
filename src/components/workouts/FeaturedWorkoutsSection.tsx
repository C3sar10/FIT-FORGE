import React from "react";
import LargeFeatureCards from "../ui/LargeFeatureCards";

type Props = {};

const FeaturedWorkoutsSection = (props: Props) => {
  return (
    <div className="w-full flex flex-col gap-2 items-start">
      <div className="px-4">
        <h2 className="font-medium text-2xl md:text-4xl">Featured Workouts</h2>
      </div>
      <div className="w-full pl-4 flex items-center gap-4 overflow-x-scroll no-scrollbar h-[160px] md:h-[200px] lg:[225px]">
        <LargeFeatureCards
          title="Push Workout"
          tags={["chest", "shoulders", "triceps"]}
        />
        <LargeFeatureCards
          title="Pull Workout"
          tags={["back", "biceps", "arms"]}
        />
        <LargeFeatureCards title="Legs Workout" tags={["quads", "calfs"]} />
      </div>
    </div>
  );
};

export default FeaturedWorkoutsSection;
