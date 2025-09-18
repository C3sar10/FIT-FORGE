"use client";
import BrowseSearchContainer from "@/components/ui/BrowseSearchContainer";
import FeaturedWorkoutsSection from "@/components/workouts/FeaturedWorkoutsSection";
import React, { useEffect, useState } from "react";

type Props = {};

const page = (props: Props) => {
  const [seedExercises, setSeedExercises] = useState([]);

  return (
    <div className="w-full h-full flex flex-col items-center">
      <div className="w-full p-4 flex items-center justify-between">
        <p className="text-sm md:text-base font-medium">Thursday</p>
        <p className="text-sm md:text-base font-medium">Aug 28, 2025</p>
      </div>
      <FeaturedWorkoutsSection />
      <BrowseSearchContainer />
    </div>
  );
};

export default page;
