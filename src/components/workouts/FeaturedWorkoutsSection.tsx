import React, { useEffect, useState } from "react";
import LargeFeatureCards from "../ui/LargeFeatureCards";
import { api } from "@/lib/api";
import LargeSkeletonCards from "../ui/LargeSkeletonCards";
import { useQuery } from "@tanstack/react-query"; // Add this

type Props = {};

interface FeaturedItem {
  id: string;
  image?: string;
  isFavorite: boolean;
  name: string;
  tags: string[];
}

const FeaturedWorkoutsSection = (props: Props) => {
  const [featuredList, setFeaturedList] = useState([]);

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
      const featuredPool = data.filter((w: any) =>
        (w.tags ?? []).includes("featured")
      );
      // Shuffle
      for (let i = featuredPool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [featuredPool[i], featuredPool[j]] = [featuredPool[j], featuredPool[i]];
      }
      const featuredFive = featuredPool.slice(0, 5);
      setFeaturedList(featuredFive);
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
            : featuredList.map((item: FeaturedItem) => (
                <LargeFeatureCards
                  key={item.id}
                  title={item.name}
                  tags={item.tags}
                  imageUrl={item.image}
                  id={item.id}
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
