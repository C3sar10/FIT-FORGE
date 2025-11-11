"use client";
import React, { useEffect, useState } from "react";
import LargeFeatureCards from "../ui/LargeFeatureCards";
import { api } from "@/lib/api";
import LargeSkeletonCards from "../ui/LargeSkeletonCards";
import { useQuery } from "@tanstack/react-query"; // Add this
import { WorkoutType } from "@/types/workout";
import { randomFive, randomFiveWorkouts } from "@/utils/utils";

type Props = {};

const FeaturedWorkoutsSection = (props: Props) => {
  const [featuredList, setFeaturedList] = useState<WorkoutType[]>([]);

  // Fetch with React Query - cached by key, no refetch if fresh
  const { data, isLoading } = useQuery({
    queryKey: ["workouts", "featured-pool"], // Unique key for this query
    queryFn: async () => {
      const res = await api("/workouts?scope=all&limit=50");
      const data = await res.json();
      return data.items ?? []; // Return the array for caching
    },
  });

  useEffect(() => {
    if (data) {
      // Filter and shuffle client-side from cached data
      const featuredPool = data.filter((w: WorkoutType) =>
        (w.tags ?? []).includes("featured")
      );
      // Shuffle
      try {
        const featuredFive = randomFiveWorkouts({ list: featuredPool });
        setFeaturedList(featuredFive);
      } catch (error) {
        console.error("Error selecting featured workouts:", error);
      }
    }
  }, [data]);

  return (
    <div className="w-full flex flex-col gap-2 items-start">
      <div className="px-4">
        <h2 className="font-medium text-2xl md:text-4xl">Featured Workouts</h2>
      </div>
      <div className="w-full h-fit px-4">
        <div className="w-full flex items-center gap-4 overflow-x-scroll no-scrollbar h-[150px] min-[375px]:h-[180px] md:h-[220px] lg:h-[280px]">
          {isLoading
            ? Array(4)
                .fill(0)
                .map((_, index) => <LargeSkeletonCards key={index} />)
            : featuredList.map((item: WorkoutType) => (
                <LargeFeatureCards
                  key={item.id}
                  title={item.name}
                  tags={item.tags}
                  imageUrl={item.image ? item.image : undefined}
                  id={item.id === undefined ? "undefined" : item.id}
                  isWorkout={true}
                  isExercise={false}
                />
              ))}
        </div>
      </div>
    </div>
  );
};

export default FeaturedWorkoutsSection;
