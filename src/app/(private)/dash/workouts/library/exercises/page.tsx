import FeaturedExercisesSection from "@/components/exercises/FeaturedExercisesSection";
import React from "react";

type Props = {};

const page = (props: Props) => {
  return (
    <div className="w-full h-full flex flex-col items-center">
      <FeaturedExercisesSection />
    </div>
  );
};

export default page;
