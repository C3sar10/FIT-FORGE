"use client";
import React, { useEffect, useState } from "react";
import LargeFeatureCards from "../ui/LargeFeatureCards";
import { api } from "@/lib/api";

type Props = {
  featuredList: FeaturedItem[];
};

interface FeaturedItem {
  id: string;
  image?: string;
  isFavorite: boolean;
  title: string;
  tags: string[];
  description: string;
}

const FeaturedExercisesSection: React.FC<Props> = ({ featuredList }) => {
  return (
    <div className="w-full flex flex-col gap-2 items-start py-4">
      <div className="px-4">
        <h2 className="font-medium text-2xl md:text-4xl">Featured Exercises</h2>
      </div>
      <div className="w-full h-fit px-4">
        <div className="w-full flex items-center gap-4 overflow-x-scroll no-scrollbar h-[150px] min-[375px]:h-[180px] md:h-[220px] lg:h-[280px]">
          {featuredList.map((item: FeaturedItem) => (
            <LargeFeatureCards
              key={item.id}
              title={item.title}
              tags={item.tags}
              imageUrl={item.image}
              id={item.id}
              isExercise={true}
              isWorkout={false}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeaturedExercisesSection;
