"use client";
import BrowseSearchContainer from "@/components/ui/BrowseSearchContainer";
import FeaturedWorkoutsSection from "@/components/workouts/FeaturedWorkoutsSection";
import React, { useEffect, useState } from "react";

type Props = {};

const page = (props: Props) => {
  const [seedExercises, setSeedExercises] = useState([]);

  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.toLocaleString("default", { month: "short" });
  const day = currentDate.getDay();
  const dayName = currentDate.toLocaleDateString("default", {
    weekday: "long",
  });

  return (
    <div className="w-full h-full flex flex-col items-center">
      <div className="w-full p-4 flex items-center justify-between">
        <p className="text-sm md:text-base font-medium">{dayName}</p>
        <p className="text-sm md:text-base font-medium">
          {month + " " + day + ", " + year}
        </p>
      </div>
      <FeaturedWorkoutsSection />
      <BrowseSearchContainer />
    </div>
  );
};

export default page;
